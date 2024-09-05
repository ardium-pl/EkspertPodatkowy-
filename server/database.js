import dotenv from "dotenv";
import pkg from "pg";  // Importing the CommonJS module as a default import
import { rawData } from "../services/invoice-data-service.js";

dotenv.config();

const { Client } = pkg;  // Destructuring to get Client from the default import

// Create a new client using the environment variables
const client = new Client({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

// Function to insert data into the database
export async function insertInvoiceBaseData(rawData) {
  const query = `
    INSERT INTO b6.inv_hdr (
        id, per, type, rk, nr, suffix, doc_date, age_date, ship_date, ship_date_type, ship_monthly, name, address,
        reason, price_level, discount, tax_by_item, vat_set, doc_amt, cy_code, cy_rate, cy_dec, ecb, bank_acct, 
        payment, paid, bal_date, vatn, nip, pro_forma_id, apply_id, apply_date, apply_no, marza, vat_included, oo, buyer_sign,
        seller_sign, corr_cnt, doc_type, proc, country, rola_odb, ref, status
    ) VALUES (
        $1, 26312, 0, false, $2, $3, $4, 
        $5, $6, 0, false, 
        $7, $8, null, 0, 0, 
        false, 3, $9, 'PLN', 10000, 
        4, null, $10, 0, $11, 
        $12, 'PL' || $13, $14, $15, $1, 
        null, 0, $16, $17, false, 
        false, false, 0, 0, 0, 
        null, 0, null, null
    )
  `;

  const values = [
    rawData.id,
    rawData.nr,
    rawData.invoiceNumber,
    rawData.documentDate,
    rawData.ageDate,
    rawData.shipDate,
    rawData.sellerName,
    rawData.address,
    rawData.invoiceBruttoValue,
    rawData.bankAccount,
    rawData.paid,
    rawData.bal_date,
    rawData.sellerNip,
    rawData.sellerNip,
    rawData.pro_forma_id,
    rawData.marza,
    rawData.vat_included
  ];

  try {
    // Connect to the client and execute the insert query
    await client.connect();  // Use the existing client
    await client.query(query, values);
    console.log("Data inserted successfully");
  } catch (err) {
    console.error("Error inserting data", err);
  } finally {
    // Close the client connection
    await client.end();
  }
}

function test(jsonData) {
  const test = `${jsonData.id}, 26312, 0, false, ${jsonData.nr}, ${jsonData.invoiceNumber}, ${jsonData.documentDate}, 
    ${jsonData.ageDate}, ${jsonData.shipDate}, 0, false, 
    ${jsonData.sellerName}, ${jsonData.address}, null, 0, 0, 
    false, 3, ${jsonData.invoiceBruttoValue}, PLN, 10000, 
    4, null, ${jsonData.bankAccount}, 0, ${jsonData.paid}, 
    ${jsonData.bal_date}, PL${jsonData.sellerNip}, ${jsonData.sellerNip}, ${jsonData.pro_forma_id}, ${jsonData.id}, 
    0, 0, ${jsonData.marza}, ${jsonData.vat_included}, false, 
    false, false, 0, 0, 0, 
    null, 0, null, null`;
  console.log(test);
}

// Call the function to insert data
insertInvoiceBaseData(rawData);
// test(rawData);
