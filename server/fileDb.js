import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pkg;

const client = new Client({
  host: process.env.FILEDB_PGHOST,
  port: process.env.FILEDB_PGPORT,
  database: process.env.FILEDB_PGDATABASE,
  user: process.env.FILEDB_PGUSER,
  password: process.env.FILEDB_PGPASSWORD,
});


await client.connect();

export async function checkIfFileExistsInDatabase(fileName) {
    try {
      const result = await client.query(
        `SELECT file_name FROM files WHERE file_name = $1`,
        [fileName] 
      );
      return result.rows.length > 0; 
    } catch (err) {
      console.error("Error querying the database", err);
      throw err;
    }
  }

export async function insertFileIntoDatabase(fileName, ocrText, structuredJson) {
    try {
      const insertDate = new Date(); 
      await client.query(
        `INSERT INTO files (file_name, insert_date, ocr_text, structured_json) VALUES ($1, $2, $3, $4)`,
        [fileName, insertDate, ocrText, structuredJson]
      );
      console.log(`Successfully inserted ${fileName} into the database`);
    } catch (err) {
      console.error("Error inserting file into the database", err);
      throw err;
    }
}
