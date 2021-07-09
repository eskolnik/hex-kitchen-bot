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
const discordButtons = require("discord-buttons");

const commandRoot = require("./commands/commandRoot");
const cache = require("./db/cache");
const { EVENT_TYPE } = require("./models/ScriptEvent");

/**
 * Sets up bot listener
 */
const main = () => {
    // Instantiate bot
    const bot = new Client();

    // set up discord button extension
    discordButtons(bot);

    // Message handler
    bot.on("message", (message) => messageHandler(bot, message));

    // Emoji reaction handler
    bot.on("messageReactionAdd", (reaction, user) =>
        emojiReactionHandler(bot, reaction, user)
    );

    // Discord Button handler
    bot.on("clickButton", (button) => buttonClickHandler(bot, button));

    // Handle joining a new server
    bot.on("guildCreate", (guild) => {
        let channel = guild.systemChannel || guild.channels.cache.first;

        channel.send(
            "Welcome to the Hex Kitchen server!. Use `!setup <version>` to initiate a script."
        );
    });

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
 * Handle messages from users
 *
 * Load script for that message's game
 * Check if message is a valid command for that game
 * Check if message is an expected response for that game
 */
const messageHandler = async (bot, message) => {
    if (message.author.bot) return; // if the message author is a bot, ignore

    // get the script for the current server

    if (commandRoot.isCommand(message)) {
        commandRoot.handleCommand(bot, message);
    }
};

/**
 * Handle a user emoji-reacting to a message
 *
 * Load script for that emoji's message's game
 * Check if the emoji's message is a valid/active game object
 *
 *
 */
const emojiReactionHandler = async (bot, messageReaction, user) => {
    // get the script for this server
    const gameScript = cache.getGameByGuildId(messageReaction.message.guild.id);

    // Short circuit if no game script exists
    if (!gameScript) {
        return;
    }

    // get all script emoji events
    const emojiEvents = gameScript.getEvents({
        typeFilter: EVENT_TYPE.EMOJI_REACT,
    });

    // look for event that matches target message id
    emojiEvents.forEach((event) => {
        // get the target event message id
        const target = event.target;
    });
};

/**
 * Handle a user clicking a button
 *
 * @param {*} bot
 * @param {*} button
 */
const buttonClickHandler = (bot, button) => {
    console.log("button clicked", button.id);
};

main();
