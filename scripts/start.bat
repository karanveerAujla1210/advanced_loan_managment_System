@echo off
echo Starting Loan Management System...
echo.

start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Servers starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
