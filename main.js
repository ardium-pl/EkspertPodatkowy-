import { pdfOCR } from "./services/ocr.js";
import { listAllFiles } from "./server/google-api.js";
import { insertInvoiceBaseData } from "./server/database.js";
import { insertFileIntoDatabase } from "./server/fileDb.js";

async function main() {
  const errorFilesTableName = "error_files";
  const processedFilesTableName = "files";

  const folderId = process.env.FOLDER_ID;
  try {
    console.log(" 💾 Listing files from Google Drive...");
    const files = await listAllFiles(folderId);
    console.log(` 💾 Found ${files.length} files`);
    const processedData = await pdfOCR(files);
    console.log("Processed data:", JSON.stringify(processedData, null, 2));

    for (const [index, object] of processedData.entries()) {
      try {
        await insertInvoiceBaseData(object.googleVisionData, index);
      } catch (err) {
        console.log("Error inserting invoice data into taxPro db: " + err);
        insertFileIntoDatabase(
          object.fileName,
          object.googleVisionText,
          object.googleVisionData,
          errorFilesTableName
        );
      }
      insertFileIntoDatabase(
        object.fileName,
        object.googleVisionText,
        object.googleVisionData,
        processedFilesTableName
      );
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
