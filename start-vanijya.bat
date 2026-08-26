@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo =========================================================
echo   Vanijya (वाणिज्य) - National Agricultural Portal
echo =========================================================
echo.

cd /d "%~dp0"

:: 1. Check if node_modules exists
if not exist "node_modules" (
    echo [1/3] First time setup detected: Installing dependencies...
    call npm.cmd install
    if errorlevel 1 (
        echo.
        echo [ERROR] npm install failed. Please verify Node.js is installed.
        pause
        exit /b 1
    )
) else (
    echo [1/3] Dependencies verified.
)

:: 2. Check if build artifacts exist
if not exist "apps\backend\dist\main.js" (
    echo [2/3] Building backend and generating database client...
    call npx.cmd prisma generate --schema=apps/backend/prisma/schema.prisma
    call npm.cmd run build
    if errorlevel 1 (
        echo.
        echo [ERROR] Build failed. Please check build logs above.
        pause
        exit /b 1
    )
) else (
    echo [2/3] Build artifacts verified.
)

:: 3. Launch Services
echo [3/3] Starting Vanijya Services...
echo.

echo Starting Backend API on http://localhost:4000...
start "Vanijya Backend (Port 4000)" cmd /k "cd /d "%~dp0" && node apps/backend/dist/main.js"

timeout /t 3 /nobreak > nul

echo Starting Unified Web Portal on http://localhost:3000...
start "Vanijya Portal (Port 3000)" cmd /k "cd /d "%~dp0" && npm.cmd run start --workspace=apps/web"

echo.
echo =========================================================
echo   🌾 Vanijya is Live!
echo   - Unified Portal: http://localhost:3000
echo   - Public Prices:  http://localhost:3000/prices
echo   - Common Login:   http://localhost:3000/login
echo   - Backend API:    http://localhost:4000/api/docs
echo =========================================================
echo.
echo Leave this window or close it. The background terminal windows will keep running.
pause
