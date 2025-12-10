# Disbursement Data Import Guide

## Overview
This guide explains how to import disbursement data from JSON format into the MongoDB database for the Advanced Loan Management System.

## Data Structure Analysis

### JSON Data Fields
The disbursement data contains the following fields:
- **Unique ID**: Unique identifier for each disbursement (e.g., TM000001)
- **Loan ID**: Loan reference number (e.g., CBL00000000002)
- **Branch**: Branch name (e.g., UNNAO, LUCKNOW, AGRA)
- **Status**: Loan status (ACTIVE)
- **Type**: Loan type (Fresh)
- **Date of Disbursement**: Disbursement date (MM/DD/YYYY format)
- **Customer Name**: Borrower's full name
- **Mobile Number**: Contact number
- **Loan Amount**: Principal loan amount
- **Processing Fees**: Processing fee charged
- **Gst**: GST on processing fee
- **Net Disbursement**: Actual amount disbursed
- **UTR**: Bank transaction reference

### Database Schema Mapping

#### Branches Collection
```javascript
{
  code: "UNNAO",           // Branch code (uppercase)
  name: "UNNAO",           // Branch name
  city: "UNNAO"            // City name
}
```

#### Borrowers Collection
```javascript
{
  branch: ObjectId,        // Reference to branch
  firstName: "NITIN",      // First name from customer name
  lastName: "CHAURASIA",   // Last name from customer name
  phone: "7408317957",     // Cleaned mobile number
  email: null,             // Not available in source data
  address: {},             // Empty for now
  kyc: {}                  // Empty for now
}
```

#### Loans Collection
```javascript
{
  branch: ObjectId,        // Reference to branch
  borrower: ObjectId,      // Reference to borrower
  principal: 25000,        // Loan Amount
  processingFee: 2500,     // Processing Fees
  gstOnProcessingFee: 450, // Gst
  netDisbursed: 22050,     // Net Disbursement
  interestRate: 24,        // Default 24% annual
  interestType: "reducing",
  termMonths: 12,          // Default 12 months
  installments: 52,        // Weekly installments
  frequencyDays: 7,        // Weekly frequency
  status: "active",        // Based on Status field
  disbursedAt: Date        // Date of Disbursement
}
```

#### Disbursements Collection
```javascript
{
  disbursementId: "TM000001",     // Unique ID
  loanId: ObjectId,               // Reference to loan
  borrowerId: ObjectId,           // Reference to borrower
  branchId: ObjectId,             // Reference to branch
  disbursementAmount: 25000,      // Loan Amount
  disbursementDate: Date,         // Date of Disbursement
  disbursementMethod: "BANK_TRANSFER",
  processingFee: 2500,            // Processing Fees
  netDisbursementAmount: 22050,   // Net Disbursement
  status: "COMPLETED",
  transactionId: "YESBN12025...", // UTR
  referenceNumber: "CBL00000..."  // Loan ID
}
```

## Import Process

### Prerequisites
1. MongoDB connection configured in `.env` file
2. JSON data file located at `Data/Disbursement Data.json`
3. Node.js and required dependencies installed

### Running the Import

#### Method 1: Using Batch File (Recommended)
```bash
# From project root directory
import-disbursement.bat
```

#### Method 2: Manual Execution
```bash
# Navigate to server directory
cd server

# Run the import script
node src/scripts/import-disbursement-data.js
```

### Import Features

#### Data Validation
- ✅ Validates required fields (customer name, phone, branch)
- ✅ Cleans and formats phone numbers
- ✅ Handles date parsing (MM/DD/YYYY format)
- ✅ Converts financial amounts to numbers

#### Duplicate Handling
- ✅ Creates branches if they don't exist
- ✅ Finds existing borrowers by phone number
- ✅ Prevents duplicate borrower creation

#### Error Handling
- ✅ Continues processing if individual records fail
- ✅ Logs detailed error messages
- ✅ Provides summary of success/failure counts

#### Default Values
- Interest Rate: 24% annual (reducing balance)
- Term: 12 months (52 weekly installments)
- Repayment Frequency: Weekly
- EMI: Calculated based on principal and interest

## Expected Output

```
🚀 Starting disbursement data import...
📊 Found 553 records to import

📝 Processing record 1/553: NITIN CHAURASIA
✅ Created branch: UNNAO
✅ Created borrower: NITIN CHAURASIA
✅ Created loan: CBL00000000002
✅ Created disbursement: TM000001

...

🎉 Import completed!
✅ Successfully imported: 550 records
❌ Failed to import: 3 records
```

## Post-Import Verification

### Check Data Counts
```javascript
// In MongoDB shell or Compass
db.branches.countDocuments()     // Should show unique branches
db.borrowers.countDocuments()    // Should show unique borrowers
db.loans.countDocuments()        // Should match successful imports
db.disbursements.countDocuments() // Should match successful imports
```

### Sample Queries
```javascript
// Find all loans for a specific branch
db.loans.find({ branch: ObjectId("...") })

// Find borrower with phone number
db.borrowers.findOne({ phone: "7408317957" })

// Check disbursement status
db.disbursements.find({ status: "COMPLETED" }).count()
```

## Troubleshooting

### Common Issues
1. **MongoDB Connection Failed**
   - Check `.env` file for correct MONGO_URI
   - Ensure MongoDB service is running
   - Verify network connectivity

2. **JSON File Not Found**
   - Ensure file is at `Data/Disbursement Data.json`
   - Check file permissions

3. **Duplicate Key Errors**
   - Phone numbers must be unique for borrowers
   - Branch codes must be unique

### Data Quality Issues
- Invalid phone numbers are skipped
- Missing customer names are skipped
- Invalid dates default to null
- Financial amounts default to 0 if invalid

## Next Steps

After successful import:
1. ✅ Verify data integrity in MongoDB
2. ✅ Test loan management features
3. ✅ Generate EMI schedules for active loans
4. ✅ Set up payment collection workflows
5. ✅ Configure user assignments for loans

## File Locations
- Import Script: `server/src/scripts/import-disbursement-data.js`
- Batch File: `import-disbursement.bat`
- Source Data: `Data/Disbursement Data.json`
- Models: `server/src/models/`