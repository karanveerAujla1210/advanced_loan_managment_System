require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Loan = require('./src/models/Loan');
const Borrower = require('./src/models/Borrower');
const Branch = require('./src/models/Branch');

async function importLoansComplete() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Loan.deleteMany({});
    await Borrower.deleteMany({});
    await Branch.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Read disbursement data
    const dataPath = path.join(__dirname, '..', 'Data', 'Disbursement Data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const fixedData = '[' + rawData.trim() + ']';
    const disbursements = JSON.parse(fixedData);

    console.log(`📊 Found ${disbursements.length} disbursement records`);

    let imported = 0;

    for (const record of disbursements.slice(0, 10)) { // Process first 10 for testing
      try {
        // Create branch
        let branch = await Branch.findOne({ name: record.Branch });
        if (!branch) {
          branch = new Branch({
            name: record.Branch,
            code: record.Branch.substring(0, 3).toUpperCase().replace(/\s+/g, ''),
            address: record.Branch,
            city: record.Branch
          });
          await branch.save();
        }

        // Create borrower
        let borrower = await Borrower.findOne({ phone: record['Mobile Number'].toString() });
        if (!borrower) {
          borrower = new Borrower({
            branch: branch._id,
            firstName: record['Customer Name'].split(' ')[0],
            lastName: record['Customer Name'].split(' ').slice(1).join(' ') || '',
            phone: record['Mobile Number'].toString(),
            email: `${record['Customer Name'].toLowerCase().replace(/\s+/g, '')}@email.com`
          });
          await borrower.save();
        }

        // Create loan
        const disbursementDate = new Date(record['Date of Disbursement']);
        const loan = new Loan({
          applicationId: record['Loan ID'],
          borrower: borrower._id,
          branch: branch._id,
          principal: record['Loan Amount'],
          processingFee: record['Processing Fees'],
          gstOnProcessingFee: record['Gst'],
          netDisbursed: record['Net Disbursement'],
          disbursedAmount: record['Net Disbursement'],
          interestRate: 24, // 24% annual
          interestType: 'reducing',
          termMonths: 12,
          termDays: 365,
          installments: 52, // Weekly
          frequencyDays: 7,
          emi: Math.round(record['Loan Amount'] / 52),
          interestTotal: Math.round(record['Loan Amount'] * 0.24),
          totalPayable: Math.round(record['Loan Amount'] * 1.24),
          status: 'disbursed',
          disbursedAt: disbursementDate,
          startDate: disbursementDate,
          outstandingPrincipal: record['Loan Amount'],
          outstandingInterest: Math.round(record['Loan Amount'] * 0.24)
        });

        await loan.save();
        console.log(`💰 Created loan: ${loan.applicationId} - ₹${loan.principal}`);
        imported++;

      } catch (error) {
        console.error(`❌ Error processing ${record['Unique ID']}:`, error.message);
      }
    }

    console.log(`\n📈 Import Summary: ${imported} loans created`);

  } catch (error) {
    console.error('❌ Import failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

importLoansComplete();