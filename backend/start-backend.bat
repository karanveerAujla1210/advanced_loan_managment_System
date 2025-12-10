@echo off
echo ========================================
echo   Advanced Loan Management System
echo   Backend Server Startup
echo ========================================
echo.

cd /d "%~dp0"

echo Checking .env file...
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please create .env file with MONGODB_URI
    pause
    exit /b 1
)

echo Starting backend server...
echo.
npm run dev
