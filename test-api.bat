@echo off
echo ========================================
echo   API Testing Script
echo   HighTech Loan Management CRM
echo ========================================
echo.

set BASE_URL=http://localhost:5000/api

echo 🔍 Testing API endpoints...
echo.

echo 1. Health Check:
curl -s %BASE_URL%/health
echo.
echo.

echo 2. Login (admin/admin123):
curl -s -X POST %BASE_URL%/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}" > temp_login.json

echo Login response saved to temp_login.json
echo.

echo 3. Get Borrowers (requires token):
echo Please copy token from temp_login.json and run:
echo curl -s %BASE_URL%/borrowers -H "Authorization: Bearer YOUR_TOKEN"
echo.

echo 4. EMI Calculator Test:
curl -s -X POST %BASE_URL%/emi/calculate ^
  -H "Content-Type: application/json" ^
  -d "{\"principal\":100000,\"interestRate\":24,\"termMonths\":12}"
echo.
echo.

echo 5. Portfolio Analytics Test:
echo curl -s %BASE_URL%/analytics/portfolio -H "Authorization: Bearer YOUR_TOKEN"
echo.

echo ✅ API testing completed!
echo.
echo 📝 Next steps:
echo 1. Copy token from temp_login.json
echo 2. Test authenticated endpoints with the token
echo 3. Use Postman for more detailed testing
echo.
pause