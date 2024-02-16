var xlsx = require('xlsx');
var fs = require('fs');

/**
 * Sheet Column
 * 1. Order ID
 * 2. Order URI
 * 3. Order Date
 * 4. Shipment Date
 * 5. Delivery Date
 * 6. Thumbnail URI
 * 7. Product
 * 8. Product URI
 * 9. Listing Price
 * 10. Tax
 * 11. Shipping
 * 12. Refund
 * 13. Closing Amount
 */

const fileName = '';
const fileData = fs.readFileSync(`../../data/amazon/orders/${fileName}.json`, 'utf8');
const parsedData = JSON.parse(fileData);
const transformedRows = [];

parsedData.forEach((data, index) => {
  data.products.forEach((prod) => {
    const row = {
      srNo: index + 1,
      orderId: data.id,
      orderUri: data.uri,
      orderDate: data.order,
      shipmentDate: data.shipment,
      deliveryDate: data.delivery,
      thumbnailUri: prod.thumbnail,
      product: prod.name,
      productUri: prod.uri,
      listingPrice: prod.transaction.listingPrice.replace('₹', ''),
      tax: prod.transaction.tax,
      shipping: prod.transaction.shipping.replace('-₹', ''),
      closing: prod.transaction.payment.replace('₹', ''),
      refund: prod.transaction.refund?.replace('-₹', ''),
    };
    transformedRows.push(row);
  });
});

const workbook = xlsx.utils.book_new();
const worksheet = xlsx.utils.json_to_sheet(transformedRows, {
  header: [
    'Sr no',
    'Order ID',
    'Order URI',
    'Order Date',
    'Shipment Date',
    'Delivery Date',
    'Thumbnail URI',
    'Product',
    'Product URI',
    'Listing Price',
    'Tax',
    'Shipping',
    'Closing Amount',
    'Refund Amount',
  ],
});

xlsx.utils.book_append_sheet(workbook, worksheet, 'Amazon');
xlsx.writeFile(workbook, `${fileName}.xlsx`);
