CREATE TABLE amazon_sales_summary (
    id INT NOT NULL AUTO_INCREMENT,
    order_id VARCHAR(19) NOT NULL,
    order_date VARCHAR(50) NOT NULL,
    listing_price DECIMAL(19 , 2 ) DEFAULT 0.00,
    tax DECIMAL(6 , 2 ) DEFAULT 0.00,
    shipping DECIMAL(6 , 2 ) DEFAULT 0.00,
    refund DECIMAL(6 , 2 ) DEFAULT 0.00,
    closing_amt DECIMAL(6 , 2 ) DEFAULT 0.00,
    profit DECIMAL(6 , 2 ) DEFAULT 0.00,
    PRIMARY KEY (id)
);

INSERT INTO amazon_sales_summary (order_id, order_date,listing_price,tax,shipping,refund,closing_amt,profit)
SELECT 
    s.order_id,
    s.order_date,
    s.listing_price,
    s.tax,
    s.shipping,
    s.refund,
    s.closing_amt,
    CASE
        WHEN s.closing_amt < refund THEN refund - closing_amt
        WHEN s.closing_amt = 0.00 AND refund = 0.00 THEN s.shipping
        ELSE (s.closing_amt - p.cost_price - s.tax - s.shipping)
    END AS profit
FROM
    amazon_products AS p
        JOIN
    femino.amazon_orders_summary AS s ON p.product_name = s.product_name;
