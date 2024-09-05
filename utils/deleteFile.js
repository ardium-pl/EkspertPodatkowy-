import fs from "fs";

export function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else {
      console.log(`File not found: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error deleting file ${filePath}:`, err);
  }
}