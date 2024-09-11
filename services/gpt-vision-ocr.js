import OpenAI from 'openai';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function performGPTVisionOCR(imagePath) {
    try {
        const imageBuffer = await fs.readFile(imagePath);
        const base64Image = imageBuffer.toString('base64');

        const response = await openai.chat.completions.create({
            model: "gpt-4o-2024-08-06",
            messages: [
                {
                    role: "user",
                    content: [
                        {type: "text", text: "Please perform OCR on this image and extract all the text you can see."},
                        {type: "image_url", image_url: {url: `data:image/jpeg;base64,${base64Image}`}},
                    ],
                },
            ],
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error in GPT Vision OCR:", error);
        throw error;
    }
}