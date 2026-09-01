# Vanijya (वाणिज्य) — Production Deployment & Cloud Guide
**SIH Problem Statement 26132 — Strengthening Market Linkages & Price Discovery for Farmers**

---

## 1. Cloud Deployment Architectures

### Option A: Cloud Platform Deployment (Render / Railway / Vercel)
Recommended for agile cloud staging and production environments.

1. **Database Setup (Neon / Supabase / Managed PostgreSQL):**
   - Create a PostgreSQL database instance.
   - Copy the PostgreSQL connection string `DATABASE_URL`.

2. **Backend API Service (Render / Railway / AWS EC2):**
   - Set Build Command:
     ```bash
     npm install && npm run build:packages && npx prisma generate --schema=apps/backend/prisma/schema.prisma && npm run build:backend
     ```
   - Set Start Command:
     ```bash
     node apps/backend/dist/main.js
     ```
   - Set Environment Variables:
     - `DATABASE_URL`: Your production PostgreSQL connection string
     - `JWT_SECRET`: Secure random signing key
     - `PORT`: `4000` (or platform default)
     - `NODE_ENV`: `production`

3. **Frontend Unified Portal (Vercel / AWS Amplify):**
   - Root Directory: `apps/web` (or Monorepo Root)
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Set Environment Variables:
     - `NEXT_PUBLIC_API_URL`: URL of your deployed Backend API (e.g. `https://api.vanijya.app/api`)

---

### Option B: Linux Server Deployment (Ubuntu / AWS EC2)
1. **System Preparation:**
   - Install Node.js 20+ LTS, npm, and PostgreSQL.
   - Configure PostgreSQL database `vanijya_db` and user permissions.

2. **Clone & Build:**
   ```bash
   git clone https://github.com/nithinpanuganti/Vanijya.git
   cd Vanijya
   npm install
   npm run build:packages
   npx prisma generate --schema=apps/backend/prisma/schema.prisma
   npx prisma db push --schema=apps/backend/prisma/schema.prisma
   npm run build
   ```

3. **Process Management with PM2:**
   ```bash
   # Install PM2 globally
   npm install -g pm2

   # Start Backend API
   pm2 start apps/backend/dist/main.js --name "vanijya-backend"

   # Start Web Portal
   pm2 start npm --name "vanijya-web" -- run start --workspace=apps/web
   ```

---

## 2. Environment Variables Reference

| Variable | Service | Template Default | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Backend | `postgresql://user:pass@localhost:5432/vanijya_db?schema=public` | PostgreSQL Connection String |
| `JWT_SECRET` | Backend | `vanijya_super_secret_jwt_key_sih2024` | Cryptographic JWT signing secret |
| `JWT_EXPIRES_IN`| Backend | `7d` | Session expiration window |
| `PORT` | Backend | `4000` | HTTP listening port |
| `MARKET_DATA_PROVIDER`| Backend | `mock` (or `government`) | Price adapter mode |
| `GOV_MARKET_API_KEY` | Backend | `""` | Optional data.gov.in Agmarknet API key |
| `PRICE_CACHE_TTL_MS` | Backend | `300000` | In-memory price cache TTL (5 minutes) |
| `NEXT_PUBLIC_API_URL`| Web | `http://localhost:4000/api` | Backend API endpoint |
| `PORT` | Web | `3000` | Web portal port |
