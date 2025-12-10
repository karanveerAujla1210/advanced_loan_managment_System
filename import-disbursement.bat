@echo off
echo ========================================
echo   DISBURSEMENT DATA IMPORT SCRIPT
echo ========================================
echo.

cd /d "%~dp0"

echo Checking if server directory exists...
if not exist "server" (
    echo ERROR: Server directory not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo Navigating to server directory...
cd server

echo.
echo Loading environment variables...
if exist ".env" (
    echo Found .env file
) else (
    echo WARNING: .env file not found, using default MongoDB connection
)

echo.
echo Starting disbursement data import...
echo This may take a few minutes depending on the data size...
echo.

node src/scripts/import-disbursement-data.js

echo.
echo ========================================
echo Import process completed!
echo Check the output above for results.
echo ========================================
echo.
pause