const puppeteer = require('puppeteer');
const speakeasy = require('speakeasy');
const fs = require('fs');
const dotenv = require('dotenv');
const selector = require('../constants/amazon-selectors');

dotenv.config({ path: './config.env' });

const fromDate = '';
const toDate = '';
const month = '';

(async () => {
  const { SELLER_EMAIL_ID, SELLER_PASSWORD, DASHBOARD_URI, AUTH_KEY, SELLER_BASE_URI } = process.env;
  const orderHistory = [];

  //#region 1. Initial startup
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--start-maximized'],
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto(DASHBOARD_URI, {
    waitUntil: 'networkidle0',
    timeout: 0,
  });
  //#endregion

  //#region 2. Navigate to login
  const { START_SELLING } = selector;
  await page
    .waitForSelector(START_SELLING)
    .then(async () => await page.click(START_SELLING))
    .catch((err) => console.log(`Login navigation error ${err}`));
  //#endregion

  //#region 3. Login
  const { EMAIL_ID, PASSWORD, SIGN_IN: LOGIN_SIGN_IN } = selector.LOGIN;
  await Promise.all([await page.waitForSelector(EMAIL_ID), await page.waitForSelector(PASSWORD)])
    .then(async () => {
      await page.click(EMAIL_ID);
      await page.type(EMAIL_ID, SELLER_EMAIL_ID);
      await page.click(PASSWORD);
      await page.type(PASSWORD, SELLER_PASSWORD);
      await page.click(LOGIN_SIGN_IN);
    })
    .catch((err) => console.log(`Login error ${err}`));
  //#endregion

  //#region 4. 2FA
  const { TOTP, SIGN_IN: AUTH_SIGN_IN } = selector.AUTH;
  const token = speakeasy.totp({
    secret: AUTH_KEY,
    encoding: 'base32',
  });
  await page
    .waitForSelector(TOTP)
    .then(async () => {
      await page.type(TOTP, token);
      await page.click(AUTH_SIGN_IN);
    })
    .catch((err) => console.log(`2FA error ${err}`));
  //#endregion

  //#region 5. Navigate to seller dashboard
  const { WELCOME_SCREEN } = selector;
  page.on('dialog', async (dialog) => await dialog.accept());
  await page
    .waitForSelector(WELCOME_SCREEN, { visible: true })
    .then(async () => await page.click(WELCOME_SCREEN))
    .catch((err) => console.log(`Seller dashboard navigation error ${err}`));
  //#endregion

  //#region 6. Navigate to manage order
  const { MANAGE } = selector.ORDERS;
  await page
    .waitForSelector(MANAGE)
    .then(async () => await page.click(MANAGE))
    .catch((err) => console.log(`Manage order navigation error ${err}`));
  //#endregion

  //#region 7. Close tour
  const { CLOSE_TOUR } = selector.ORDERS;
  await page
    .waitForSelector(CLOSE_TOUR)
    .then(async () => await page.click(CLOSE_TOUR))
    .catch((err) => console.log(`Close tour error ${err}`));
  //#endregion

  //#region 8. Navigate to sent tab
  const { SENT_TAB } = selector.ORDERS;
  await page
    .waitForSelector(SENT_TAB)
    .then(async () => await page.click(SENT_TAB))
    .catch((err) => console.log(`Sent tab navigation error ${err}`));
  //#endregion

  //#region 9. Navigate to shipped tab
  const { SHIPPED_TAB } = selector.ORDERS;
  await page
    .waitForSelector(SHIPPED_TAB)
    .then(async () => await page.click(SHIPPED_TAB))
    .catch((err) => console.log(`Shipped tab navigation error ${err}`));
  //#endregion

  //#region 10. Apply filters and pull order details
  const { ORDERS } = selector;
  await Promise.all([
    await page.waitForSelector(ORDERS.FILTERS.DATE_RANGE_DROPDOWN),
    await page.waitForSelector(ORDERS.FILTERS.SORT_ORDER_DROPDOWN),
  ])
    .then(async () => {
      // 1. Apply filters
      await page.select(ORDERS.FILTERS.SORT_ORDER_DROPDOWN, ORDERS.FILTERS.SORT_ASCENDING_VALUE);
      await page.select(ORDERS.FILTERS.DATE_RANGE_DROPDOWN, ORDERS.FILTERS.CUSTOM_DATE_VALUE);
      await page.type(`${ORDERS.FILTERS.FROM_DATE_CALENDAR} ${ORDERS.FILTERS.DATE_INPUT}`, fromDate);
      await page.type(`${ORDERS.FILTERS.TO_DATE_CALENDAR} ${ORDERS.FILTERS.DATE_INPUT}`, toDate);
      await page.select(ORDERS.FILTERS.RESULT_PER_PAGE_DROPDOWN, ORDERS.FILTERS.RESULT_PER_PAGE_VALUE);

      // 2. Pull total order count
      await page.waitForTimeout(2000);
      const totalOrderCount = (await page.$eval(ORDERS.TOTAL_ORDERS, (ele) => ele.textContent)) || '0';
      console.log(totalOrderCount);

      // 3. Scroll down
      if (parseInt(totalOrderCount) > 15) await page.evaluate(() => window.scrollTo(0, 1000));

      // 4. Pull all order uris
      await page.waitForTimeout(2000);
      const orderUris = await page.$$eval(ORDERS.INVOICE_URI_TABLE, (sel) => sel.map((a) => a.getAttribute('href')));

      // 5. Iterate over order uris
      for (let i = 0; i < orderUris.length; i++) {
        const { ORDERS } = selector;
        const orderUri = `${SELLER_BASE_URI}${orderUris[i]}`;
        if (orderUri.endsWith('null')) {
          console.log(`${i}. Error while constructing uri`);
          continue;
        }
        console.log(`${i}. Navigating to `, orderUri);

        // 6. Navigate to the orders page
        const orderPg = await browser.newPage();
        await orderPg.goto(orderUri, { waitUntil: 'networkidle0', timeout: 0 });

        // 7. Pull order id
        const orderId = await orderPg.$eval(ORDERS.ORDER_ID, (ele) => ele.textContent);

        // 8. Pull customer info
        const customerName = (await orderPg.$eval(`${ORDERS.CUSTOMER_INFO} ${ORDERS.CUSTOMER_NAME}`, (ele) => ele.textContent)) || '';
        const address = await orderPg.$eval(ORDERS.CUSTOMER_INFO, (ele) => ele.textContent);

        // 9. Pull order details
        const orderDate = await orderPg.$eval(ORDERS.ORDER_AT, (ele) => ele.textContent);
        const shipmentDate = await orderPg.$eval(ORDERS.SHIP_BY, (ele) => ele.textContent);
        const deliveryDate = await orderPg.$eval(ORDERS.DELIVERY_BY, (ele) => ele.textContent);
        const status = await page.$eval(ORDERS.ORDER_STATUS, (ele) => ele.textContent);

        // 10. Pull transaction detail
        const transactionPg = await browser.newPage();
        await transactionPg.goto(
          `${SELLER_BASE_URI}/payments/event/view?accountType=ALL&orderId=${orderId}&resultsPerPage=10&pageNumber=1`,
          {
            waitUntil: 'networkidle0',
            timeout: 0,
          },
        );

        const transaction = await transactionPg.evaluate((row) => {
          const rows = document.querySelectorAll(row);
          const amts = [];
          const isRefund = rows.length === 4;

          if (isRefund) {
            amts.push(rows[1]?.lastChild?.textContent || 'refund');
            amts.push(rows[2]?.lastChild?.textContent || 'payment');
            amts.push(rows[3]?.lastChild?.textContent || 'shipping');
          } else {
            amts.push(rows[1]?.lastChild?.textContent || 'payment');
            amts.push(rows[2]?.lastChild?.textContent || 'shipping');
          }

          return amts;
        }, ORDERS.TRANSACTION_ROW);

        await transactionPg.close();

        // 11. Pull product details
        await page.waitForTimeout(2000);
        const products = await orderPg.evaluate(
          (tbl, row, data, thumbnail, href, tx) => {
            const prods = [];
            const tbody = document.querySelector(tbl);

            tbody?.querySelectorAll(row).forEach((el) => {
              var imgTd = el.querySelectorAll(data)[1];
              var nameTd = el.querySelectorAll(data)[2];

              prods.push({
                name: nameTd.textContent,
                thumbnail: imgTd.querySelector(thumbnail)?.getAttribute('src'),
                uri: nameTd.querySelector(href)?.getAttribute('href'),
                transaction: {
                  listingPrice: el.querySelectorAll(data)[5].textContent,
                  tax: el.querySelectorAll(data)[6].textContent?.match(/Tax:₹([0-9]+\.[0-9]{2})/)?.[1],
                  ...(tx.length === 3 && {
                    refund: tx[0],
                    payment: tx[1],
                    shipping: tx[2],
                  }),
                  ...(tx.length === 2 && { payment: tx[0], shipping: tx[1] }),
                },
              });
            });

            return prods;
          },
          ORDERS.ORDER_DETAIL_TBL,
          ORDERS.ORDER_DETAIL_ROW,
          ORDERS.ORDER_DETAIL_DATA,
          ORDERS.ORDER_THUMBNAIL_IMG,
          ORDERS.PRODUCT_HREF,
          transaction,
        );

        const orderSummary = {
          id: orderId,
          uri: orderUri,
          order: orderDate,
          shipment: shipmentDate,
          delivery: deliveryDate,
          status,
          products,
          customer: {
            name: customerName,
            address: address?.replace(customerName, '').match(/.*[A-Z]/)?.[0],
            pincode: address?.match(/[0-9].*/)?.[0],
          },
        };

        orderHistory.push(orderSummary);
        await orderPg.close();
      }
    })
    .catch((err) => console.log(`Error while extracting order detail ${err}`));
  //#endregion

  //#region 11. Logout
  const { SETTINGS_MENU, SIGN_OUT, HOME } = selector.LOGOUT;
  await page.click(SETTINGS_MENU);
  await page.click(SIGN_OUT);
  await page.waitForSelector(HOME);
  //#endregion

  console.log('Total orders - ', orderHistory.length);

  fs.writeFileSync(`${month}.json`, JSON.stringify(orderHistory));
  await page.waitForTimeout(2000);
  await page.close();
  await browser.close();
})();
