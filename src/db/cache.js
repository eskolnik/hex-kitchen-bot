// In-memory data store
// TODO: back with a DB
// TODO: replace with a cache library or remove entirely

const { Collection } = require("discord.js");
const GameScript = require("../models/GameScript");
const { ScriptEvent } = require("../models/ScriptEvent");

// master list of in-progress scripts
// keyed by Guild ID (Snowflake)
let _activeGames = new Collection();

// Cached events
// Keyed by game ID + "_event_" + event ID
let _events = new Collection();
const buildEventKey = (eventId, guildId) => `${guildId}_event_${eventId}`;

// Arbitrary KV store
let _cache = new Collection();

/**
 * Add a new script to the cache
 *
 * @param {String} guildId
 * @param {GameScript} script
 * @returns {Boolean}
 */
const addGame = (guildId, script) => {
    if (_activeGames.has(guildId)) {
        return false;
    }

    _activeGames.set(guildId, script);
    return true;
};

/**
 * Remove a script from the cache
 *
 * @param {String} guildId
 * @returns {Boolean}
 */
const removeGame = (guildId) => {
    if (!_activeGames.has(guildId)) {
        return false;
    }

    _activeGames.delete(guildId);
    return true;
};

/**
 * Get a script from cache by guild id
 *
 * @param {String} guildId Snowflake guild ID
 * @returns {GameScript} Game Script
 */
const getGameByGuildId = (guildId) => {
    return _activeGames.get(guildId);
};

/**
 * Get an event from cache by event Id and guild Id
 *
 * @param {String} eventId
 * @param {String} guildId
 * @returns {ScriptEvent} Event
 */
const getEventById = (eventId, guildId) => {
    return _events.get(buildEventKey(eventId, guildId));
};

const addEvent = (eventId, guildId, event) => {
    const key = buildEventKey(eventId, guildId);
    if (_events.has(key)) {
        return false;
    }

    _events.set(key, event);
    return true;
};

const removeEvent = (eventId, guildId) => {
    const key = buildEventKey(eventId, guildId);
    if (!_events.has(key)) {
        return false;
    }

    _events.delete(key);
    return true;
};

const save = (key, value) => {
    _cache.set(key, value);
};

const get = (key) => _cache.get(key);

const remove = (key) => _cache.delete(key);

/**
 * FOR TESTING ONLY
 */
const clearCache = () => {
    _activeGames = new Collection();
    _events = new Collection();
    _cache = new Collection();
};

module.exports = {
    addGame,
    removeGame,
    getGameByGuildId,
    getEventById,
    removeEvent,
    addEvent,
    clearCache,
    save,
    get,
    remove,
};
