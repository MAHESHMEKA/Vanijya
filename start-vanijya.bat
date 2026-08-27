@echo off
setlocal EnableDelayedExpansion

cd /d "%~dp0"

echo =========================================================
echo   Vanijya - National Agricultural Portal Launcher
echo =========================================================
echo.

REM 1. Verify Node.js
where node >nul 2>&1
if errorlevel 1 goto NO_NODE

REM 2. Check dependencies
if not exist "node_modules\" goto INSTALL_DEPS
echo [1/3] Dependencies verified.
goto CHECK_BUILD

:INSTALL_DEPS
echo [1/3] Installing dependencies for first-time run...
call npm.cmd install
if errorlevel 1 goto ERR_NPM
echo [1/3] Dependencies installed successfully.

:CHECK_BUILD
if not exist "apps\backend\dist\main.js" goto DO_BUILD
if not exist "apps\web\.next\" goto DO_BUILD
echo [2/3] Build artifacts verified.
goto LAUNCH_SERVERS

:DO_BUILD
echo [2/3] Building backend and web applications...
call npx.cmd prisma generate --schema=apps/backend/prisma/schema.prisma
call npm.cmd run build
if errorlevel 1 goto ERR_BUILD
echo [2/3] Build completed successfully.

:LAUNCH_SERVERS
echo [3/3] Launching Vanijya Platform...
echo.

echo Starting Backend API on port 4000...
start "Vanijya Backend (Port 4000)" /D "%~dp0" cmd /k "node apps/backend/dist/main.js"

ping 127.0.0.1 -n 4 > nul

echo Starting Unified Web Portal on port 3000...
start "Vanijya Web Portal (Port 3000)" /D "%~dp0" cmd /k "npm.cmd run start --workspace=apps/web"

ping 127.0.0.1 -n 3 > nul

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
exit /b 0

:NO_NODE
echo [ERROR] Node.js is not installed or not found in PATH.
echo Please install Node.js from https://nodejs.org
echo.
pause
exit /b 1

:ERR_NPM
echo.
echo [ERROR] npm install failed. Please check your internet connection.
pause
exit /b 1

:ERR_BUILD
echo.
echo [ERROR] Build failed. Please review the build errors above.
pause
exit /b 1
