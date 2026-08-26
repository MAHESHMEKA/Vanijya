# Vanijya (वाणिज्य) — Complete API Reference & Endpoints
**Base URL:** `http://localhost:4000/api` | **Interactive Swagger UI:** `http://localhost:4000/api/docs`

---

## 1. Authentication & Users

| Method | Endpoint | Description | Role / Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Authenticate with phone/email and password, returns JWT token | Public |
| `GET` | `/auth/me` | Fetch authenticated user profile and verification status | Bearer JWT |
| `GET` | `/users/me` | Retrieve profile details | Bearer JWT |
| `PATCH` | `/users/me` | Update name, district, state, location | Bearer JWT |

---

## 2. Commodities & Markets

| Method | Endpoint | Description | Role / Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/crops` | List agricultural commodities (Tomato, Onion, Paddy, etc.) | Public |
| `GET` | `/markets` | List APMC mandis with GPS coordinates and state | Public |

---

## 3. Market Intelligence & Mandi Prices

| Method | Endpoint | Description | Role / Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/prices` | Query mandi prices with crop, district, and state filters | Public |
| `GET` | `/prices/latest` | Deduplicated latest benchmark rates per crop/mandi | Public |
| `GET` | `/prices/trends` | 7-day Simple Moving Average (SMA), trend direction, volatility | Public |
| `GET` | `/prices/compare` | Haversine distance, transport offset, and optimal nearby APMC | Public |
| `GET` | `/prices/dashboard` | **Hero Dashboard:** Today's rate, SMA, trend, and Best Selling Window | Public |

---

## 4. Crop Lots Management

| Method | Endpoint | Description | Role / Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/lots` | Query crop lots with crop, farmer, quality, status filters | Public |
| `GET` | `/lots/:id` | Get lot specifications, farmer credentials, and existing bids | Public |
| `POST` | `/lots` | Publish a new crop lot | `FARMER` |
| `PATCH` | `/lots/:id` | Update lot status or price | `FARMER` |

---

## 5. Bidding & Negotiations

| Method | Endpoint | Description | Role / Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/bids/my` | List all bids submitted by the authenticated buyer | `BUYER` |
| `GET` | `/lots/:id/bids` | List all incoming bids on a specific crop lot | `FARMER` / `BUYER` |
| `POST` | `/lots/:id/bids` | Submit a direct sourcing offer on a lot | `BUYER` |
| `PATCH` | `/bids/:id/accept` | Accept winning bid (atomically marks lot SOLD and creates transaction) | `FARMER` |
| `PATCH` | `/bids/:id/reject` | Reject a specific bid | `FARMER` |

---

## 6. Transactions & Payment Fulfillment

| Method | Endpoint | Description | Role / Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/transactions` | List confirmed purchase contracts for authenticated user | Bearer JWT |
| `GET` | `/transactions/:id` | Get contract breakdown, agreed rates, and payment state | Bearer JWT |
| `GET` | `/payments/:transactionId` | View payment invoice, status, and bank UTR reference | Bearer JWT |
| `PATCH` | `/payments/:transactionId/status` | Update payment state (`PENDING` $\rightarrow$ `INITIATED` $\rightarrow$ `PAID`) | Bearer JWT |

---

## 7. Demo & Simulation

| Method | Endpoint | Description | Role / Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/demo/reset` | **1-Click Demo Reset:** Restores database state to baseline for judges | Public / Demo |
| `GET` | `/health` | Server heartbeat and system status | Public |
