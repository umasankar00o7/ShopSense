\# ShopSense: E-Commerce Customer Intelligence \& Growth Platform



\[!\[Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-3776AB?style=for-the-badge\&logo=python\&logoColor=white)](https://www.python.org/)

\[!\[SQL Server](https://img.shields.io/badge/Microsoft%20SQL%20Server-2019%20%7C%202022-CC292B?style=for-the-badge\&logo=microsoftsqlserver\&logoColor=white)](https://www.microsoft.com/sql-server)

\[!\[FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge\&logo=fastapi\&logoColor=white)](https://fastapi.tiangolo.com/)

\[!\[Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4+-F7931E?style=for-the-badge\&logo=scikitlearn\&logoColor=white)](https://scikit-learn.org/)

\[!\[Power BI](https://img.shields.io/badge/Power%20BI-Desktop%20%26%20Service-F2C811?style=for-the-badge\&logo=powerbi\&logoColor=black)](https://powerbi.microsoft.com/)

\[!\[JavaScript](https://img.shields.io/badge/Frontend-Vanilla%20JS%20%2B%20HTML5%2FCSS3-F7DF1E?style=for-the-badge\&logo=javascript\&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)



> \*\*Author:\*\* Uma Sankar Rao  

> \*\*Credential:\*\* EPGC in Data Science (IIT Roorkee \& Intellipaat)  

> \*\*Role:\*\* Aspiring Data Scientist \& Analytics Developer  

> \*\*Data Source:\*\* Brazilian E-Commerce Public Dataset by Olist (\~100k Orders, 2016–2018)



\---



\## 📌 Executive Summary \& Business Problem



In high-volume e-commerce marketplaces, businesses accumulate massive transaction logs across orders, payments, reviews, and line items. However, raw relational tables cannot answer strategic growth questions:

\- \*Which customers are silently drifting away (non-contractual churn)?\*

\- \*Who are our high-value VIP buyers versus one-time bargain hunters?\*

\- \*What personalized cross-sell recommendations should be served to an individual buyer?\*

\- \*How does carrier delivery latency affect customer sentiment and operational SLAs?\*



\*\*ShopSense\*\* is an enterprise-grade Customer Intelligence and Growth Platform. Rather than operating on static CSV files or isolated notebook scripts, ShopSense establishes an end-to-end production architecture: ingesting \*\*1.55+ Million relational records\*\* into \*\*Microsoft SQL Server (`ShopSenseDB`)\*\*, serving analytics and machine learning models through a \*\*FastAPI REST API\*\*, and delivering intelligence via a \*\*Full-Stack Web Application\*\* and \*\*Power BI Executive Dashboards\*\*.



\---



\## 🏗️ System Architecture



\[Raw Olist Public Dataset (9 Tables)]

│

▼ (Batch Ingestion with Spatial Aggregation \& Encoding Sanitization)

\[Microsoft SQL Server: ShopSenseDB]

│

├──► \[Analytical Views \& CTEs (dbo.vw\_order\_details)]

│

├──► \[RFM Behavioral Engine (dbo.customer\_rfm\_segments)]

│

▼

\[Data Science \& ML Pipeline (Python / Scikit-Learn)]

├── Zero-Leakage 6-Month Temporal Cutoff

├── Imbalanced Churn Modeling (Logistic Regression / Random Forest)

└── Hybrid Cross-Sell Recommender (Market Basket Co-Occurrence + Bestseller Fallback)

│

▼ (Precomputed Models \& Lookup Graph Serialization: .pkl)

\[Python REST Backend (FastAPI on Port 8001)]

│

┌───────┴────────────────────────┐

▼ ▼

\[Interactive Web Application] \[Power BI Dashboard]

├── Executive KPIs ├── Page 1: Executive Overview

├── Monthly Revenue Trends ├── Page 2: Customer Intelligence

├── Customer RFM Segments └── Page 3: Logistics \& Regional KPIs

├── Live Customer ML Churn

└── 3-Item Cross-Sell Cards

\---



\## 💡 Core Features \& Technical Highlights



\### 1. Relational Database Modeling (Microsoft SQL Server)

\- \*\*Database Engine:\*\* Microsoft SQL Server with SSMS.

\- \*\*Relational Integrity:\*\* Implemented 9 normalized tables (`orders`, `customers`, `order\_items`, `order\_payments`, `order\_reviews`, `products`, `sellers`, `geolocation`, `product\_category\_translation`).

\- \*\*Data Engineering Optimization:\*\* Solved the "Fan-Out Join Bug" by spatially aggregating 1,000,163 redundant geolocation rows down to 19,015 clean postal lookup zones, reducing storage and eliminating duplicate Cartesian join inflation.

\- \*\*Master Analytical View (`dbo.vw\_order\_details`):\*\* Centralized 6-table relational view computing delivery durations (`DATEDIFF`), delay flags, and gross merchandise value (GMV).



\### 2. Analytical SQL \& Financial KPIs

\- \*\*Gross Marketplace Volume (GMV):\*\* R$ 15.42 Million fulfilled volume across 96,478 delivered orders.

\- \*\*Unique Customers:\*\* 93,358 distinct purchasers.

\- \*\*Average Order Value (AOV):\*\* R$ 159.83.

\- \*\*Fulfillment Velocity:\*\* 12.5 days average delivery time; 7.91% carrier SLA delay rate.

\- \*\*Advanced T-SQL:\*\* Computed Month-over-Month (MoM) revenue trajectory using CTEs and `LAG()`, and partitioned category rankings using `DENSE\_RANK() OVER (PARTITION BY customer\_state)`.



\### 3. Customer Intelligence \& RFM Segmentation

\- \*\*Frequency Skew Adaptation:\*\* Overcame the severe retail skew (\~96.9% single-order buyers) by engineering custom frequency thresholds alongside quintile-binned Recency ($R$) and Monetary ($M$) distributions.

\- \*\*Strategic Segments:\*\*

&#x20; 1. \*Champions (VIP):\* High R, High F, High M (top spenders).

&#x20; 2. \*Loyal Customers:\* Consistent multi-order purchasers.

&#x20; 3. \*Promising New:\* Recent first-time buyers ripe for second-order nurture sequences.

&#x20; 4. \*At Risk / High Value Lost:\* High historical spend but dormant >250 days.

&#x20; 5. \*Lost / Hibernating:\* Single-order low-spend buyers.

\- \*\*Persistence:\*\* Stored 93,358 segmented profiles into SQL Server as `dbo.customer\_rfm\_segments`.



\### 4. Machine Learning: Non-Contractual Inactivity / Churn

\- \*\*Leakage-Free Formulation:\*\* Engineered a strict temporal cutoff ($T = \\text{2018-04-01}$):

&#x20; - \*Observation Window:\* Historical transactions prior to $T$ used for feature creation.

&#x20; - \*Prediction Window:\* 6-month forward horizon used to evaluate the binary churn target (1 if zero repurchases; 0 if returned).

\- \*\*Class Imbalance Handling:\*\* Addressed the 99.03% churn vs 0.97% retained class skew using `class\_weight='balanced'` and stratified cross-validation.

\- \*\*Benchmark Metrics:\*\*

&#x20; - \*\*Logistic Regression (Balanced):\*\* ROC-AUC: \*\*0.5921\*\*, PR-AUC: \*\*0.9931\*\* (top performer on rank discrimination).

&#x20; - \*\*Hist Gradient Boosting:\*\* ROC-AUC: \*\*0.5810\*\*, PR-AUC: \*\*0.9924\*\*.

&#x20; - \*\*Random Forest:\*\* ROC-AUC: \*\*0.5458\*\*, PR-AUC: \*\*0.9917\*\*.

\- \*\*Model Explainability:\*\* Evaluated feature weights demonstrating that `recency\_days` is the single strongest positive driver of churn risk, while `total\_spend` and `historical\_orders` act as retention buffers.



\### 5. Product Intelligence \& Hybrid Recommender

\- \*\*Dual-Tier Engine:\*\*

&#x20; - \*Tier 1 (Market Basket Co-Occurrence):\* Self-joined multi-item orders to compute product pairing affinity counts.

&#x20; - \*Tier 2 (Category Bestseller Fallback):\* Resolves cold-start and sparse-history buyers by surfacing the highest-rated ($\\ge 4.0\\star$) items in the customer's favorite category.

\- \*\*Transparent Output:\*\* Delivers clear similarity scores (75%–95%) alongside plain-language business explanations (e.g., \*"Frequently bought together with your previous order"\*).



\### 6. Full-Stack Web Application (Vanilla JS / HTML5 / CSS3)

\- Modern SaaS interface featuring:

&#x20; - \*\*Executive KPIs:\*\* Live metrics pulled from SQL Server.

&#x20; - \*\*Monthly Revenue Trajectory:\*\* Interactive Chart.js line graph with formatted currency axes.

&#x20; - \*\*RFM Segments:\*\* Interactive donut chart and detailed customer-spend table.

&#x20; - \*\*Customer Intelligence Lookup:\*\* Search any customer to inspect RFM scores, live ML churn probability, and personalized recommendation cards.

&#x20; - \*\*Power BI Showcase \& Lightbox:\*\* Interactive gallery previewing executive reports with full-screen zoom.

&#x20; - \*\*Creator Profile Modal:\*\* App-style, zero-scroll profile card with direct contact actions (LinkedIn, GitHub, WhatsApp, Phone, Email).

&#x20; - \*\*100% Mobile \& Desktop Responsive:\*\* Fluidly adapts to mobile screens without UI clipping.



\### 7. Executive Power BI Report

\- Multi-page analytical dashboard connecting directly to `ShopSenseDB`:

&#x20; - \*\*Page 1 (Executive Overview):\*\* GMV, delivered order counts, AOV, monthly trajectory line chart, and top 10 categories bar chart.

&#x20; - \*\*Page 2 (Customer Intelligence):\*\* Customer counts, platform recency, segment share donut chart, and average spend comparison.

&#x20; - \*\*Page 3 (Logistics \& Geography):\*\* Delivery speed, late shipment percentages, and regional fulfillment demand across Brazilian states.



\---



\## 📁 Repository Directory Structure

ShopSense/

├── data/

│ ├── raw/ # Original Olist CSV files (git-ignored)

│ └── processed/ # Processed ML features (churn\_features.csv)

├── sql/

│ ├── schema.sql # Relational DDL for 9 tables

│ ├── views.sql # dbo.vw\_order\_details Master View

│ └── analytics.sql # CTEs, Window Functions \& KPI queries

├── notebooks/

│ ├── 00\_project\_documentation.ipynb # Comprehensive Markdown project ledger

│ ├── 01\_data\_understanding.ipynb # Profiling and exploratory data analysis

│ ├── 02\_data\_ingestion.ipynb # Automated ETL into SQL Server

│ ├── 03\_rfm\_customer\_intelligence.ipynb# RFM Segmentation \& SQL persistence

│ ├── 04\_churn\_model.ipynb # ML feature engineering \& benchmarking

│ └── 05\_recommendation\_engine.ipynb # Co-occurrence \& hybrid recommender

├── models/

│ ├── churn\_model.pkl # Production Logistic Regression estimator

│ ├── churn\_scaler.pkl # Feature standardizer

│ ├── feature\_columns.pkl # Ordered feature schema list

│ └── recommendation\_engine.pkl # Serialized co-occurrence \& popularity graphs

├── backend/

│ └── main.py # FastAPI REST application

├── frontend/

│ ├── index.html # Single-Page Application interface

│ ├── style.css # Custom modern SaaS styling

│ ├── app.js # Frontend API consumer \& Chart.js logic

│ └── profile.jpg # Creator profile picture

├── dashboard/

│ └── ShopSense\_Executive\_Dashboard.pbix# Multi-page Power BI report file

├── start\_shopsense.bat # 1-Click Windows launch automation

├── requirements.txt # Project Python dependencies

├── .gitignore # Data and credential leakage prevention

└── README.md # Project portfolio master documentation



\---



\## 🚀 Quickstart \& Setup Guide



\### 1. Prerequisites

\- Python 3.10+ (tested on Python 3.13)

\- Microsoft SQL Server \& SSMS

\- Power BI Desktop (optional, for viewing `.pbix`)



\### 2. Clone the Repository

```bash

git clone https://github.com/umasankar00o7/ShopSense.git

cd ShopSense



python -m venv venv

\# On Windows:

venv\\Scripts\\activate

pip install -r requirements.txt

