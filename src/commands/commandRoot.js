const { Message, Client } = require("discord.js");
const { prefix } = require("../utils/config");
const { logger } = require("../utils/logger");
const DEV_COMMANDS = require("./dev");

// Given a message, determine if it is a command
const isCommand = (message) => {
    return message.content.startsWith(prefix);
};

/**
 * Given a discord message and a library of available commands,
 * return the matching command
 * or null if no matching command is found.
 *
 * @param {Message} message
 * @param {Object} availableCommands
 * @returns {Object||null}
 */
const matchCommand = (cmd, availableCommands) => {
    const command = availableCommands.find((c) => c.name === cmd);

    return command || null;
};

/**
 * Returns the available commands for a given server
 *
 * @param {Snowflake} guildId
 */
const getAvailableCommandsForGuild = (guildId) => {
    return [];
};

/**
 * Given a message that has the command prefix, execute the given command
 * If the command is unavailable in the server, or is incorrectly invoked,
 * send the appropriate error response to the channel.
 *
 * @param {Client} bot
 * @param {String} message
 */
const handleCommand = (bot, message) => {
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    const guildId = message.guild.id;

    let availableCommands = getAvailableCommandsForGuild(guildId);

    if (process.env.NODE_ENV === "development") {
        availableCommands = [...availableCommands, ...DEV_COMMANDS];
    }

    const command = matchCommand(cmd, availableCommands);

    if (!command) {
        return;
    }

    if (command.usageFilter && !command.usageFilter(bot, message, args)) {
        message.channel.send("Command usage: " + command.usageHelp);
        logger.info("CommandInvoked-Incorrectly", { command: message.content });
        return;
    }

    command.run(bot, message, args);
    logger.info("CommandInvoked-Correctly", { command: message.content });
};

module.exports = {
    isCommand,
    matchCommand,
    handleCommand,
    getAvailableCommandsForGuild,
};
