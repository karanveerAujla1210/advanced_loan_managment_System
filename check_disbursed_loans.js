const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './server/.env' });

async function checkDisbursedLoans() {
    const client = new MongoClient(process.env.MONGO_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db('loancrm');
        const loansCollection = db.collection('loans');
        
        // Check all loans with disbursement status
        const disbursedLoans = await loansCollection.find({
            status: 'DISBURSED'
        }).toArray();
        
        console.log('\n=== DISBURSED LOANS ===');
        console.log(`Total Disbursed Loans: ${disbursedLoans.length}`);
        
        if (disbursedLoans.length > 0) {
            disbursedLoans.forEach((loan, index) => {
                console.log(`\n${index + 1}. Loan ID: ${loan.loanId}`);
                console.log(`   Borrower: ${loan.borrowerId}`);
                console.log(`   Amount: ₹${loan.loanAmount}`);
                console.log(`   Status: ${loan.status}`);
                console.log(`   Disbursed Date: ${loan.disbursedDate ? new Date(loan.disbursedDate).toLocaleDateString() : 'Not set'}`);
                console.log(`   Created: ${new Date(loan.createdAt).toLocaleDateString()}`);
                console.log(`   Updated: ${new Date(loan.updatedAt).toLocaleDateString()}`);
            });
        }
        
        // Check loans by status
        const statusCounts = await loansCollection.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]).toArray();
        
        console.log('\n=== LOAN STATUS SUMMARY ===');
        statusCounts.forEach(status => {
            console.log(`${status._id}: ${status.count}`);
        });
        
        // Check recent updates
        const recentUpdates = await loansCollection.find({
            updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        }).sort({ updatedAt: -1 }).toArray();
        
        console.log('\n=== RECENT UPDATES (Last 24 hours) ===');
        console.log(`Recently Updated Loans: ${recentUpdates.length}`);
        
        if (recentUpdates.length > 0) {
            recentUpdates.forEach((loan, index) => {
                console.log(`\n${index + 1}. Loan ID: ${loan.loanId}`);
                console.log(`   Status: ${loan.status}`);
                console.log(`   Updated: ${new Date(loan.updatedAt).toLocaleString()}`);
            });
        }
        
    } catch (error) {
        console.error('Error checking disbursed loans:', error);
    } finally {
        await client.close();
        console.log('\nConnection closed');
    }
}

checkDisbursedLoans();