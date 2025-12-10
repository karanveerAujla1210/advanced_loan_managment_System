@echo off
echo === Business Loan - Windows Quick Setup ===

REM 1) Install root deps
npm install

REM 2) Install workspaces
npm run install:all

REM 3) Copy .env example to server/.env if not exists
if not exist "server\.env" (
  copy ".env.example" "server\.env"
  echo Created server\.env from .env.example. Edit server\.env and add your MONGO_URI and JWT_SECRET.
) else (
  echo server\.env already exists - skip
)

echo.
echo Setup complete. To start dev servers:
echo   npm run dev
echo or
echo   npm run dev:all
pause
