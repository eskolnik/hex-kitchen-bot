/** 
Ingredient Collection sequence
Triggered by a player interacting with an Ingredient Room menu / button
Variables:
- Player doing the collecting (might not be part of the model)
- Ingredient being collected
- Bot Prompt text options
- upvote instructions text
- upvote emoji
- validation emoji
- upvote threshold
- state to update on success (maybe part of ingredient?)
- failure message?
*/

const { TextChannel, User } = require("discord.js");
const { softVerify } = require("./softVerification");

/**
 * Initiate an ingredient collection sequence
 *
 * @param {User} player
 * @param {TextChannel} channel
 * @param {String} promptText
 * @param {String} upvotePromptText
 * @param {String} upvoteEmoji
 * @param {String} validationEmoji
 * @param {Number} upvoteThreshold
 * @param {Function} updateIngredientState
 */
async function handleIngredientCollectionSequence(
    player,
    channel,
    promptText,
    upvotePromptText,
    upvoteEmoji,
    validationEmoji,
    upvoteThreshold,
    updateIngredientState
) {
    // Display the prompt text (AND TAG THE PLAYER)
    const promptMessageContent = `${player} ${promptText}`;

    const promptMessage = await channel.send(promptMessageContent);

    // await player response
    const messageFilter = (message) => {
        message.author.id === player.id && !message.content.startsWtih("!");
    };

    const messageCollector = channel.createMessageCollector(messageFilter, {
        max: 1,
        time: 120 * 1000,
    });

    // Currently, softVerify doesnt prompt the user
    // TODO: Either change that or remove this prompt entirely
    messageCollector.on("collect", (message) => {
        channel.send(upvotePromptText);
    });

    const handleValidationSuccess = (validatedMessage) => {
        validatedMessage.react(validationEmoji);
        updateIngredientState();
    };

    softVerify(
        channel,
        messageFilter,
        upvoteThreshold,
        upvoteEmoji,
        handleValidationSuccess
    );
}

module.exports = handleIngredientCollectionSequence;
