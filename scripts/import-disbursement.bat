@echo off
echo Importing Disbursement Data...
echo.

cd /d "%~dp0.."
cd server

echo Running disbursement data import...
node src/scripts/import-disbursement-data.js

echo.
echo Import completed!
pause