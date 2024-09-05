import { Poppler } from 'node-poppler';
import path from 'path';
import { replacePolishCharacters } from './replacePolishCharacters.js';

export async function convertPdfToImages(pdfFilePath, saveFolder) {
  const poppler = new Poppler();
  const outputPrefix = replacePolishCharacters(path.basename(pdfFilePath, path.extname(pdfFilePath)));
  const outputFilePath = path.join(saveFolder, `${outputPrefix}`);

  const options = {
    firstPageToConvert: 1,
    lastPageToConvert: 1,
    pngFile: true, // Convert to PNG
  };

  try {
    // Convert the first page of the PDF to an image and save to the sanitized file path
    await poppler.pdfToCairo(pdfFilePath, outputFilePath, options);

    // Return the image buffer
    return `${outputFilePath}-1.png`;
  } catch (err) {
    console.error('Error converting PDF to image:', err);
    throw err;
  }
}
