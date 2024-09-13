import dotenv from "dotenv";
import pkg from "pg";
import { removeDecimal } from "../utils/valuesAdjustment.js";
import { mapVatRate } from "../utils/valuesAdjustment.js";

dotenv.config();

const {Client} = pkg;

const client = new Client({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
});

export async function insertInvoiceBaseData(rawData, id) {
    const baseInvoiceQuery = `
        INSERT INTO b7.inv_hdr (id, per, type, rk, nr, suffix, doc_date, age_date, ship_date, ship_date_type,
                                ship_monthly, name, address,
                                reason, price_level, discount, tax_by_item, vat_set, doc_amt, cy_code, cy_rate, cy_dec,
                                ecb, bank_acct,
                                payment, paid, bal_date, vatn, nip, pro_forma_id, apply_id, apply_date, apply_no, marza,
                                vat_included, oo, buyer_sign,
                                seller_sign, corr_cnt, doc_type, proc, country, rola_odb, ref, status)
        VALUES ($1, 26312, 0, false, $2, $3, $4,
                $5, $6, 0, false,
                $7, $8, null, 0, 0,
                false, 3, $9, 'PLN', 10000,
                4, null, $10, 0, $11,
                $12, 'PL' || $13, $14, $15, $1,
                null, 0, $16, $17, false,
                false, false, 0, 0, 0,
                null, 0, null, null)
    `;

    const productsQuery = `
        INSERT INTO b7.inv_ln (inv_id, apply_id, nr, goods, unit_cost, unit, unit_price, qty, tax_id, descr, gtu,
                               zw_typ, zw_basis, art100, appx15)
        VALUES ($1, $2, $3, false, 0, $4, $5, $6, $7, $8, 0, null, null, false, false)
    `;
    console.log(rawData);
    const baseInvoiceValues = [
        parseInt(id),
        parseInt(id) + 5,
        rawData.invoiceNumber,
        rawData.documentDate,
        rawData.shipDate,
        rawData.shipDate,
        rawData.sellerName,
        rawData.address,
        removeDecimal(parseFloat(rawData.invoiceBruttoValue.toString())),
        rawData.bankAccount,
        true,
        rawData.shipDate,
        rawData.sellerNip,
        rawData.sellerNip,
        parseInt(id),
        0,
        false,
    ];

    console.log(baseInvoiceValues);


    try {
        await client.connect();

        // Insert into inv_hdr (invoice header)
        await client.query(baseInvoiceQuery, baseInvoiceValues);

        // Loop through the products array and insert each product
        for (const [index, product] of rawData.products.entries()) {
            const productValues = [
                parseInt(id),        // inv_id (invoice id)
                parseInt(id),  // apply_id (apply id from invoice)
                index + 1,         // nr (line number, incremented)
                product.index,      // descr (product description)
                removeDecimal(parseFloat(product.net_price.toString())), // unit_price (net price per unit)
                product.quantity * 1000,  // qty (quantity)
                mapVatRate(product.vat_rate),  // tax_id (vat rate)
                product.name      // gtu (product index or identifier)
            ];

            console.log(parseFloat(product.net_price.toString()));

            await client.query(productsQuery, productValues);
        }

        console.log("Data inserted successfully");
    } catch (err) {
        console.error("Error inserting data", err);
    } finally {
        await client.end();
    }
}
