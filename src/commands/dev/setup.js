/**
 * Set up a script from the Script Tool
 */
const { initiateScript } = require("../../engine/initiateScript");
const fetch = require("node-fetch");

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
        const version = args.join(" ") || "v1";
        const scriptURL = process.env.SCRIPT_TOOL_URL + "?version=" + version;
        let data;
        try {
            data = await fetch(scriptURL);
        } catch (error) {
            console.log("Unable to fetch script. ", error);
            return;
        }

        const scriptJSON = await data.json();

        const script = await initiateScript(scriptJSON, bot, message.guild);

        const reply = await message.channel.send(
            "Beginning setup, press the X to destroy all channels from this script."
        );

        await reply.react("❌");

        // Destroy channels on react
        const filter = (reaction, user) => reaction.emoji.name === "❌";
        const collector = reply.createReactionCollector(filter);

        const deleteChannelHooks = async (channel) => {
            try {
                const hooks = await channel
                    .fetchWebhooks()
                    .catch(console.error);

                console.log("deleting " + hooks.size + " hooks");
                for (let [id, hook] of hooks) {
                    await hook.delete();
                }
            } catch (error) {
                console.log("failed to delete hooks", error);
            }
        };

        collector.on("collect", async (reaction, user) => {
            const channels = script.channels.concat(script.categoryChannels);

            for (let i = channels.length - 1; i >= 0; i--) {
                if (channels[i].channelId) {
                    try {
                        const channelForDeletion = await bot.channels.fetch(
                            channels[i].channelId
                        );

                        if (channelForDeletion.type === "text") {
                            await deleteChannelHooks(channelForDeletion);
                        }
                        await channelForDeletion.delete();
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
            try {
                await message.delete();
                await reply.delete();
                collector.stop();
            } catch (error) {
                console.error("Failed to remove reactions.");
            }
        });
    },
};