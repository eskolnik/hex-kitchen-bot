// GameScript model
//
// has many events
// TODO: has a version identifier
// Has a server

const { getGameByGuildId } = require("../db/cache");
const { parseScript } = require("../engine/parseScript");

class GameScript {
    constructor({
        guildId,
        characters,
        events,
        initialEvent,
        channels,
        categoryChannels,
        guild,
    }) {
        this.guildId = guildId;
        this.guild = guild;
        this.events = events;
        this.channels = channels;
        this.categoryChannels = categoryChannels;
        this.characters = characters;
        this.initialEvent = initialEvent;
    }

    getChannel(channelName) {
        this.channels.find((channel) => channel.name === channelName);
    }

    getCategoryChannel(channelName) {
        this.categoryChannels.find((channel) => channel.name === channelName);
    }

    static fromJson(guildId, jsonString, guild) {
        const gameScript = parseScript(jsonString);

        const { characters, events, channels, categoryChannels, initialEvent } =
            gameScript;

        return new GameScript({
            guildId,
            characters,
            events,
            initialEvent,
            channels,
            categoryChannels,
            guild,
        });
    }

    static fromCache(guildId) {
        return getGameByGuildId(guildId);
    }
}

module.exports = GameScript;
