import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import getConfig from "../getConfig.mjs";
import wait from "../utils/wait.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = getConfig();

/*
HeadersList {
  cookies: null,
  [Symbol(headers map)]: Map(14) {
    'date' => { name: 'Date', value: 'Fri, 15 Mar 2024 16:20:20 GMT' },
    'content-type' => { name: 'Content-Type', value: 'application/json; charset=utf-8' },
    'content-length' => { name: 'Content-Length', value: '47' },
    'connection' => { name: 'Connection', value: 'keep-alive' },
    'x-powered-by' => { name: 'X-Powered-By', value: 'Express' },
    'access-control-allow-origin' => { name: 'Access-Control-Allow-Origin', value: '*' },
    'x-ratelimit-limit' => { name: 'X-RateLimit-Limit', value: '4000' },
    'x-ratelimit-remaining' => { name: 'X-RateLimit-Remaining', value: '0' },
    'x-ratelimit-reset' => { name: 'X-RateLimit-Reset', value: '1710519622' },
    'retry-after' => { name: 'Retry-After', value: '60' },
    'etag' => { name: 'ETag', value: 'W/"2f-BF3KBqsSrTsoh+XFEwrSIGsJz4E"' },
    'cf-cache-status' => { name: 'CF-Cache-Status', value: 'DYNAMIC' },
    'server' => { name: 'Server', value: 'cloudflare' },
    'cf-ray' => { name: 'CF-RAY', value: '864dd48a7ce33a49-FRA' }
  },
 */
export default async function fetchOHLVC(baseAddress, targetAddress, type, timeFrom, timeTo) {
    const url = `https://public-api.birdeye.so/defi/ohlcv/base_quote?base_address=${baseAddress}&quote_address=${targetAddress}&type=${type}&time_from=${timeFrom}&time_to=${timeTo}`;
    let candlesticks;

    let retryCount = 0;
    do {
        let waitDuration = 60;
        let response;
        let content;
        try {
            response = await fetch(url, { headers: { "x-api-key": config.birdeye.apiKey } });
            content = await response.json();
        } catch (error) {
            process.stdout.write(` retry…`);
            await wait(waitDuration * 1000);
            continue;
        }

        if (content.success) {
            candlesticks = content.data.items;
            break;
        }

        if (content.message === "Internal Server Error") {
            candlesticks = [];
            process.stdout.write(` Internal Server Error`);
            break;
        }

        retryCount++;
        if (retryCount >= 20) {
            candlesticks = [];
            process.stdout.write(` Max retry reached`);
            break;
        }

        if (response.headers.has("retry-after")) {
            waitDuration = parseInt(response.headers.get("retry-after")) + 1;
        }
        process.stdout.write(` retry…`);
        //console.log(baseAddress, targetAddress);
        await wait(waitDuration * 1000);
    } while (true);


    return candlesticks;
}
