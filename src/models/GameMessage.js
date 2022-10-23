/**
 * Represents a message sent from the bot
 */
const { Message, Client } = require("discord.js");
const cache = require("../db/cache");

const CACHE_KEY_IDENTIFIER = "GAME_MESSAGE";

class GameMessage {
    constructor(eventId, serverId, messageId, channelId) {
        this.serverId = serverId;
        this.messageId = messageId;
        this.eventId = eventId;
        this.channelId = channelId;
    }

    saveToCache() {
        const { serverId, messageId, eventId, channelId } = { ...this };
        cache.save(this.constructor.makeCacheKey(this.eventId, this.serverId), {
            serverId,
            messageId,
            eventId,
            channelId,
        });
    }

    /**
     *
     * @param {Client} client
     * @returns {Message}
     */
    async getMessage(client) {
        const guild = await client.guilds.fetch(this.serverId);
        const channel = await guild.channels.fetch(this.channelId);
        return await channel.messages.fetch(this.messageId);
    }

    static async getFromCache(eventId, serverId) {
        const data = await cache.get(this.makeCacheKey(eventId, serverId));
        return new GameMessage(
            data.serverId,
            data.messageId,
            data.eventId,
            data.channelId
        );
    }

    static makeCacheKey(eventId, serverId) {
        return [CACHE_KEY_IDENTIFIER, serverId, eventId].join("-");
    }
}

module.exports = { GameMessage };
