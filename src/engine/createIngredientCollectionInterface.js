const discordButtons = require("discord-buttons");
const { Collection } = require("discord.js");
const handleIngredientCollectionSequence = require("./handleIngredientCollectionSequence");
const cache = require("../db/cache");
const Ingredient = require("../models/Ingredient");

// Post the required UI elements for ingredient collection

function chunk(ary, chunkSize) {
    return Array(Math.ceil(ary.length / chunkSize))
        .fill()
        .map((_, i) => ary.slice(i * chunkSize, i * chunkSize + chunkSize));
}

/**
 * Posts the ingredient selection UI
 *
 *
 * @param {*} channel
 * @param {Collection} ingredients collection of Ingredient objects
 * @param {*} upvoteThreshold
 * @param {*} upvoteEmoji
 */
async function createIngredientCollectionInterface(
    bot,
    channel,
    ingredientNames,
    upvoteThreshold,
    upvoteEmoji
) {
    const serverId = channel.guild.id;

    // create ingredients list
    const ingredientsListingMessageText = makeIngredientCollectionMessage(
        ingredientNames,
        serverId
    );

    // send ingredients list
    const ingredientsListingMessage = await channel.send(
        ingredientsListingMessageText
    );

    const updateListingMessage = async () => {
        await ingredientsListingMessage.edit(
            makeIngredientCollectionMessage(ingredientNames, serverId)
        );
    };

    // make buttons for each ingredients
    const ingredientButtons = makeIngredientMenuButtons(ingredients, serverId);

    // split buttons into rows of 5
    const rowbuttonLimit = 5;
    const buttonRows = chunk(ingredientButtons, rowbuttonLimit).map((buttons) =>
        new discordButtons.MessageActionRow().addComponents(buttons)
    );

    const ingredientsButtonMessage = await channel.send(
        `Select an ingredient to collect. In order to finish collecting it, you must respond to the prompt, and ${upvoteThreshold} other ${
            upvoteThreshold === 1 ? "person" : "people"
        } must ${upvoteEmoji} upvote it.`,
        { components: buttonRows }
    );

    const promptText = "What's your favorite color?";
    const upvotePromptText = "Updoot it.";
    const validationEmoji = "✅";

    // On a button click
    // Check that we're on the right server
    // Match the button id to an ingredient
    // Button ID should always be server
    const clickHandler = async (button) => {
        try {
            const ingredientName = identifyIngredientButton(
                button.id,
                serverId
            );

            if (!ingredientName) {
                return;
            }

            // const cachedIngredients = cache.get();
            const ingredient = Ingredient.getFromCache(
                ingredientName,
                serverId
            );

            if (!ingredient) {
                return;
            }

            await button.defer(true);

            // update ingredient state and update message
            const buttonClicker = button.clicker.user;

            const onSuccess = async (userMessage) => {
                const updatedIngredient = Ingredient.getFromCache(
                    ingredientName,
                    serverId
                );

                updatedIngredient.quantity += 1;
                updatedIngredient.saveToCache();

                await updateListingMessage();
            };

            handleIngredientCollectionSequence(
                buttonClicker,
                channel,
                promptText,
                upvotePromptText,
                upvoteEmoji,
                validationEmoji,
                upvoteThreshold,
                onSuccess
            );

            // ("✅")
        } catch (error) {
            console.log(error);
        }
    };

    bot.on("clickButton", clickHandler);
}

/**
 *
 * @param {Array<Ingredient>} ingredients
 * @returns ingredientsa collected string
 */
function makeIngredientCollectionMessage(ingredientNames, serverId) {
    // initialize get ingredients from cache
    const ingredients = ingredientNames.map((name) =>
        Ingredient.getFromCache(name, serverId)
    );

    const ingredientsListing = ingredients
        .map((ingredient) => `${ingredient.name}: ${ingredient.quantity}`)
        .join("\n");

    const ingredientsListingMessageText = `Ingredients available in this room:\n ${ingredientsListing}`;

    return ingredientsListingMessageText;
}

/**
 *
 *
 * @param {Array<Ingredient>} ingredients an array of ingredients to create buttons for
 * @param {String} buttonIdPrefix the id prefix to use for each button, based on server / game id
 */
function makeIngredientMenuButtons(ingredients, buttonIdPrefix) {
    return ingredients.map((ingredient) =>
        new discordButtons.MessageButton()
            .setLabel(ingredient.name)
            .setStyle("green")
            .setID(makeIngredientButtonId(ingredient, buttonIdPrefix))
    );
}

/**
 *
 * @param {Ingredient} ingredient
 * @param {string} prefix
 * @returns
 */
function makeIngredientButtonId(ingredient, prefix) {
    return `${prefix}-${ingredient.name}`;
}

function identifyIngredientButton(buttonId, serverId) {
    const [prefix, ingredientName] = buttonId.split("-");

    return serverId === prefix ? ingredientName : false;
}
