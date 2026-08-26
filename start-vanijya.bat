@echo off
setlocal

cd /d "%~dp0"

echo =========================================================
echo   Vanijya - National Agricultural Portal
echo =========================================================
echo.

REM 1. Check if dependencies are installed
if not exist "node_modules\" (
    echo [1/3] Installing dependencies for first-time run...
    call npm.cmd install
) else (
    echo [1/3] Dependencies found.
)

REM 2. Check if build artifacts exist
if not exist "apps\backend\dist\main.js" (
    echo [2/3] Generating Prisma client and compiling packages...
    call npx.cmd prisma generate --schema=apps/backend/prisma/schema.prisma
    call npm.cmd run build
) else (
    echo [2/3] Build artifacts found.
)

REM 3. Start Backend and Web Portal
echo [3/3] Launching Vanijya Platform...
echo.

echo Starting Backend API on port 4000...
start "Vanijya Backend (Port 4000)" cmd /k "cd /d %~dp0 && node apps/backend/dist/main.js"

ping 127.0.0.1 -n 4 > nul

echo Starting Unified Web Portal on port 3000...
start "Vanijya Web Portal (Port 3000)" cmd /k "cd /d %~dp0 && npm.cmd run start --workspace=apps/web"

echo.
echo =========================================================
echo   Vanijya is Live!
echo   - Unified Portal: http://localhost:3000
echo   - Public Prices:  http://localhost:3000/prices
echo   - Common Login:   http://localhost:3000/login
echo   - Backend API:    http://localhost:4000/api/docs
echo =========================================================
echo.
pause
