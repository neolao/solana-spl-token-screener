import { statSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function getHistoricalOHLCV(baseAddress, targetAddress, year) {
    const filePath = `${__dirname}/../data/${baseAddress}_${targetAddress}/${year}.json`;
    const filePathStat = statSync(filePath, { throwIfNoEntry: false });
    if (!filePathStat || !filePathStat.isFile()) {
        return {};
    }

    const content = readFileSync(filePath);
    const historical = JSON.parse(content);
    return historical;
}
