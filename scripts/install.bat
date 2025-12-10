@echo off
echo Installing Advanced Loan Management System...
echo.

echo [1/4] Installing root dependencies...
call npm install

echo.
echo [2/4] Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo [3/4] Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo [4/4] Initializing database...
cd backend
node -e "const fs = require('fs'); const path = require('path'); const dbDir = path.join(__dirname, '..', 'database'); if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });"
cd ..

echo.
echo Installation complete!
echo.
echo To start the application:
echo 1. cd backend ^&^& npm run dev (in one terminal)
echo 2. cd frontend ^&^& npm run dev (in another terminal)
echo.
echo Default login: admin / admin123
pause
