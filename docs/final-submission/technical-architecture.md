# Vanijya (वाणिज्य) — Technical Architecture
**Smart India Hackathon 2024 — Problem Statement 26132**

---

## 1. Architectural Blueprint

```mermaid
graph TB
    subgraph Client_Applications [Client Applications Layer]
        FW["Farmer Web Portal (:3001)<br/>Next.js 14 • Mobile-First • SVG Analytics"]
        BW["Buyer Procurement Portal (:3002)<br/>Next.js 14 • B2B Marketplace • Live Bidding"]
    end

    subgraph Core_Backend [NestJS Modular Monolith Layer (:4000)]
        AuthMod["Auth & RBAC (JWT + Bcrypt)"]
        PriceMod["Market Intelligence Engine"]
        LotsMod["Lot Management"]
        BidsMod["Bidding & Negotiation"]
        TxnMod["Transaction & Settlement"]
        DemoMod["Demo Reset Controller"]
        AnalyticsMod["Platform Analytics & Impact"]
    end

    subgraph Data_Intelligence [Data & Provider Layer]
        PrismaORM["Prisma ORM Client"]
        GovAdapter["Government Market Data Provider (data.gov.in)"]
        MockAdapter["Offline Mock APMC Provider"]
        PriceCache["In-Memory TTL Price Cache"]
    end

    subgraph Database [Persistence Layer]
        PostgreSQL[("PostgreSQL Database<br/>8 Relational Entities")]
    end

    FW -->|REST API + Bearer JWT| Core_Backend
    BW -->|REST API + Bearer JWT| Core_Backend
    Core_Backend --> PrismaORM
    PriceMod --> GovAdapter
    PriceMod --> MockAdapter
    PriceMod --> PriceCache
    PrismaORM --> PostgreSQL
```

---

## 2. Database Relational ER Diagram

```mermaid
erDiagram
    USER ||--o{ CROPLOT : creates
    USER ||--o{ BID : places
    USER ||--o{ TRANSACTION : participates
    CROP ||--o{ CROPLOT : categorizes
    CROP ||--o{ MANDIPRICE : rates
    MARKET ||--o{ MANDIPRICE : hosts
    CROPLOT ||--o{ BID : receives
    CROPLOT ||--o| TRANSACTION : finalizes
    BID ||--o| TRANSACTION : accepted_in
    TRANSACTION ||--|| PAYMENT : triggers

    USER {
        string id PK
        string name
        string phone
        string email
        string password
        UserRole role "FARMER | BUYER | ADMIN"
        string district
        string state
        string location
        boolean isVerified
    }

    CROP {
        string id PK
        string name "Tomato, Onion, Paddy, etc."
        string category "Vegetable, Grain, Cash Crop"
        string defaultUnit
    }

    MARKET {
        string id PK
        string name "Nashik APMC, Lasalgaon, etc."
        string state
        string district
        float latitude
        float longitude
    }

    MANDIPRICE {
        string id PK
        string cropId FK
        string marketId FK
        float minPrice
        float maxPrice
        float modalPrice
        float arrivalQuantity
        datetime date
        PriceSource source
    }

    CROPLOT {
        string id PK
        string farmerId FK
        string cropId FK
        float quantity
        string unit
        float expectedPrice
        QualityGrade qualityGrade
        string location
        CropLotStatus status "OPEN | BIDDING | SOLD | CANCELLED"
    }

    BID {
        string id PK
        string lotId FK
        string buyerId FK
        float price
        float quantity
        string message
        BidStatus status "PENDING | ACCEPTED | REJECTED | WITHDRAWN"
    }

    TRANSACTION {
        string id PK
        string lotId FK
        string buyerId FK
        string farmerId FK
        string acceptedBidId FK
        float agreedPrice
        float quantity
        float totalAmount
        TransactionStatus status "INITIATED | IN_PROGRESS | COMPLETED | CANCELLED"
    }

    PAYMENT {
        string id PK
        string transactionId FK
        float amount
        PaymentStatus status "PENDING | INITIATED | PAID | FAILED"
        string paymentReference
    }
```
