const mongoose = require('mongoose');
require('dotenv').config();

// Import the actual Loan model
const Loan = require('./src/models/Loan');
const Borrower = require('./src/models/Borrower');

async function checkDisbursedLoans() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        console.log('Database:', mongoose.connection.db.databaseName);
        
        // Check all loans with disbursement status
        const disbursedLoans = await Loan.find({ status: 'disbursed' }).populate('borrower', 'name');
        
        console.log('\n=== DISBURSED LOANS ===');
        console.log(`Total Disbursed Loans: ${disbursedLoans.length}`);
        
        if (disbursedLoans.length > 0) {
            disbursedLoans.forEach((loan, index) => {
                console.log(`\n${index + 1}. Application ID: ${loan.applicationId || 'Not set'}`);
                console.log(`   Borrower: ${loan.borrower ? loan.borrower.name : 'Not populated'}`);
                console.log(`   Principal: ₹${loan.principal}`);
                console.log(`   Net Disbursed: ₹${loan.netDisbursed}`);
                console.log(`   Status: ${loan.status}`);
                console.log(`   Disbursed At: ${loan.disbursedAt ? new Date(loan.disbursedAt).toLocaleDateString() : 'Not set'}`);
                console.log(`   Created: ${loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : 'Not set'}`);
                console.log(`   Updated: ${loan.updatedAt ? new Date(loan.updatedAt).toLocaleDateString() : 'Not set'}`);
            });
        }
        
        // Check loans by status
        const statusCounts = await Loan.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalPrincipal: { $sum: '$principal' },
                    totalDisbursed: { $sum: '$netDisbursed' }
                }
            }
        ]);
        
        console.log('\n=== LOAN STATUS SUMMARY ===');
        statusCounts.forEach(status => {
            console.log(`${status._id}: ${status.count} loans, ₹${status.totalPrincipal || 0} principal, ₹${status.totalDisbursed || 0} disbursed`);
        });
        
        // Check recent updates
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentUpdates = await Loan.find({
            updatedAt: { $gte: yesterday }
        }).sort({ updatedAt: -1 }).populate('borrower', 'name');
        
        console.log('\n=== RECENT UPDATES (Last 24 hours) ===');
        console.log(`Recently Updated Loans: ${recentUpdates.length}`);
        
        if (recentUpdates.length > 0) {
            recentUpdates.forEach((loan, index) => {
                console.log(`\n${index + 1}. Application ID: ${loan.applicationId || 'Not set'}`);
                console.log(`   Borrower: ${loan.borrower ? loan.borrower.name : 'Not populated'}`);
                console.log(`   Status: ${loan.status}`);
                console.log(`   Updated: ${loan.updatedAt ? new Date(loan.updatedAt).toLocaleString() : 'Not set'}`);
            });
        }
        
        // Check specific loan IDs from payment collection CSV
        const csvLoanIds = ['CBL00000000002', 'CBL00000000011', 'CBL00000000021', 'CBL00000000026', 'CBL00000000006'];
        
        console.log('\n=== LOANS FROM PAYMENT CSV ===');
        for (const loanId of csvLoanIds) {
            const loan = await Loan.findOne({ applicationId: loanId }).populate('borrower', 'name');
            if (loan) {
                console.log(`\n${loanId}:`);
                console.log(`   Status: ${loan.status}`);
                console.log(`   Principal: ₹${loan.principal}`);
                console.log(`   Net Disbursed: ₹${loan.netDisbursed}`);
                console.log(`   Borrower: ${loan.borrower ? loan.borrower.name : 'Not populated'}`);
                console.log(`   Disbursed: ${loan.disbursedAt ? 'Yes (' + new Date(loan.disbursedAt).toLocaleDateString() + ')' : 'No'}`);
            } else {
                console.log(`\n${loanId}: NOT FOUND`);
            }
        }
        
    } catch (error) {
        console.error('Error checking disbursed loans:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nConnection closed');
    }
}

checkDisbursedLoans();