require("dotenv").config({
    path: `./.env.${
        process.env.NODE_ENV?.match(/development|production/) || "default"
    }`,
});
const { Client, Collection, Message } = require("discord.js"); // discord api wrapper, only requiring the Client and Collection class
const { prefix } = require("./utils/config"); // we require our config to get our token and prefix
const chalk = require("chalk"); // chalk is a module that adds color to our console logs
const moment = require("moment"); // moment will allow us to format specific dates and times later
const { logger } = require("./utils/logger");

// these 2 modules will be used for the command handler
const { join } = require("path");
const { readdirSync, lstatSync } = require("fs");

const token = process.env.DISCORD_TOKEN; // Grab the discord token

const bot = new Client();

// necessary to fetch commands.
bot.commands = new Collection();
bot.aliases = new Collection();

// and now our (recursive) command handler
// allows `/commands/ping.js` and `/commands/misc/ping.js`
const read = function (directory, files = []) {
    readdirSync(directory).forEach((path) => {
        if (path.endsWith(".js")) return files.push(join(directory, path));
        if (lstatSync(join(directory, path).isDirectory()))
            return files.concat(read(join(directory, path), files));
    });
    return files;
}; // read inside "commmands" directory and filter the files to only get those that end in ".js"

for (const path of read(join(__dirname, "commands"))) {
    const command = require(path); // require the command file

    // now we'll add the command name and aliases, if any, to our collection
    bot.commands.set(command.help.name, command);
    (command.help.aliases || []).forEach((alias) =>
        bot.aliases.set(alias, command.help.name)
    );
}

// now we'll add event listeners
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

bot.on("error", console.error); // if theres an error, console log it
bot.on("warn", console.warn); // if theres a warning, log it

bot.on("message", (message) => {
    if (message.author.bot) return; // if there is no guild or the message author is a bot, ignore
    if (!message.content.startsWith(prefix)) return; // if the message doesnt start with prefix, ignore

    // some standard argument definitions
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    // now we try getting the command. if it doesn't exist, return
    try {
        const command =
            bot.commands.get(cmd) || bot.aliases.get(bot.commands.get(cmd));
        if (!command) return;

        logger.info("Command Received", { command: message.content });
        command.run(bot, message, args);
    } catch (e) {
        logger.error(e.message, { command: message.content });
        console.log(e.message);
    }
});

bot.on("guildCreate", (guild) => {
    let channel = guild.systemChannel || guild.channels.cache.first;

    channel.send(
        "Welcome to the Hex Kitchen server!. Use `!setup <version>` to initiate a script."
    );
});

bot.on("rateLimit", (info) => {
    console.log(info);
    logger.error(info);
});

bot.login(token); // connects to the discord gateway
