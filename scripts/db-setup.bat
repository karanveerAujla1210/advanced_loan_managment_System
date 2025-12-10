@echo off
echo ========================================
echo   Advanced Loan Management System
echo   Database Setup Script
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version

echo.
echo Checking MongoDB connection...
if not exist "server\.env" (
    echo WARNING: server\.env file not found
    echo Please create server\.env with your MongoDB URI
    echo Example:
    echo MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/loan_management
    echo JWT_SECRET=your_32_character_secret_key
    echo.
    pause
    exit /b 1
)

echo.
echo Setting up database...
echo ========================================

cd /d "%~dp0.."

echo 1. Installing dependencies...
call npm install --silent

echo.
echo 2. Creating indexes...
node database/indexes.js

echo.
echo 3. Seeding sample data...
node database/seed.js

echo.
echo 4. Running migrations...
node -e "require('./database/migrate').runMigrations().then(() => process.exit(0)).catch(err => {console.error(err); process.exit(1);})"

echo.
echo ========================================
echo   Database Setup Complete!
echo ========================================
echo.
echo Login Credentials:
echo   Username: admin      ^| Password: admin123
echo   Username: manager1   ^| Password: admin123
echo   Username: counsellor1^| Password: admin123
echo   Username: collection1^| Password: admin123
echo.
echo You can now start the application:
echo   npm run dev
echo.
pause