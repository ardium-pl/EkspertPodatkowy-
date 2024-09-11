import vision from "@google-cloud/vision";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { listAllFiles } from "../server/google-api.js";
import { convertPdfToImages } from "../utils/convertPdfToImage.js";
import { deleteFile } from "../utils/deleteFile.js";
import { downloadFile } from "../utils/downloadFile.js";
import { parseOCRText } from "./structured-ocr-parser.js";

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
                    const [result] = await client.documentTextDetection(imageFilePath); // OCR on the image
                    const fullTextAnnotation = result.fullTextAnnotation;

                    if (fullTextAnnotation) {
                        extractedText += fullTextAnnotation.text;
                    }
                }

                const structuredData = await parseOCRText(extractedText);

                results.push({
                    fileName: file.name,
                    structuredData: structuredData,
                });

                const outputTextFilePath = path.join(outputTextFolder, `${file.name}.txt`);
                const outputJsonFilePath = path.join(outputTextFolder, `${file.name}.json`);

                fs.writeFileSync(outputTextFilePath, extractedText, "utf8");
                fs.writeFileSync(outputJsonFilePath, JSON.stringify(structuredData, null, 2), "utf8");
                console.log(`Processed ${file.name} and saved results`);
            } catch (err) {
                console.error(`Error processing ${file.name} (${file.id}):`, err);
            }

            deleteFile(pdfFilePath);
            for (const imageFilePath of imageFilePaths) {
                deleteFile(imageFilePath);
            }
        }

        return results;
    } catch (err) {
        console.error("Error in pdfOCR:", err);
        throw err;
    }
}
