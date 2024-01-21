-- TOTAL NUMBERS OF ORDER WITH THEIR STATUS
SELECT 
    COUNT(*) AS orders,
    CASE
        WHEN closing_amt = 0.00 AND refund = 0.00 THEN 'Exchange'
        WHEN refund = closing_amt THEN 'Courier'
        WHEN closing_amt < refund THEN 'Customer'
        ELSE 'Delivered'
    END AS return_type
FROM
    femino.amazon_orders_summary
WHERE
    order_date LIKE '%%'
GROUP BY return_type;

-- PROFIT PER MONTH FOR DELIVERED ORDERS
SELECT 
    SUM(o.closing_amt - (p.cost_price + o.tax + o.shipping)) AS profit
FROM
    femino.amazon_orders_summary AS o
        JOIN
    femino.amazon_products AS p ON p.product_name = o.product_name
WHERE
    order_date LIKE '%%'
        AND closing_amt > refund;

-- RETURN SHIPMENT 
SELECT 
    SUM(refund - closing_amt) AS return_shipping
FROM
    femino.amazon_orders_summary
WHERE
    order_date LIKE '%%'
        AND closing_amt < refund;