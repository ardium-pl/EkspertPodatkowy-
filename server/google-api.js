import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

export const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/drive"],
  project_id: process.env.GOOGLE_PROJECT_ID,
});

export async function listAllFiles(folderId) {
  const drive = google.drive({ version: "v3", auth: auth });

  async function listFilesInFolder(folderId) {
    let allFiles = [];
    let pageToken = null;

    try {
      do {
        const res = await drive.files.list({
          q: `'${folderId}' in parents`,
          pageSize: 100,
          fields: "nextPageToken, files(id, name, mimeType)",
          pageToken: pageToken,
        });

        const files = res.data.files || [];
        
        // Separate folders and files
        const folderFiles = files.filter(file => file.mimeType !== "application/vnd.google-apps.folder");
        const subfolders = files.filter(file => file.mimeType === "application/vnd.google-apps.folder");

        allFiles = allFiles.concat(folderFiles);

        // Recursively get files from subfolders
        for (const subfolder of subfolders) {
          const subfolderFiles = await listFilesInFolder(subfolder.id);
          allFiles = allFiles.concat(subfolderFiles);
        }

        pageToken = res.data.nextPageToken;
      } while (pageToken);

      return allFiles;
    } catch (err) {
      console.error("Error listing files:", err);
      throw err;
    }
  }

  return await listFilesInFolder(folderId);
}
