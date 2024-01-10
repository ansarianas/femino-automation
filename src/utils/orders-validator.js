var fs = require('fs');

const fileName = '';
const data = fs.readFileSync(`../../data/amazon/orders/${fileName}`, 'utf8');
const parsed = JSON.parse(data);
console.log(`Total processed orders - ${parsed.length}`);
