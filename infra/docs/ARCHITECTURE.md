# Architecture Documentation

## Monorepo Structure

```
business-loan/
├─ electron/          # Electron desktop wrapper
├─ ui/                # React + Tailwind frontend
├─ server/            # Express + MongoDB backend
└─ infra/             # Infrastructure & docs
```

## Role-Based Access Control

### Roles
- **ADMIN**: Full system access
- **MANAGER**: Branch-level management
- **COUNSELLOR**: Lead & borrower management
- **ADVISOR**: Loan approval & review
- **OPERATION**: Disbursement & operations
- **COLLECTION**: Payment collection & field visits
- **LEGAL**: Legal cases & notices

### Access Matrix

See main documentation for complete role-permission mapping.

## MongoDB Collections

- branches
- users
- borrowers
- loanProducts
- loans
- instalments
- payments
- leads
- fieldVisits
- legalCases
- auditLogs
- notifications

## Technology Stack

- **Frontend**: React 18, Tailwind CSS, Zustand, React Router
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB
- **Desktop**: Electron
- **Auth**: JWT

## Deployment

For LAN deployment:
1. Run MongoDB on central server
2. Configure MONGO_URI in .env
3. Deploy server on network-accessible machine
4. Distribute Electron app to client machines
