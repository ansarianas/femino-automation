CREATE TABLE amazon_sales_fy_23 (
    id INT NOT NULL AUTO_INCREMENT,
    order_id VARCHAR(19) NOT NULL,
    order_uri VARCHAR(67) NOT NULL,
    order_date VARCHAR(50) NOT NULL,
    shipment_date VARCHAR(30) NOT NULL,
    delivery_date VARCHAR(30) NOT NULL,
    thumbnail_uri VARCHAR(90) DEFAULT NULL,
    product_name VARCHAR(180) NOT NULL,
    product_uri VARCHAR(60) DEFAULT NULL,
    listing_price DECIMAL(19 , 2 ) DEFAULT 0.00,
    tax DECIMAL(6 , 2 ) DEFAULT 0.00,
    shipping DECIMAL(6 , 2 ) DEFAULT 0.00,
    refund DECIMAL(6 , 2 ) DEFAULT 0.00,
    closing_amt DECIMAL(6 , 2 ) DEFAULT 0.00,
    PRIMARY KEY(id)
);


CREATE INDEX order_id_date ON amazon_sales_fy_23 (order_id, order_date);
CREATE INDEX order_id ON amazon_sales_fy_23 (order_id);
CREATE INDEX order_date ON amazon_sales_fy_23 (order_date);