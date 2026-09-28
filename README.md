ShopSense: E-Commerce Customer Intelligence & Growth Platform
![Image](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Image](https://img.shields.io/badge/Microsoft%20SQL%20Server-2019%20%7C%202022-CC292B?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)
![Image](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Image](https://img.shields.io/badge/Scikit--Learn-1.4+-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)
![Image](https://img.shields.io/badge/Power%20BI-Desktop%20%26%20Service-F2C811?style=for-the-badge&logo=powerbi&logoColor=black)
![Image](https://img.shields.io/badge/Frontend-Vanilla%20JS%20%2B%20HTML5%2FCSS3-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
Author: Uma Sankar Rao
Credential: EPGC in Data Science (IIT Roorkee & Intellipaat)
Role: Aspiring Data Scientist & Analytics Developer
Data Source: Brazilian E-Commerce Public Dataset by Olist (~100k Orders, 2016–2018)
📌 Executive Summary & Business Problem
In high-volume e-commerce marketplaces, businesses accumulate massive transaction logs across orders, payments, reviews, and line items. However, raw relational tables cannot answer strategic growth questions:
Which customers are silently drifting away (non-contractual churn)?
Who are our high-value VIP buyers versus one-time bargain hunters?
What personalized cross-sell recommendations should be served to an individual buyer?
How does carrier delivery latency affect customer sentiment and operational SLAs?
ShopSense is an enterprise-grade Customer Intelligence and Growth Platform. Rather than operating on static CSV files or isolated notebook scripts, ShopSense establishes an end-to-end production architecture: ingesting 1.55+ Million relational records into Microsoft SQL Server (ShopSenseDB), serving analytics and machine learning models through a FastAPI REST API, and delivering intelligence via a Full-Stack Web Application and Power BI Executive Dashboards.
🏗️ System Architecture
code
Text
[Raw Olist Public Dataset (9 Tables)]
                 │
                 ▼  (Batch Ingestion with Spatial Aggregation & Encoding Sanitization)
[Microsoft SQL Server: ShopSenseDB]
                 │
                 ├──► [Analytical Views & CTEs (dbo.vw_order_details)]
                 │
                 ├──► [RFM Behavioral Engine (dbo.customer_rfm_segments)]
                 │
                 ▼
[Data Science & ML Pipeline (Python / Scikit-Learn)]
  ├── Zero-Leakage 6-Month Temporal Cutoff
  ├── Imbalanced Churn Modeling (Logistic Regression / Random Forest)
  └── Hybrid Cross-Sell Recommender (Market Basket Co-Occurrence + Bestseller Fallback)
                 │
                 ▼  (Precomputed Models & Lookup Graph Serialization: .pkl)
[Python REST Backend (FastAPI on Port 8001)]
                 │
         ┌───────┴────────────────────────┐
         ▼                                ▼
[Interactive Web Application]    [Power BI Dashboard]
  ├── Executive KPIs               ├── Page 1: Executive Overview
  ├── Monthly Revenue Trends       ├── Page 2: Customer Intelligence
  ├── Customer RFM Segments        └── Page 3: Logistics & Regional KPIs
  ├── Live Customer ML Churn
  └── 3-Item Cross-Sell Cards
💡 Core Features & Technical Highlights
1. Relational Database Modeling (Microsoft SQL Server)
Database Engine: Microsoft SQL Server with SSMS.
Relational Integrity: Implemented 9 normalized tables (orders, customers, order_items, order_payments, order_reviews, products, sellers, geolocation, product_category_translation).
Data Engineering Optimization: Solved the "Fan-Out Join Bug" by spatially aggregating 1,000,163 redundant geolocation rows down to 19,015 clean postal lookup zones, reducing storage and eliminating duplicate Cartesian join inflation.
Master Analytical View (dbo.vw_order_details): Centralized 6-table relational view computing delivery durations (DATEDIFF), delay flags, and gross merchandise value (GMV).
2. Analytical SQL & Financial KPIs
Gross Marketplace Volume (GMV): R$ 15.42 Million fulfilled volume across 96,478 delivered orders.
Unique Customers: 93,358 distinct purchasers.
Average Order Value (AOV): R$ 159.83.
Fulfillment Velocity: 12.5 days average delivery time; 7.91% carrier SLA delay rate.
Advanced T-SQL: Computed Month-over-Month (MoM) revenue trajectory using CTEs and LAG(), and partitioned category rankings using DENSE_RANK() OVER (PARTITION BY customer_state).
3. Customer Intelligence & RFM Segmentation
Frequency Skew Adaptation: Overcame the severe retail skew (~96.9% single-order buyers) by engineering custom frequency thresholds alongside quintile-binned Recency (
R
R
) and Monetary (
M
M
) distributions.
Strategic Segments:
Champions (VIP): High R, High F, High M (top spenders).
Loyal Customers: Consistent multi-order purchasers.
Promising New: Recent first-time buyers ripe for second-order nurture sequences.
At Risk / High Value Lost: High historical spend but dormant >250 days.
Lost / Hibernating: Single-order low-spend buyers.
Persistence: Stored 93,358 segmented profiles into SQL Server as dbo.customer_rfm_segments.
4. Machine Learning: Non-Contractual Inactivity / Churn
Leakage-Free Formulation: Engineered a strict temporal cutoff (
T
=
2018-04-01
T=2018-04-01
):
Observation Window: Historical transactions prior to 
T
T
 used for feature creation.
Prediction Window: 6-month forward horizon used to evaluate the binary churn target (1 if zero repurchases; 0 if returned).
Class Imbalance Handling: Addressed the 99.03% churn vs 0.97% retained class skew using class_weight='balanced' and stratified cross-validation.
Benchmark Metrics:
Logistic Regression (Balanced): ROC-AUC: 0.5921, PR-AUC: 0.9931 (top performer on rank discrimination).
Hist Gradient Boosting: ROC-AUC: 0.5810, PR-AUC: 0.9924.
Random Forest: ROC-AUC: 0.5458, PR-AUC: 0.9917.
Model Explainability: Evaluated feature weights demonstrating that recency_days is the single strongest positive driver of churn risk, while total_spend and historical_orders act as retention buffers.
5. Product Intelligence & Hybrid Recommender
Dual-Tier Engine:
Tier 1 (Market Basket Co-Occurrence): Self-joined multi-item orders to compute product pairing affinity counts.
Tier 2 (Category Bestseller Fallback): Resolves cold-start and sparse-history buyers by surfacing the highest-rated (
≥
4.0
⋆
≥4.0⋆
) items in the customer's favorite category.
Transparent Output: Delivers clear similarity scores (75%–95%) alongside plain-language business explanations (e.g., "Frequently bought together with your previous order").
6. Full-Stack Web Application (Vanilla JS / HTML5 / CSS3)
Modern SaaS interface featuring:
Executive KPIs: Live metrics pulled from SQL Server.
Monthly Revenue Trajectory: Interactive Chart.js line graph with formatted currency axes.
RFM Segments: Interactive donut chart and detailed customer-spend table.
Customer Intelligence Lookup: Search any customer to inspect RFM scores, live ML churn probability, and personalized recommendation cards.
Power BI Showcase & Lightbox: Interactive gallery previewing executive reports with full-screen zoom.
Creator Profile Modal: App-style, zero-scroll profile card with direct contact actions (LinkedIn, GitHub, WhatsApp, Phone, Email).
100% Mobile & Desktop Responsive: Fluidly adapts to mobile screens without UI clipping.
7. Executive Power BI Report
Multi-page analytical dashboard connecting directly to ShopSenseDB:
Page 1 (Executive Overview): GMV, delivered order counts, AOV, monthly trajectory line chart, and top 10 categories bar chart.
Page 2 (Customer Intelligence): Customer counts, platform recency, segment share donut chart, and average spend comparison.
Page 3 (Logistics & Geography): Delivery speed, late shipment percentages, and regional fulfillment demand across Brazilian states.
📁 Repository Directory Structure
code
Text
ShopSense/
├── data/
│   ├── raw/                              # Original Olist CSV files (git-ignored)
│   └── processed/                        # Processed ML features (churn_features.csv)
├── sql/
│   ├── schema.sql                        # Relational DDL for 9 tables
│   ├── views.sql                         # dbo.vw_order_details Master View
│   └── analytics.sql                     # CTEs, Window Functions & KPI queries
├── notebooks/
│   ├── 00_project_documentation.ipynb    # Comprehensive Markdown project ledger
│   ├── 01_data_understanding.ipynb       # Profiling and exploratory data analysis
│   ├── 02_data_ingestion.ipynb           # Automated ETL into SQL Server
│   ├── 03_rfm_customer_intelligence.ipynb# RFM Segmentation & SQL persistence
│   ├── 04_churn_model.ipynb              # ML feature engineering & benchmarking
│   └── 05_recommendation_engine.ipynb    # Co-occurrence & hybrid recommender
├── models/
│   ├── churn_model.pkl                   # Production Logistic Regression estimator
│   ├── churn_scaler.pkl                  # Feature standardizer
│   ├── feature_columns.pkl               # Ordered feature schema list
│   └── recommendation_engine.pkl         # Serialized co-occurrence & popularity graphs
├── backend/
│   └── main.py                           # FastAPI REST application
├── frontend/
│   ├── index.html                        # Single-Page Application interface
│   ├── style.css                         # Custom modern SaaS styling
│   ├── app.js                            # Frontend API consumer & Chart.js logic
│   └── profile.jpg                       # Creator profile picture
├── dashboard/
│   └── ShopSense_Executive_Dashboard.pbix# Multi-page Power BI report file
├── start_shopsense.bat                   # 1-Click Windows launch automation
├── requirements.txt                      # Project Python dependencies
├── .gitignore                            # Data and credential leakage prevention
└── README.md                             # Project portfolio master documentation
🚀 Quickstart & Setup Guide
1. Prerequisites
Python 3.10+ (tested on Python 3.13)
Microsoft SQL Server & SSMS
Power BI Desktop (optional, for viewing .pbix)
2. Clone the Repository
code
Bash
git clone https://github.com/umasankar00o7/ShopSense.git
cd ShopSense
3. Create & Activate Virtual Environment
code
Bash
python -m venv venv
# On Windows:
venv\Scripts\activate
4. Install Dependencies
code
Bash
pip install -r requirements.txt
5. Database Setup (SQL Server)
Open SSMS and execute sql/schema.sql to initialize ShopSenseDB and create all 9 relational tables.
Ingest data by running the ETL notebook notebooks/02_data_ingestion.ipynb (or execute the Python ingestion pipeline).
Execute sql/views.sql to build the master analytical view dbo.vw_order_details.
6. Launch the Application (1-Click or Manual)
Option A: 1-Click Launcher (Windows)
Double-click start_shopsense.bat in the project root directory.
Option B: Manual Terminal Launch
code
Bash
python -m uvicorn backend.main:app --port 8001
Open frontend/index.html in your browser (via VS Code Live Server or standard double-click) to experience the live platform!
📊 Interactive API Documentation
When the FastAPI backend is running, navigate to:
code
Text
http://127.0.0.1:8001/docs
Explore the interactive Swagger UI testing the live REST endpoints:
GET /api/kpis: Returns platform-wide volume, orders, AOV, and delivery latency.
GET /api/monthly-trends: Returns chronological monthly revenue and order volume.
GET /api/segments: Surfaces customer counts and revenue share across RFM tiers.
GET /api/customer/{customer_id}: Real-time ML churn scoring and 3-item cross-sell recommendations.
⚖️ Dataset & Licensing Transparency
This project utilizes the Brazilian E-Commerce Public Dataset by Olist released on Kaggle under the CC BY-NC-SA 4.0 license. This project simulates an enterprise analytics platform using real-world public data. All customer identities and proprietary merchant identifiers remain anonymized per the original data release.
👤 Author & Contact
Uma Sankar Rao
Aspiring Data Scientist & Analytics Developer
EPGC in Data Science — IIT Roorkee & Intellipaat
LinkedIn: linkedin.com/in/uma-sankara-rao-kontyana-a97a3a243
GitHub: @umasankar00o7
Email: uma131482@gmail.com
Phone / WhatsApp: +91 6304431108
