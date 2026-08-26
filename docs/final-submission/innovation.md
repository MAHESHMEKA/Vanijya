# Vanijya (वाणिज्य) — Key Innovations & Differentiators
**Smart India Hackathon 2024 — Problem Statement 26132**

---

## 1. Core Technical & Product Innovations

### Innovation 1: Spatial Arbitrage Engine (Haversine Net Realization)
Rather than simply showing static mandi price lists, Vanijya calculates the **Net Realizable Return** for nearby APMC mandis using the Haversine great-circle geographic distance formula:
$$\text{Net Price} = \text{Modal Rate} - (d_{\text{km}} \times ₹0.50/\text{Qtl/km})$$
*Outcome:* Identifies profitable regional markets where higher prices exceed extra transport costs (e.g. Lasalgaon offering ₹96/Qtl net arbitrage gain over Nashik APMC).

### Innovation 2: Explainable "Best Selling Window"
Unlike opaque deep-learning models that farmers distrust, Vanijya utilizes a deterministic, explainable momentum classification engine:
- Evaluates 7-day Simple Moving Average ($\text{SMA}_7$), price delta ($\Delta\%$), and arrival volatility ($CV$).
- Generates clear, human-readable advice (e.g. *"Today's Tomato rate is 6.8% above baseline with low volatility. Sell within the next 24–48 hours before supply peaks."*).

### Innovation 3: Resilient Offline-First Data Adapter Architecture
- Implements the Adapter Pattern with dynamic dependency injection (`MARKET_DATA_PROVIDER_TOKEN`).
- Connects to government Agmarknet / data.gov.in APIs with automated 3.5s timeout abort and graceful fallback to offline APMC datasets, guaranteeing **100% uptime during rural network dead zones or hackathon demos**.

### Innovation 4: Atomic Contract & Transaction Lock
- Bids are executed in atomic database transactions (`prisma.$transaction`).
- When a farmer accepts an offer, the winning bid becomes `ACCEPTED`, the lot becomes `SOLD`, competing bids are automatically marked `REJECTED`, and a legally binding `Transaction` and `Payment` record are created in a single database operation.

### Innovation 5: 1-Click SIH Judge Demonstration Suite
- Integrated floating monitor widget with live backend connectivity indicator and 1-Click Demo Reset (`POST /api/demo/reset`) allowing seamless multi-browser demonstrations in under 3 minutes.
