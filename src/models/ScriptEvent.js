// Script Event model
// A Script Event is an action the bot takes, or an action the bot is awaiting from a player

const { getWebhookForChannel } = require("../webhooks/webhook");
const { createChannel } = require("./createChannel");

const EVENT_TYPE = {
    GAME_MESSAGE: "GameMessage",
    UPDATE_GAME_MESSAGE: "UpdateGameMessage",
    EMOJI_REACT: "EmojiReact",
    REMOVE_EMOJI_REACT: "RemoveEmojiReact",
    COMMAND: "Command",
    LINEAR_SEQUENCE: "LinearSequence",
    CHANNEL_UNLOCK: "ChannelUnlock",
    PUZZLE_COMMAND: "PuzzleCommand",
    SPECIAL: "Special",
};

const EVENT_STATUS = {
    UNAVAILABLE: "unavailable",
    IN_PROGRESS: "in_progress",
    COMPLETE: "complete",
};

class ScriptEvent {
    constructor({ type, id, currentStatus = EVENT_STATUS.UNAVAILABLE }) {
        if (!Object.values(EVENT_TYPE).includes(type)) {
            throw new Error("Undefined Event Type");
        }

        this.type = type;
        this.id = id;
        this.currentStatus = currentStatus;
    }

    begin() {
        if (!this.currentStatus === EVENT_STATUS.UNAVAILABLE) {
            return false;
        }
        this.currentStatus = EVENT_STATUS.IN_PROGRESS;
        return true;
    }

    end() {
        if (!this.currentStatus === EVENT_STATUS.IN_PROGRESS) {
            return false;
        }
        this.currentStatus = EVENT_STATUS.COMPLETE;
        return true;
    }
}

/**
 * Sends a message to the server from an NPC
 */
class GameMessageEvent extends ScriptEvent {
    constructor({
        id,
        channel,
        character,
        content,
        currentStatus = EVENT_STATUS.UNAVAILABLE,
        message: messageId = null,
    }) {
        super({ type: EVENT_TYPE.GAME_MESSAGE, id, currentStatus });

        this.channel = channel;
        this.character = character;
        this.content = content;
        this.message = messageId;
    }
    /**
     * Record a message related to a script event
     *
     * @param {String} messageId
     * @param {Event} event
     * @param {Script} script
     */
    recordMessage(messageId) {
        this.message = messageId;
    }

    getMessageId() {
        return this.message;
    }
}

/**
 * Reacts to a message with an emoji.
 */
class EmojiReactEvent extends ScriptEvent {
    constructor({
        id,
        content,
        targetEventId,
        currentStatus = EVENT_STATUS.UNAVAILABLE,
    }) {
        super({ type: EVENT_TYPE.EMOJI_REACT, id, currentStatus });
        this.content = content;
        this.targetEventId = targetEventId;
    }
}

/**
 * Creates a new Channel in the server.
 */
class ChannelUnlockEvent extends ScriptEvent {
    constructor({ id, channel, currentStatus = EVENT_STATUS.UNAVAILABLE }) {
        super({ type: EVENT_TYPE.CHANNEL_UNLOCK, id, currentStatus });
    }
}

/**
 * Triggers several other events in sequence
 * TODO: add an option for a delay between events
 */
class LinearSequenceEvent extends ScriptEvent {}

/**
 * Make a command available in a channel
 * TODO This style of commands probably needs rethinking?
 */
class CommandEvent extends ScriptEvent {}

/**
 * Record a message related to a script event
 *
 * @param {Message} message
 * @param {Event} event
 * @param {Script} script
 */
const recordMessage = (message, event) => {
    event.messages.push(message.id);
};

const getEventMessageId = (event) => {
    return event.messages && event.messages[0];
};

const sendMessage = async (channel, content, author, script) => {
    if (channel.hook) {
        const sentMessage = await channel.hook.send(content, author);
        return sentMessage;
    }

    const gameChannel = await script.guild.channels.resolve(channel.channelId);

    // Generate a webhook for the channel
    const webhook = await getWebhookForChannel(gameChannel);

    channel.hook = webhook;

    const sentMessage = await webhook.send(content, author);

    return sentMessage;
};

const handleMessage = async (event, bot, script) => {
    const { channel, character, content } = event;

    // Do nothing if message has already been sent
    if (event.status === EVENT_STATUS.COMPLETE) {
        return;
    }

    const scriptChannel = getScriptChannel(script, channel);

    // Find the character name / avatar
    // const author = script.characters.find((c) => c.username === character);
    const author = script.characters[character];

    const sentMessage = await sendMessage(
        scriptChannel,
        content,
        author,
        script
    );

    // Store message on script
    recordMessage(sentMessage, event);

    event.status = EVENT_STATUS.COMPLETE;
};

const handleEmojiReact = async (event, bot, script) => {
    const {
        targetEvent: targetId,
        content: emoji,
        options,
        eventsTriggered,
    } = event;

    // If event has been started, short circuit
    if (event.status !== EVENT_STATUS.UNAVAILABLE) {
        return;
    }

    // react to target message
    const targetEvent = getEventById(script, targetId);

    // get target message
    const targetMessageId = getEventMessageId(targetEvent);

    const scriptChannel = getScriptChannel(script, targetEvent.channel);
    const gameChannel = await bot.channels.fetch(scriptChannel.channelId);

    const targetMessage = await gameChannel.messages.fetch(targetMessageId);
    await targetMessage.react(emoji);

    // set up trigger condition (if any)
    if (eventsTriggered && eventsTriggered.length > 0) {
        const filterOptions = {};
        if (options.max) {
            filterOptions.max = options.max;
        }

        const emojiReactionCollector = targetMessage.createReactionCollector(
            (reaction, user) => reaction.emoji.name === emoji,
            filterOptions
        );

        // on collect, trigger followup event
        emojiReactionCollector.on("collect", async (reaction, user) => {
            await handleLinearSequence(event, bot, script);

            if (options.autoRemove) {
                try {
                    await reaction.users.remove(user.id);
                } catch (err) {
                    console.error("Failed to remove reactions");
                }
            }
        });

        // mark event as closed after collector completes
        emojiReactionCollector.on("end", (collected) => {
            event.status = EVENT_STATUS.COMPLETE;
        });
    }

    event.status = EVENT_STATUS.IN_PROGRESS;
};

const handleChannelUnlock = async (event, bot, script) => {
    const { channel } = event;

    const scriptChannel = getScriptChannel(script, channel);

    await createChannel(script, script.guild, scriptChannel);
};

const handleCommand = async (event, bot, script) => {
    const { channel, command, solution } = event;

    const scriptChannel = getScriptChannel(script, channel);

    const gameChannel = await bot.channels.fetch(scriptChannel.channelId);

    const collector = gameChannel.createMessageCollector(
        (message) =>
            message.content === `!${command}${solution ? " " + solution : ""}`
    );

    collector.on("collect", (message) => {
        // Record the triggering message
        recordMessage(message, event);

        // trigger the associated events
        handleLinearSequence(event, bot, script);
    });
};

// const handlePuzzleCommand = async (event, bot, script) => {
//     const { channel, command, solution, eventsTriggered } = event;
//     const scriptChannel = getScriptChannel(script, channel);
//     const gameChannel = await bot.channels.fetch(scriptChannel.channelId);
//     const collector = gameChannel.createMessageCollector(
//         (message) => message.content === `!${command} ${solution}`,
//         { max: 1 }
//     );
//     collector.on("collect", (message) => {
//         // Record the triggering message
//         recordMessage(message, event);

//         // trigger the associated events
//         handleEvent(script.events[eventsTriggered], bot, script);
//     });
// };

const handleLinearSequence = async (event, bot, script) => {
    // Linear Sequence events contain a property "events" with an array of events to trigger in serial
    const { eventsTriggered } = event;
    for (let i = 0; i < eventsTriggered.length; i++) {
        const nextEvent = script.events[eventsTriggered[i]];
        if (nextEvent) {
            await handleEvent(nextEvent, bot, script);
        }
    }
};

const handleEvent = async (event, bot, script) => {
    // for Message events, send to the correct channel
    // for Room unlocks, create the correct channel
    // for Commands, set up the appropriate collector

    switch (event.type) {
        case "GameMessage":
            await handleMessage(event, bot, script);
            break;
        case "EmojiReact":
            await handleEmojiReact(event, bot, script);
            break;
        case "ChannelUnlock":
            await handleChannelUnlock(event, bot, script);
            break;
        case "Command":
            await handleCommand(event, bot, script);
            break;
        // case "PuzzleCommand":
        //     await handlePuzzleCommand(event, bot, script);
        //     break;
        case "LinearSequence":
            await handleLinearSequence(event, bot, script);
            break;
        default:
            return;
    }
};

module.exports = {
    handleEvent,
};
