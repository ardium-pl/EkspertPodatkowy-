import vision from "@google-cloud/vision";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { checkIfFileExistsInDatabase } from "../server/fileDb.js";
import { convertPdfToImages } from "../utils/convertPdfToImage.js";
import { deleteFile } from "../utils/deleteFile.js";
import { downloadFile } from "../utils/downloadFile.js";
import { performGPTVisionOCR } from "./gpt-vision-ocr.js";
import { parseOCRText } from "./structured-ocr-parser.js";

dotenv.config();

const VISION_AUTH = {
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
    }
};

export async function pdfOCR(files) {
    const inputPdfFolder = "./input-pdf";
    const imagesFolder = "./images";
    const outputTextFolder = "./output-text";
    const gptVisionOutputFolder = "./gpt-vision-output";

    [inputPdfFolder, imagesFolder, outputTextFolder, gptVisionOutputFolder].forEach(folder => {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, {recursive: true});
        }
    });

    const client = new vision.ImageAnnotatorClient(VISION_AUTH);

    try {
        const results = [];

        for (const file of files) {

            let alreadyProcessed = await checkIfFileExistsInDatabase(file.name);
            console.log(`Checking if file has already been processed: ${file.name}`);
            
            if (alreadyProcessed) {
                console.log(`Skipping ${file.name}, it has already been processed.`);
                continue;
            }

            console.log(` ♻️ Processing file: ${file.name} (${file.id})`);

            try {
                console.log(` 🧾 Downloading PDF: ${file.name}`);
                const pdfFilePath = await downloadFile(file.id, inputPdfFolder, file.name);
                console.log(`🧾 PDF downloaded to: ${pdfFilePath}`);

                console.log(` 🖼️ Converting PDF to images: ${file.name}`);
                const imageFilePaths = await convertPdfToImages(pdfFilePath, imagesFolder);
                console.log(`🖼️ Converted PDF to images: ${imageFilePaths.join(', ')}`);

                if (imageFilePaths.length === 0) {
                    throw new Error(" 😡 No images were generated from the PDF");
                }

                let googleVisionText = '';
                let gptVisionText = '';

                // Process each image
                for (const imageFilePath of imageFilePaths) {
                    console.log(` 🕶️ Processing image with Google Vision: ${imageFilePath}`);
                    const [result] = await client.documentTextDetection(imageFilePath);
                    if (result.fullTextAnnotation) {
                        googleVisionText += result.fullTextAnnotation.text + '\n';
                    }

                    console.log(` 🤖 Processing image with GPT Vision: ${imageFilePath}`);
                    gptVisionText += await performGPTVisionOCR(imageFilePath) + '\n';
                }

                console.log(`Parsing OCR text for: ${file.name}`);
                const googleVisionStructuredData = await parseOCRText(googleVisionText);
                const gptVisionStructuredData = await parseOCRText(gptVisionText);


                results.push({
                    fileName: file.name,
                    googleVisionText: googleVisionText,
                    googleVisionData: googleVisionStructuredData,
                    // gptVisionData: gptVisionStructuredData,
                });

                // Save results
                const saveData = (folder, prefix, text, structuredData) => {
                    const textPath = path.join(folder, `${file.name}_${prefix}.txt`);
                    const jsonPath = path.join(folder, `${file.name}_${prefix}.json`);
                    fs.writeFileSync(textPath, text, "utf8");
                    fs.writeFileSync(jsonPath, JSON.stringify(structuredData, null, 2), "utf8");
                    console.log(`Saved ${prefix} results to: ${textPath} and ${jsonPath}`);
                };

                saveData(outputTextFolder, "google_vision", googleVisionText, googleVisionStructuredData);
                saveData(gptVisionOutputFolder, "gpt_vision", gptVisionText, gptVisionStructuredData);

                console.log(` 💚 Successfully processed ${file.name}`);
            } catch (err) {
                console.error(`Error processing ${file.name} (${file.id}):`, err);
            } finally {
                // Clean up temporary files
                const pdfPath = path.join(inputPdfFolder, file.name);
                if (fs.existsSync(pdfPath)) {
                    console.log(`Deleting temporary PDF: ${pdfPath}`);
                    deleteFile(pdfPath);
                }
                const imagePaths = fs.readdirSync(imagesFolder)
                    .filter(f => f.startsWith(path.basename(file.name, '.pdf') + '-'))
                    .map(f => path.join(imagesFolder, f));
                imagePaths.forEach(imagePath => {
                    console.log(`Deleting temporary image: ${imagePath}`);
                    deleteFile(imagePath);
                });
            }
        }

        return results;
    } catch (err) {
        console.error("Error in pdfOCR:", err);
        throw err;
    }
}
