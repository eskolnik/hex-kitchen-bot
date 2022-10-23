// GameScript model
//
// TODO: has a version identifier
// TODO: remove guild ref, gamescript shouldnt need it

const { Collection } = require("discord.js");
const { getGameByGuildId, addGame, addEvent } = require("../db/cache");
const { parseScript } = require("../engine/parseScript");
const { ScriptEventFactory, ScriptEvent, EVENT_TYPE } = require("./ScriptEvent");

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

    /**
     *
     * @param {String} channelName
     * @returns {Object}
     */
    getChannel(channelName) {
        return this.channels.get(channelName);
    }

    /**
     *
     * @param {String} channelName
     * @returns {Object}
     */
    getCategoryChannel(channelName) {
        return this.categoryChannels.get(channelName);
    }

    /**
     *
     * @param {String} eventId
     * @returns {ScriptEvent}
     */
    getEventById(eventId) {
        if (this.events.has(eventId)) {
            return this.events.get(eventId);
        }
        return null;
    }

    /**
     * Returns all events in the script, optionally filtered by type and/or status
     *
     * @param {EventFilter} eventFilters the set of event filters
     * @returns {Collection<String, ScriptEvent>}
     */
    getEvents({ typeFilter, statusFilter } = {}) {
        const filteredEvents = new Collection();

        const filter = (event) =>
            (!typeFilter || event.type === typeFilter) &&
            (!statusFilter || event.status === statusFilter);

        this.events.forEach((event, eventId) => {
            if (filter(event)) {
                filteredEvents.set(eventId, event);
            }
        });

        return filteredEvents;
    }

    getCharacter(name) {
        return this.characters.get(name);
    }

    /**
     * Save this script and all events to cache
     */
    saveToCache() {
        addGame(this.guildId, this);
        this.events.forEach((event) => addEvent(event.id, this.guildId, event));
    }

    static fromJson(guildId, jsonString, guild) {
        const gameScript = parseScript(jsonString);

        const { characters, events, channels, categoryChannels, initialEvent } =
            gameScript;

        const eventsMap = new Collection();
        const eventFactory = new ScriptEventFactory(guildId);

        // Some event keys coming from the script tool will have old or non-descriptive keys
        // Modify the incoming json data to map the script tool keys to the correct keys
        const replaceKeys = (object, keyMap) => {
            keyMap.forEach(([oldKey, newKey]) => {
                // if the data object has the old key and not the new, overwrite and remove old key
                if(object[oldKey] && !object[newKey]) {
                    object[newKey] = object[oldKey];
                    delete object[oldKey];
                }
            });
            return object;
        };
        const normalizeEventData = (jsonEvent) => { 
            switch(jsonEvent.type) {
                case EVENT_TYPE.EMOJI_INPUT:
                case EVENT_TYPE.EMOJI_REACT:
                    // if (jsonEvent.content && !jsonEvent.emoji){
                    //     let {content, ...modifiedEvent} = jsonEvent;
                    //     modifiedEvent.emoji = content;
                    //     return modifiedEvent;
                    // }
                    // return jsonEvent;
                    return replaceKeys(jsonEvent, [["content", "emoji"], ["targetEvent", "targetEventId"]]);
            }
            return jsonEvent;
        };

        Object.values(events).forEach((eventData) => {
            const normalizedEventData = normalizeEventData(eventData);
            const event = eventFactory.fromJson(normalizedEventData);
            eventsMap.set(event.id, event);
        });

        const charactersMap = new Collection(Object.entries(characters));

        const channelsToIterarable = (channelsArray) =>
            channelsArray.map((c) => [c.name, c]);

        const categoryChannelsMap = new Collection(
            channelsToIterarable(categoryChannels)
        );

        const channelsMap = new Collection(channelsToIterarable(channels));

        return new GameScript({
            guildId,
            characters: charactersMap,
            events: eventsMap,
            initialEvent,
            channels: channelsMap,
            categoryChannels: categoryChannelsMap,
            guild,
        });
    }

    static async loadByGuildId(guildId) {
        // Get from cache only for now
        return getGameByGuildId(guildId);
    }
}

module.exports = GameScript;
