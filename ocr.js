import Tesseract from "tesseract.js";
import { auth, listAllFiles } from "./server/google-api.js";
import { google } from "googleapis";
import { fromBuffer } from "pdf2pic";


export async function pdfOCR() {
  const folderId = "1Lf15vSzfQw0YyH_RhbXXKspPdzlqgsao";
  try {
    const files = await listAllFiles(folderId);

    for (const file of files) {
      console.log(`Processing file: ${file.name} (${file.id})`);

      const fileContent = await downloadFile(file.id);
      console.log(fileContent);

      // Convert the PDF to images
      const image = await convertPdfToImages(fileContent);

      // Process each image with Tesseract
      try {
        const { data: { text } } = await Tesseract.recognize(image, "pol", {
          logger: (m) => console.log(m),
        });
        console.log(`Extracted text from ${file.name}:`, text);
      } catch (err) {
        console.error(`Error processing ${file.name} (${file.id}):`, err);
      }
    }
  } catch (err) {
    console.error("Error in pdfOCR:", err);
  }
}

// Example function to download the file content
async function downloadFile(fileId) {
  const drive = google.drive({ version: "v3", auth: auth });

  try {
    const res = await drive.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      { responseType: "arraybuffer" }
    );

    return Buffer.from(res.data);
  } catch (err) {
    console.error(`Error downloading file ${fileId}:`, err);
    throw err;
  }
}

async function convertPdfToImages(pdfFile) {
    const options = {
      density: 300,
      format: "png",
      width: 800,      // Increase the width for better OCR accuracy
      height: 800,     // Ensure the height is proportional
      quality: 100,     // Set the image quality to 100%
      saveFilename: "test",
      savePath: "./images",
    };
  
    const convert = fromBuffer(pdfFile, options);
    const pageToConvertAsImage = 1;
  
    try {
      const image = await convert(pageToConvertAsImage, { responseType: "buffer" });
      console.log("Page 1 is now converted as image");
      return image;  // Return the image buffer
    } catch (err) {
      console.error("Error converting PDF to image:", err);
      throw err;
    }
  }
