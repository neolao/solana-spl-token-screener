import { statSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function getLastOHLCVTime(baseAddress, targetAddress) {
    const folderPath = `${__dirname}/../data/${baseAddress}_${targetAddress}`;
    const lastTimePath = `${folderPath}/lastTime.json`;
    const lastTimePathStat = statSync(lastTimePath, { throwIfNoEntry: false });
    let lastTime = Math.floor((new Date("2020-01-01")).getTime() / 1000);
    if (lastTimePathStat && lastTimePathStat.isFile()) {
        lastTime = JSON.parse(readFileSync(lastTimePath));
    }

    return lastTime;
}
