import {pdfOCR} from "./services/ocr.js";

async function main() {
    try {
        const processedData = await pdfOCR();
        console.log("Processed data:", JSON.stringify(processedData, null, 2));

        for (const item of processedData) {
            console.log(`File: ${item.fileName}`);
            console.log(`Invoice Number: ${item.structuredData.invoiceNumber}`);
            console.log(`Seller: ${item.structuredData.sellerName}`);
            console.log(`Total Value: ${item.structuredData.invoiceBruttoValue}`);
            console.log("Products:");
            item.structuredData.products.forEach((product, index) => {
                console.log(`  ${index + 1}. ${product.name} - Quantity: ${product.quantity}, Price: ${product.gross_price}`);
            });
            console.log("---");
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();