# 🌾 Vanijya (वाणिज्य)

> **National Agricultural Price Discovery & Direct Market Linkages Portal**  
> *Smart India Hackathon 2026 | Problem Statement: SIH 26132*

---

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)](https://github.com)
[![Tests](https://img.shields.io/badge/Tests-33%2F33%20Passing-brightgreen?style=for-the-badge)](https://github.com)
[![Theme](https://img.shields.io/badge/Theme-Golden%20Yellow-amber?style=for-the-badge&color=f59e0b)](https://github.com)
[![Languages](https://img.shields.io/badge/Languages-English%20%7C%20%E0%A4%B9%E0%A4%BF%E0%A4%82%E0%A4%A6%E0%A4%85%20%7C%20%E0%B0%A4%E0%B1%86%E0%B0%B2%E0%B1%81%E0%B0%97%E0%B1%81-yellow?style=for-the-badge)](https://github.com)

---

## ⚡ What's New in the Latest Update

1. **🌟 Consolidated Single Web Portal (`apps/web` on `:3000`):**
   - Merged previous separate frontends into one intelligent role-aware application.
   - Public visitors, Farmers, Wholesale Buyers, and Administrators now enter through a single gateway.

2. **🎨 Golden Yellow Agricultural Theme:**
   - Premium golden amber palette (`from-amber-400 to-yellow-500`) with high-contrast slate cards and gold micro-animations.

3. **📊 Public Price Discovery (`/prices` — No Login Required):**
   - Live Agmarknet benchmark rates, 7-day Simple Moving Average (SMA) charts, and regional Spatial Arbitrage calculator accessible to anyone.

4. **🧠 Explainable "Best Selling Window" Advisory:**
   - Data-backed momentum advisory guiding farmers on whether to sell immediately or hold.

5. **🌐 Trilingual Localization Engine:**
   - Instant switching between **English**, **हिंदी (Hindi)**, and **తెలుగు (Telugu)** across all pages.

6. **🚀 1-Click Desktop Launcher (`start-vanijya.bat`):**
   - Single click to spin up both the backend API and frontend portal on Windows.

---

## 🌐 Application Endpoints

| Portal / Feature | URL | Description |
| :--- | :--- | :--- |
| 🌾 **Unified Web Portal** | [**http://localhost:3000**](http://localhost:3000) | Public landing page with live mandi tickers & benefits |
| 📊 **Public Price Discovery** | [**http://localhost:3000/prices**](http://localhost:3000/prices) | Live rates, 7-day trend chart & arbitrage (No login needed) |
| 🔐 **Common Sign In** | [**http://localhost:3000/login**](http://localhost:3000/login) | Unified login with Farmer, Buyer, and Admin personas |
| 📊 **Smart Dashboard** | [**http://localhost:3000/dashboard**](http://localhost:3000/dashboard) | Role-aware command center |
| ⚙️ **Backend API & Docs** | [**http://localhost:4000/api/docs**](http://localhost:4000/api/docs) | 24 NestJS REST APIs & Swagger documentation |

---

## 🚀 Quick Start Guide (Docker-Powered)

### Option 1: 1-Click Launch (Windows with Docker)
Double-click the launcher script in the project root:
```bat
start-vanijya.bat
```
*This automatically starts Docker Desktop if stopped, builds all multi-stage containers, and launches PostgreSQL, Backend API, and Web Portal.*

---

### Option 2: Command Line (Docker Compose)

```bash
# Start the full containerized stack (Postgres + NestJS Backend + Next.js Web)
docker compose up -d --build

# View container logs
docker compose logs -f

# Stop all containers
docker compose down
```

---

## 🔑 Demo Personas & Test Credentials

Use these pre-configured accounts on the unified sign-in page ([`/login`](http://localhost:3000/login)):

| Role | Mobile / Email | Password | Persona Details |
| :--- | :--- | :--- | :--- |
| 👨‍🌾 **Farmer** | `9876543210` | `Farmer@123` | **Ramesh Patel** (Nashik, Maharashtra) — KCC Verified |
| 🏢 **Buyer** | `buyer@freshcart.com` | `Buyer@123` | **FreshCart Agro Ltd.** — Institutional Procurer |
| ⚙️ **Admin** | `admin@vanijya.gov.in` | `Admin@123` | **System Administrator** — Ministry Oversight |

---

## 🎯 5-Step Golden Demo Flow

```
1. DISCOVER (No Login)
   Open /prices → View Tomato price (₹2,233/Qtl), 7-day SMA (₹2,213/Qtl), and nearby arbitrage (+₹96 Net Gain at Lasalgaon).

2. LIST (Farmer)
   Sign in as Farmer (9876543210) → Click "Publish Crop Lot" → List 100 Qtl Tomato at ₹2,200/Qtl (Grade A).

3. BID (Buyer)
   Sign in as Buyer (buyer@freshcart.com) → Browse Marketplace → Place bid of ₹2,250/Qtl for 100 Qtl.

4. ACCEPT (Farmer)
   Switch to Farmer → Go to "My Lots" → Accept Buyer's offer → Contract is generated atomically (Status: SOLD).

5. SETTLE (Buyer)
   Switch to Buyer → Go to "Purchases" → Enter Bank UTR (UPI-HDFC-992144) → Confirm Settlement (Status: SETTLED/PAID).
```

---

## 🏗️ Monorepo Architecture

```
vanijya/
├── apps/
│   ├── backend/                    # NestJS REST API Monolith (:4000)
│   │   ├── src/
│   │   │   ├── auth/               # JWT Authentication & RBAC
│   │   │   ├── prices/             # Agmarknet Adapter, SMA & Arbitrage
│   │   │   ├── lots/               # Crop Lot Management
│   │   │   ├── bids/               # Live Bidding & Counter-Offers
│   │   │   ├── transactions/       # Atomic Contracts & Purchase Orders
│   │   │   ├── payments/           # Settlement Workflow & UTR Verification
│   │   │   └── analytics/          # National Impact & Platform Metrics
│   │   └── test/                   # 33 Unit & E2E Test Suites (100% Pass)
│   └── web/                        # Unified Next.js 14 Portal (:3000)
│       └── src/
│           ├── app/                # App Router (Public, Dashboard, Lots, Deals)
│           ├── components/ui/      # Shared Design System (TopNav, Charts, Badges)
│           └── lib/                # AuthContext, LanguageContext & Translations
├── packages/
│   ├── shared-types/               # Shared TypeScript Interfaces & DTOs
│   └── shared-utils/               # Mathematical Formulas & Date Utilities
├── Dockerfile.backend              # Production Backend Container
├── Dockerfile.web                  # Production Web Container
├── start-vanijya.bat               # 1-Click Windows Launcher
└── README.md                       # Master Documentation
```

---

## 🧪 Automated Tests

Run the test suite across all services:
```bash
npm run test --workspace=apps/backend
```

**Results: 7 Test Suites Passed, 33 Tests Passed (100% Success Rate)**

---

## 📜 License
Licensed under the [MIT License](LICENSE).
