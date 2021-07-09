const discordButtons = require("discord-buttons");

// Post the required UI elements for ingredient collection

function chunk(ary, chunkSize) {
    return Array(Math.ceil(ary.length / chunkSize))
        .fill()
        .map((_, i) => ary.slice(i * chunkSize, i * chunkSize + chunkSize));
}

async function createIngredientCollectionInterface(channel, ingredients) {
    // create ingredients list
    const ingredientsListingMessageText =
        makeIngredientCollectionMessage(ingredients);

    // send ingredients list
    const ingredientsListingMessage = await channel.send(
        ingredientsListingMessageText
    );

    // make buttons for each ingredients
    const ingredientButtons = makeIngredientMenuButtons(
        ingredients,
        channel.guild.id
    );

    // split buttons into rows of 5
    const rowbuttonLimit = 5;
    const buttonRows = chunk(ingredientButtons, rowbuttonLimit).map((buttons) =>
        new discordButtons.MessageActionRow().addComponents(buttons)
    );
}

function makeIngredientCollectionMessage(ingredients) {
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

function makeIngredientButtonId(ingredient, prefix) {
    return `${prefix}${ingredient.name}`;
}
