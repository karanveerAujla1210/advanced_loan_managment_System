# System Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ELECTRON DESKTOP APP                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    REACT UI (Port 5173)                │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │   Sidebar   │  │    Pages     │  │  Components │  │  │
│  │  │  (Role-     │  │  Dashboard   │  │   KpiCard   │  │  │
│  │  │   Based)    │  │  Borrowers   │  │   Table     │  │  │
│  │  │             │  │  Loans       │  │   Drawer    │  │  │
│  │  └─────────────┘  │  Collections │  └─────────────┘  │  │
│  │                   │  Legal       │                    │  │
│  │  ┌─────────────┐  │  Reports     │  ┌─────────────┐  │  │
│  │  │   Zustand   │  │  Settings    │  │   Axios     │  │  │
│  │  │   Stores    │  └──────────────┘  │   API       │  │  │
│  │  │  - Auth     │                    │  Client     │  │  │
│  │  │  - UI       │                    └─────────────┘  │  │
│  │  └─────────────┘                                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              │ JWT Auth
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  EXPRESS SERVER (Port 3000)                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                     Middlewares                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │  Helmet  │  │   CORS   │  │  Morgan  │           │  │
│  │  └──────────┘  └──────────┘  └──────────┘           │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │  Auth Middleware (JWT Verification)          │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │  Roles Middleware (Authorization)            │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                       Routes                           │  │
│  │  /api/auth      /api/borrowers    /api/loans         │  │
│  │  /api/payments  /api/products     /api/reports       │  │
│  │  /api/legal     /api/collections  /api/users         │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Controllers                         │  │
│  │  Handle business logic, validation, responses         │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                      Services                          │  │
│  │  - Schedule Service (EMI calculation)                 │  │
│  │  - Notification Service (SMS/Email)                   │  │
│  │  - Report Service (Analytics)                         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Mongoose ODM
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Collections:                                          │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │ branches │  │  users   │  │borrowers │           │  │
│  │  └──────────┘  └──────────┘  └──────────┘           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │  loans   │  │instalments│ │ payments │           │  │
│  │  └──────────┘  └──────────┘  └──────────┘           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │  leads   │  │legalCases│  │auditLogs │           │  │
│  │  └──────────┘  └──────────┘  └──────────┘           │  │
│  │                                                        │  │
│  │  Indexes: Optimized for queries                       │  │
│  │  Relationships: ObjectId references                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Authentication Flow
```
User Login
    ↓
UI: Login Form → POST /api/auth/login
    ↓
Server: Verify credentials → Generate JWT
    ↓
UI: Store token in Zustand → Add to Axios headers
    ↓
Protected Routes: Verify token + role
```

### 2. Loan Application Flow
```
COUNSELLOR creates borrower
    ↓
COUNSELLOR creates loan application
    ↓
ADVISOR reviews and approves
    ↓
OPERATION disburses funds
    ↓
System generates instalment schedule
    ↓
COLLECTION tracks payments
    ↓
LEGAL handles defaults (if needed)
```

### 3. API Request Flow
```
UI Component
    ↓
Axios API Client (with JWT)
    ↓
Express Server
    ↓
Auth Middleware (verify JWT)
    ↓
Roles Middleware (check permissions)
    ↓
Route Handler
    ↓
Controller (business logic)
    ↓
Service (if needed)
    ↓
Mongoose Model
    ↓
MongoDB
    ↓
Response back to UI
```

## Role-Based Access Matrix

```
┌──────────────┬───────┬─────────┬────────────┬─────────┬───────────┬────────────┬───────┐
│   Module     │ ADMIN │ MANAGER │ COUNSELLOR │ ADVISOR │ OPERATION │ COLLECTION │ LEGAL │
├──────────────┼───────┼─────────┼────────────┼─────────┼───────────┼────────────┼───────┤
│ Dashboard    │   ✓   │    ✓    │     ✓      │    ✓    │     ✓     │     ✓      │   ✓   │
│ Borrowers    │   ✓   │    ✓    │     ✓      │    ✓    │     ✓     │     ✓      │   ✗   │
│ Create Loan  │   ✓   │    ✓    │     ✓      │    ✗    │     ✓     │     ✗      │   ✗   │
│ Approve Loan │   ✓   │    ✓    │     ✗      │    ✓    │     ✗     │     ✗      │   ✗   │
│ Disburse     │   ✓   │    ✓    │     ✗      │    ✗    │     ✓     │     ✗      │   ✗   │
│ Collections  │   ✓   │    ✓    │     ✗      │    ✗    │     ✗     │     ✓      │   ✗   │
│ Legal Cases  │   ✓   │    ✓    │     ✗      │    ✗    │     ✗     │     ✗      │   ✓   │
│ Reports      │   ✓   │    ✓    │     ✗      │    ✗    │     ✗     │     ✗      │   ✗   │
│ Settings     │   ✓   │    ✗    │     ✗      │    ✗    │     ✗     │     ✗      │   ✗   │
└──────────────┴───────┴─────────┴────────────┴─────────┴───────────┴────────────┴───────┘
```

## Technology Stack Layers

```
┌─────────────────────────────────────────┐
│         PRESENTATION LAYER              │
│  React 18 + Tailwind CSS + Zustand      │
│  React Router + Axios                   │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│         APPLICATION LAYER               │
│  Express.js + Middleware                │
│  JWT Auth + Role Authorization          │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│         BUSINESS LOGIC LAYER            │
│  Controllers + Services                 │
│  EMI Calculation + Notifications        │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│         DATA ACCESS LAYER               │
│  Mongoose ODM + Models                  │
│  Validation + Relationships             │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│         DATABASE LAYER                  │
│  MongoDB + Indexes                      │
│  Collections + Documents                │
└─────────────────────────────────────────┘
```

## Deployment Architecture (LAN)

```
┌─────────────────────────────────────────────────────────┐
│                    CENTRAL SERVER                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │  MongoDB (Port 27017)                             │  │
│  │  - All collections                                │  │
│  │  - Indexes                                        │  │
│  │  - Backup & replication                          │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Express Server (Port 3000)                       │  │
│  │  - REST API                                       │  │
│  │  - Authentication                                 │  │
│  │  - Business logic                                │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ LAN Network
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  Client PC 1  │  │  Client PC 2  │  │  Client PC 3  │
│  ┌─────────┐  │  │  ┌─────────┐  │  │  ┌─────────┐  │
│  │Electron │  │  │  │Electron │  │  │  │Electron │  │
│  │   App   │  │  │  │   App   │  │  │  │   App   │  │
│  └─────────┘  │  │  └─────────┘  │  │  └─────────┘  │
│  Branch 1     │  │  Branch 2     │  │  Head Office  │
└───────────────┘  └───────────────┘  └───────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────┐
│  1. HTTPS/TLS (Production)              │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│  2. JWT Token Authentication            │
│     - Token expiry                      │
│     - Refresh tokens                    │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│  3. Role-Based Authorization            │
│     - Middleware checks                 │
│     - Route protection                  │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│  4. Input Validation                    │
│     - Express validator                 │
│     - Mongoose schemas                  │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│  5. Security Headers (Helmet)           │
│     - XSS protection                    │
│     - CORS policy                       │
└─────────────────────────────────────────┘
```

## File Storage Architecture

```
┌─────────────────────────────────────────┐
│         File Upload Flow                │
└─────────────────────────────────────────┘
                  │
    User uploads KYC document
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Server receives file                   │
│  - Validate file type                   │
│  - Check file size                      │
│  - Generate unique filename             │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Store in filesystem                    │
│  /storage/attachments/                  │
│  - Organized by type                    │
│  - Secure permissions                   │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Save metadata in MongoDB               │
│  - File reference                       │
│  - Upload date                          │
│  - Uploaded by                          │
└─────────────────────────────────────────┘
```

## Monitoring & Logging

```
┌─────────────────────────────────────────┐
│  Application Logs (Morgan)              │
│  - HTTP requests                        │
│  - Response times                       │
│  - Error logs                           │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│  Audit Logs (MongoDB)                   │
│  - User actions                         │
│  - Data changes                         │
│  - Timestamps                           │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│  Error Tracking                         │
│  - Stack traces                         │
│  - User context                         │
│  - Environment info                     │
└─────────────────────────────────────────┘
```
