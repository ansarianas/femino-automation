const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const xlsx = require('xlsx');

function saveAmazonOrders() {
  const orders = JSON.parse(fs.readFileSync(`../../data/amazon/orders/${process.argv[2].replace('--', '')}.json`));
  const orderSchema = new mongoose.Schema({
    order_id: String,
    uri: String,
    order_date: String,
    shipment_date: String,
    delivery_date: String,
    status: String,
    products: [
      {
        name: String,
        thumbnail_uri: String,
        uri: String,
        transaction: {
          listing_price: Number,
          tax: Number,
          payment: Number,
          shipping: Number,
          refund: Number,
        },
      },
    ],
    customer: {
      name: String,
      address: String,
      pincode: String,
    },
  });

  const Orders = mongoose.model('amazon-orders', orderSchema);
  const documents = orders.map((order) => {
    return {
      order_id: order.id,
      order_uri: order.uri,
      order_date: order.order,
      shipment_date: order.shipment,
      delivery_date: order.delivery,
      order_status: order.status,
      products: order.products.map((prod) => {
        return {
          name: prod.name,
          thumbnail_uri: prod.thumbnail,
          uri: prod.uri,
          transaction: {
            listing_price: prod.transaction.listingPrice.replace('₹', ''),
            tax: prod.transaction.tax,
            payment: prod.transaction.payment.replace(/(-|₹|,)/g, ''),
            shipping: prod.transaction.shipping.replace(/(-|₹|,)/g, ''),
            refund: prod.transaction.refund?.replace(/(-|₹|,)/g, '') || 0.0,
          },
        };
      }),
      customer: order.customer,
    };
  });

  Orders.insertMany(documents)
    .then(() => {
      console.log('Document saved!');
      process.exit();
    })
    .catch((err) => {
      console.log(`Error while saving the documents!${err}`);
      process.exit();
    });
}

function saveAmazonProducts() {
  const products = JSON.parse(fs.readFileSync(`../../data/amazon/orders/${process.argv[2].replace('--', '')}.json`));
  const productSchema = new mongoose.Schema(
    {
      name: String,
      cost_price: Number,
    },
    { collection: 'amazon-products' },
  );

  const Product = mongoose.model('product', productSchema);
  const documents = products.map((product) => {
    return {
      name: product.product_name,
      cost_price: product.cost_price,
    };
  });

  Product.insertMany(documents)
    .then(() => {
      console.log('Document saved!');
      process.exit();
    })
    .catch((err) => {
      console.log(`Error while saving the documents!${err}`);
      process.exit();
    });
}

function saveInstagramOrders() {
  const file = `../../data/instagram/orders/${process.argv[2].replace('--', '')}.xlsx`;
  const workbook = xlsx.readFile(file);
  const sheetName = workbook.SheetNames;
  const documents = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName[0]]);
  const orderSchema = new mongoose.Schema({
    order_date: String,
    customer_name: String,
    contact_number: String,
    address: String,
    article_number: String,
    product_name: String,
    selling_price: Number,
    purchase_price: Number,
    shipping: Number,
  });
  const Orders = mongoose.model('instagram-orders', orderSchema);

  Orders.insertMany(documents)
    .then(() => {
      console.log('Document saved!');
      process.exit();
    })
    .catch((err) => {
      console.log(`Error while saving the documents!${err}`);
      process.exit();
    });
}

(() => {
  dotenv.config({ path: '../../config.env' });

  mongoose
    .connect(process.env.DB)
    .then(() => console.log('DB connected'))
    .catch((err) => console.log(`Error while connecting with the DB, ${err}`));

  if (process.argv[3] === '--amazon-products') documents = saveAmazonProducts();
  else if (process.argv[3] === '--amazon-orders') documents = saveAmazonOrders();
  else if (process.argv[3] === '--instagram-orders') documents = saveInstagramOrders();
})();
