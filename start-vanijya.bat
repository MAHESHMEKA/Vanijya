@echo off
setlocal

cd /d "%~dp0"

echo =========================================================
echo   Vanijya - National Agricultural Portal Launcher
echo =========================================================
echo.

REM 1. Verify Node.js and npm
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js (v18 or v20+) from https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM 2. Check and install dependencies if needed
if not exist "node_modules\" (
    echo [1/3] First-time setup: Installing dependencies...
    call npm.cmd install
    if errorlevel 1 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
) else (
    echo [1/3] Dependencies found.
)

REM 3. Check build artifacts and compile if needed
if not exist "apps\backend\dist\main.js" (
    echo [2/3] First-time setup: Generating database client and building...
    call npx.cmd prisma generate --schema=apps/backend/prisma/schema.prisma
    call npm.cmd run build
    if errorlevel 1 (
        echo [ERROR] Build failed.
        pause
        exit /b 1
    )
) else (
    echo [2/3] Build artifacts found.
)

REM 4. Launch Backend and Web Portal
echo [3/3] Launching Vanijya Platform...
echo.

echo Starting Backend API on port 4000...
start "Vanijya Backend (Port 4000)" cmd /k "cd /d %~dp0 && node apps/backend/dist/main.js"

ping 127.0.0.1 -n 4 > nul

echo Starting Unified Web Portal on port 3000...
start "Vanijya Web Portal (Port 3000)" cmd /k "cd /d %~dp0 && npm.cmd run start --workspace=apps/web"

ping 127.0.0.1 -n 3 > nul

REM 5. Open browser automatically
start http://localhost:3000

echo.
echo =========================================================
echo   Vanijya is Live!
echo   - Unified Portal: http://localhost:3000
echo   - Public Prices:  http://localhost:3000/prices
echo   - Common Login:   http://localhost:3000/login
echo   - Backend API:    http://localhost:4000/api/docs
echo =========================================================
echo.
echo Browser opened to http://localhost:3000
echo You can close this window. The servers will continue running.
pause
