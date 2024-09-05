import Tesseract from "tesseract.js";
import { listAllFiles } from "../server/google-api.js";
import { convertPdfToImages } from "../utils/convertPdfToImage.js";
import { downloadFile } from "../utils/downloadFile.js";
import { deleteFile } from "../utils/deleteFile.js";
import fs from "fs";  // Add the fs module for file system operations
import path from "path"; // Use path for cross-platform file paths

export async function pdfOCR() {
  const folderId = "1Lf15vSzfQw0YyH_RhbXXKspPdzlqgsao";
  const inputPdfFolder = "./input-pdf";
  const imagesFolder = "./images";
  const outputTextFolder = "./output-text";  // Folder to store the extracted text files

  // Ensure the output-text folder exists, if not, create it
  if (!fs.existsSync(outputTextFolder)) {
    fs.mkdirSync(outputTextFolder);
  }

  try {
    const files = await listAllFiles(folderId);
    const results = [];

    for (const file of files) {
      console.log(`Processing file: ${file.name} (${file.id})`);

      const pdfFilePath = await downloadFile(file.id, inputPdfFolder, file.name);
      const imageFilePath = await convertPdfToImages(pdfFilePath, imagesFolder);

      try {
        const { data: { text } } = await Tesseract.recognize(imageFilePath, "pol");

        // Store the result in the results array
        results.push({
          fileName: file.name,
          imagePath: imageFilePath,
          extractedText: text,
        });

        // Define the path for the output text file
        const outputTextFilePath = path.join(outputTextFolder, `${file.name}.txt`);

        // Write the extracted text to a .txt file
        fs.writeFileSync(outputTextFilePath, text, "utf8");
        console.log(`Extracted text from ${file.name} and saved to ${outputTextFilePath}`);
      } catch (err) {
        console.error(`Error processing ${file.name} (${file.id}):`, err);
      }

      // Clean up by deleting the PDF and image files
      deleteFile(pdfFilePath);
      deleteFile(imageFilePath);
    }

    return results;
  } catch (err) {
    console.error("Error in pdfOCR:", err);
    throw err;
  }
}
