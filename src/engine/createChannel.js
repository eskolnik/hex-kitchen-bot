const CHANNEL_TYPE_TEXT = "text";
const CHANNEL_TYPE_VOICE = "voice";
const CHANNEL_TYPE_CATEGORY = "category";

async function createChannel(script, guild, channel) {
    // short circuit if channel exists
    if (channel.channelId !== null) {
        return;
    }

    // Get channel manager
    const channelManager = guild.channels;

    // Create category if it doesnt exist yet
    const category = script.categoryChannels.find(
        (cc) => cc.name === channel.category
    );

    if (category.channelId === null) {
        const categoryChannel = await channelManager.create(category.name, {
            type: CHANNEL_TYPE_CATEGORY,
        });

        category.channelId = categoryChannel.id;
    }

    const createdChannel = await channelManager.create(channel.name, {
        type: channel.type,
        parent: category.channelId,
    });

    channel.channelId = createdChannel.id;
}

module.exports = { createChannel };
