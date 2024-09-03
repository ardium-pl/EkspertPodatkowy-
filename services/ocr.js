import Tesseract from "tesseract.js";
import { listAllFiles } from "../server/google-api.js";
import { convertPdfToImages } from "../utils/convertPdfToImage.js";
import { downloadFile } from "../utils/downloadFile.js";
import { deleteFile } from "../utils/deleteFile.js";

export async function pdfOCR() {
  const folderId = "1Lf15vSzfQw0YyH_RhbXXKspPdzlqgsao";
  const inputPdfFolder = "./input-pdf";
  const imagesFolder = "./images";

  try {
    const files = await listAllFiles(folderId);

    for (const file of files) {
      console.log(`Processing file: ${file.name} (${file.id})`);

      // Download the PDF and save it locally
      const pdfFilePath = await downloadFile(file.id, inputPdfFolder, file.name);

      // Convert the PDF to images
      const imageFilePath = await convertPdfToImages(pdfFilePath, imagesFolder);

      // Process each image with Tesseract
      try {
        const {
          data: { text },
        } = await Tesseract.recognize(imageFilePath, "pol", {
          logger: (m) => console.log(m),
        });
        console.log(`Extracted text from ${file.name}:`, text);
      } catch (err) {
        console.error(`Error processing ${file.name} (${file.id}):`, err);
      }
      
      deleteFile(pdfFilePath);
      deleteFile(imageFilePath);
    }
  } catch (err) {
    console.error("Error in pdfOCR:", err);
  }
}
