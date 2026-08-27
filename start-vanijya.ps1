# =========================================================
# Vanijya - National Agricultural Portal PowerShell Launcher
# =========================================================

Set-Location -Path $PSScriptRoot

Write-Host "=========================================================" -ForegroundColor Yellow
Write-Host "  Vanijya - National Agricultural Portal Launcher" -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Yellow
Write-Host ""

# 1. Verify Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org"
    Read-Host "Press Enter to exit..."
    exit 1
}

# 2. Check dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "[1/3] Installing dependencies for first-time run..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] npm install failed." -ForegroundColor Red
        Read-Host "Press Enter to exit..."
        exit 1
    }
} else {
    Write-Host "[1/3] Dependencies verified." -ForegroundColor Green
}

# 3. Check build artifacts
if (-not (Test-Path "apps\backend\dist\main.js") -or -not (Test-Path "apps\web\.next")) {
    Write-Host "[2/3] Building backend and web applications..." -ForegroundColor Cyan
    npx prisma generate --schema=apps/backend/prisma/schema.prisma
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Build failed." -ForegroundColor Red
        Read-Host "Press Enter to exit..."
        exit 1
    }
} else {
    Write-Host "[2/3] Build artifacts verified." -ForegroundColor Green
}

# 4. Launch Servers
Write-Host "[3/3] Launching Vanijya Platform..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting Backend API on port 4000..." -ForegroundColor Cyan
Start-Process cmd.exe -ArgumentList "/k cd /d `"$PSScriptRoot`" && node apps/backend/dist/main.js"

Start-Sleep -Seconds 3

Write-Host "Starting Unified Web Portal on port 3000..." -ForegroundColor Cyan
Start-Process cmd.exe -ArgumentList "/k cd /d `"$PSScriptRoot`" && npm.cmd run start --workspace=apps/web"

Start-Sleep -Seconds 2

# 5. Open Browser
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Yellow
Write-Host "  Vanijya is Live!" -ForegroundColor Green
Write-Host "  - Unified Portal: http://localhost:3000" -ForegroundColor White
Write-Host "  - Public Prices:  http://localhost:3000/prices" -ForegroundColor White
Write-Host "  - Common Login:   http://localhost:3000/login" -ForegroundColor White
Write-Host "  - Backend API:    http://localhost:4000/api/docs" -ForegroundColor White
Write-Host "=========================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Browser opened to http://localhost:3000"
Write-Host "You can close this window. The servers will continue running."
