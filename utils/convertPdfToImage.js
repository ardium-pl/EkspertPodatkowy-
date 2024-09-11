import { Poppler } from "node-poppler";
import camelcase from "camelcase";
import path from "path";
import { replacePolishCharacters } from "./replacePolishCharacters.js";

export async function convertPdfToImages(pdfFilePath, saveFolder) {
  const poppler = new Poppler();
  const outputPrefix = replacePolishCharacters(
    path.basename(pdfFilePath, path.extname(pdfFilePath))
  );
  const outputFilePath = path.join(saveFolder, `${outputPrefix}`);
  const pdfInfo = {}
  
  const ret = await poppler.pdfInfo(pdfFilePath);

  ret.split('\n').map(r => r.split(': ')).forEach(r => {
    if (r.length > 1)	pdfInfo[camelcase(r[0])] = r[1].trim()
  })

  const options = {
    firstPageToConvert: 1,
    lastPageToConvert: parseInt(pdfInfo.pages),
    pngFile: true,
  };



  try {
    await poppler.pdfToCairo(pdfFilePath, outputFilePath, options);
    
    const imagePaths = [];
    for (let i = options.firstPageToConvert; i <= options.lastPageToConvert; i++) {
      imagePaths.push(`${outputFilePath}-${i}.png`);
    }

    return imagePaths
  } catch (err) {
    console.error("Error converting PDF to image:", err);
    throw err;
  }
}
