import { statSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import getConfig from "./getConfig.mjs";
import getYesterdayTime from "./utils/getYesterdayTime.mjs";
import getLastOHLCVTime from "./utils/getLastOHLCVTime.mjs";
import saveLastOHLCVTime from "./utils/saveLastOHLCVTime.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = getConfig();
const pairsContent = readFileSync(`${__dirname}/data/pairs.json`);
const pairs = JSON.parse(pairsContent);

async function fetchYear(baseAddress, targetAddress, year) {
    const yesterdayTime = getYesterdayTime();

    const type = "1D";
    const timeFrom = Math.floor((new Date(`${year}-01-01`)).getTime() / 1000);
    let timeTo = Math.floor(((new Date(`${year + 1}-01-01`)).getTime() - 1) / 1000);
    if (timeTo > yesterdayTime) {
        timeTo = yesterdayTime;
    }

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

    const lastTime = getLastOHLCVTime(baseAddress, targetAddress);
    const lastYear = (new Date(lastTime * 1000)).getFullYear();
    const currentYear = (new Date()).getFullYear();
    for (let year = lastYear; year <= currentYear; year++) {
        console.log(`Fetching ${baseSymbol}/${targetSymbol} ${year} ...`);
        const candlesticks = await fetchYear(baseAddress, targetAddress, year);
        if (candlesticks.length <= 0) {
            continue;
        }

        const filePath = `${folderPath}/${year}.json`;
        const historical = {};
        for (const candlestick of candlesticks) {
            historical[candlestick.unixTime] = candlestick;
        }
        writeFileSync(filePath, JSON.stringify(historical, null, "  "));

        // Save the last candlestick time
        const lastCandlestick = candlesticks.pop();
        saveLastOHLCVTime(baseAddress, targetAddress, lastCandlestick.unixTime);
    }
}
