const dButtons = require("discord-buttons");
const mapTiles = require("./mapTiles");

module.exports = {
    name: "maze-demo",
    aliases: [],
    usageFilter: null,
    usageHelp: "",
    run: async (bot, message, args) => {
        // Set up map and state

        const { channel } = message;

        let mapGrid = mapTiles.tiles;
        let position = [1, 0];
        const coordDeltas = (direction) => {
            switch (direction) {
                case "up":
                    return [0, -1];
                case "down":
                    return [0, 1];
                case "right":
                    return [1, 0];
                case "left":
                    return [-1, 0];
                default:
                    return [0, 0];
            }
        };

        let goal = [1, 1];
        let success = false;

        const buttonIdSuffix = channel.guild.id + Date.now().toString();

        const upButtonId = "up-" + buttonIdSuffix;
        const downButtonId = "down-" + buttonIdSuffix;
        const leftButtonId = "left-" + buttonIdSuffix;
        const rightButtonId = "right-" + buttonIdSuffix;
        const closeButtonId = "close-" + buttonIdSuffix;

        let upButton = new dButtons.MessageButton()
            .setLabel("Up")
            .setStyle("blurple")
            .setID(upButtonId);

        let downButton = new dButtons.MessageButton()
            .setLabel("Down")
            .setStyle("blurple")
            .setID(downButtonId);

        let leftButton = new dButtons.MessageButton()
            .setLabel("Left")
            .setStyle("blurple")
            .setID(leftButtonId);

        let rightButton = new dButtons.MessageButton()
            .setLabel("Right")
            .setStyle("blurple")
            .setID(rightButtonId);

        let closeButton = new dButtons.MessageButton()
            .setLabel("Close")
            .setStyle("red")
            .setEmoji("✖️")
            .setID(closeButtonId);

        let controlButtons = new dButtons.MessageActionRow()
            .addComponent(upButton)
            .addComponent(downButton)
            .addComponent(leftButton)
            .addComponent(rightButton)
            .addComponent(closeButton);

        const isLegalPosition = (x, y) =>
            x >= 0 && y >= 0 && x < mapGrid[0].length && y < mapGrid.length;

        const getTile = (grid, x, y) => grid[y][x];
        const getTileDescription = (x, y) => mapTiles.descriptions[y][x];

        const positionToTileString = (x, y) => {
            if (isLegalPosition(x, y)) {
                return `${"```"}${mapTiles.ccTile(
                    getTile(mapGrid, x, y)
                )}${"```"}\n${getTileDescription(x, y)}`;
            }
            return "Illegal Position";
        };

        let mapMessage = await channel.send(positionToTileString(...position));

        const updatePosition = async (direction) => {
            const exits = mapTiles.exits[position[1]][position[0]];
            if (!exits.includes(direction)) {
                return;
            }
            const [dX, dY] = coordDeltas(direction);

            const newPosition = [position[0] + dX, position[1] + dY];
            if (isLegalPosition(...newPosition)) {
                position = newPosition;
                await mapMessage.edit(positionToTileString(...position));
            }
        };

        const controlsMessage = await channel.send("Find the $$", {
            component: controlButtons,
        });

        let messagesMarkedForDeletion = [message, mapMessage, controlsMessage];

        const handleSuccess = async () => {
            const atGoal = position[0] === goal[0] && position[1] === goal[1];
            if (!atGoal || success) {
                return;
            }
            // if we've reached goal for the first time
            success = true;
            const successMessage =
                await channel.send(`You did it! You found the $$! Here's the full map:
            ${"```"}${mapTiles.ccTileMap(mapGrid)}${"```"}`);

            messagesMarkedForDeletion.push(successMessage);
        };

        const endTask = () =>
            messagesMarkedForDeletion.forEach((m) => {
                m.delete().catch((err) => console.log(err));
            });

        async function clickHandler(button) {
            try {
                // match id and button direction
                const buttonId = button.id;

                const controlsRegex = new RegExp(
                    `(up|down|left|right|close)-${buttonIdSuffix}`
                );

                const match = controlsRegex.exec(buttonId);
                if (!(match && match[1])) {
                    return;
                }

                await button.defer(true);

                const direction = match[1];
                if (direction === "close") {
                    endTask();
                    return;
                    // TODO: remove listener (or not if its all one big one)
                }

                await updatePosition(direction);
                await handleSuccess();
            } catch (error) {
                console.log(error);
            }
        }

        bot.on("clickButton", clickHandler);
    },
};
