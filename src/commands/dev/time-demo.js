const { Collection, Message } = require("discord.js");
const cache = require("../../db/cache");

module.exports = {
    name: "time-demo",
    aliases: [],
    usageFilter: null,
    usageHelp: "",
    /**
     *
     * @param {*} bot
     * @param {Message} message
     * @param {*} args
     */
    run: async (bot, message, args) => {
        const channel = message.channel;
        let cmdMessages = [message];
        let voiceChannels = [];
        const channelManager = message.guild.channels;

        const vc1 = await channelManager.create("Library 1", { type: "voice" });
        const vc2 = await channelManager.create("Library 2", { type: "voice" });

        voiceChannels.push(vc1, vc2);

        const connection = await vc1.join();

        const duckSong = "src/assets/duck.mp3";

        const playNext = () => {
            let dispatcher = connection.play(duckSong, {
                volume: 1,
            });

            dispatcher.on("start", () => {
                console.log("duck.mp3 is now playing!");
            });

            dispatcher.on("finish", () => {
                console.log("duck.mp3 has finished playing!");
            });

            dispatcher.on("error", console.error);
            return dispatcher;
        };

        let dispatcher;

        bot.on("voiceStateUpdate", async (oldState, newState) => {
            const joinedChannelId = newState.channelID;
            if (
                [vc1.id, vc2.id].includes(joinedChannelId) &&
                !oldState?.member.user.bot
            ) {
                const msg = await channel.send(
                    `${newState.member.user} is in ${newState.channel.name}`
                );
                cmdMessages.push(msg);
            }
        });

        await message.react("❌");
        await message.react("👍");

        const playfilter = (reaction, user) => reaction.emoji.name === "👍";
        const playcollector = message.createReactionCollector(playfilter);

        playcollector.on("collect", async () => {
            dispatcher = playNext();
        });

        // Destroy channels on react
        const filter = (reaction, user) => reaction.emoji.name === "❌";
        const collector = message.createReactionCollector(filter);

        collector.on("collect", async () => {
            dispatcher?.destroy;
            voiceChannels.forEach((c) => {
                c?.delete().catch((err) => console.log(err));
            });
            cmdMessages.forEach((m) => {
                m?.delete().catch((err) => console.log(err));
            });
        });
    },
};
