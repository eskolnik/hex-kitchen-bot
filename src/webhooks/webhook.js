// given a channel, return a webhook for that channel
const getWebhookForChannel = async (channel) => {
    let hooks = await channel.fetchWebhooks();
    let hook;
    try {
        hook =
            hooks.size > 0
                ? hooks[0]
                : await channel.createWebhook(channel.name);
    } catch (err) {
        console.log(err);
    }

    return hook;
};

module.exports = { getWebhookForChannel };
