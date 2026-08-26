@echo off
echo =========================================================
echo   Starting Vanijya (वाणिज्य) Unified Agricultural Portal
echo =========================================================
echo.

echo [1/2] Starting Backend API on http://localhost:4000...
start "Vanijya Backend (Port 4000)" cmd /k "cd /d %~dp0 && node apps/backend/dist/main.js"

timeout /t 2 /nobreak > nul

echo [2/2] Starting Unified Vanijya Web Portal on http://localhost:3000...
start "Vanijya Portal (Port 3000)" cmd /k "cd /d %~dp0 && npm.cmd run start --workspace=apps/web"

echo.
echo =========================================================
echo   Vanijya is Live!
echo   - Unified Portal: http://localhost:3000
echo   - Public Prices:  http://localhost:3000/prices
echo   - Common Login:   http://localhost:3000/login
echo   - Backend API:    http://localhost:4000/api/docs
echo =========================================================
pause
