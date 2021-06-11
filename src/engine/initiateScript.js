const { parseScript } = require("./parseScript");
const { handleEvent } = require("./handleEvent");

const initiateScript = (scriptJSON, bot, guild) => {
    // Parse script json
    const gameScript = parseScript(scriptJSON);

    // Assign guild to script
    gameScript.guild = guild;

    // Set up message cache, keyed by event id
    // gameScript.gameMessages = {};
    Object.entries(gameScript.events).forEach((key, value) => {
        value["messageId"] = "";
    });

    // Set up initial events
    handleEvent(gameScript.events[gameScript.initialEvent], bot, gameScript);

    return gameScript;
};

module.exports = { initiateScript };
