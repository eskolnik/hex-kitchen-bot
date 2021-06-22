// A Soft Verification occurs when the bot expects the player to submit a response
// In order for the game to recognize that reponse as valid, some number of other players
// must acknowledge it, by upvoting it via emoji responses.

const {
    TextChannel,
    Message,
    Emoji,
    Channel,
    ReactionCollector,
} = require("discord.js");

/**
 *
 * @param {Channel} channel the channel in which to expect a player message
 * @param {Function} messageFilter filter messages in the channel to find a valid candidate
 * @param {Number} upvoteThreshold the number of required upvotes from other players to verify a candidate
 * @param {String} upvoteEmoji the emoji to use for registering upvotes
 * @param {Function} handleSuccess callback for after a candidate message is verified
 */
function softVerify(
    channel,
    messageFilter,
    upvoteThreshold,
    upvoteEmoji,
    handleSuccess
) {
    // await messages that passes the message filter in the channel
    const timeoutDurationMinutes = 2;
    const messageCollector = createMessageCollector(
        channel,
        messageFilter,
        timeoutDurationMinutes * 60 * 1000
    );

    messageCollector.on("collect", (message) => {
        // respond to that message with the upvote emoji
        showUpvoteEmoji(message, upvoteEmoji);
        // await upvoteThreshold other players (NOT the message sender) to respond with the upvote emoji
        const upvoteCollector = createUpvoteCollector(message, upvoteEmoji);

        upvoteCollector.on("collect", (reaction) => {
            // once the threshold has been reached, run the success handler for the message
            const reactionCount = reaction.count;
            const disqualifiedUsersCount = reaction.users.cache.filter(
                (user) => user.bot //|| user.id === message.author.id
            ).size;

            const validReactions = reactionCount - disqualifiedUsersCount;

            if (validReactions >= upvoteThreshold) {
                upvoteCollector.stop("Upvote Threshold Reached");
                handleSuccess(message);
            }
        });
    });
}

/**
 *
 * @param {TextChannel} channel
 * @param {Function} messageFilter
 * @param {Number} timeout
 */
function createMessageCollector(channel, messageFilter, timeout = 10000) {
    return channel.createMessageCollector(messageFilter, {
        max: 1,
        time: timeout,
    });
}

/**
 *
 * @param {Message} message
 * @param {Emoji} emoji
 */
async function showUpvoteEmoji(message, emoji) {
    await message.react(emoji);
}

/**
 *
 * @param {Message} message
 * @param {String} emoji
 * @returns {ReactionCollector}
 */
function createUpvoteCollector(message, emoji) {
    return message.createReactionCollector((reaction, user) => {
        return reaction.emoji.name === emoji && !user.bot;
    });
}

module.exports = {
    softVerify,
};
