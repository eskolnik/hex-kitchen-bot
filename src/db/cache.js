// In-memory data store
// TODO: back with a DB
// TODO: replace with a cache library or remove entirely

// master list of in-progress scripts
// keyed by Guild ID
let _activeGames = new Map();

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

const getGameByGuildId = (guildId) => {
    return _activeGames.get(guildId);
};

/**
 * FOR TESTING ONLY
 */
const clearCache = () => {
    _activeGames = new Map();
};

module.exports = {
    addGame,
    removeGame,
    getGameByGuildId,
    clearCache,
};
