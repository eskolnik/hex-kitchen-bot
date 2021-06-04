require("dotenv").config({
    path: `./.env.${
        process.env.NODE_ENV?.match(/development|production|staging/) ||
        "development"
    }`,
});

const { Client, Collection, Message } = require("discord.js"); // discord api wrapper, only requiring the Client and Collection class
const chalk = require("chalk"); // chalk is a module that adds color to our console logs
const moment = require("moment"); // moment will allow us to format specific dates and times later
const { logger } = require("./utils/logger");

const commandRoot = require("./commands/commandRoot");

/**
 * Sets up bot listener
 */
const main = () => {
    // Instantiate bot
    const bot = new Client();

    // Message handler
    bot.on("message", (message) => messageHandler(bot, message));

    // Emoji reaction handler
    bot.on("messageReactionAdd", (reaction, user) =>
        emojiReactionHandler(bot, reaction, user)
    );

    // Handle errors and warnings
    bot.on("error", console.error); // if theres an error, console log it
    bot.on("warn", console.warn); // if theres a warning, log it

    bot.on("ready", () => {
        console.log(
            chalk.green(
                `[${moment().format(
                    "LT"
                )}] The bot is now online! Currently logging on ${
                    bot.guilds.cache.size
                } servers!`
            )
        ); // once the bot is ready, it'll log, in green, that the bot is online and will display the number of servers it's in.
    });

    const token = process.env.DISCORD_TOKEN; // Grab the discord token
    bot.login(token);
};

/**
 * Load script for that message's game
 * Check if message is a valid command for that game
 * Check if message is a valid promptResponse for that game
 */
const messageHandler = (bot, message) => {
    if (message.author.bot) return; // if the message author is a bot, ignore

    if (commandRoot.isCommand(message)) {
        commandRoot.handleCommand(bot, message);
    }
};

/**
 * Load script for that emoji's message's game
 * Check if the emoji's message is a valid/active game object
 *
 *
 */
const emojiReactionHandler = (bot, messageReaction, user) => {};

main();
