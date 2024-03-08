import { statSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import getConfig from "./getConfig.mjs";
import fetchOHLCV from "./birdeye/fetchOHLCV.mjs";
import getYesterdayTime from "./utils/getYesterdayTime.mjs";
import getLastOHLCVTime from "./utils/getLastOHLCVTime.mjs";
import saveLastOHLCVTime from "./utils/saveLastOHLCVTime.mjs";
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

    const lastTime = getLastOHLCVTime(baseAddress, targetAddress);
    const lastYear = (new Date(lastTime * 1000)).getFullYear();
    const currentYear = (new Date()).getFullYear();
    for (let year = lastYear; year <= currentYear; year++) {
        process.stdout.write(`Fetching ${baseSymbol}/${targetSymbol} ${year} ...`);
        const timeFrom = Math.floor((new Date(`${year}-01-01`)).getTime() / 1000);
        const yesterdayTime = getYesterdayTime();
        let timeTo = Math.floor(((new Date(`${year + 1}-01-01`)).getTime() - 1) / 1000);
        if (timeTo > yesterdayTime) {
            timeTo = yesterdayTime;
        }
        const candlesticks = await fetchOHLCV(baseAddress, targetAddress, "1D", timeFrom, timeTo);
        if (candlesticks.length <= 0) {
            process.stdout.write(`\n`);
            continue;
        }

        const historical = {};
        for (const candlestick of candlesticks) {
            historical[candlestick.unixTime] = candlestick;
        }
        saveHistoricalOHLCV(baseAddress, targetAddress, year, historical);

        // Save the last candlestick time
        const lastCandlestick = candlesticks.pop();
        saveLastOHLCVTime(baseAddress, targetAddress, lastCandlestick.unixTime);

        process.stdout.write(` ${candlesticks.length} added\n`);
    }
}
