# =========================================================
# Vanijya - National Agricultural Marketplace (Unified Image)
# =========================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Install native compilation dependencies
RUN apk add --no-cache python3 make g++

# Copy package descriptors
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY apps/web/package*.json ./apps/web/
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/shared-utils/package*.json ./packages/shared-utils/

# Install monorepo dependencies
RUN npm install

# Copy complete project source
COPY . .

# Generate Prisma Client and build all workspaces
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma
RUN npm run build

# =========================================================
# Production Runner
# =========================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache curl

# Copy build artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/backend ./apps/backend
COPY --from=builder /app/apps/web ./apps/web

EXPOSE 3000 4000

# Default entry starts backend and web concurrently
CMD ["sh", "-c", "node apps/backend/dist/main.js & npm run start --workspace=apps/web"]
