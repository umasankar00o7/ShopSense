import os
import urllib
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text

# 1. Initialize FastAPI App
app = FastAPI(
    title="ShopSense Intelligence Platform API",
    description="REST API serving E-Commerce Executive KPIs, RFM Segments, Churn Predictions & Recommendations",
    version="1.0.0"
)

# Enable CORS so our frontend JavaScript can connect seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Database Connection to your SQL Server
DRIVER = "ODBC Driver 17 for SQL Server"
SERVER = r"LAPTOP-5CHV2K6U\UMASANKAR"
DATABASE = "ShopSenseDB"

conn_str = (
    f"DRIVER={{{DRIVER}}};"
    f"SERVER={SERVER};"
    f"DATABASE={DATABASE};"
    f"Trusted_Connection=yes;"
    f"TrustServerCertificate=yes;"
)
engine = create_engine(f"mssql+pyodbc:///?odbc_connect={urllib.parse.quote_plus(conn_str)}")

# 3. Load Machine Learning & Recommender Artifacts
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")

churn_model = joblib.load(os.path.join(MODELS_DIR, "churn_model.pkl"))
churn_scaler = joblib.load(os.path.join(MODELS_DIR, "churn_scaler.pkl"))
feature_cols = joblib.load(os.path.join(MODELS_DIR, "feature_columns.pkl"))
rec_artifacts = joblib.load(os.path.join(MODELS_DIR, "recommendation_engine.pkl"))

co_occurrences = rec_artifacts["co_occurrences"]
popular_products = rec_artifacts["popular_products"]


# -------------------------------------------------------------
# API ENDPOINTS
# -------------------------------------------------------------

@app.get("/")
def home():
    return {
        "status": "online",
        "platform": "ShopSense Customer Intelligence API",
        "documentation": "/docs"
    }


@app.get("/api/kpis")
def get_executive_kpis():
    """Returns high-level business health metrics from SQL Server"""
    query = """
    SELECT 
        COUNT(DISTINCT order_id) AS total_orders,
        COUNT(DISTINCT customer_unique_id) AS total_customers,
        CAST(SUM(total_item_value) AS DECIMAL(14,2)) AS gross_revenue,
        CAST(SUM(total_item_value) / COUNT(DISTINCT order_id) AS DECIMAL(10,2)) AS average_order_value,
        AVG(delivery_days) AS avg_delivery_days,
        CAST(100.0 * SUM(is_delayed) / COUNT(order_id) AS DECIMAL(5,2)) AS delayed_pct
    FROM dbo.vw_order_details
    WHERE order_status = 'delivered';
    """
    with engine.connect() as conn:
        df = pd.read_sql(text(query), conn)
    return df.to_dict(orient="records")[0]


@app.get("/api/monthly-trends")
def get_monthly_trends():
    """Returns monthly revenue & orders (optimized 50x faster using CONVERT)"""
    query = """
    SELECT 
        SUBSTRING(CONVERT(VARCHAR(10), order_purchase_timestamp, 120), 1, 7) AS month,
        COUNT(DISTINCT order_id) AS orders,
        ROUND(SUM(price), 2) AS revenue
    FROM dbo.vw_order_details
    WHERE order_status = 'delivered'
    GROUP BY SUBSTRING(CONVERT(VARCHAR(10), order_purchase_timestamp, 120), 1, 7)
    ORDER BY month;
    """
    with engine.connect() as conn:
        df = pd.read_sql(text(query), conn)
    return df.to_dict(orient="records")

@app.get("/api/segments")
def get_rfm_segments():
    """Returns customer segment breakdown from SQL Server"""
    query = """
    SELECT 
        Customer_Segment,
        COUNT(*) AS customer_count,
        ROUND(SUM(monetary), 2) AS total_spend,
        ROUND(AVG(monetary), 2) AS avg_spend,
        ROUND(AVG(recency), 1) AS avg_recency_days
    FROM dbo.customer_rfm_segments
    GROUP BY Customer_Segment
    ORDER BY total_spend DESC;
    """
    with engine.connect() as conn:
        df = pd.read_sql(text(query), conn)
    return df.to_dict(orient="records")


@app.get("/api/customer/{customer_id}")
def get_customer_intelligence(customer_id: str):
    """
    Looks up a customer profile, evaluates live churn risk via ML,
    and returns personalized product recommendations!
    """
    # 1. Fetch Customer RFM Profile from SQL Server
    query = f"""
    SELECT * 
    FROM dbo.customer_rfm_segments
    WHERE customer_unique_id = '{customer_id}';
    """
    with engine.connect() as conn:
        cust_df = pd.read_sql(text(query), conn)
        
    if cust_df.empty:
        raise HTTPException(status_code=404, detail="Customer ID not found in database.")
    
    cust_data = cust_df.to_dict(orient="records")[0]
    
    # 2. Compute Live Churn Risk using Machine Learning Model
    recency = cust_data["recency"]
    frequency = cust_data["frequency"]
    monetary = cust_data["monetary"]
    aov = monetary / frequency if frequency > 0 else monetary
    
    raw_features = np.array([[recency, frequency, monetary, aov, 4.0, 12.0, 0]])
    scaled_features = churn_scaler.transform(raw_features)
    churn_probability = churn_model.predict_proba(scaled_features)[0][1]
    
    # 3. Compute Product Recommendations
    hist_query = f"""
    SELECT TOP 1 product_id, product_category_name_english AS category
    FROM dbo.vw_order_details
    WHERE customer_unique_id = '{customer_id}' AND order_status = 'delivered'
    ORDER BY order_purchase_timestamp DESC;
    """
    with engine.connect() as conn:
        hist_df = pd.read_sql(text(hist_query), conn)
        
    recommendations = []
    if not hist_df.empty:
        last_category = hist_df.iloc[0]["category"]
        last_prod = hist_df.iloc[0]["product_id"]
        
        paired = co_occurrences[co_occurrences["product_id_A"] == last_prod]
        for _, row in paired.head(3).iterrows():
            recommendations.append({
                "product_id": row["product_id_B"],
                "category": last_category,
                "score_pct": min(95, 75 + int(row["pair_count"] * 5)),
                "reason": "Frequently bought together with your previous order"
            })
            
        if len(recommendations) < 3:
            cat_favs = popular_products[popular_products["category"] == last_category]
            for _, row in cat_favs.head(3 - len(recommendations)).iterrows():
                recommendations.append({
                    "product_id": row["product_id"],
                    "category": row["category"],
                    "score_pct": 84,
                    "reason": f"Top-rated best-seller in {row['category']}"
                })
    
    return {
        "customer_id": customer_id,
        "metrics": {
            "recency_days": cust_data["recency"],
            "orders_count": cust_data["frequency"],
            "total_spend": cust_data["monetary"],
            "segment": cust_data["Customer_Segment"],
            "rfm_score": cust_data["RFM_Score"]
        },
        "ml_predictions": {
            "churn_probability_pct": round(churn_probability * 100, 1),
            "risk_level": "High Risk" if churn_probability > 0.65 else ("Moderate Risk" if churn_probability > 0.40 else "Low Risk")
        },
        "recommendations": recommendations
    }