# Deployment Guide

## Production Deployment

### 1. Environment Setup

**server/.env (Production)**
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://prod_user:prod_pass@cluster.mongodb.net/loancrm_prod
JWT_SECRET=your_production_secret_32_chars_minimum
CORS_ORIGIN=https://yourdomain.com
```

### 2. MongoDB Atlas Configuration

1. Create production cluster
2. Whitelist application server IP
3. Create database user with read/write access
4. Enable automated backups
5. Set up monitoring alerts

### 3. Build Application

```bash
# Build frontend
cd ui
npm run build
# Output: ui/dist/

# Build backend (if using TypeScript)
cd server
npm run build
# Output: server/dist/

# Build Electron
cd electron
npm run build
# Output: electron/dist/
```

### 4. Windows Server Deployment

**Install Node.js:**
```bash
# Download and install Node.js 16+ LTS
# Verify: node --version
```

**Deploy Backend as Windows Service:**
```bash
# Install NSSM (Non-Sucking Service Manager)
# Download from: https://nssm.cc/download

# Install service
nssm install LoanManagementAPI "C:\Program Files\nodejs\node.exe"
nssm set LoanManagementAPI AppDirectory "C:\app\server"
nssm set LoanManagementAPI AppParameters "src\index.js"
nssm set LoanManagementAPI AppEnvironmentExtra NODE_ENV=production

# Start service
nssm start LoanManagementAPI

# Check status
nssm status LoanManagementAPI
```

**Deploy Frontend:**
```bash
# Option 1: Serve with Node.js
npm install -g serve
serve -s ui/dist -p 3000

# Option 2: Use IIS or Nginx
# Copy ui/dist/ to web server root
```

### 5. Electron Desktop App

**Package for Windows:**
```bash
cd electron
npm install electron-builder --save-dev

# Add to package.json
{
  "build": {
    "appId": "com.loancrm.app",
    "productName": "Loan Management System",
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    }
  }
}

# Build
npm run build
# Output: electron/dist/LoanManagementSystem-Setup.exe
```

### 6. Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (32+ chars)
- [ ] Enable HTTPS/TLS
- [ ] Restrict MongoDB IP whitelist
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Enable audit logging

### 7. Monitoring

**Health Check Endpoint:**
```bash
curl https://yourdomain.com/api/health
```

**MongoDB Monitoring:**
- Enable Atlas monitoring
- Set up alerts for high CPU/memory
- Monitor slow queries

**Application Logs:**
```bash
# View service logs
nssm log LoanManagementAPI
```

### 8. Backup Strategy

**Database:**
- Automated daily backups (Atlas)
- Weekly full exports
- Test restore procedures monthly

**Files:**
- Document storage backup
- Configuration files backup
- Database connection strings (encrypted)

### 9. Rollback Plan

```bash
# Stop service
nssm stop LoanManagementAPI

# Restore previous version
# Copy backup files

# Start service
nssm start LoanManagementAPI
```

### 10. Performance Optimization

- Enable gzip compression
- Use CDN for static assets
- Database indexing
- Connection pooling
- Caching (Redis optional)

---

## Quick Commands

```bash
# Start service
nssm start LoanManagementAPI

# Stop service
nssm stop LoanManagementAPI

# Restart service
nssm restart LoanManagementAPI

# View logs
nssm log LoanManagementAPI

# Remove service
nssm remove LoanManagementAPI confirm
```
