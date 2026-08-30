#!/bin/sh
set -e

echo "========================================================="
echo "  🌾 Vanijya Platform - Container Initialization"
echo "========================================================="

# 1. Database migration/push if DATABASE_URL is available
if [ -n "$DATABASE_URL" ]; then
  echo "🔍 Database connection string detected. Synchronizing Prisma schema..."
  npx prisma db push --schema=apps/backend/prisma/schema.prisma --skip-generate || echo "⚠️ Database sync skipped or database not yet reachable."
fi

# 2. Start NestJS Backend API in background
echo "🚀 Starting Vanijya Backend API on port 4000 (0.0.0.0)..."
export BACKEND_PORT="4000"
node apps/backend/dist/main.js &
BACKEND_PID=$!

# Trap signals for graceful shutdown
cleanup() {
  echo "🛑 Received termination signal. Shutting down gracefully..."
  kill -TERM "$BACKEND_PID" 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

# 3. Wait briefly for backend initialization
sleep 2

# 4. Start Next.js Unified Web Portal in foreground
echo "🌐 Starting Vanijya Web Portal on port 3000 (0.0.0.0)..."
export HOSTNAME="0.0.0.0"
export PORT="3000"
exec npm run start --workspace=apps/web
