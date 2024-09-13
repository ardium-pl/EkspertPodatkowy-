import {pdfOCR} from "./services/ocr.js";
import { listAllFiles } from "./server/google-api.js";
import { insertInvoiceBaseData } from "./server/database.js";

async function main() {
    const folderId = process.env.FOLDER_ID;
    try {
        console.log(" 💾 Listing files from Google Drive...");
        const files = await listAllFiles(folderId);
        console.log(` 💾 Found ${files.length} files`);
        const processedData = await pdfOCR(files);
        console.log("Processed data:", JSON.stringify(processedData, null, 2));

        for (const [index, object] of processedData.entries()) {
           await insertInvoiceBaseData(object.googleVisionData, index);
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();