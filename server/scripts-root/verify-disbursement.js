require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const Loan = require('./src/models/Loan');
const Borrower = require('./src/models/Borrower');
const Branch = require('./src/models/Branch');
const Instalment = require('./src/models/Instalment');

async function verifyDisbursement() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check disbursed loans
    const disbursedLoans = await Loan.find({ status: 'disbursed' }).populate('borrower branch');
    console.log(`\n📊 DISBURSED LOANS: ${disbursedLoans.length}`);

    // Check specific loan IDs from payment collection CSV
    const csvLoanIds = ['CBL00000000002', 'CBL00000000011', 'CBL00000000021', 'CBL00000000026', 'CBL00000000006'];
    
    console.log(`\n🔍 CHECKING PAYMENT CSV LOAN IDs:`);
    for (const loanId of csvLoanIds) {
      const loan = await Loan.findOne({ applicationId: loanId }).populate('borrower');
      if (loan) {
        const instalmentCount = await Instalment.countDocuments({ loan: loan._id });
        console.log(`✅ ${loanId}: Status=${loan.status}, EMI=₹${loan.emi}, Instalments=${instalmentCount}, Borrower=${loan.borrower?.firstName} ${loan.borrower?.lastName}`);
      } else {
        console.log(`❌ ${loanId}: NOT FOUND`);
      }
    }

    // Summary statistics
    const totalBranches = await Branch.countDocuments();
    const totalBorrowers = await Borrower.countDocuments();
    const totalLoans = await Loan.countDocuments();
    const totalInstalments = await Instalment.countDocuments();

    console.log(`\n📈 SUMMARY STATISTICS:`);
    console.log(`🏢 Total Branches: ${totalBranches}`);
    console.log(`👤 Total Borrowers: ${totalBorrowers}`);
    console.log(`💰 Total Loans: ${totalLoans}`);
    console.log(`📊 Disbursed Loans: ${disbursedLoans.length}`);
    console.log(`📅 Total Instalments: ${totalInstalments}`);

    // Check loan status distribution
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

    console.log(`\n📊 LOAN STATUS DISTRIBUTION:`);
    statusCounts.forEach(status => {
      console.log(`${status._id}: ${status.count} loans, ₹${status.totalPrincipal || 0} principal, ₹${status.totalDisbursed || 0} disbursed`);
    });

    // Check recent loans (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentLoans = await Loan.find({
      disbursedAt: { $gte: sevenDaysAgo }
    }).populate('borrower');

    console.log(`\n🕐 RECENT DISBURSEMENTS (Last 7 days): ${recentLoans.length}`);
    if (recentLoans.length > 0 && recentLoans.length <= 10) {
      recentLoans.forEach(loan => {
        console.log(`  ${loan.applicationId}: ${loan.borrower?.firstName} ${loan.borrower?.lastName} - ₹${loan.netDisbursed} on ${loan.disbursedAt?.toLocaleDateString()}`);
      });
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

verifyDisbursement();