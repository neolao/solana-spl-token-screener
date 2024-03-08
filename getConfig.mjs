import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function getConfig() {
    const configContent = readFileSync(`${__dirname}/config.json`);
    return JSON.parse(configContent);
}
