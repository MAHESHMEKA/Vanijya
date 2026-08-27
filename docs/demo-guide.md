# Vanijya (वाणिज्य) — Smart India Hackathon Demo Guide
**Problem Statement 26132:** Strengthening Market Linkages & Price Discovery for Farmers

---

## 1. System Launch & Preparation

### 1-Click Launch (Windows)
Double-click:
```bat
start-vanijya.bat
```
*Launches Backend API on port 4000 and Unified Web Portal on port 3000.*

---

## 2. Pre-Configured Demo Credentials

On the unified login page ([`http://localhost:3000/login`](http://localhost:3000/login)), click any role tab to auto-fill credentials:

| Persona | Name / Entity | Identifier | Password | Role & Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Farmer** | Ramesh Patel | `9876543210` | `Farmer@123` | Nashik, Maharashtra (KCC Verified Producer) |
| **Buyer** | FreshCart Agro Ltd. | `buyer@freshcart.com` | `asdfcv321` | Mumbai, Maharashtra (Wholesale Sourcing) |
| **Admin** | Vanijya System Admin | `admin@vanijya.gov.in` | `Admin@123` | Ministry of Agriculture Oversight |

---

## 3. The 3-Minute Live Demonstration Script

### Step 1: Public Price Discovery (No Login — 0:00 - 0:45)
1. Navigate to `http://localhost:3000/prices`.
2. Point out **Today's Benchmark Rate (₹2,233/Qtl)**, **7-Day Moving Average (₹2,213/Qtl)**, and the **Lasalgaon Market Arbitrage (+₹96/Qtl Net Gain)**.
3. Highlight the **Best Selling Window** card:
   - *Recommendation:* "Sell within next 24-48 Hours"
   - *Confidence:* High (Momentum analytics).
4. View the 7-day SVG price trend vector chart.

---

### Step 2: Farmer Produce Listing (0:45 - 1:30)
1. Sign in as **Farmer** (`9876543210`).
2. Tap **"Publish New Crop Lot"** (`/create-lot`).
3. Enter:
   - *Crop:* Tomato
   - *Quantity:* 100 Quintals
   - *Expected Price:* ₹2,200/Qtl
   - *Quality Grade:* Grade A
   - *Location:* Pimpalgaon Farm Gate, Niphad, Nashik
4. Click **"Publish Crop Lot"**. Produce is broadcast to the national marketplace.

---

### Step 3: Buyer Discovery & Competitive Bidding (1:30 - 2:15)
1. Sign in as **Buyer** (`buyer@freshcart.com`).
2. Open **Marketplace** (`/browse-lots`) $\rightarrow$ Click the newly published Tomato lot.
3. Show the **APMC Benchmark Guide (₹2,320/Qtl)**.
4. Submit a competitive direct sourcing offer of **₹2,250/Qtl** for 100 Quintals.

---

### Step 4: Farmer Acceptance & Atomic Contract (2:15 - 2:45)
1. Switch back to **Farmer** $\rightarrow$ Go to **"My Lots"** (`/my-lots`).
2. Open the lot $\rightarrow$ Review incoming buyer offers.
3. Click **"Accept & Finalize Deal"**.
4. Contract is generated atomically; lot updates to **`SOLD & LOCKED`**.

---

### Step 5: Digital Payment Settlement (2:45 - 3:00)
1. Switch to **Buyer** $\rightarrow$ Go to **"Purchases"** (`/transactions`).
2. Enter Bank UTR reference (`UPI-HDFC-992144`).
3. Click **"Confirm Settlement (Paid)"**.
4. Contract updates to **`SETTLED (PAID)`** with zero intermediary commission deduction.
