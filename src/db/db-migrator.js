const xlsx = require('xlsx');
const mysql = require('mysql');
const dotenv = require('dotenv');

const orderRows = (table, data) => {
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
  return {
    insertQuery,
    rows,
  };
};

const productRows = (table, data) => {
  const insertQuery = `INSERT INTO ${table} (${Object.keys(data[0]).join(',')}) VALUES ?`;
  const rows = data.map((product) => [product.thumbnail_uri, product.product_name, product.cost_price]);
  return {
    insertQuery,
    rows,
  };
};

(() => {
  dotenv.config({ path: '../../config.env' });

  const table = process.argv[2].replace('--', '');
  const file = `../../data/amazon/orders/${process.argv[3].replace('--', '')}.xlsx`;
  const workbook = xlsx.readFile(file);
  const sheetName = workbook.SheetNames;
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName[0]]);
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
  });
  let sql = {};

  connection.connect();
  if (process.argv[4] === '--products') sql = productRows(table, data);
  else if (process.argv[4] === '--orders') sql = orderRows(table, data);

  connection.query(sql.insertQuery, [sql.rows], (error, result, fields) => {
    connection.end();
    if (error) console.error('Error inserting row', error);
    console.log('Total rows inserted', result.affectedRows);
  });
})();
