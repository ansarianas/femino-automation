const xlsx = require('xlsx');
const mysql = require('mysql');
const dotenv = require('dotenv');

(() => {
  dotenv.config({ path: '../../config.env' });

  const table = '<TABLE_NAME>';
  const file = '<FILE_PATH>';
  const sheetName = workbook.SheetNames;
  const workbook = xlsx.readFile(file);
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName[0]]);
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
  });

  console.log(process.env);

  connection.connect();
  const insertQuery = `INSERT INTO ${table} (${Object.keys(data[0]).join(',')}) VALUES ?`;
  const rows = data.map((order) => [
    order.order_id,
    order.order_uri,
    order.order_date,
    order.shipment_date,
    order.delivery_date,
    order.thumbnail_uri,
    order.product_name,
    order.product_uri,
    order.listing_price,
    order.tax,
    order.shipping,
    order.refund,
    order.closing_amt,
  ]);

  connection.query(insertQuery, [rows], (error, result, fields) => {
    connection.end();
    if (error) console.error('Error inserting row', error);
    console.log('Total rows inserted', result.affectedRows);
  });
})();
