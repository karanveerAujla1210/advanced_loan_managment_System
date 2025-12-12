@echo off
echo ========================================
echo   HighTech Loan Management CRM
echo   Quick Start Commands
echo ========================================
echo.

:menu
echo Choose an option:
echo.
echo 1. Start Development Servers (Backend + Frontend)
echo 2. Start Backend Only
echo 3. Start Frontend Only
echo 4. Import Disbursement Data
echo 5. Run Enhanced Import
echo 6. Install Dependencies
echo 7. Build for Production
echo 8. Exit
echo.
set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" goto start_all
if "%choice%"=="2" goto start_backend
if "%choice%"=="3" goto start_frontend
if "%choice%"=="4" goto import_data
if "%choice%"=="5" goto enhanced_import
if "%choice%"=="6" goto install_deps
if "%choice%"=="7" goto build_prod
if "%choice%"=="8" goto exit
goto menu

:start_all
echo 🚀 Starting all development servers...
start "Backend Server" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak >nul
start "Frontend Server" cmd /k "cd ui && npm run dev"
echo ✅ Servers started!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
goto menu

:start_backend
echo 🚀 Starting backend server...
cd server
npm run dev
cd ..
goto menu

:start_frontend
echo 🚀 Starting frontend server...
cd ui
npm run dev
cd ..
goto menu

:import_data
echo 📊 Importing disbursement data...
cd server
node clean-and-import.js
cd ..
echo ✅ Import completed!
pause
goto menu

:enhanced_import
echo 📊 Running enhanced import with loan schedules...
cd server
node src/scripts/enhanced-import.js
cd ..
echo ✅ Enhanced import completed!
pause
goto menu

:install_deps
echo 📦 Installing dependencies...
echo Installing server dependencies...
cd server
npm install
cd ..
echo Installing UI dependencies...
cd ui
npm install
cd ..
echo ✅ All dependencies installed!
pause
goto menu

:build_prod
echo 🏗️ Building for production...
cd ui
npm run build
cd ..
echo ✅ Production build completed!
pause
goto menu

:exit
echo 👋 Goodbye!
exit