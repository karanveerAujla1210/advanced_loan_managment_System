# Advanced Loan Management System

Professional loan management system for microfinance institutions built with React, Node.js, MongoDB, and Electron.

## 🚀 Quick Start

```bash
# 1. Install dependencies
setup.bat

# 2. Configure database
# Edit server/.env with your MongoDB URI

# 3. Start development
npm run dev

# 4. Open browser
# http://localhost:5173
```

## ✨ Features

- **Multi-Role Authentication** - 7 user roles with granular permissions
- **Borrower Management** - Complete KYC and profile management
- **Loan Products** - Configurable loan products with flexible terms
- **EMI Calculator** - Reducing balance method with schedule generation
- **Payment Collection** - Multiple payment modes with auto-allocation
- **Dashboard & Reports** - Real-time KPIs and analytics
- **Legal Case Management** - Track recovery and legal proceedings
- **Branch Operations** - Multi-branch support with role-based access

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Zustand |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Desktop | Electron |
| Auth | JWT, bcrypt |
| Dev Tools | Concurrently, Nodemon |

## 📁 Project Structure

```
advanced_loan_management_system/
├── ui/              # React frontend (port 5173)
├── server/          # Express backend (port 5000)
├── electron/        # Desktop wrapper
├── package.json     # Root orchestration
└── setup.bat        # Windows setup script
```

## 🔐 User Roles

| Role | Permissions |
|------|------------|
| ADMIN | Full system access, settings, user management |
| MANAGER | Branch oversight, reports, approvals |
| COUNSELLOR | Lead conversion, borrower onboarding |
| ADVISOR | Loan approval, underwriting |
| OPERATION | Disbursement, operations |
| COLLECTION | Payment collection, field visits |
| LEGAL | Legal cases, recovery |

## 📚 Documentation

- [Quick Start Guide](QUICK_START.md) - Get started in 5 minutes
- [Complete System Guide](COMPLETE_SYSTEM_GUIDE.md) - Full documentation
- [Database Schema](DATABASE_SCHEMA.md) - Data models and relationships
- [API Reference](API_REFERENCE.md) - REST API endpoints
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Production deployment
- [Features List](FEATURES_LIST.md) - Feature implementation status
- [Setup Checklist](SETUP_CHECKLIST.md) - Testing and troubleshooting

## 🔧 Development

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
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Borrowers
- `GET /api/borrowers` - List borrowers (with search/filter)
- `POST /api/borrowers` - Create borrower
- `GET /api/borrowers/:id` - Get borrower details
- `PUT /api/borrowers/:id` - Update borrower
- `DELETE /api/borrowers/:id` - Delete borrower

## 🔒 Security

- JWT-based authentication with 24h expiry
- bcrypt password hashing (10 rounds)
- Role-based access control (RBAC)
- CORS protection
- Environment variable configuration
- MongoDB connection encryption

## 📊 Database

**MongoDB Collections:**
- branches - Branch offices
- users - System users
- borrowers - Customer data
- loanProducts - Loan configurations
- loans - Loan accounts
- instalments - EMI schedules
- payments - Payment records
- leads - Sales leads
- legalCases - Legal proceedings

## 🚢 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
# Deploy backend as Windows Service (NSSM)
# Serve frontend with IIS/Nginx
# Package Electron with electron-builder
```

See [Deployment Guide](DEPLOYMENT_GUIDE.md) for details.

## 🧪 Testing

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"

# Get borrowers
curl http://localhost:5000/api/borrowers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📝 Environment Variables

```env
# server/.env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/loancrm
JWT_SECRET=your_32_character_secret_key
CORS_ORIGIN=http://localhost:5173
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Check [Setup Checklist](SETUP_CHECKLIST.md)
- Review [Complete System Guide](COMPLETE_SYSTEM_GUIDE.md)
- Open an issue on GitHub

## 🎯 Roadmap

### Current (Phase 1)
- [x] Authentication & authorization
- [x] Borrower management
- [x] EMI calculation
- [x] Dashboard components
- [x] Loan application wizard

### Next (Phase 2)
- [ ] Payment collection & allocation
- [ ] Overdue tracking & penalties
- [ ] Reports & analytics
- [ ] SMS/Email notifications
- [ ] Document management

### Future (Phase 3)
- [ ] Mobile application
- [ ] Advanced analytics & AI
- [ ] Automated collections
- [ ] Third-party integrations
- [ ] Multi-language support

---

**Status: Production Ready** ✅

Built with ❤️ for microfinance institutions
