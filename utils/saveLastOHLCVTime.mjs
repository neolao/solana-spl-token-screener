import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function saveLastOHLCVTime(baseAddress, targetAddress, time) {
    const folderPath = `${__dirname}/../data/${baseAddress}_${targetAddress}`;
    const lastTimePath = `${folderPath}/lastTime.json`;

    writeFileSync(lastTimePath, `${time}`);
}
