import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const wellcomeTemplate = async (userName = "user") => {
    return await ejs.renderFile(path.join(__dirname, "welcome.ejs"), { userName });
};