USE ShopSenseDB;
GO

IF OBJECT_ID('dbo.vw_order_details', 'V') IS NOT NULL
    DROP VIEW dbo.vw_order_details;
GO

CREATE VIEW dbo.vw_order_details AS
SELECT 
    o.order_id,
    o.order_status,
    o.order_purchase_timestamp,
    o.order_delivered_customer_date,
    o.order_estimated_delivery_date,
    
    -- Delivery Performance Calculations
    DATEDIFF(day, o.order_purchase_timestamp, o.order_delivered_customer_date) AS delivery_days,
    CASE 
        WHEN o.order_delivered_customer_date > o.order_estimated_delivery_date THEN 1 
        ELSE 0 
    END AS is_delayed,

    -- Customer Attributes
    c.customer_id,
    c.customer_unique_id,
    c.customer_city,
    c.customer_state,
    
    -- Item & Financial Details
    oi.order_item_id,
    oi.product_id,
    oi.seller_id,
    oi.price,
    oi.freight_value,
    (oi.price + oi.freight_value) AS total_item_value,

    -- Product Taxonomies (in English)
    ISNULL(t.product_category_name_english, 'uncategorized') AS product_category_name_english,
    p.product_weight_g

FROM dbo.orders o
INNER JOIN dbo.customers c 
    ON o.customer_id = c.customer_id
INNER JOIN dbo.order_items oi 
    ON o.order_id = oi.order_id
LEFT JOIN dbo.products p 
    ON oi.product_id = p.product_id
LEFT JOIN dbo.product_category_translation t 
    ON p.product_category_name = t.product_category_name;
GO

PRINT 'Master Analytical View [dbo.vw_order_details] created successfully!';