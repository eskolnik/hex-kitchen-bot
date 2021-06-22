const Room = require("../models/room.js");
const Puzzle = require("../models/puzzle.js");
const { npcConfig } = require("../fakeDB/npcConfig");
const { getWebhookForChannel } = require("../webhooks/webhook");
const { logger } = require("../utils/logger");

// events can be of several types, this util handles them all
const EVENT_TYPES = {
    POST: "post", // post to a public channel
    DM: "dm", // send a direct message to the author of the event trigger (or another player)
    UNLOCK: "unlock", // Set a room to be public
    ROLE: "role", // Grant a role to the author of the event trigger (or another player)
};

const handleEvents = async (events, bot, message, args) => {
    if (!events) return;
    for (let i = 0; i < events.length; i++) {
        await handleEvent(events[i], bot, message, args);
    }
};

const handleEvent = async (event, bot, message, args) => {
    const { POST, DM, UNLOCK, ROLE } = EVENT_TYPES;
    const { delay } = event;
    switch (event.type) {
        case POST:
            await handlePostEvent(event, bot, message, args);
            break;
        case DM:
            await handleDmEvent(event, bot, message, args);
            break;
        case UNLOCK:
            await handleUnlockEvent(event, bot, message, args);
            break;
        case ROLE:
            await handleRoleEvent(event, bot, message, args);
    }
    if (event.delay) {
        await setTimeout(() => {}, delay);
    }
    return;
};

const handlePostEvent = async (event, bot, message, args) => {
    const { roomName, content, makeContent, npc } = event;

    const room = await Room.getByName(roomName);
    const response = content || makeContent(message);
    const channel = await room.textChannel(bot);

    if (npc && npcConfig.npc) {
        const webhook = await getWebhookForChannel(channel);
        const { name, url } = npcConfig[npc];

        await webhook.send({
            embeds: [response],
            username: name,
            avatarURL: url,
        });
        await webhook.delete();
        return;
    }
    await channel.send(response);
};

const handleDmEvent = async (event, bot, message, args) => {
    const { content, makeContent, playerOverride } = event;

    const player = playerOverride || message.author;
    const response = content || makeContent(message);

    await player.send(response);
};

const handleUnlockEvent = async (event, bot, message, args) => {
    const { roomName, statusOverride } = event;

    const room = await Room.getByName(roomName);
    logger.info("unlocking", { roomName });
    await room.updateState(bot, statusOverride || 0);
};

const handleRoleEvent = async (event, bot, message, args) => {
    const { role } = event;

    const player = message.member;

    await player.roles.add(role);
};
module.exports = { handleEvent, handleEvents };
