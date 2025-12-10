# Quick Start Guide

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd advanced_loan_management_system
setup.bat
```

### Step 2: Configure Database
Edit `server\.env`:
```env
MONGO_URI="mongodb+srv://YOUR_USER:YOUR_PASS@cluster.mongodb.net/loancrm"
JWT_SECRET="your_random_32_character_secret_key"
```

### Step 3: Start Development
```bash
npm run dev
```

### Step 4: Access Application
- Frontend: http://localhost:5173
- Backend: http://localhost:5000/api/health

### Step 5: Create Admin User
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\",\"name\":\"Admin\",\"role\":\"ADMIN\"}"
```

### Step 6: Login
Open http://localhost:5173/login
- Username: admin
- Password: admin123

---

## Common Commands

```bash
# Start all services
npm run dev

# Start backend only
npm run dev:server

# Start frontend only
npm run dev:ui

# Start with Electron
npm run dev:all

# Build for production
npm run build

# Clean install
npm run clean
npm install
npm run install:all
```

---

## Project Structure

```
advanced_loan_management_system/
├── ui/              # React frontend
├── server/          # Express backend
├── electron/        # Desktop app
├── package.json     # Root scripts
└── setup.bat        # Setup script
```

---

## Next Steps

1. Read COMPLETE_SYSTEM_GUIDE.md for full documentation
2. Check DATABASE_SCHEMA.md for data models
3. Review API_REFERENCE.md for API endpoints
4. See DEPLOYMENT_GUIDE.md for production setup

---

## Troubleshooting

**MongoDB Connection Failed:**
- Check MONGO_URI in server/.env
- Verify Atlas IP whitelist (add 0.0.0.0/0 for dev)
- Test connection in MongoDB Compass

**Port Already in Use:**
- Change PORT in server/.env
- Kill process: `netstat -ano | findstr :5000`

**Dependencies Not Installing:**
```bash
npm run clean
npm cache clean --force
npm install
npm run install:all
```

---

## Support

For detailed help, see:
- SETUP_CHECKLIST.md
- IMPLEMENTATION_COMPLETE.md
- COMPLETE_SYSTEM_GUIDE.md
