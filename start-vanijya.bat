@echo off
setlocal

cd /d "%~dp0"

echo =========================================================
echo   Vanijya - National Agricultural Portal (Docker Mode)
echo =========================================================
echo.

REM 1. Check if Docker CLI is installed
where docker >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not found in system PATH.
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

REM 2. Check if Docker daemon is running
echo [1/3] Checking Docker Engine status...
docker info >nul 2>&1
if errorlevel 1 (
    echo Docker Engine is not running. Starting Docker Desktop automatically...

    if exist "%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe" (
        start "" "%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe"
    ) else if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
        start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    ) else (
        echo Could not locate Docker Desktop executable automatically.
        echo Please launch Docker Desktop manually and run this script again.
        pause
        exit /b 1
    )

    echo Waiting for Docker daemon to initialize...
    :WAIT_DOCKER
    ping 127.0.0.1 -n 4 > nul
    docker info >nul 2>&1
    if errorlevel 1 (
        echo Still waiting for Docker Engine...
        goto WAIT_DOCKER
    )
    echo Docker Engine is ready!
) else (
    echo [1/3] Docker Engine is active and ready.
)

REM 3. Build and launch Docker containers
echo.
echo [2/3] Building and starting Vanijya Docker Containers...
echo.
docker compose up -d --build
if errorlevel 1 (
    echo.
    echo [ERROR] Docker Compose build/startup failed.
    echo Please check Docker logs above.
    pause
    exit /b 1
)

REM 4. Status and URLs
echo.
echo [3/3] Vanijya Stack is Running inside Docker!
echo =========================================================
echo   Vanijya Containers are Live!
echo   - Unified Portal: http://localhost:3000
echo   - Public Prices:  http://localhost:3000/prices
echo   - Common Login:   http://localhost:3000/login
echo   - Backend API:    http://localhost:4000/api/docs
echo   - PostgreSQL:     localhost:5432 (vanijya_db)
echo =========================================================
echo.
echo To view container logs:   docker compose logs -f
echo To stop containers:       docker compose down
echo.
pause
