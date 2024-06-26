// Exposes all DEV-only commands

const ping = require("./ping");
const setup = require("./setup");
const button = require("./button");
const mazeDemo = require("./maze-demo");
const ingredientDemo = require("./ingredient-demo");
const timeDemo = require("./time-demo");
const metro = require("./metro");

module.exports = [
    ping,
    setup,
    button,
    mazeDemo,
    ingredientDemo,
    timeDemo,
    metro,
];
