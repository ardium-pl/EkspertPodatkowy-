import { pdfOCR } from "./services/ocr.js";

async function main() {
    const rawData = await pdfOCR();
    console.log(rawData);
}

main();
