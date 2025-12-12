@echo off
echo 🚀 Starting Enhanced Disbursement Data Import...
echo.
cd server
node src/scripts/enhanced-import.js
cd ..
echo.
echo ✅ Import completed! Check server/import-errors.json for any errors.
echo.
pause