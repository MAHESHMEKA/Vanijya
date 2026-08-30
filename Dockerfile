# =========================================================
#   🌾 Vanijya (वाणिज्य) - Multi-Stage Production Dockerfile
#   Smart India Hackathon 2026 | Problem Statement: SIH 26132
# =========================================================

# Stage 1: Base Environment
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++ openssl

# Stage 2: Dependencies & Build
FROM base AS builder
WORKDIR /app

# Copy dependency manifests for efficient caching
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-utils/package.json ./packages/shared-utils/

# Install dependencies across all monorepo workspaces
RUN npm ci

# Copy full repository source
COPY . .

# Generate Prisma client for backend
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma

# Build all monorepo packages, backend API, and Next.js portal
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production
ENV PORT=3000
ENV BACKEND_PORT=4000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Copy workspace manifests & node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules

# Copy shared packages
COPY --from=builder /app/packages ./packages

# Copy backend build artifacts and prisma schema
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma

# Copy frontend build artifacts and public assets
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public

# Copy entrypoint script
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Expose ports: 3000 (Unified Web Portal), 4000 (Backend API & Swagger Docs)
EXPOSE 3000 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000 || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
