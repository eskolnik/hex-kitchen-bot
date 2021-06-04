module.exports = {
    name: "ping",
    aliases: [],
    usageFilter: (bot, message, args) => args.length <= 0,
    usageHelp: "`!ping`",
    run: async (bot, message, args) => {
        const channel = message.channel;
        channel.send("pong");
    },
};
