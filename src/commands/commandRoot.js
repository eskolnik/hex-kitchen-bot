const { prefix } = require("../utils/config");
// const { setup } =

// Given a message, determine if it is a command
const isCommand = (message) => {
    message.startsWith(prefix);
};

/**
 * Given a discord message and a library of available commands,
 * return the matching command
 * or null if no matching command is found.
 *
 * @param {Discord.message} message
 * @param {Object} availableCommands
 * @returns {Object||null}
 */
const matchCommand = (message, availableCommands) => {
    // extract arguments and command keyword
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    const command = availableCommands[cmd];

    return command || null;
};

/**
 * Returns the available commands for a given server
 *
 * @param {Snowflake} guildId
 */
const getAvailableCommandsForGuild = (guildId) => {};

module.exports = {
    isCommand,
    matchCommand,
};
