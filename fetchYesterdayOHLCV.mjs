import { statSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import getConfig from "./getConfig.mjs";
import fetchOHLCV from "./birdeye/fetchOHLCV.mjs";
import getYesterdayTime from "./utils/getYesterdayTime.mjs";
import getLastOHLCVTime from "./utils/getLastOHLCVTime.mjs";
import saveLastOHLCVTime from "./utils/saveLastOHLCVTime.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = getConfig();
const pairsContent = readFileSync(`${__dirname}/data/pairs.json`);
const pairs = JSON.parse(pairsContent);

async function fetchYesterday(baseAddress, targetAddress, year) {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    yesterday.setUTCHours(0);
    yesterday.setUTCMinutes(0);
    yesterday.setUTCSeconds(0);
    yesterday.setUTCMilliseconds(0);
    const yesterdayTime = Math.floor(yesterday.getTime() / 1000);

    const type = "1D";
    const timeFrom = yesterdayTime;
    const timeTo = yesterdayTime;

    const url = `https://public-api.birdeye.so/defi/ohlcv/base_quote?base_address=${baseAddress}&quote_address=${targetAddress}&type=${type}&time_from=${timeFrom}&time_to=${timeTo}`;
    const response = await fetch(url, { headers: { "x-api-key": config.birdeye.apiKey } });
    const content = await response.json();
    if (!content.success) {
        return [];
    }
    const candlesticks = content.data.items;

    return candlesticks;
}

for (const pair of pairs) {
    const baseSymbol = pair.base;
    const baseAddress = pair.base_address;
    const targetSymbol = pair.target;
    const targetAddress = pair.target_address;
    const folderPath = `${__dirname}/data/${baseAddress}_${targetAddress}`;
    mkdirSync(folderPath, { recursive: true });

    console.log(`Fetching ${baseSymbol}/${targetSymbol} ...`);
    const timeFrom = getLastOHLCVTime(baseAddress, targetAddress);
    const timeTo = getYesterdayTime();
    const candlesticks = await fetchOHLCV(baseAddress, targetAddress, "1D", timeFrom, timeTo);
    if (candlesticks.length <= 0) {
        continue;
    }

    // Update
    const year = (new Date()).getFullYear();
    const filePath = `${folderPath}/${year}.json`;
    const content = readFileSync(filePath);
    const historical = JSON.parse(content);
    for (const candlestick of candlesticks) {
        historical[candlestick.unixTime] = candlestick;
    }
    writeFileSync(filePath, JSON.stringify(historical, null, "  "));

    // Save the last candlestick time
    const lastCandlestick = candlesticks.pop();
    saveLastOHLCVTime(baseAddress, targetAddress, lastCandlestick.unixTime);
}
