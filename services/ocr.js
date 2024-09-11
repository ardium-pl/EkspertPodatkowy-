import vision from "@google-cloud/vision";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { listAllFiles } from "../server/google-api.js";
import { convertPdfToImages } from "../utils/convertPdfToImage.js";
import { deleteFile } from "../utils/deleteFile.js";
import { downloadFile } from "../utils/downloadFile.js";

dotenv.config();

const VISION_AUTH = {
  credentials:{
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY, 
  }
};

export async function pdfOCR() {
  const folderId = "1Lf15vSzfQw0YyH_RhbXXKspPdzlqgsao";
  const inputPdfFolder = "./input-pdf";
  const imagesFolder = "./images";
  const outputTextFolder = "./output-text";  

  if (!fs.existsSync(outputTextFolder)) {
    fs.mkdirSync(outputTextFolder);
  }

  const client = new vision.ImageAnnotatorClient(VISION_AUTH);

  try {
    const files = await listAllFiles(folderId);
    const results = [];

    for (const file of files) {
      console.log(`Processing file: ${file.name} (${file.id})`);

      const pdfFilePath = await downloadFile(file.id, inputPdfFolder, file.name);

      const imageFilePaths = await convertPdfToImages(pdfFilePath, imagesFolder);
      let extractedText = '';

      try {
        for (const imageFilePath of imageFilePaths) {
          const [result] = await client.documentTextDetection(imageFilePath);
          const fullTextAnnotation = result.fullTextAnnotation;

          if (fullTextAnnotation) {
            extractedText += fullTextAnnotation.text; 
          }

          deleteFile(imageFilePath);
        }

        results.push({
          fileName: file.name,
          imagePaths: imageFilePaths,
          extractedText,
        });

        const outputTextFilePath = path.join(outputTextFolder, `${file.name}.txt`);

        fs.writeFileSync(outputTextFilePath, extractedText, "utf8");
        console.log(`Extracted text from ${file.name} and saved to ${outputTextFilePath}`);
      } catch (err) {
        console.error(`Error processing ${file.name} (${file.id}):`, err);
      }

      deleteFile(pdfFilePath);
    }

    return results;
  } catch (err) {
    console.error("Error in pdfOCR:", err);
    throw err;
  }
}
