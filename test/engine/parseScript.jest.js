// /**
//  * Tests for the script parser
//  */
const { parseScript } = require("../../src/engine/parseScript");
const fs = require("fs");
const mockScriptPath = "test/engine/mockScript.json";


describe("parseScript", () => {
    test("returns a set of game objects based on the input JSON", () => {
        const scriptFile = fs.readFileSync(mockScriptPath);

        const script = parseScript(scriptFile);

        expect(Object.keys(script.events).length).toEqual(12);
        expect(script.events["KitchenDoorButton"]).toEqual({
            id: "KitchenDoorButton",
            type: "EmojiReactEvent",
            targetEventId: "2",
            emoji: "🚪",
            options: {
                max: 1,
                autoRemove: true,
            },
            triggers: "KitchenOpenSequence",
            messages: [],
            status: "unavailable"
        });
        expect(script.channels.length).toEqual(2);
    });
});
