import {pdfOCR} from "./services/ocr.js";

async function main() {
    try {
        const processedData = await pdfOCR();
        console.log("Processed data:", JSON.stringify(processedData, null, 2));

        for (const item of processedData) {
            console.log(`File: ${item.fileName}`);

            console.log("Google Vision Results:");
            console.log(`Invoice Number: ${item.googleVisionData.invoiceNumber}`);
            console.log(`Seller: ${item.googleVisionData.sellerName}`);
            console.log(`Total Value: ${item.googleVisionData.invoiceBruttoValue}`);
            console.log("Products:");
            item.googleVisionData.products.forEach((product, index) => {
                console.log(`  ${index + 1}. ${product.name} - Quantity: ${product.quantity}, Price: ${product.gross_price}`);
            });

            console.log("\nGPT Vision Results:");
            console.log(`Invoice Number: ${item.gptVisionData.invoiceNumber}`);
            console.log(`Seller: ${item.gptVisionData.sellerName}`);
            console.log(`Total Value: ${item.gptVisionData.invoiceBruttoValue}`);
            console.log("Products:");
            item.gptVisionData.products.forEach((product, index) => {
                console.log(`  ${index + 1}. ${product.name} - Quantity: ${product.quantity}, Price: ${product.gross_price}`);
            });

            console.log("---");
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();