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
    order_date LIKE '%Jul%'
GROUP BY return_type;

-- PROFIT PER MONTH
SELECT 
    SUM(profit)
FROM
    amazon_sales_summary
WHERE
    closing_amt != 0.00 AND refund != 0.00
        AND order_date LIKE '%Jan%';