import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { argv } from "node:process";
import getLastOHLCV from "./utils/getLastOHLCV.mjs";
import relativeStrengthIndex from "./indicators/relativeStrengthIndex.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const baseAddress = argv[2];
const targetAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

const pairsContent = readFileSync(`${__dirname}/data/pairs.json`);
const pairs = JSON.parse(pairsContent);
const pair = pairs.filter((pair) => {
    return pair.base_address === baseAddress && pair.target_address === targetAddress;
})[0];
if (pair === undefined) {
    throw new Error(`Pair not found`);
}

const columns = process.stdout.columns;
const rows = process.stdout.rows - 4;

const candlesticks = getLastOHLCV(baseAddress, targetAddress, columns);

// Find the lowest low and the highest high
let lowestLow = Infinity;
let highestHigh = -Infinity;
for (let candlestick of candlesticks) {
    if (candlestick.h > highestHigh) {
        highestHigh = candlestick.h;
    }
    if (candlestick.l < lowestLow) {
        lowestLow = candlestick.l;
    }
}

const verticalRange = highestHigh - lowestLow;

function cursorTo(column, row) {
    return new Promise((resolve, reject) => {
        process.stdout.cursorTo(column, row, () => {
            resolve();
        });
    });
}
function writeCharacterAt(character, column, row) {
    return new Promise((resolve, reject) => {
        process.stdout.cursorTo(column, row, () => {
            process.stdout.write(character, () => {
                resolve();
            });
        });
    });
}
function red(character) {
    return `\x1b[31m${character}\x1b[0m`;
}
function green(character) {
    return `\x1b[32m${character}\x1b[0m`;
}

console.clear();
let column = 0;
for (let candlestick of candlesticks) {
    column++;
    const rowLow = rows - Math.round((candlestick.l - lowestLow) / verticalRange * rows);
    const rowHigh = rows - Math.round((candlestick.h - lowestLow) / verticalRange * rows);
    const rowOpen = rows - Math.round((candlestick.o - lowestLow) / verticalRange * rows);
    const rowClose = rows - Math.round((candlestick.c - lowestLow) / verticalRange * rows);
    const rowBodyLow = (candlestick.o < candlestick.c) ? rowOpen : rowClose;
    const rowBodyHigh = (candlestick.c > candlestick.o) ? rowClose : rowOpen;
    const isGreen = candlestick.c > candlestick.o;

    if (rowLow === rowOpen && rowLow === rowClose && rowLow === rowHigh) {
        const character = isGreen ? green("┼") : red("┼");
        await writeCharacterAt(character, column, rowLow);
        continue;
    }

    for (let rowIndex = rowHigh; rowIndex <= rowLow; rowIndex++) {
        const character = isGreen ? green("│") : red("│");
        await writeCharacterAt(character, column, rowIndex);
    }

    if (rowOpen === rowClose) {
        const character = isGreen ? green("┼") : red("┼");
        await writeCharacterAt(character, column, rowOpen);
    } else {
        const character = isGreen ? green("█") : red("█");
        for (let rowIndex = rowBodyHigh; rowIndex <= rowBodyLow; rowIndex++) {
            await writeCharacterAt(character, column, rowIndex);
        }
    }

}
await cursorTo(0, rows+1);

// Infos
console.log(pair.base, "/", pair.target, "~", pair.base_address, "/", pair.target_address);

const firstCandlestick = candlesticks[0];
const lastCandlestick = candlesticks[candlesticks.length - 1];
const periodStartDate = new Date(firstCandlestick.unixTime * 1000);
const periodEndDate = new Date(lastCandlestick.unixTime * 1000);
console.log(
    periodStartDate.toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}),
    "-",
    periodEndDate.toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}),
);
