# Vanijya (वाणिज्य) — System Architecture & Technical Specification
**Smart India Hackathon 2026 | Problem Statement 26132**

---

## 1. High-Level Architecture Diagram

```mermaid
graph TB
    subgraph Client_Layer [Unified Client Application Layer]
        Web["Unified Vanijya Portal (Next.js 14 / Golden Theme)<br/>Port 3000 (Public / Farmer / Buyer / Admin)"]
    end

    subgraph API_Gateway [Backend Core Layer - NestJS Modular Monolith]
        Auth["Auth & RBAC Module<br/>(JWT + Passport + Fallback)"]
        Price["Market Intelligence Engine<br/>(SMA + Haversine + Best Sell Window)"]
        Lots["Lot Management Module"]
        Bids["Bidding & Negotiation Desk"]
        Txn["Transaction & Settlement Engine"]
        Demo["SIH Demo Reset Controller"]
    end

    subgraph Data_Intelligence [Data & Provider Layer]
        Prisma["Prisma ORM Client"]
        GovAdapter["Government Market Data Adapter<br/>(data.gov.in / Agmarknet)"]
        MockAdapter["Offline Mock Market Data Adapter<br/>(Indian APMC Dataset)"]
        PriceCache["In-Memory TTL Price Cache"]
    end

    subgraph Persistence [Persistence Layer]
        PostgreSQL[("PostgreSQL Database<br/>(Users, Crops, Markets, Prices, Lots, Bids, Transactions, Payments)")]
    end

    Web -->|REST API / Bearer JWT| API_Gateway
    Auth --> Prisma
    Lots --> Prisma
    Bids --> Prisma
    Txn --> Prisma
    Demo --> Prisma
    Price --> GovAdapter
    Price --> MockAdapter
    Price --> PriceCache
    Prisma --> PostgreSQL
```

---

## 2. Technical Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Monorepo Architecture** | npm workspaces | Unified type safety across `@vanijya/shared-types`, `@vanijya/shared-utils`, backend, and web portal. |
| **Backend Core** | NestJS (TypeScript) | Enterprise-grade modular architecture with dependency injection, OpenAPI/Swagger docs, and built-in validation pipes. |
| **Database & ORM** | PostgreSQL + Prisma ORM | Relational integrity, ACID atomic transactions (`$transaction`), and type-safe schema queries. |
| **Unified Web Client** | Next.js 14 (App Router, Tailwind CSS) | Role-aware unified application supporting Public Price Discovery, Farmer Sell Hub, Buyer B2B Marketplace, and Admin Analytics. |
| **Price Analytics** | Custom In-Memory Analytics Service | 7-day Simple Moving Average (SMA), momentum detection (`BULLISH`/`BEARISH`/`STABLE`), spatial Haversine distance arbitrage. |
| **Design System** | Golden Yellow Agricultural Palette | High-contrast gold & slate theme with micro-interactions, shimmer loading, and full trilingual localization. |
