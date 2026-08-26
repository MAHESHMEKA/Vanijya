# Vanijya (वाणिज्य) — Production Deployment & Cloud Guide
**SIH Problem Statement 26132 — Strengthening Market Linkages & Price Discovery for Farmers**

---

## 1. Cloud Deployment Architectures

### Option A: Single-Host Production Deployment (Docker Compose)
Recommended for Hackathon live staging and pilot validation.

1. **Host Setup (AWS EC2 / Ubuntu Linux):**
   - Recommended: AWS EC2 `t3.medium` (2 vCPU, 4GB RAM) with Ubuntu 22.04 LTS.
   - Open Inbound Ports: `80` (HTTP), `443` (HTTPS), `3000` (Unified Web Portal), `4000` (Backend API).

2. **Clone & Launch with Docker Compose:**
   ```bash
   git clone https://github.com/your-org/vanijya.git
   cd vanijya
   docker compose -f infrastructure/docker-compose.prod.yml up -d --build
   ```

3. **Database Seed & Initialize:**
   ```bash
   docker exec -it vanijya-backend-prod npx prisma db push
   docker exec -it vanijya-backend-prod npx prisma db seed
   ```

---

### Option B: Cloud-Native Managed Deployment
- **Backend & Database:** Render / Railway / AWS ECS connecting to Managed PostgreSQL.
- **Frontend Portal:** Vercel / AWS Amplify (`apps/web` on `https://vanijya.gov.in` or `https://vanijya.app`).
  - Set Environment Variable `NEXT_PUBLIC_API_URL=https://api.vanijya.app/api`.

---

## 2. Environment Variables Reference

| Variable | Service | Template Default | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Backend | `postgresql://vanijya_user:vanijya_pass@localhost:5432/vanijya_db?schema=public` | PostgreSQL Connection String |
| `JWT_SECRET` | Backend | `vanijya_super_secret_jwt_key_sih2024` | Cryptographic JWT signing secret |
| `JWT_EXPIRES_IN`| Backend | `7d` | Session expiration window |
| `PORT` | Backend | `4000` | HTTP listening port |
| `MARKET_DATA_PROVIDER`| Backend | `mock` (or `government`) | Price adapter mode |
| `GOV_MARKET_API_KEY` | Backend | `""` | Optional data.gov.in Agmarknet API key |
| `PRICE_CACHE_TTL_MS` | Backend | `300000` | In-memory price cache TTL (5 minutes) |
| `NEXT_PUBLIC_API_URL`| Web | `http://localhost:4000/api` | Backend API endpoint |
| `PORT` | Web | `3000` | Web portal port |
