const t = "┬";
const l = "├";
const b = "┴";
const r = "┤";
const q = "┌";
const w = "┐";
const a = "└";
const s = "┘";
const h = "─";
const v = "│";
const x = "┼";

let basetile = `- - - - - - - 
 - - - - - - - 
 - - - - - - - 
 - - - - - - - `;

let t0_0 = `- -q-h-h-h-h-h
 - -v- - -q-h-h
 - -v- - -v- -
 - -v- - -v- - `;

let t0_1 = `h-h-h-h-h-w- - 
 h-h-w- - -v- - 
 - -v- - - - -<=
 - -a-h-h-h- - `;

let t1_0 = ` - -v- - -v- - 
  - -v- - -a-h-h 
  - -a-h-h-h-h-h
  - - - - - - - `;
let t1_1 = ` - - - - - - - 
 h-h-h-h-h-w- - 
 h-h-w- - -v- - 
  - -v-$-$-v- - `;

// const tiles = [[t0_0, currentTile]]
const tiles = [
    [t0_0, t0_1],
    [t1_0, t1_1],
];

const exits = [
    [["right", "down"], ["left"]],
    [["up", "right"], ["left"]],
];

const descriptions = [
    [
        "An empty hallway with exits to the east and south",
        "The entrance to the labyrinth..or is it? (It is)",
    ],
    [
        "An empty hallway with exits to the north and east",
        "Money! There's money on the ground! It's not real! Pick it up anyway!",
    ],
];

const lines = (m) => m.split("\n").map((l) => l.split("-"));
const transform = (line) =>
    line.map((char) => {
        if (char === " ") {
            return char;
        }
        if (char === "" || char === "  ") {
            return " ";
        }
        try {
            return eval(char);
        } catch (err) {
            return char;
        }
    });
const combine = (m) => m.map((l) => l.join("")).join("\n");

const convertTile = (tile) => lines(tile).map(transform);

const convertTileMap = (tiles) => tiles.map((row) => row.map(convertTile));

const getNthRow = (tileRow, n) =>
    tileRow.reduce((line, tile) => line.concat(tile[n]), []);

const combineTileMap = (map) =>
    map
        .map((tileRow) => {
            const combinedRows = tileRow[0].map((charRow, idx) => {
                // combine all rows in tileRow at idx
                const nthRow = getNthRow(tileRow, idx);
                return nthRow.join("");
            });

            return combinedRows.join("\n");
        })
        .join("\n");

const ccTileMap = (tileMap) => combineTileMap(convertTileMap(tileMap));
const ccTile = (tile) => combine(convertTile(tile));

module.exports = {
    tiles,
    exits,
    descriptions,
    ccTile,
    ccTileMap,
};
