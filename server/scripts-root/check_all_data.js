const mongoose = require('mongoose');
require('dotenv').config();

const Loan = require('./src/models/Loan');
const Borrower = require('./src/models/Borrower');

async function checkAllData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        // Check all loans
        const allLoans = await Loan.find({});
        console.log(`\n=== ALL LOANS ===`);
        console.log(`Total Loans: ${allLoans.length}`);
        
        // Check all borrowers
        const allBorrowers = await Borrower.find({});
        console.log(`\n=== ALL BORROWERS ===`);
        console.log(`Total Borrowers: ${allBorrowers.length}`);
        
        if (allBorrowers.length > 0) {
            console.log('\nBorrower Details:');
            allBorrowers.forEach((borrower, index) => {
                console.log(`${index + 1}. ID: ${borrower._id}`);
                console.log(`   Name: ${borrower.name}`);
                console.log(`   Phone: ${borrower.phone}`);
                console.log(`   Status: ${borrower.status}`);
            });
        }
        
        // Check loan details with borrower info
        if (allLoans.length > 0) {
            console.log('\n=== LOAN DETAILS ===');
            for (let i = 0; i < allLoans.length; i++) {
                const loan = allLoans[i];
                const borrower = await Borrower.findById(loan.borrower);
                
                console.log(`\n${i + 1}. Application ID: ${loan.applicationId}`);
                console.log(`   Borrower ID: ${loan.borrower}`);
                console.log(`   Borrower Name: ${borrower ? borrower.name : 'NOT FOUND'}`);
                console.log(`   Principal: ₹${loan.principal}`);
                console.log(`   Status: ${loan.status}`);
                console.log(`   Disbursed At: ${loan.disbursedAt ? new Date(loan.disbursedAt).toLocaleDateString() : 'Not set'}`);
            }
        }
        
        // Check if we need to create more loans for the CSV data
        const csvLoanIds = ['CBL00000000002', 'CBL00000000011', 'CBL00000000021', 'CBL00000000026', 'CBL00000000006'];
        const missingLoans = [];
        
        console.log('\n=== MISSING LOANS FROM CSV ===');
        for (const loanId of csvLoanIds) {
            const exists = await Loan.findOne({ applicationId: loanId });
            if (!exists) {
                missingLoans.push(loanId);
                console.log(`${loanId}: MISSING`);
            } else {
                console.log(`${loanId}: EXISTS`);
            }
        }
        
        console.log(`\nMissing Loans Count: ${missingLoans.length}`);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nConnection closed');
    }
}

checkAllData();