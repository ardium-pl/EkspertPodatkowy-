import path from "path";
import { fromPath } from "pdf2pic";

export async function convertPdfToImages(pdfFilePath, saveFolder) {
    const options = {
      format: "jpeg",
      density: 300,
      height: 1740,
      width: 1240,
      saveFilename: path.basename(pdfFilePath, path.extname(pdfFilePath)),
      savePath: saveFolder,
    };
  
    try {
      const convert = fromPath(pdfFilePath, options);
      const pageToConvertAsImage = 1;
  
      // Convert the first page to an image and save it
      const result = await convert(pageToConvertAsImage, { responseType: "image" })
      .then((resolve) => {
    
        return resolve;
      });
  
      return result.path; // Return the image path for OCR processing
    } catch (err) {
      console.error("Error converting PDF to image:", err);
      throw err;
    }
  }