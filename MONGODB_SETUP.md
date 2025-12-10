# MongoDB Setup Guide

## Issue: IP Whitelist Error

Your MongoDB Atlas connection is failing because your current IP address is not whitelisted.

## Solution Options:

### Option 1: Fix MongoDB Atlas IP Whitelist (Recommended)

1. **Go to MongoDB Atlas Dashboard**
   - Visit: https://cloud.mongodb.com/
   - Login to your account

2. **Navigate to Network Access**
   - Click on "Network Access" in the left sidebar
   - Click "Add IP Address"

3. **Add Your Current IP**
   - Click "Add Current IP Address" 
   - Or manually add: `0.0.0.0/0` (allows all IPs - less secure but works for development)
   - Click "Confirm"

4. **Wait for Changes to Apply**
   - It may take 1-2 minutes for the changes to take effect

### Option 2: Use Local MongoDB (Alternative)

If you prefer to use local MongoDB:

1. **Install MongoDB Community Server**
   - Download from: https://www.mongodb.com/try/download/community
   - Install with default settings

2. **Update Environment Variables**
   ```env
   MONGO_URI=mongodb://localhost:27017/loancrm
   ```

3. **Start MongoDB Service**
   ```bash
   net start MongoDB
   ```

## After Fixing Connection:

Run the import script:
```bash
cd server
node src/scripts/direct-import.js
```

## Expected Output:
```
🚀 Starting direct MongoDB import...
✅ Connected to MongoDB
📊 Database: loancrm
✅ Created admin user
✅ Created borrower: Rajesh Kumar
✅ Created borrower: Priya Sharma
✅ Created borrower: Amit Singh
✅ Created loan: LN001
✅ Created loan: LN002
✅ Created loan: LN003

🎉 Import completed!
📊 Statistics:
   New borrowers created: 3
   New loans created: 3
   Total borrowers: 3
   Total loans: 3
   Total users: 1
👋 Disconnected from MongoDB
```

## Test the Import:

After successful import, you can start the server:
```bash
cd server
npm start
```

Then test the API:
```bash
curl http://localhost:5000/api/health
```

## Login Credentials:
- Username: `admin`
- Password: `admin123`