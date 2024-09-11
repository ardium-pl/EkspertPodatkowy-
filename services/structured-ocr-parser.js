import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const Product = z.object({
    index: z.string(),
    name: z.string(),
    quantity: z.number(),
    net_price: z.number(),
    vat_rate: z.number(),
    vat_value: z.number(),
    gross_price: z.number()
});

const InvoiceData = z.object({
    invoiceNumber: z.string(),
    sellerNip: z.string(),
    shipDate: z.string(),
    documentDate: z.string(),
    address: z.string(),
    sellerName: z.string(),
    invoiceNettoValue: z.number(),
    invoiceBruttoValue: z.number(),
    bankAccount: z.string(),
    products: z.array(Product)
});

async function parseOCRText(ocrText) {
    const completion = await client.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
            {
                role: "system",
                content: "You are an expert in parsing invoice data from OCR text. Extract the relevant information and " +
                    "structure it according to the provided schema."
            },
            { role: "user", content: ocrText }
        ],
        response_format: zodResponseFormat(InvoiceData, 'invoiceData'),
    });

    const message = completion.choices[0]?.message;
    if (message?.parsed) {
        return message.parsed;
    } else if (message?.refusal) {
        throw new Error(` 🤖 AI refused to process the text: ${message.refusal}`);
    } else {
        throw new Error('Failed to parse OCR text');
    }
}

export { parseOCRText };