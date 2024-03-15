import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import getConfig from "./getConfig.mjs";
import getYesterdayTime from "./utils/getYesterdayTime.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = getConfig();

//const baseAddress = "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh";
const baseAddress = "AaAEw2VCw1XzgvKB8Rj2DyK2ZVau9fbt2bE8hZFWsMyE";
const quoteAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const type = "1D";

const dayDuration = 86400; // seconds
const timeTo = getYesterdayTime();
const timeFrom = timeTo - dayDuration * 2;
const url = `https://public-api.birdeye.so/defi/ohlcv/base_quote?base_address=${baseAddress}&quote_address=${quoteAddress}&type=${type}&time_from=${timeFrom}&time_to=${timeTo}`;
//const url = `https://public-api.birdeye.so/defi/history`;
const response = await fetch(url, { headers: { "x-api-key": config.birdeye.apiKey } });

const content = await response.json();
console.log(response.headers, content);
