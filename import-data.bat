@echo off
echo ========================================
echo   Advanced Loan Management System
echo   Database Import Utility
echo ========================================
echo.

echo Checking MongoDB connection...
cd server

echo.
echo Running data import...
node src/scripts/direct-import.js

echo.
echo Import process completed!
echo.
echo Next steps:
echo 1. Start the server: npm start
echo 2. Open browser: http://localhost:5173
echo 3. Login with: admin / admin123
echo.
pause