USE ShopSenseDB;
GO

-- ShopSense Executive Health Dashboard Query
SELECT 
    COUNT(DISTINCT order_id) AS total_delivered_orders,
    COUNT(DISTINCT customer_unique_id) AS total_unique_customers,
    CAST(SUM(price) AS DECIMAL(14,2)) AS total_product_revenue,
    CAST(SUM(freight_value) AS DECIMAL(14,2)) AS total_freight_revenue,
    CAST(SUM(total_item_value) AS DECIMAL(14,2)) AS gross_revenue,
    CAST(AVG(price) AS DECIMAL(10,2)) AS average_item_price,
    CAST(SUM(total_item_value) / COUNT(DISTINCT order_id) AS DECIMAL(10,2)) AS average_order_value_AOV,
    AVG(delivery_days) AS avg_delivery_days,
    CAST(100.0 * SUM(is_delayed) / COUNT(order_id) AS DECIMAL(5,2)) AS delayed_delivery_pct
FROM dbo.vw_order_details
WHERE order_status = 'delivered';