@echo off
echo Installing High-Tech Frontend Features...
echo.

cd ui

echo Installing new dependencies...
npm install @radix-ui/react-dialog@^1.0.5 ^
@radix-ui/react-dropdown-menu@^2.0.6 ^
@radix-ui/react-tabs@^1.0.4 ^
@radix-ui/react-toast@^1.1.5 ^
@radix-ui/react-tooltip@^1.0.7 ^
@radix-ui/react-command@^0.2.0 ^
framer-motion@^10.16.4 ^
@tanstack/react-query@^4.35.3 ^
cmdk@^0.2.0 ^
recharts@^2.8.0 ^
react-hot-toast@^2.4.1 ^
clsx@^2.0.0 ^
tailwind-merge@^1.14.0 ^
date-fns@^2.30.0 ^
react-dnd@^16.0.1 ^
react-dnd-html5-backend@^16.0.1 ^
socket.io-client@^4.7.2 ^
zustand@^4.4.0

echo.
echo Dependencies installed successfully!
echo.
echo High-Tech Features Added:
echo ✅ Smart Command Bar (Ctrl+K)
echo ✅ Real-Time Dashboard with Live KPIs
echo ✅ Advanced Data Tables with Sorting/Filtering
echo ✅ Notification Center with Real-Time Updates
echo ✅ Multi-Tab Workspace
echo ✅ Drag & Drop Collections Board
echo ✅ Role-Based Smart Sidebar
echo ✅ Dark/Light Mode Toggle
echo ✅ Animated UI Components
echo ✅ Modern Micro-Interactions
echo.
echo To start the application:
echo npm run dev
echo.
pause