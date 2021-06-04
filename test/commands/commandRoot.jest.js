const commandRoot = require("../../src/commands/commandRoot");

describe(commandRoot.handleCommand, () => {
    test("Runs dev commands in dev environment", () => {
        process.NODE_ENV = "development";

        const mockBot = {};
        commandRoot.handleCommand(mockBot, message);
    });
});
