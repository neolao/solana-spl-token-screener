import { statSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import getConfig from "./getConfig.mjs";
import getYesterdayTime from "./utils/getYesterdayTime.mjs";
import getLastOHLCVTime from "./utils/getLastOHLCVTime.mjs";
import getHistoricalOHLCV from "./utils/getHistoricalOHLCV.mjs";
import getLastOHLCV from "./utils/getLastOHLCV.mjs";
import relativeStrengthIndex from "./indicators/relativeStrengthIndex.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = getConfig();
const pairsContent = readFileSync(`${__dirname}/data/pairs.json`);
const pairs = JSON.parse(pairsContent);

function computeRSI(candlesticks) {
    if (candlesticks.length < 14) {
        throw new Error(`Not enough candlesticks to compute RSI: ${candlesticks.length}`);
    }

    const rsi = [];
    for (let index = 14; index < candlesticks.length; index++) {
        const subCandlesticks = candlesticks.slice(index - 14, index);
        const value = relativeStrengthIndex(subCandlesticks);
        rsi.push(value);
    }
    return rsi;
}

function computeSMA(values) {
    if (values.length < 14) {
        throw new Error(`Not enough values to compute SMA: ${values.length}`);
    }

    const sma = [];
    for (let index = 14; index < values.length; index++) {
        const subValues = values.slice(index - 14, index);
        const sum = subValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        sma.push(sum / subValues.length);
    }
    return sma;
}

const filtered = new Map();
for (const pair of pairs) {
    const baseSymbol = pair.base;
    const baseAddress = pair.base_address;
    const targetSymbol = pair.target;
    const targetAddress = pair.target_address;

    const candlesticks = getLastOHLCV(baseAddress, targetAddress, 90);
    if (candlesticks.length < 90) {
        continue;
    }
    const rsi = computeRSI(candlesticks);
    const rsi_sma = computeSMA(rsi);
    const previousRSI = rsi[rsi.length - 2];
    const currentRSI = rsi[rsi.length - 1];
    const previousRSISMA = rsi_sma[rsi_sma.length - 2];
    const currentRSISMA = rsi_sma[rsi_sma.length - 1];
    if (currentRSI < 50 && currentRSI > currentRSISMA && previousRSI < previousRSISMA) {
        filtered.set(pair, {rsi, rsi_sma, currentRSI, currentRSISMA});
    }
}

for (const pair of filtered.keys()) {
    const { rsi, rsi_sma, currentRSI, currentRSISMA } = filtered.get(pair);
    console.log(pair.base, pair.base_address, `https://birdeye.so/token/${pair.base_address}?chain=solana`);
}
