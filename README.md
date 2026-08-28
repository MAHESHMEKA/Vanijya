# 🌾 Vanijya (वाणिज्य)

> **National Agricultural Price Discovery & Direct Market Linkages Portal**  
> *Smart India Hackathon 2026 | Problem Statement: SIH 26132*

---

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)](https://github.com/nithinpanuganti/Vanijya)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage%20Ready-blue?style=for-the-badge&logo=docker)](https://github.com/nithinpanuganti/Vanijya)
[![Tests](https://img.shields.io/badge/Tests-59%2F59%20Passing-brightgreen?style=for-the-badge)](https://github.com/nithinpanuganti/Vanijya)
[![Security](https://img.shields.io/badge/CAPTCHA-Visual%20Alphanumeric%20SVG-orange?style=for-the-badge&logo=shield)](https://github.com/nithinpanuganti/Vanijya)
[![Theme](https://img.shields.io/badge/Theme-Golden%20Yellow-amber?style=for-the-badge&color=f59e0b)](https://github.com/nithinpanuganti/Vanijya)
[![Languages](https://img.shields.io/badge/Languages-English%20%7C%20%E0%A4%B9%E0%A4%BF%E0%A4%82%E0%A4%A6%E0%A4%85%20%7C%20%E0%B0%A4%E0%B1%86%E0%B0%B2%E0%B1%81%E0%B0%97%E0%B1%81-yellow?style=for-the-badge)](https://github.com/nithinpanuganti/Vanijya)

---

## Key Features & Highlights

1. **🌟 Consolidated Single Web Portal (`apps/web` on `:3000`):**
   - Unified role-aware Next.js 14 application serving public visitors, farmers, institutional buyers, and administrators.
2. **🛡️ Visual Alphanumeric CAPTCHA Security Verification:**
   - Server-side SVG generator with random character rotation, offset, interference curves, and noise dots.
   - Cryptographic SHA-256 challenge hashing with per-challenge salt, single-use enforcement, 5-minute expiry, and max 5 failed attempts limit.
   - Zero client-side trust: all validation performed authoritatively on the backend.
3. **🌾 Farmer Produce Management with Segregated Categories:**
   - "My Lots" area with category tabs: **All**, **Active Bidding (🔥)**, **Sold (✅)**, **Open (📋)**, and **Cancelled (❌)**.
   - Dedicated views for Active Bidding lots (asking price, top bid, live incoming offers) and Sold lots (accepted price, buyer, contract total, payment status).
   - Real KPI dashboard summary cards dynamically calculated from backend data (*Active Bidding Lots*, *Sold Lots*, *Pending Bids*, *Open Lots*, *Total Sale Value*, *Pending Payments*).
4. **🏢 Buyer Bid Lifecycle Management:**
   - **Bid Cancellation:** Self-service cancellation of pending bids (`PENDING` $\rightarrow$ `WITHDRAWN`) with confirmation modal and safety checks (cannot cancel accepted/rejected/sold bids).
   - **Bid Quantity Modification:** Self-service modification of pending bid quantities ($0 < \text{newQuantity} \le \text{lot.quantity}$) with instant total recalculation.
5. **🛡️ Complete Audit Trail System (`AuditLog` / `BidActivity`):**
   - Auditable event logging tracking lot creations, bid placements, quantity modifications, bid cancellations, and deal acceptances.
6. **🏛️ Comprehensive Admin Oversight Cockpit (`/dashboard`):**
   - Real-time marketplace monitoring: live KPI cards, Crop Lots Monitor, Bids Monitor with modification history, Verified User Directories (Farmers & Buyers), Atomic Contracts Ledger, and Live Chronological Audit Stream.
7. **🎨 Golden Yellow Agricultural Theme:**
   - Premium golden amber palette (`from-amber-400 to-yellow-500`) with high-contrast UI and gold micro-animations.
8. **📊 Public Price Discovery (`/prices` — No Login Required):**
   - Live Agmarknet benchmark rates, 7-day Simple Moving Average (SMA) charts, and regional Spatial Arbitrage calculator accessible to anyone without login or CAPTCHA.
9. **🌐 Trilingual Localization Engine:**
   - Instant 1-click switching between **English**, **हिंदी (Hindi)**, and **తెలుగు (Telugu)** across all pages.
10. **🛡️ 100% Offline Resilient Data Store:**
    - Full 5-step publish $\rightarrow$ bid $\rightarrow$ accept $\rightarrow$ settle loop operates smoothly with in-memory stores even without PostgreSQL.
11. **🚀 1-Click Desktop Launcher (`start-vanijya.bat`):**
    - Automated port conflict resolution, dependency verification, compilation, and browser launch in a single click.

---

## Application Endpoints

| Portal / Feature | URL | Description |
| :--- | :--- | :--- |
|  **Unified Web Portal** | [**http://localhost:3000**](http://localhost:3000) | Public landing page with live mandi tickers & features |
|  **Public Price Discovery** | [**http://localhost:3000/prices**](http://localhost:3000/prices) | Live rates, 7-day trend chart & arbitrage (No login needed) |
|  **Common Sign In** | [**http://localhost:3000/login**](http://localhost:3000/login) | Unified login with visual alphanumeric CAPTCHA verification |
|  **Smart Dashboard** | [**http://localhost:3000/dashboard**](http://localhost:3000/dashboard) | Role-aware command center (Farmer, Buyer, Admin) |
|  **Farmer Lots & Bids** | [**http://localhost:3000/my-lots**](http://localhost:3000/my-lots) | Category tabs: All, Active Bidding, Sold, Open, Cancelled |
|  **Buyer Active Bids** | [**http://localhost:3000/my-bids**](http://localhost:3000/my-bids) | Buyer bids management with Modify Quantity & Cancel Bid |
|  **Marketplace** | [**http://localhost:3000/browse-lots**](http://localhost:3000/browse-lots) | Sourcing lots with direct farm-gate price discovery |
|  **Backend API & Swagger Docs** | [**http://localhost:4000/api/docs**](http://localhost:4000/api/docs) | 29 NestJS REST APIs & Swagger interactive docs |

---

## Pre-Configured Demo Credentials

On the unified login page ([`http://localhost:3000/login`](http://localhost:3000/login)), click any role tab to auto-fill credentials:

| Persona | Name / Entity | Identifier | Password | Role & Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Farmer (किसान)** | Ramesh Patel | `9876543210` | `Farmer@123` | Nashik, Maharashtra (KCC Verified Producer) |
| **Buyer (व्यापारी)** | FreshCart Agro Ltd. | `buyer@freshcart.com` | `asdfcv321` | Mumbai, Maharashtra (Wholesale Sourcing) |
| **Admin (व्यवस्थापक)** | Vanijya System Admin | `admin@vanijya.gov.in` | `Admin@123` | Ministry of Agriculture Oversight |

---

## Quick Start Guide

### Option 1: 1-Click Launch on Windows (Recommended)
Double-click the launcher script in the project root:
```bat
start-vanijya.bat
```
*This automatically clears any conflicting ports, checks dependencies, builds artifacts on first run, starts both servers, and opens your browser to `http://localhost:3000`.*

---

### Option 2: Run with Docker Compose
```bash
docker compose up --build
```

---

### Option 3: Manual Monorepo Commands
```bash
# 1. Install dependencies
npm install

# 2. Build shared packages
npm run build:packages

# 3. Generate Prisma client
npx prisma generate --schema=apps/backend/prisma/schema.prisma

# 4. Run test suites
npm run test --workspace=apps/backend

# 5. Start development servers
npm run dev
```

---

## Automated Testing

All 59 automated unit and integration tests pass with 100% success rate:
```bash
npm run test --workspace=apps/backend
```

```
Test Suites: 8 passed, 8 total
Tests:       59 passed, 59 total
Snapshots:   0 total
Time:        9.8 s
```



## Project Architecture

```
Vanijya/
├── apps/
│   ├── backend/                 # NestJS 10 REST API Server (Port 4000)
│   │   ├── prisma/              # Prisma Schema with AuditLog, Lots, Bids, Transactions
│   │   └── src/
│   │       ├── admin/           # Admin Oversight Cockpit & Monitoring Service
│   │       ├── audit/           # Auditable Activity Logging Service
│   │       ├── auth/            # Auth Controller, Service, & Visual CaptchaService
│   │       ├── bids/            # Bidding Desk with Modify Qty & Cancel Bid
│   │       ├── lots/            # Crop Lots with Category Filters
│   │       ├── prices/          # Mandi Intelligence & Trend Analytics
│   │       └── transactions/    # Atomic Trade Contracts & Settlements
│   └── web/                     # Next.js 14 Single Web Portal (Port 3000)
│       └── src/
│           ├── components/
│           │   └── security/    # Visual Alphanumeric CAPTCHA Component
│           └── app/
│               ├── browse-lots/ # Marketplace with Direct Price Discovery
│               ├── create-lot/  # Farmer produce listing
│               ├── dashboard/   # Role-aware command centers (Farmer, Buyer, Admin)
│               ├── login/       # Unified login with visual CAPTCHA & persona switch
│               ├── my-bids/     # Buyer bids with Modify Quantity & Cancel modals
│               ├── my-lots/     # Farmer tabs: All, Active Bidding, Sold, Open
│               ├── prices/      # Public price discovery (no login / no CAPTCHA)
│               └── transactions/# Purchase orders & payment UTR settlements
├── packages/
│   ├── shared-types/            # Common domain TypeScript interfaces & enums
│   └── shared-utils/            # Currency formatting & total calculation
├── docs/
│   ├── api-summary.md           # Full API route index & descriptions
│   └── demo-guide.md            # Step-by-step judge presentation guide
├── Dockerfile                   # Multi-stage production container
├── docker-compose.yml           # Unified multi-service orchestration
└── start-vanijya.bat            # 1-click Windows launcher
```

---

## 🏛️ Smart India Hackathon 2026 Compliance

- **Problem Statement:** SIH 26132
- **Organization:** Ministry of Agriculture & Farmers Welfare
- **Theme:** Agriculture, FoodTech & Rural Development
- **Outcome:** Direct farmer price discovery, visual alphanumeric CAPTCHA security verification, full bid modification lifecycle, and auditable national trade monitoring.
