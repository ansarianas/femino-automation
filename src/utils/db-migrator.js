const xlsx = require('xlsx');
const mysql = require('mysql');
const dotenv = require('dotenv');

(() => {
  dotenv.config({ path: '../../config.env' });

  const workbook = xlsx.readFile('../../data/amazon/orders/amazon-orders-23-07-not-present.xlsx');
  const data = xlsx.utils.sheet_to_json(workbook.Sheets['Sheet1']);
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
  });

  console.log(process.env);

  connection.connect();
  const insertQuery = `INSERT INTO amazon_sales_fy_23 (${Object.keys(data[0]).join(',')}) VALUES ?`;
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
