const API_BASE = "http://127.0.0.1:8001";

let revenueChartInstance = null;
let segmentChartInstance = null;
let trendsDataCache = null;

// Tab Switching Navigation Logic
function switchTab(tabId, buttonElement) {
    // 1. Hide all tab panes
    document.querySelectorAll(".tab-pane").forEach(pane => {
        pane.classList.remove("active");
    });

    // 2. Remove active state from all buttons
    document.querySelectorAll(".nav-item").forEach(btn => {
        btn.classList.remove("active");
    });

    // 3. Show selected tab
    document.getElementById(tabId).classList.add("active");
    buttonElement.classList.add("active");

    // 4. Update Header Titles
    const titles = {
        "tab-kpis": { title: "Executive KPIs", desc: "Real-Time E-Commerce Health Metrics from Microsoft SQL Server" },
        "tab-trends": { title: "Revenue Trends", desc: "Longitudinal Monthly Delivered Gross Market Volume" },
        "tab-segments": { title: "Customer Segments", desc: "RFM Behavioral Segmentation & Value Tiers" },
        "tab-intelligence": { title: "Customer Intelligence", desc: "Live ML Churn Risk Scoring & Hybrid Product Recommender" }
    };

    document.getElementById("page-title").innerText = titles[tabId].title;
    document.getElementById("page-subtitle").innerText = titles[tabId].desc;

    // 5. If switching to Trends, render the chart immediately now that the container is visible!
    if (tabId === "tab-trends") {
        renderRevenueChart();
    }
}

// Initial Data Loading
document.addEventListener("DOMContentLoaded", () => {
    fetchKPIs();
    fetchTrends();
    fetchSegments();
});

// 1. Fetch Executive KPIs
function fetchKPIs() {
    fetch(`${API_BASE}/api/kpis`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("kpi-revenue").innerText = `R$ ${(data.gross_revenue / 1000000).toFixed(2)}M`;
            document.getElementById("kpi-orders").innerText = Number(data.total_orders).toLocaleString();
            document.getElementById("kpi-customers").innerText = Number(data.total_customers).toLocaleString();
            document.getElementById("kpi-aov").innerText = `R$ ${Number(data.average_order_value).toFixed(2)}`;
            document.getElementById("kpi-delivery").innerText = `${data.avg_delivery_days} Days`;
            document.getElementById("kpi-delayed").innerText = `${data.delayed_pct}%`;
        })
        .catch(err => console.error("Error loading KPIs:", err));
}

// 2. Fetch Monthly Trends Data & Cache It
function fetchTrends() {
    fetch(`${API_BASE}/api/monthly-trends`)
        .then(res => res.json())
        .then(data => {
            trendsDataCache = data;
        })
        .catch(err => console.error("Error loading Trends:", err));
}

// Render Revenue Chart when tab is active
function renderRevenueChart() {
    if (!trendsDataCache) {
        setTimeout(renderRevenueChart, 200);
        return;
    }

    const months = trendsDataCache.map(d => d.month);
    const revenues = trendsDataCache.map(d => d.revenue);

    const ctx = document.getElementById("revenueChart").getContext("2d");
    if (revenueChartInstance) revenueChartInstance.destroy();

    revenueChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: months,
            datasets: [{
                label: "Gross Revenue (R$)",
                data: revenues,
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.15)",
                fill: true,
                tension: 0.3,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: "#3b82f6"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ` Revenue: R$ ${Number(ctx.raw).toLocaleString()}`
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: val => `R$ ${(val / 1000).toFixed(0)}k`
                    }
                }
            }
        }
    });
}

// 3. Fetch RFM Segments & Render Donut Chart + Table
function fetchSegments() {
    fetch(`${API_BASE}/api/segments`)
        .then(res => res.json())
        .then(data => {
            const labels = data.map(d => d.Customer_Segment);
            const counts = data.map(d => d.customer_count);

            const ctx = document.getElementById("segmentChart").getContext("2d");
            if (segmentChartInstance) segmentChartInstance.destroy();

            segmentChartInstance = new Chart(ctx, {
                type: "doughnut",
                data: {
                    labels: labels,
                    datasets: [{
                        data: counts,
                        backgroundColor: [
                            "#3b82f6",
                            "#10b981",
                            "#f59e0b",
                            "#ef4444",
                            "#8b5cf6"
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "bottom" } }
                }
            });

            // Populate Table
            const tbody = document.getElementById("segmentTableBody");
            tbody.innerHTML = "";
            data.forEach(row => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><strong>${row.Customer_Segment}</strong></td>
                    <td>${Number(row.customer_count).toLocaleString()}</td>
                    <td>R$ ${Number(row.total_spend).toLocaleString()}</td>
                    <td>${row.avg_recency_days} days</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error("Error loading Segments:", err));
}

// 4. Search Customer Intelligence & Live ML Churn
function searchCustomer() {
    const custId = document.getElementById("custSearchInput").value.trim();
    if (!custId) {
        alert("Please enter a valid Customer Unique ID.");
        return;
    }

    fetch(`${API_BASE}/api/customer/${custId}`)
        .then(res => {
            if (!res.ok) throw new Error("Customer not found");
            return res.json();
        })
        .then(data => {
            document.getElementById("customerResult").style.display = "block";
            document.getElementById("res-cust-id").innerText = data.customer_id;
            document.getElementById("res-segment").innerText = data.metrics.segment;
            document.getElementById("res-recency").innerText = `${data.metrics.recency_days} days ago`;
            document.getElementById("res-orders").innerText = data.metrics.orders_count;
            document.getElementById("res-spend").innerText = `R$ ${Number(data.metrics.total_spend).toFixed(2)}`;
            
            // Churn Risk
            const riskElem = document.getElementById("res-churn-risk");
            riskElem.innerText = `${data.ml_predictions.churn_probability_pct}% (${data.ml_predictions.risk_level})`;
            riskElem.style.color = data.ml_predictions.churn_probability_pct > 65 ? "#ef4444" : "#10b981";

            // Product Recommendations
            const recContainer = document.getElementById("rec-list");
            recContainer.innerHTML = "";
            data.recommendations.forEach(rec => {
                const card = document.createElement("div");
                card.className = "rec-card";
                card.innerHTML = `
                    <span>${rec.score_pct}% Match</span>
                    <strong>${rec.category.replace(/_/g, " ").toUpperCase()}</strong>
                    <small style="color:#64748b; font-size:11px; display:block; margin-bottom:4px;">SKU: ${rec.product_id.slice(0, 10)}...</small>
                    <p>${rec.reason}</p>
                `;
                recContainer.appendChild(card);
            });
        })
        .catch(err => {
            alert("Customer ID not found. Click 'Load Sample Customer' to test.");
        });
}

function loadSampleCustomer() {
    document.getElementById("custSearchInput").value = "8d50f5eadf50201ccdcedfb9e2ac8455";
    searchCustomer();
}

// ============================================================
// CREATOR PROFILE MODAL LOGIC (Tab Switching & Image Handling)
// ============================================================

function openCreatorModal() {
    document.getElementById("creatorModal").classList.add("show");
}

function closeCreatorModal() {
    document.getElementById("creatorModal").classList.remove("show");
}

function closeCreatorModalOnBackdrop(event) {
    if (event.target.id === "creatorModal") {
        closeCreatorModal();
    }
}

// Switch between Overview, Milestones, and Contact (Zero-Scroll!)
function switchCreatorTab(tabId, btnElement) {
    document.querySelectorAll(".c-tab-content").forEach(content => {
        content.classList.remove("active");
    });
    document.querySelectorAll(".c-tab-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    document.getElementById(tabId).classList.add("active");
    btnElement.classList.add("active");
}

// Optional: Click photo to preview
function expandPhoto() {
    const photo = document.getElementById("creatorMainPhoto");
    photo.style.transform = photo.style.transform === "scale(1.15)" ? "scale(1)" : "scale(1.15)";
}

// ============================================================
// POWER BI DASHBOARD INTERACTIVITY & LIGHTBOX
// ============================================================

// Switch between Page 1, Page 2, Page 3
function switchPbiPage(pageNumber, btnElement) {
    document.querySelectorAll(".pbi-page-view").forEach(view => {
        view.classList.remove("active");
    });
    document.querySelectorAll(".pbi-pill-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    document.getElementById(`pbi-view-${pageNumber}`).classList.add("active");
    btnElement.classList.add("active");
}

// Lightbox Open/Close
function openLightbox(imgSrc, title) {
    document.getElementById("lightboxImg").src = imgSrc;
    document.getElementById("lightboxTitle").innerText = title;
    document.getElementById("pbiLightbox").classList.add("show");
}

function closeLightbox(event) {
    if (event.target.id === "pbiLightbox") {
        closeLightboxDirect();
    }
}

function closeLightboxDirect() {
    document.getElementById("pbiLightbox").classList.remove("show");
}