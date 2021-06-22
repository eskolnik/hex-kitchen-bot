const { MessageButton, MessageActionRow } = require("discord-buttons");
const { Collection } = require("discord.js");
const { softVerify } = require("../../engine/softVerification");
const cache = require("../../db/cache");

module.exports = {
    name: "ingredient-demo",
    aliases: [],
    usageFilter: null,
    usageHelp: "",
    run: async (bot, message, args) => {
        const channel = message.channel;

        let cmdMessages = [message];

        let cacheKeySuffix = channel.guild.id;

        const ingredients = ["carrot", "apple", "meat"];
        const makeCacheKey = (ingredient) => `${ingredient}-${cacheKeySuffix}`;

        // Initialize cache if not already
        ingredients.forEach((ingredient) => {
            const cacheKey = makeCacheKey(ingredient);
            if (!cache.get(cacheKey)) {
                cache.save(cacheKey, 0);
            }
        });

        const getCollectedIngredients = () =>
            new Collection(
                ingredients.map((name) => [name, cache.get(makeCacheKey(name))])
            );

        const makeCollectionMessage = () => {
            const ingredientString = getCollectedIngredients()
                .map((count, name) => `${name}: ${count}`)
                .join("\n");
            return "Collected Ingredients:\n" + ingredientString;
        };

        const buttonIdSuffix = channel.guild.id + Date.now().toString();

        const makeButton = (name) =>
            new MessageButton()
                .setLabel(name)
                .setStyle("green")
                .setID(name + "-" + buttonIdSuffix);

        const makeControlMessageComponents = () => {
            const actionRow = new MessageActionRow();
            actionRow.addComponents(
                getCollectedIngredients().map((count, name) => makeButton(name))
            );

            return [actionRow];
        };

        const matchButtonId = (buttonId) => {
            const [name, suffix] = buttonId.split("-");
            if (suffix !== buttonIdSuffix) {
                return false;
            }
            if (getCollectedIngredients().has(name)) {
                return name;
            } else {
                return false;
            }
        };

        const upvoteEmoji = "👍";
        const upvoteThreshold = 1;

        // const sendControlMessage = async () =>
        let collectionMessage = await channel.send(makeCollectionMessage());
        let controlMessage = await channel.send(
            `Select an ingredient to collect. In order to finish collecting it, you must respond to the prompt, and ${upvoteThreshold} other ${
                upvoteThreshold === 1 ? "person" : "people"
            } must ${upvoteEmoji} upvote it.`,
            { components: makeControlMessageComponents() }
        );

        cmdMessages.push(collectionMessage);
        cmdMessages.push(controlMessage);

        const sendPrompt = async (user) => {
            const pm = await channel.send(
                `${user} To collect this ingredient, write a haiku and have ${upvoteThreshold} other ${
                    upvoteThreshold === 1 ? "person" : "people"
                } upvote it.`
            );
            cmdMessages.push(pm);
        };

        async function clickHandler(button) {
            try {
                const ingredientName = matchButtonId(button.id);
                if (!ingredientName) {
                    return;
                }
                await button.defer(true);
                // update ingredient state and update message
                const buttonClicker = button.clicker.user;
                await sendPrompt(buttonClicker);

                const handleSuccess = (userMessage) => {
                    const collectedIngredients = getCollectedIngredients();
                    const newCount =
                        collectedIngredients.get(ingredientName) + 1;
                    cache.save(makeCacheKey(ingredientName), newCount);

                    collectionMessage.edit(makeCollectionMessage());
                    userMessage.react("✅");
                    cmdMessages.push(userMessage);
                };

                const filterUser = (m) => m.author.id === buttonClicker.id;

                softVerify(
                    channel,
                    filterUser,
                    upvoteThreshold,
                    upvoteEmoji,
                    handleSuccess
                );
            } catch (error) {
                console.log(error);
            }
        }

        await message.react("❌");

        // Destroy channels on react
        const filter = (reaction, user) => reaction.emoji.name === "❌";
        const collector = message.createReactionCollector(filter);

        collector.on("collect", async () => {
            cmdMessages.forEach((m) => {
                m?.delete().catch((err) => console.log(err));
            });
        });

        bot.on("clickButton", clickHandler);
    },
};
