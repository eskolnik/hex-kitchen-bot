const fs = require("fs");

const GameScript = require("../../src/models/GameScript");
const { EVENT_TYPE, EVENT_STATUS } = require("../../src/models/ScriptEvent");
const mockScriptPath = "test/engine/mockScript.json";

describe("GameScript", () => {
    test("build from json", () => {
        const scriptFile = fs.readFileSync(mockScriptPath);

        const script = GameScript.fromJson("mockGuildId", scriptFile, {
            mockguild: true,
        });

        expect(script.getEventById(2).type).toEqual("ChannelUnlock");
        expect(script.getEvents().size).toEqual(16);
        expect(
            script.getEvents({ typeFilter: EVENT_TYPE.CHANNEL_UNLOCK }).size
        ).toEqual(4);
        expect(
            script.getEvents({ typeFilter: EVENT_TYPE.GAME_MESSAGE }).size
        ).toEqual(8);
    });
});
