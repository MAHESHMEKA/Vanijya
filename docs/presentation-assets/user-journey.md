# Vanijya (वाणिज्य) — User Journey & Platform Infographic
**Smart India Hackathon 2024 — Problem Statement 26132**

---

## 1. End-to-End User Journey Map

```mermaid
graph TD
    subgraph S1 [Phase 1: Price Discovery & Advisory]
        F1["👨‍🌾 Farmer Opens Vanijya"] --> F2["📊 Views Today's Benchmark Price (₹2,233/Qtl)"]
        F2 --> F3["📈 Reviews 7-Day Moving Average & Volatility"]
        F3 --> F4["💡 Receives 'Best Selling Window' Advisory"]
    end

    subgraph S2 [Phase 2: Farm-Gate Listing]
        F4 --> F5["🌱 Publishes Crop Lot (100 Qtl Tomato @ ₹2,200/Qtl)"]
        F5 --> F6["🚀 Lot Broadcast to Verified Commercial Buyers"]
    end

    subgraph S3 [Phase 3: Sourcing & Bidding]
        F6 --> B1["🏢 Wholesale Buyer Discovers Lot on Marketplace"]
        B1 --> B2["🔍 Compares Farm Rate vs Nearby APMC Mandi Benchmark"]
        B2 --> B3["🤝 Submits Direct Digital Bid (₹2,250/Qtl)"]
    end

    subgraph S4 [Phase 4: Deal Finalization & Fulfillment]
        B3 --> F7["🔔 Farmer Reviews Incoming Bid"]
        F7 --> F8["✅ Farmer Accepts Winning Offer"]
        F8 --> T1["📜 Atomic Transaction & Contract Created"]
        T1 --> P1["💳 Buyer Settles Payment Directly (UTR Recorded)"]
        P1 --> F9["🎉 Farmer Verifies Payment Received (PAID)"]
    end

    style S1 fill:#f0fdf4,stroke:#16a34a,stroke-width:2px
    style S2 fill:#fefce8,stroke:#ca8a04,stroke-width:2px
    style S3 fill:#eff6ff,stroke:#2563eb,stroke-width:2px
    style S4 fill:#fdf4ff,stroke:#9333ea,stroke-width:2px
```

---

## 2. Key Value Propositions for Indian Agriculture

| Dimension | Traditional Mandi Channel | Vanijya Digital Platform |
| :--- | :--- | :--- |
| **Price Discovery** | Asymmetric, controlled by local middlemen (*arhtiyas*) | Real-time Agmarknet benchmark data with 7-day Simple Moving Average |
| **Market Access** | Restricted to physical APMC yard within 10–20 km | Regional trade corridor discovery with automated spatial arbitrage calculation |
| **Commissions & Deductions** | 6% to 12% lost in unofficial commissions and weighing cuts | **0% Intermediary Commission** — 100% direct buyer-to-farmer settlement |
| **Payment Security** | Delayed credit payments, cash vulnerability | Transparent milestone tracking with recorded electronic bank transaction UTRs |
| **Selling Timing** | Distress distress selling upon harvest | **Rule-Based Best Selling Window** advisory based on price momentum and arrivals |
