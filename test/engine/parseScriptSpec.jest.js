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

        expect(Object.keys(script.events).length).toEqual(16);
        expect(script.events["5"]).toMatchSnapshot();
        expect(script.channels.length).toEqual(4);
        expect(script.categoryChannels.length).toEqual(2);
    });
});
