const START_SELLING = '#Nav';

const LOGIN = {
  EMAIL_ID: '#ap_email',
  PASSWORD: '#ap_password',
  SIGN_IN: '#signInSubmit',
};

const AUTH = {
  TOTP: '#auth-mfa-otpcode',
  SIGN_IN: '#auth-signin-button',
};

const WELCOME_SCREEN = "input[data-ng-click='goToSellerCentral()'][type='submit']";

const ORDERS = {
  MANAGE: "a[data-page-id='seller-your-account']",
  CLOSE_TOUR: "button[data-test-id='button-close']",
  SENT_TAB: "a[data-test-id='tab-/mfn/shipped']",
  SHIPPED_TAB: "a[data-test-id='subtab-/mfn/shipped/easyship/handover-done']",
  FILTERS: {
    SORT_ORDER_DROPDOWN: '#myo-table-sort-order',
    SORT_ASCENDING_VALUE: 'order_date_asc',
    DATE_RANGE_DROPDOWN: '#myo-table-date-range',
    CUSTOM_DATE_VALUE: 'custom',
    FROM_DATE_CALENDAR: '#myo-date-range-from-cal',
    TO_DATE_CALENDAR: '#myo-date-range-to-cal',
    DATE_INPUT: '.a-input-text.a-cal-input',
    RESULT_PER_PAGE_DROPDOWN: '#myo-table-results-per-page',
    RESULT_PER_PAGE_VALUE: '100',
  },
  TOTAL_ORDERS: '.total-orders-heading span',
  ORDER_ID: "span[data-test-id='order-id-value']",
  SHIP_BY: "span[data-test-id='order-summary-shipby-value']",
  DELIVERY_BY: "span[data-test-id='order-summary-deliverby-value']",
  ORDER_AT: "span[data-test-id='order-summary-purchase-date-value']",
  INVOICE_URI_TABLE: 'tbody tr td:nth-child(3) .cell-body .cell-body-title a',
  CUSTOMER_INFO: "div[data-test-id='shipping-section-buyer-address']",
  CUSTOMER_NAME: 'span:first-child',
  ORDER_STATUS: '.main-status.delivered-status',
  ORDER_DETAIL_TBL: '.a-keyvalue tbody',
  ORDER_DETAIL_ROW: 'tr',
  ORDER_DETAIL_DATA: 'td',
  ORDER_THUMBNAIL_IMG: 'img',
  PRODUCT_HREF: 'a',
  CLOSING_AMT: 'a#link-target',
  TRANSACTION_ROW: '.transactions-table-content kat-table-row',
};

const LOGOUT = {
  SETTINGS_MENU: "div[data-test-tag='settings-menu-trigger']",
  SIGN_OUT: "a[data-test-tag='sign-out']",
  HOME: "a[data-ld-append='SCINRP_WP_N']",
};

module.exports = {
  START_SELLING,
  LOGIN,
  AUTH,
  WELCOME_SCREEN,
  ORDERS,
  LOGOUT,
};
