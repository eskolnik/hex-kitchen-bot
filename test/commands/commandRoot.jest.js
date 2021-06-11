const commandRoot = require("../../src/commands/commandRoot");

xdescribe(commandRoot.handleCommand, () => {
    test("Runs dev commands in dev environment", () => {
        process.NODE_ENV = "development";

        const mockBot = {};
        commandRoot.handleCommand(mockBot, message);
    });
});
