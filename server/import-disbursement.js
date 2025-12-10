require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const Loan = require('./src/models/Loan');
const Borrower = require('./src/models/Borrower');
const Branch = require('./src/models/Branch');

const MONGO_URI = process.env.MONGO_URI;

async function importDisbursementData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Read disbursement data
    const dataPath = path.join(__dirname, '..', 'Data', 'Disbursement Data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    // Fix JSON format by wrapping in array brackets
    const fixedData = '[' + rawData.trim() + ']';
    const disbursements = JSON.parse(fixedData);

    console.log(`📊 Found ${disbursements.length} disbursement records`);

    let imported = 0;
    let skipped = 0;

    for (const record of disbursements) {
      try {
        // Check if loan already exists
        const existingLoan = await Loan.findOne({ applicationId: record['Loan ID'] });
        if (existingLoan) {
          console.log(`⏭️  Loan ${record['Loan ID']} already exists, skipping`);
          skipped++;
          continue;
        }

        // Find or create branch
        let branch = await Branch.findOne({ name: record.Branch });
        if (!branch) {
          branch = new Branch({
            name: record.Branch,
            code: record.Branch.substring(0, 3).toUpperCase().replace(/\s+/g, ''),
            address: record.Branch,
            city: record.Branch
          });
          await branch.save();
          console.log(`🏢 Created branch: ${branch.name}`);
        }

        // Find or create borrower
        let borrower = await Borrower.findOne({ phone: record['Mobile Number'].toString() });
        if (!borrower) {
          borrower = new Borrower({
            branch: branch._id,
            firstName: record['Customer Name'].split(' ')[0],
            lastName: record['Customer Name'].split(' ').slice(1).join(' ') || '',
            phone: record['Mobile Number'].toString(),
            email: `${record['Customer Name'].toLowerCase().replace(/\s+/g, '')}@email.com`,
            address: {
              line1: 'Address',
              city: record.Branch,
              state: 'UP',
              pincode: '000000'
            }
          });
          await borrower.save();
          console.log(`👤 Created borrower: ${borrower.firstName} ${borrower.lastName}`);
        }

        // Create loan
        const loan = new Loan({
          applicationId: record['Loan ID'],
          borrower: borrower._id,
          branch: branch._id,
          principal: record['Loan Amount'],
          processingFee: record['Processing Fees'],
          gstOnProcessingFee: record['Gst'],
          netDisbursed: record['Net Disbursement'],
          disbursedAmount: record['Net Disbursement'],
          interestRate: 24, // Default 24% annual
          interestType: 'reducing',
          termMonths: 12, // Default 12 months
          termDays: 365,
          installments: 52, // Weekly installments
          frequencyDays: 7,
          emi: Math.round(record['Loan Amount'] / 52),
          interestTotal: Math.round(record['Loan Amount'] * 0.24),
          totalPayable: Math.round(record['Loan Amount'] * 1.24),
          status: record.Status.toLowerCase(),
          disbursedAt: new Date(record['Date of Disbursement']),
          startDate: new Date(record['Date of Disbursement']),
          outstandingPrincipal: record['Loan Amount'],
          outstandingInterest: Math.round(record['Loan Amount'] * 0.24)
        });

        await loan.save();
        console.log(`💰 Created loan: ${loan.loanId} for ${record['Customer Name']}`);
        imported++;

      } catch (error) {
        console.error(`❌ Error processing record ${record['Unique ID']}:`, error.message);
      }
    }

    console.log(`\n📈 Import Summary:`);
    console.log(`✅ Imported: ${imported} loans`);
    console.log(`⏭️  Skipped: ${skipped} loans`);
    console.log(`📊 Total processed: ${imported + skipped} records`);

  } catch (error) {
    console.error('❌ Import failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

importDisbursementData();