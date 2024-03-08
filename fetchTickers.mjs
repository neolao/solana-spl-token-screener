import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import getConfig from "./getConfig.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = getConfig();
const pairsContent = readFileSync(`${__dirname}/data/pairs.json`);
const pairs = JSON.parse(pairsContent);

const response = await fetch("https://stats.jup.ag/coingecko/tickers");
const tickers = await response.json();

function getTicker(id) {
    for (let index = 0; index < tickers.length; index++) {
        if (tickers[index].ticker_id === id) {
            return tickers[index];
        }
    }
    throw new Error(`Ticker not found: ${id}`);
}

for (const pair of pairs) {
    const baseSymbol = pair.base;
    const baseAddress = pair.base_address;
    const targetSymbol = pair.target;
    const targetAddress = pair.target_address;

    const tickerId = `${baseAddress}_${targetAddress}`;
    try {
        const ticker = getTicker(tickerId);
    } catch (error) {
        continue;
    }
}
