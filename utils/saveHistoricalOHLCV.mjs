import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function saveHistoricalOHLCV(baseAddress, targetAddress, year, historical) {
    const folderPath = `${__dirname}/../data/${baseAddress}_${targetAddress}`;
    mkdirSync(folderPath, { recursive: true });

    const filePath = `${folderPath}/${year}.json`;

    const content = JSON.stringify(historical, null, "  ");
    writeFileSync(filePath, content);
}
