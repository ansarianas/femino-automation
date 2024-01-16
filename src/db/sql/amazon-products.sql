CREATE TABLE amazon_products (
    id INT NOT NULL AUTO_INCREMENT,
    thumbnail_uri VARCHAR(90) DEFAULT NULL,
    product_name VARCHAR(180) NOT NULL,
    cost_price INT NOT NULL,
    PRIMARY KEY (id)
);

CREATE INDEX prod_name ON amazon_products (product_name);