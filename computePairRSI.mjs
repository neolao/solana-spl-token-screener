import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { argv } from "node:process";
import getLastOHLCV from "./utils/getLastOHLCV.mjs";
import relativeStrengthIndex from "./indicators/relativeStrengthIndex.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const baseAddress = argv[2];
const targetAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

const candlesticks = getLastOHLCV(baseAddress, targetAddress, 14);
const value = relativeStrengthIndex(candlesticks);
console.log("RSI", value);
