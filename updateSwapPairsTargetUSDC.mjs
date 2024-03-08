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

    if (pair.target === "USDC") {
        filtered.push(pair);
    }
}

const json = JSON.stringify(filtered, null, "  ");
writeFileSync(`${__dirname}/data/pairs.json`, json);