const mongoose = require('mongoose');
const Disbursement = require('./src/models/Disbursement');
require('dotenv').config();

async function verifyDisbursementImport() {
  try {
    console.log('🔍 Verifying disbursement data import...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get basic statistics
    const totalCount = await Disbursement.countDocuments();
    console.log(`\n📊 Total Disbursement Records: ${totalCount}`);

    if (totalCount === 0) {
      console.log('❌ No disbursement records found. Please run the import first.');
      return;
    }

    // Get overall statistics
    const stats = await Disbursement.getStatistics();
    console.log('\n💰 Financial Summary:');
    console.log(`   Total Loan Amount: ₹${stats.totalLoanAmount?.toLocaleString('en-IN') || 0}`);
    console.log(`   Total Net Disbursement: ₹${stats.totalNetDisbursement?.toLocaleString('en-IN') || 0}`);
    console.log(`   Total Processing Fees: ₹${stats.totalProcessingFees?.toLocaleString('en-IN') || 0}`);
    console.log(`   Total GST: ₹${stats.totalGST?.toLocaleString('en-IN') || 0}`);
    console.log(`   Average Loan Amount: ₹${Math.round(stats.avgLoanAmount || 0).toLocaleString('en-IN')}`);

    // Get branch-wise statistics
    const branchStats = await Disbursement.getBranchStatistics();
    console.log('\n🏢 Branch-wise Summary:');
    branchStats.slice(0, 10).forEach((branch, index) => {
      console.log(`   ${index + 1}. ${branch._id}: ${branch.count} loans, ₹${branch.totalLoanAmount.toLocaleString('en-IN')}`);
    });

    // Get recent disbursements
    const recentDisbursements = await Disbursement.find()
      .sort({ dateOfDisbursement: -1 })
      .limit(5)
      .select('uniqueId customerName loanAmount branch dateOfDisbursement');

    console.log('\n📅 Recent Disbursements:');
    recentDisbursements.forEach((disbursement, index) => {
      console.log(`   ${index + 1}. ${disbursement.uniqueId} - ${disbursement.customerName} - ₹${disbursement.loanAmount.toLocaleString('en-IN')} (${disbursement.branch})`);
    });

    // Check for data quality issues
    console.log('\n🔍 Data Quality Check:');
    
    const missingUTR = await Disbursement.countDocuments({ $or: [{ utr: null }, { utr: '' }] });
    console.log(`   Records without UTR: ${missingUTR}`);

    const duplicateUniqueIds = await Disbursement.aggregate([
      { $group: { _id: '$uniqueId', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    console.log(`   Duplicate Unique IDs: ${duplicateUniqueIds.length}`);

    const invalidMobileNumbers = await Disbursement.countDocuments({
      $or: [
        { mobileNumber: { $lt: 1000000000 } },
        { mobileNumber: { $gt: 9999999999 } }
      ]
    });
    console.log(`   Invalid Mobile Numbers: ${invalidMobileNumbers}`);

    // Status distribution
    const statusDistribution = await Disbursement.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('\n📈 Status Distribution:');
    statusDistribution.forEach(status => {
      console.log(`   ${status._id}: ${status.count}`);
    });

    console.log('\n✅ Verification completed successfully!');

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the verification
verifyDisbursementImport();