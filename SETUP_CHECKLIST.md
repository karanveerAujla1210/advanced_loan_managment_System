# Setup & Test Checklist

## 1. Initial Setup

```bash
cd advanced_loan_management_system

# Run setup script (installs all dependencies)
setup.bat

# OR manually:
npm install
npm run install:all
```

## 2. Configure Environment

1. Edit `server\.env` (created from `.env.example`)
2. Replace `USERNAME` and `PASSWORD` with your MongoDB Atlas credentials
3. Set a strong `JWT_SECRET` (random 32+ character string)
4. Verify `CORS_ORIGIN=http://localhost:5173`

Example:
```env
PORT=5000
MONGO_URI="mongodb+srv://myuser:mypass@cluster0.1ed6kd1.mongodb.net/loancrm?retryWrites=true&w=majority"
JWT_SECRET="your_super_secret_random_string_here_32chars_min"
CORS_ORIGIN=http://localhost:5173
```

## 3. Start Development Servers

```bash
# Start backend + frontend (recommended)
npm run dev

# OR start all including Electron
npm run dev:all
```

Expected output:
- Server: `🚀 Server listening on port 5000`
- Server: `✅ Connected to MongoDB`
- UI: `VITE ready in XXXms` on `http://localhost:5173`

## 4. Test API Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```
Expected: `{"ok":true,"env":"dev"}`

### Borrowers (placeholder)
```bash
curl http://localhost:5000/api/borrowers
```
Expected: `[]`

### Browser Test
Open: http://localhost:5173

## 5. Troubleshooting

### MongoDB Connection Fails
- ✅ Check `.env` MONGO_URI is correct
- ✅ Verify Atlas IP whitelist (add `0.0.0.0/0` for dev, restrict in prod)
- ✅ Confirm username/password are correct
- ✅ Restart server after editing `.env`

### Port Already in Use
- Backend (5000): Change `PORT` in `.env`
- Frontend (5173): Change in `ui/vite.config.js`

### Dependencies Not Installing
```bash
npm run clean
npm install
npm run install:all
```

## 6. Next Development Steps

### Backend Controllers (generate these next)
- [ ] `server/src/controllers/borrowers.controller.js` - CRUD operations
- [ ] `server/src/routes/borrowers.routes.js` - Route definitions
- [ ] `server/src/services/schedule.service.js` - EMI calculation

### Frontend Components (generate these next)
- [ ] `ui/src/pages/dashboard/AdminDashboard.jsx`
- [ ] `ui/src/pages/borrowers/BorrowerList.jsx`
- [ ] `ui/src/components/ui/KpiCard.jsx`
- [ ] `ui/src/components/ui/Table.jsx`

### Authentication
- [ ] `server/src/controllers/auth.controller.js` - Login/register
- [ ] `server/src/routes/auth.routes.js`
- [ ] `ui/src/pages/auth/Login.jsx`

## 7. Security Reminders

⚠️ **NEVER commit `.env` files**
- Add `server/.env` to `.gitignore`
- Only commit `.env.example`

⚠️ **Production Security**
- Lock Atlas IP whitelist (remove `0.0.0.0/0`)
- Use strong JWT_SECRET (32+ random characters)
- Enable TLS/SSL in MongoDB connection
- Rotate secrets regularly

⚠️ **Environment Variables**
- Development: Use `.env` file
- Production: Use environment variables or secrets manager

## 8. Build for Production

```bash
# Build all packages
npm run build

# Test production build
cd ui
npm run preview
```

## 9. Electron Desktop App

```bash
# Start Electron with backend + frontend
npm run dev:all
```

## 10. Git Setup

```bash
git init
git add .
git commit -m "Initial setup: monorepo with Express + React + Electron"
```

Add to `.gitignore`:
```
node_modules/
server/.env
ui/dist/
*.log
.DS_Store
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend + frontend |
| `npm run dev:all` | Start backend + frontend + electron |
| `npm run dev:server` | Start backend only |
| `npm run dev:ui` | Start frontend only |
| `npm run build` | Build all for production |
| `npm run clean` | Remove all node_modules |

| URL | Service |
|-----|---------|
| http://localhost:5173 | Frontend (Vite) |
| http://localhost:5000 | Backend API |
| http://localhost:5000/api/health | Health check |

---

**Ready to code!** 🚀

Tell me which components/controllers you want generated next:
1. Borrower CRUD (controller + routes + UI)
2. Authentication system (login + JWT)
3. Dashboard components (KPI cards + charts)
4. EMI calculation service
5. Loan application wizard
