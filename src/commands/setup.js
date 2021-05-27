const { initiateScript } = require("../engine/initiateScript");
const fetch = require("node-fetch");

module.exports = {
    help: {
        name: "setup", // command name
        aliases: [], // command aliases, if any
    },

    run: async (bot, message, args) => {
        // console.log(message.attachments);
        // const file = message.attachments.first().attachment;

        const version = args.join(" ") || "v1";
        const scriptURL =
            "https://script.google.com/macros/s/AKfycbz5p9Tq5NqdCzzT3ZpBZBXqlRmxFrVnE4cd0Q_qRaVjDsnmTpVoaZTZ7uoDiJFnQgvgoA/exec?version=" +
            version;

        const data = await fetch(scriptURL);

        const scriptJSON = await data.json();

        console.log(scriptJSON);

        // const filePath = join(__dirname, "../gameScripts/testScript.json");
        // const scriptFile = fs.readFileSync(filePath);

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

        // const CHANNEL_TYPE_TEXT = "text";
        // const CHANNEL_TYPE_VOICE = "voice";
        // const CHANNEL_TYPE_CATEGORY = "category";

        // // Get channel manager
        // const channels = message.guild.channels;

        // // Create channel category
        // const channelGroup = await channels.create("Test Category", {
        //     type: CHANNEL_TYPE_CATEGORY,
        // });

        // // Create a Test channel
        // const channelName = args.join("-") || "test-channel";
        // const testChannel = await channels.create(channelName, {
        //     type: CHANNEL_TYPE_TEXT,
        //     topic: "A bespoke bot-generated channel",
        //     parent: channelGroup,
        // });

        // // await database("Channels").insert({Name: channelName, Slug: channelName, ChannelType: 'text'});

        // // Send teardown reaction
        // const sentMessage = await message.channel.send(
        //     `Created new channel ${testChannel}. Press :x: to delete it.`
        // );
        // await sentMessage.react("❌");

        // // Destroy channel and category on react
        // const filter = (reaction, user) => reaction.emoji.name === "❌";
        // const collector = sentMessage.createReactionCollector(filter, {
        //     max: 1,
        // });
        // collector.on("collect", async (reaction, user) => {
        //     try {
        //         await testChannel.delete();
        //         await channelGroup.delete();
        //         await reaction.remove();
        //     } catch (error) {
        //         console.error("Failed to remove reactions.");
        //     }
        // });
    },
};
