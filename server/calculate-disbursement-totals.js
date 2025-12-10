const fs = require('fs');
const path = require('path');

// Read the disbursement data
const disbursementDataPath = path.join(__dirname, '..', 'Data', 'Disbursement Data.json');
const disbursementData = JSON.parse(fs.readFileSync(disbursementDataPath, 'utf8'));

console.log('=== DISBURSEMENT DATA ANALYSIS ===\n');

// Calculate totals
let totalLoans = disbursementData.length;
let totalLoanAmount = 0;
let totalProcessingFees = 0;
let totalGst = 0;
let totalNetDisbursement = 0;

// Count by status
let statusCounts = {};
let branchCounts = {};

disbursementData.forEach(loan => {
    // Convert string numbers to actual numbers
    const loanAmount = parseFloat(loan['Loan Amount']) || 0;
    const processingFees = parseFloat(loan['Processing Fees']) || 0;
    const gst = parseFloat(loan['Gst']) || 0;
    const netDisbursement = parseFloat(loan['Net Disbursement']) || 0;
    
    totalLoanAmount += loanAmount;
    totalProcessingFees += processingFees;
    totalGst += gst;
    totalNetDisbursement += netDisbursement;
    
    // Count by status
    const status = loan.Status || 'Unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    
    // Count by branch
    const branch = loan.Branch || 'Unknown';
    branchCounts[branch] = (branchCounts[branch] || 0) + 1;
});

console.log(`Total Disbursed Loans: ${totalLoans}`);
console.log(`Total Loan Amount: ₹${totalLoanAmount.toLocaleString('en-IN')}`);
console.log(`Total Processing Fees: ₹${totalProcessingFees.toLocaleString('en-IN')}`);
console.log(`Total GST: ₹${totalGst.toLocaleString('en-IN')}`);
console.log(`Total Net Disbursement: ₹${totalNetDisbursement.toLocaleString('en-IN')}`);

console.log('\n=== STATUS BREAKDOWN ===');
Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`${status}: ${count} loans`);
});

console.log('\n=== TOP 10 BRANCHES ===');
const sortedBranches = Object.entries(branchCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

sortedBranches.forEach(([branch, count]) => {
    console.log(`${branch}: ${count} loans`);
});

console.log('\n=== LOAN AMOUNT RANGES ===');
const ranges = {
    '₹15,000 - ₹25,000': 0,
    '₹25,001 - ₹50,000': 0,
    '₹50,001 - ₹100,000': 0,
    '₹100,001+': 0
};

disbursementData.forEach(loan => {
    const amount = parseFloat(loan['Loan Amount']) || 0;
    if (amount >= 15000 && amount <= 25000) {
        ranges['₹15,000 - ₹25,000']++;
    } else if (amount >= 25001 && amount <= 50000) {
        ranges['₹25,001 - ₹50,000']++;
    } else if (amount >= 50001 && amount <= 100000) {
        ranges['₹50,001 - ₹100,000']++;
    } else if (amount > 100000) {
        ranges['₹100,001+']++;
    }
});

Object.entries(ranges).forEach(([range, count]) => {
    console.log(`${range}: ${count} loans`);
});

console.log('\n=== RECENT DISBURSEMENTS (Last 10) ===');
const recentLoans = disbursementData.slice(-10);
recentLoans.forEach(loan => {
    console.log(`${loan['Loan ID']} - ${loan['Customer Name']} - ₹${parseFloat(loan['Loan Amount']).toLocaleString('en-IN')} - ${loan['Date of Disbursement']}`);
});

console.log('\n=====================================');