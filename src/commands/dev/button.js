const dButtons = require("discord-buttons");

module.exports = {
    name: "buttons",
    aliases: [],
    usageFilter: null,
    usageHelp: "",
    run: async (bot, message, args) => {
        const buttonIdSuffix = message.channel.guild.id + Date.now().toString();
        const pizzaId = "pizza-" + buttonIdSuffix;
        let button1 = new dButtons.MessageButton()
            .setLabel("Pizza")
            .setStyle("blurple")
            .setEmoji("🍕")
            .setID(pizzaId);

        const closeId = "close-" + buttonIdSuffix;
        let button2 = new dButtons.MessageButton()
            .setLabel("Close")
            .setStyle("red")
            .setEmoji("❌")
            .setID(closeId);

        let pCount = 0;
        const scoreboard = await message.channel.send("Pizza: " + pCount);

        const updateScore = async (n) => {
            await scoreboard.edit("Pizza: " + n).catch(console.log);
        };

        let buttonRow = new dButtons.MessageActionRow()
            .addComponent(button1)
            .addComponent(button2);
        let buttonRow2 = new dButtons.MessageActionRow()
            .addComponent(button1.setDisabled(true))
            .addComponent(button2);

        const resp = await message.channel.send("Order a pizza:", {
            component: buttonRow,
        });

        async function clickHandler(button) {
            try {
                if (button.id === pizzaId) {
                    await button.defer(true);
                    pCount++;
                    await updateScore(pCount);
                    if (pCount >= 3) {
                        await resp.edit("Maximum 3 pizzas per customer.", {
                            component: buttonRow2,
                        });
                    }
                } else if (button.id === closeId) {
                    await button.defer(true);

                    // remove the listener
                    [message, resp, scoreboard].forEach((m) => {
                        m.delete().catch((err) => console.log(err));
                    });
                }
            } catch (error) {
                console.log(error);
            }
        }

        bot.on("clickButton", clickHandler);
    },
};
