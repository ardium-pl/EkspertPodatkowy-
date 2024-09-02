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
  
    try {
      let allFiles = [];
      let pageToken = null;
  
      do {
        const res = await drive.files.list({
          q: `'${folderId}' in parents and mimeType != 'application/vnd.google-apps.folder'`, //query to not to read folder as a file
          pageSize: 100,
          fields: "nextPageToken, files(id, name, mimeType)",
          pageToken: pageToken,
        });
  
        allFiles = allFiles.concat(res.data.files);
        pageToken = res.data.nextPageToken;
      } while (pageToken);
  
      return allFiles;
    } catch (err) {
      console.error("Error listing files:", err);
      throw err;
    }
  }
