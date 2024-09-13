import fs from "fs";
import { google } from "googleapis";
import path from "path";
import { auth } from "./../server/google-api.js";


export async function downloadFile(fileId, saveFolder, fileName) {
    const drive = google.drive({ version: "v3", auth: auth });
  
    try {
      const res = await drive.files.get(
        {
          fileId: fileId,
          alt: "media",
        },
        { responseType: "arraybuffer" }
      );
  
      const pdfFilePath = path.join(saveFolder, fileName);
  
      if (!fs.existsSync(saveFolder)) {
        fs.mkdirSync(saveFolder, { recursive: true });
      }
  
      // Save the file as a PDF
      fs.writeFileSync(pdfFilePath, Buffer.from(res.data, "binary"));
  
      return pdfFilePath;
    } catch (err) {
      console.error(`Error downloading file ${fileId}:`, err);
      throw err;
    }
  }