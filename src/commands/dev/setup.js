/**
 * Set up a script from the Script Tool
 */
const { initiateScript } = require("../../engine/initiateScript");
const fetch = require("node-fetch");
const GameScript = require("../../models/GameScript");
const { handleEvent } = require("../../engine/handleEvent");
const { logger } = require("../../utils/logger");

module.exports = {
    help: {
        name: "setup", // command name
        aliases: [], // command aliases, if any
    },
    name: "setup",
    aliases: [],
    usageFilter: (bot, message, args) => args.length <= 1,
    usageHelp: "`!setup <version>`",
    run: async (bot, message, args) => {
        let data;
        try {
            const version = args.join(" ") || "v1";
            const scriptURL =
                process.env.SCRIPT_TOOL_URL + "?version=" + version;
            data = await fetch(scriptURL);
        } catch (error) {
            logger.error("Unable to fetch script. ", error);
            return;
        }

        const scriptJSON = await data.json();

        const reply = await message.channel.send(
            "Beginning setup, press the X to destroy all channels from this script."
        );

        const gameScript = GameScript.fromJson(
            message.guild.id,
            scriptJSON,
            message.guild
        );
        try {
            handleEvent(
                gameScript.events.get(gameScript.initialEvent),
                bot,
                gameScript
            );
        } catch (e) {
            logger.error("Error executing initial event");
        }

        await reply.react("❌");

        // Destroy channels on react
        const filter = (reaction, user) => reaction.emoji.name === "❌";
        const collector = reply.createReactionCollector(filter);

        const deleteChannelHooks = async (channel) => {
            try {
                const hooks = await channel
                    .fetchWebhooks()
                    .catch(logger.error);

                logger.info("Deleting " + hooks.size + " hooks");
                for (let [id, hook] of hooks) {
                    await hook.delete();
                }
            } catch (error) {
                logger.log("Failed to delete hooks", error);
            }
        };

        collector.on("collect", async (reaction, user) => {
            const channels = gameScript.channels.concat(
                gameScript.categoryChannels
            );

            const deleteChannel = async (channelId) => {
                if (channelId) {
                    try {
                        const channelForDeletion = await bot.channels.fetch(
                            channelId
                        );
                        logger.info(`Deleting channel ${channelForDeletion}`);

                        if (channelForDeletion.type === "text") {
                            await deleteChannelHooks(channelForDeletion);
                        }
                        await channelForDeletion.delete();
                    } catch (error) {
                        logger.error("Error deleting channel: ", error);
                    }
                }
            };
                
            logger.info("Cleaning up channels: ", channels);
            channels.forEach(channel => {
                if(channel.channelId) {
                    deleteChannel(channel.channelId);
                }
            });
            try {
                await message.delete();
                await reply.delete();
                collector.stop();
            } catch (error) {
                logger.error("Failed to remove reactions.");
            }
        });
    },
};
