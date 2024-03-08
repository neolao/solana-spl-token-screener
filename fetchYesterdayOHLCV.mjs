import { statSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import getConfig from "./getConfig.mjs";
import fetchOHLCV from "./birdeye/fetchOHLCV.mjs";
import getYesterdayTime from "./utils/getYesterdayTime.mjs";
import getLastOHLCVTime from "./utils/getLastOHLCVTime.mjs";
import saveLastOHLCVTime from "./utils/saveLastOHLCVTime.mjs";
import getHistoricalOHLCV from "./utils/getHistoricalOHLCV.mjs";
import saveHistoricalOHLCV from "./utils/saveHistoricalOHLCV.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = getConfig();
const pairsContent = readFileSync(`${__dirname}/data/pairs.json`);
const pairs = JSON.parse(pairsContent);

for (const pair of pairs) {
    const baseSymbol = pair.base;
    const baseAddress = pair.base_address;
    const targetSymbol = pair.target;
    const targetAddress = pair.target_address;
    const folderPath = `${__dirname}/data/${baseAddress}_${targetAddress}`;
    mkdirSync(folderPath, { recursive: true });

    process.stdout.write(`Fetching ${baseSymbol}/${targetSymbol} ...`);
    const timeFrom = getLastOHLCVTime(baseAddress, targetAddress);
    const timeTo = getYesterdayTime();
    const candlesticks = await fetchOHLCV(baseAddress, targetAddress, "1D", timeFrom, timeTo);
    if (candlesticks.length <= 0) {
        process.stdout.write(`\n`);
        continue;
    }

    // Update
    const year = (new Date()).getFullYear();
    const filePath = `${folderPath}/${year}.json`;
    const historical = getHistoricalOHLCV(baseAddress, targetAddress, year);
    let addedCount = 0;
    for (const candlestick of candlesticks) {
        if (!historical.hasOwnProperty(candlestick.unixTime)) {
            historical[candlestick.unixTime] = candlestick;
            addedCount++;
        }
    }
    saveHistoricalOHLCV(baseAddress, targetAddress, year, historical);

    // Save the last candlestick time
    const lastCandlestick = candlesticks.pop();
    saveLastOHLCVTime(baseAddress, targetAddress, lastCandlestick.unixTime);

    process.stdout.write(` ${addedCount} added\n`);
}
