@echo off
echo Installing Report System Dependencies...
echo.

echo Installing Backend Dependencies...
cd server
npm install xlsx pdfkit node-cron nodemailer
echo Backend dependencies installed!
echo.

echo Installing Frontend Dependencies...
cd ..\ui
npm install xlsx file-saver
echo Frontend dependencies installed!
echo.

echo.
echo ✅ Report System Installation Complete!
echo.
echo Backend Features Added:
echo - Excel/CSV/PDF Export
echo - Scheduled Email Reports
echo - Comprehensive Report APIs
echo.
echo Frontend Features Added:
echo - Modern Report Pages
echo - Export Center
echo - Advanced Filtering
echo - Real-time Data Loading
echo.
echo Environment Variables Required in server/.env:
echo SMTP_HOST=smtp.example.com
echo SMTP_PORT=587
echo SMTP_SECURE=false
echo SMTP_USER=your_smtp_user
echo SMTP_PASS=your_smtp_password
echo EMAIL_FROM="Loan CRM <no-reply@yourdomain.com>"
echo REPORT_EMAILS=reports@yourdomain.com,ops@yourdomain.com
echo.
echo To test the system:
echo 1. Update server/.env with SMTP settings
echo 2. Start the server: npm run dev
echo 3. Navigate to /reports in the frontend
echo.
pause