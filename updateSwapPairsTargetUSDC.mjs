import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const response = await fetch("https://stats.jup.ag/coingecko/pairs")
const pairs = await response.json();

const filtered = [];
for (const pair of pairs) {
    if (!pair.hasOwnProperty("base")) {
        continue;
    }

    if (["USDC", "USDT"].includes(pair.base)) {
        continue;
    }

    // USDC
    if (pair.target_address === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") {
        filtered.push(pair);
    }
}

const json = JSON.stringify(filtered, null, "  ");
writeFileSync(`${__dirname}/data/pairs.json`, json);

// Summary
const oldPairs = JSON.parse(readFileSync(`${__dirname}/data/pairs.json`));
const oldBases = oldPairs.map(pair => pair.base);
const newBases = filtered.map(pair => pair.base);
const removed = oldBases.filter(base => !newBases.includes(base));
const added = newBases.filter(base => !oldBases.includes(base));
console.log("Removed", removed);
console.log("Added", added);
