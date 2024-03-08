import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import getConfig from "../getConfig.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = getConfig();

export default async function fetchOHLVC(baseAddress, targetAddress, type, timeFrom, timeTo) {
    const url = `https://public-api.birdeye.so/defi/ohlcv/base_quote?base_address=${baseAddress}&quote_address=${targetAddress}&type=${type}&time_from=${timeFrom}&time_to=${timeTo}`;
    const response = await fetch(url, { headers: { "x-api-key": config.birdeye.apiKey } });
    const content = await response.json();
    if (!content.success) {
        return [];
    }
    const candlesticks = content.data.items;

    return candlesticks;
}
