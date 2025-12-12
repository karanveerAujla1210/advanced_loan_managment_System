@echo off
title Disbursement Data Import Tool
color 0A

echo.
echo ===============================================
echo    DISBURSEMENT DATA IMPORT TOOL
echo ===============================================
echo.

:MENU
echo Please choose an import method:
echo.
echo [1] MongoDB Import Tool (mongoimport)
echo [2] Node.js Script (Recommended)
echo [3] Exit
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto MONGOIMPORT
if "%choice%"=="2" goto NODEJS
if "%choice%"=="3" goto EXIT
echo Invalid choice. Please try again.
goto MENU

:MONGOIMPORT
echo.
echo ========================================
echo   Using MongoDB Import Tool
echo ========================================
echo.

echo Checking if MongoDB tools are available...
where mongoimport >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: mongoimport not found.
    echo.
    echo Please install MongoDB Database Tools:
    echo https://www.mongodb.com/try/download/database-tools
    echo.
    pause
    goto MENU
)

echo ✅ MongoDB tools found!
echo.

echo Checking if data file exists...
if not exist "Data\Disbursement Data.json" (
    echo ❌ Error: Data file not found!
    echo Expected location: Data\Disbursement Data.json
    echo.
    pause
    goto MENU
)

echo ✅ Data file found!
echo.

echo 🚀 Starting import with mongoimport...
echo Using MongoDB Atlas connection...
echo.

mongoimport --uri="mongodb+srv://singh2212karanveer_db_user:Aujla%%40121021@cluster0.1ed6kd1.mongodb.net/loancrm?retryWrites=true&w=majority&appName=Cluster0" --collection=disbursements --file="Data\Disbursement Data.json" --jsonArray --drop

if %errorlevel% equ 0 (
    echo.
    echo ✅ Import completed successfully!
    echo.
    echo Checking collection count...
    mongosh "mongodb+srv://singh2212karanveer_db_user:Aujla%%40121021@cluster0.1ed6kd1.mongodb.net/loancrm?retryWrites=true&w=majority&appName=Cluster0" --eval "db.disbursements.countDocuments()"
) else (
    echo.
    echo ❌ Import failed! Please check the error messages above.
    echo.
    echo Common issues:
    echo - Network connection: Check internet connectivity
    echo - Authentication: Verify MongoDB credentials
    echo - File format: Ensure JSON is valid
)

echo.
pause
goto MENU

:NODEJS
echo.
echo ========================================
echo   Using Node.js Script (Recommended)
echo ========================================
echo.

echo Checking if Node.js is available...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js not found.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    goto MENU
)

echo ✅ Node.js found!
echo.

echo Checking if data file exists...
if not exist "Data\Disbursement Data.json" (
    echo ❌ Error: Data file not found!
    echo Expected location: Data\Disbursement Data.json
    echo.
    pause
    goto MENU
)

echo ✅ Data file found!
echo.

echo 🚀 Starting import with Node.js script...
cd server
node import-disbursement-data.js
cd ..

echo.
pause
goto MENU

:EXIT
echo.
echo Thank you for using the Disbursement Data Import Tool!
echo.
exit /b 0