const { APIMessage, Client } = require("discord.js");
const { ScriptEvent, EVENT_TYPE, EVENT_STATUS } = require("../models/ScriptEvent");
const { logger } = require("../utils/logger");
const { getWebhookForChannel } = require("../webhooks/webhook");
const { createChannel } = require("./createChannel");

const getScriptChannel = (script, channelName) =>
    script.getChannel(channelName);

const getEventById = (script, eventId) => script.getEventById(eventId);

/**
 * Record a message related to a script event
 *
 * @param {Message} message
 * @param {Event} event
 * @param {Script} script
 */
const recordMessage = (message, event) => {
    event.messageId = message.id;
    // TODO: figure out if events can store multiple messages
};

const getEventMessageId = (event) => {
    return event.messageId;
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

/**
 *
 * @param {ScriptEvent} event
 * @param {Client} bot
 * @param {GameScript} script
 * @returns null
 */
const handleMessage = async (event, bot, script) => {
    const { channel, character, content } = event;
    logger.info(`HandleMessage: ${channel}, ${character}, ${content}`);
    // Do nothing if message has already been sent
    if (!event.begin()) {
        return;
    }

    const scriptChannel = getScriptChannel(script, channel);

    // Find the character name / avatar
    const author = script.getCharacter(character);

    const sentMessage = await sendMessage(
        scriptChannel,
        content,
        author,
        script
    );

    // Store message on script
    recordMessage(sentMessage, event);

    event.end();
};

const handleEmojiReact = async (event, bot, script) => {
    const {
        targetEventId,
        emoji,
        options,
        eventsTriggered,
    } = event;
    
    logger.info(`HandleEmoji: ${targetEventId}, ${emoji}, ${eventsTriggered}`);
    // If event has been started, short circuit
    if (event.currentStatus !== EVENT_STATUS.UNAVAILABLE) {
        return;
    }

    // react to target message
    const targetEvent = getEventById(script, targetEventId.toString());

    // get target message
    const targetMessageId = targetEvent.messageId;

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
            (reaction, user) => {
                return reaction.emoji.name === emoji;
            },
            filterOptions
        );

        // on collect, trigger followup event
        emojiReactionCollector.on("collect", async (reaction, user) => {
            logger.info(`Emoji reaction triggered: ${event.id} ${event.emoji}`);
            await handleLinearSequence(event, bot, script);

            if (options.autoRemove) {
                try {
                    await reaction.users.remove(user.id);
                } catch (err) {
                    logger.error("Failed to remove reactions");
                }
            }
        });

        // mark event as closed after collector completes
        emojiReactionCollector.on("end", (collected) => {
            event.status = EVENT_STATUS.COMPLETE;
        });
    }

    event.begin();
};

const handleEmojiInput = async (event, bot, script) => {
    // react to target message
    const targetEvent = getEventById(script, event.targetEventId.toString());

    // get target message
    // const targetMessageId = getEventMessageId(targetEvent);
    const targetMessageId = targetEvent.messageId;

    const scriptChannel = getScriptChannel(script, targetEvent.channel);
    const gameChannel = await bot.channels.fetch(scriptChannel.channelId);

    const targetMessage = await gameChannel.messages.fetch(targetMessageId);
    await targetMessage.react(event.emoji);

    // set up trigger condition (if any)
    if (event.eventsTriggered && event.eventsTriggered.length > 0) {
        const filterOptions = {};
        if (event.options?.max) {
            filterOptions.max = event.options.max;
        }

        const emojiReactionCollector = targetMessage.createReactionCollector(
            (reaction, user) => {
                return reaction.emoji.name === event.emoji;
            },
            filterOptions
        );

        // on collect, trigger followup event
        emojiReactionCollector.on("collect", async (reaction, user) => {
            logger.info(`Emoji reaction triggered: ${event.id} ${event.emoji}`);
            await handleLinearSequence(event, bot, script);

            if (event.options?.autoRemove) {
                try {
                    await reaction.users.remove(user.id);
                } catch (err) {
                    console.error("Failed to remove reactions");
                }
            }
        });

        // mark event as closed after collector completes
        emojiReactionCollector.on("end", (collected) => {
            event.end();
        });
    }

    event.begin();
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
    // Linear Sequence events contain a property "eventsTriggered" with an array of events to trigger in serial

    if(!event?.eventsTriggered) {
        logger.warn("Empty LinearSequence: ", event);
        return;
    } 

    const { eventsTriggered } = event;

    logger.info(`HandleLinearSequence: ${eventsTriggered}`);

    for (let i = 0; i < eventsTriggered.length; i++) {
        if(typeof eventsTriggered[i] !== "string") {
            logger.warn("Event key wasn't a string:", eventsTriggered, i);
        }
        let stringKey = eventsTriggered[i].toString();
        const nextEvent = script.events.get(stringKey);
        if (nextEvent) {
            await handleEvent(nextEvent, bot, script);
        }
    }
};

const handleEvent = async (event, bot, script) => {
    // for Message events, send to the correct channel
    // for Room unlocks, create the correct channel
    // for Commands, set up the appropriate collector
    try {

        switch (event.type) {
            case EVENT_TYPE.GAME_MESSAGE:
                await handleMessage(event, bot, script);
                break;
            case EVENT_TYPE.EMOJI_REACT:
                await handleEmojiReact(event, bot, script);
                break;
            case EVENT_TYPE.EMOJI_INPUT:
                await handleEmojiInput(event, bot, script);
                break;
            case EVENT_TYPE.CHANNEL_UNLOCK:
                await handleChannelUnlock(event, bot, script);
                break;
            case EVENT_TYPE.COMMAND_INPUT:
                await handleCommand(event, bot, script);
                break;
                // case "PuzzleCommand":
                //     await handlePuzzleCommand(event, bot, script);
                //     break;
            case EVENT_TYPE.LINEAR_SEQUENCE:
                await handleLinearSequence(event, bot, script);
                break;
            default:
                return;
        }
    } catch (e) {
        logger.error(`Error handling event: ${event}`, e);
    }
};

module.exports = {
    handleEvent,
};
