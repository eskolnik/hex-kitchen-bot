// Script Event model
// A Script Event is an action the bot takes, or an action the bot is awaiting from a player

const EVENT_TYPE = {
    GAME_MESSAGE: "GameMessage",
    UPDATE_GAME_MESSAGE: "UpdateGameMessage",
    EMOJI_REACT: "EmojiReact",
    REMOVE_EMOJI_REACT: "RemoveEmojiReact",
    EMOJI_INPUT: "EmojiInput",
    COMMAND_INPUT: "Command",
    LINEAR_SEQUENCE: "LinearSequence",
    CHANNEL_UNLOCK: "ChannelUnlock",
    SPECIAL: "Special",
};

const EVENT_STATUS = {
    UNAVAILABLE: "unavailable",
    IN_PROGRESS: "in_progress",
    COMPLETE: "complete",
};

class ScriptEvent {
    constructor({
        type,
        id,
        guildId,
        currentStatus = EVENT_STATUS.UNAVAILABLE,
    }) {
        if (!Object.values(EVENT_TYPE).includes(type)) {
            throw new Error("Undefined Event Type");
        }

        this.id = id;
        this.type = type;
        this.currentStatus = currentStatus;
        this.guildId = guildId;
    }

    isAvailable() {
        return this.status === EVENT_STATUS.IN_PROGRESS;
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
 * A message to the server from an NPC
 *
 */
class GameMessageEvent extends ScriptEvent {
    constructor({
        id,
        guildId,
        channel,
        character,
        content,
        currentStatus = EVENT_STATUS.UNAVAILABLE,
        messageId = null,
    }) {
        super({ type: EVENT_TYPE.GAME_MESSAGE, id, currentStatus, guildId });

        this.channel = channel;
        this.character = character;
        this.content = content;
        this.messageId = messageId;
    }
}

/**
 * Reacts to a message with an emoji.
 */
class EmojiReactEvent extends ScriptEvent {
    constructor({
        id,
        guildId,
        emoji,
        targetEventId,
        currentStatus = EVENT_STATUS.UNAVAILABLE,
    }) {
        super({ type: EVENT_TYPE.EMOJI_REACT, id, currentStatus, guildId });
        this.emoji = emoji;
        this.targetEventId = targetEventId;
    }
}

/**
 * Creates a new Channel in the server.
 */
class ChannelUnlockEvent extends ScriptEvent {
    constructor({
        id,
        guildId,
        channel,
        currentStatus = EVENT_STATUS.UNAVAILABLE,
    }) {
        super({ type: EVENT_TYPE.CHANNEL_UNLOCK, id, currentStatus, guildId });
        this.channel = channel;
    }
}

/**
 * Triggers several other events in sequence
 * TODO: add an option for a delay between events
 */
class LinearSequenceEvent extends ScriptEvent {
    constructor({
        id,
        guildId,
        eventsTriggered,
        currentStatus = EVENT_STATUS.UNAVAILABLE,
    }) {
        super({ type: EVENT_TYPE.LINEAR_SEQUENCE, id, guildId, currentStatus });
        this.eventsTriggered = eventsTriggered;
    }
}

/**
 * Await a command in a specified channel
 * TODO This style of commands probably needs rethinking? how do we even handle failure cases?
 */
class CommandInputEvent extends ScriptEvent {
    constructor({
        id,
        guildId,
        command,
        solution,
        currentStatus = EVENT_STATUS.UNAVAILABLE,
    }) {
        super({ type: EVENT_TYPE.COMMAND_INPUT, id, guildId, currentStatus });

        this.command = command;
        this.solution = solution;
    }
}

/**
 * Await a player's emoji reaction to a target message
 *
 */
class EmojiInputEvent extends ScriptEvent {
    constructor({ id, guildId, emoji, targetEventId, eventsTriggered }) {
        super({ type: EVENT_TYPE.EMOJI_INPUT, id, guildId });

        this.emoji = emoji;
        this.targetEventId = targetEventId;
        this.eventsTriggered = eventsTriggered;
    }
}

class ScriptEventFactory {
    constructor(guildId) {
        this.guildId = guildId;
    }

    fromJson(json) {
        const { type } = json;
        let classMap = {
            [EVENT_TYPE.GAME_MESSAGE]: GameMessageEvent,
            [EVENT_TYPE.EMOJI_REACT]: EmojiReactEvent,
            [EVENT_TYPE.EMOJI_INPUT]: EmojiInputEvent,
            [EVENT_TYPE.COMMAND_INPUT]: CommandInputEvent,
            [EVENT_TYPE.LINEAR_SEQUENCE]: LinearSequenceEvent,
            [EVENT_TYPE.CHANNEL_UNLOCK]: ChannelUnlockEvent,
        };
        const EventClass = classMap[type];

        return new EventClass({ guildId: this.guildId, ...json });
    }
}

module.exports = {
    ScriptEvent,
    GameMessageEvent,
    EmojiReactEvent,
    ChannelUnlockEvent,
    LinearSequenceEvent,
    CommandInputEvent,
    ScriptEventFactory,
    EVENT_STATUS,
    EVENT_TYPE,
};
