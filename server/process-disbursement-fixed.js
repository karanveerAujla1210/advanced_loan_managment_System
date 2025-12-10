require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const Loan = require('./src/models/Loan');
const Borrower = require('./src/models/Borrower');
const Branch = require('./src/models/Branch');
const Instalment = require('./src/models/Instalment');

const MONGO_URI = process.env.MONGO_URI;

function parseDate(dateStr) {
  const parts = dateStr.split('/');
  return new Date(parts[2], parts[0] - 1, parts[1]);
}

async function processDisbursementFixed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // First, let's drop the problematic borrowerId index if it exists
    try {
      await mongoose.connection.db.collection('borrowers').dropIndex('borrowerId_1');
      console.log('🗑️  Dropped problematic borrowerId index');
    } catch (error) {
      console.log('ℹ️  borrowerId index not found or already dropped');
    }

    // Read disbursement data
    const dataPath = path.join(__dirname, '..', 'Data', 'Disbursement Data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const fixedData = '[' + rawData.trim() + ']';
    const disbursements = JSON.parse(fixedData);

    console.log(`📊 Found ${disbursements.length} disbursement records`);

    let loansCreated = 0;
    let loansUpdated = 0;
    let schedulesCreated = 0;
    let borrowersCreated = 0;
    let branchesCreated = 0;
    let errors = 0;

    // Process in smaller batches to avoid overwhelming the database
    const batchSize = 50;
    for (let i = 0; i < disbursements.length; i += batchSize) {
      const batch = disbursements.slice(i, i + batchSize);
      console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(disbursements.length/batchSize)} (${batch.length} records)`);

      for (const record of batch) {
        try {
          // Skip records with missing mobile numbers
          if (!record['Mobile Number'] || record['Mobile Number'] === null || record['Mobile Number'] === undefined) {
            console.log(`⚠️  Skipping ${record['Unique ID']} - Missing mobile number`);
            errors++;
            continue;
          }

          console.log(`🔄 Processing ${record['Loan ID']} - ${record['Customer Name']}`);

          // Find or create branch
          let branch = await Branch.findOne({ name: record.Branch });
          if (!branch) {
            branch = new Branch({
              name: record.Branch,
              code: record.Branch.substring(0, 3).toUpperCase().replace(/\s+/g, ''),
              address: record.Branch,
              city: record.Branch,
              state: 'UP',
              pincode: '000000'
            });
            await branch.save();
            branchesCreated++;
            console.log(`🏢 Created branch: ${branch.name}`);
          }

          // Find or create borrower using phone number
          const phoneStr = record['Mobile Number'].toString();
          let borrower = await Borrower.findOne({ phone: phoneStr });
          
          if (!borrower) {
            const nameParts = record['Customer Name'].trim().split(' ');
            borrower = new Borrower({
              branch: branch._id,
              firstName: nameParts[0] || 'Unknown',
              lastName: nameParts.slice(1).join(' ') || '',
              phone: phoneStr,
              email: `${record['Customer Name'].toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}@email.com`,
              address: {
                line1: 'Address',
                city: record.Branch,
                state: 'UP',
                pincode: '000000'
              }
            });
            await borrower.save();
            borrowersCreated++;
            console.log(`👤 Created borrower: ${borrower.firstName} ${borrower.lastName}`);
          }

          // Check if loan already exists
          let loan = await Loan.findOne({ applicationId: record['Loan ID'] });
          
          if (!loan) {
            // Calculate EMI using reducing balance method
            const monthlyRate = 24 / (12 * 100); // 24% annual to monthly
            const tenure = 14;
            const principal = record['Net Disbursement'];
            
            const emi = Math.round((principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1));
            const totalPayable = emi * tenure;
            const interestTotal = totalPayable - principal;

            // Create new loan
            loan = new Loan({
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
              termMonths: 14,
              termDays: 420, // 14 months * 30 days
              installments: 14,
              frequencyDays: 30, // Monthly
              emi: emi,
              interestTotal: interestTotal,
              totalPayable: totalPayable,
              status: 'disbursed',
              disbursedAt: parseDate(record['Date of Disbursement']),
              startDate: parseDate(record['Date of Disbursement']),
              outstandingPrincipal: record['Net Disbursement'],
              outstandingInterest: interestTotal
            });

            await loan.save();
            loansCreated++;
            console.log(`💰 Created loan: ${loan.applicationId} - EMI: ₹${emi}`);
          } else {
            // Update existing loan to disbursed status
            loan.status = 'disbursed';
            loan.disbursedAt = parseDate(record['Date of Disbursement']);
            loan.disbursedAmount = record['Net Disbursement'];
            loan.netDisbursed = record['Net Disbursement'];
            await loan.save();
            loansUpdated++;
            console.log(`🔄 Updated loan to disbursed: ${loan.applicationId}`);
          }

          // Create repayment schedule (delete existing first)
          await Instalment.deleteMany({ loan: loan._id });
          
          const monthlyRate = 24 / (12 * 100);
          const tenure = 14;
          const principal = record['Net Disbursement'];
          const emi = loan.emi;
          
          let balance = principal;
          let currentDate = new Date(parseDate(record['Date of Disbursement']));
          currentDate.setMonth(currentDate.getMonth() + 1); // First EMI after 1 month

          const schedules = [];
          for (let j = 1; j <= tenure; j++) {
            const interestAmount = Math.round(balance * monthlyRate);
            const principalAmount = emi - interestAmount;
            balance = Math.max(0, balance - principalAmount);
            
            schedules.push({
              loan: loan._id,
              installmentNo: j,
              dueDate: new Date(currentDate),
              principalDue: principalAmount,
              interestDue: interestAmount,
              totalDue: emi,
              principalComponent: principalAmount,
              interestComponent: interestAmount,
              outstandingPrincipal: balance,
              status: 'pending'
            });
            
            currentDate.setMonth(currentDate.getMonth() + 1);
          }

          await Instalment.insertMany(schedules);
          schedulesCreated += schedules.length;
          console.log(`📅 Created ${schedules.length} instalments`);

        } catch (error) {
          console.error(`❌ Error processing ${record['Unique ID']}:`, error.message);
          errors++;
        }
      }

      // Small delay between batches to avoid overwhelming the database
      if (i + batchSize < disbursements.length) {
        console.log('⏳ Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`\n🎉 DISBURSEMENT PROCESSING COMPLETE!`);
    console.log(`🏢 Branches Created: ${branchesCreated}`);
    console.log(`👤 Borrowers Created: ${borrowersCreated}`);
    console.log(`💰 Loans Created: ${loansCreated}`);
    console.log(`🔄 Loans Updated: ${loansUpdated}`);
    console.log(`📅 Instalments Created: ${schedulesCreated}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total Records Processed: ${disbursements.length}`);

    // Verification
    const disbursedCount = await Loan.countDocuments({ status: 'disbursed' });
    const totalInstalments = await Instalment.countDocuments();
    const totalBorrowers = await Borrower.countDocuments();
    const totalBranches = await Branch.countDocuments();
    
    console.log(`\n✅ VERIFICATION:`);
    console.log(`🏢 Total Branches in DB: ${totalBranches}`);
    console.log(`👤 Total Borrowers in DB: ${totalBorrowers}`);
    console.log(`📊 Total Disbursed Loans in DB: ${disbursedCount}`);
    console.log(`📅 Total Instalments in DB: ${totalInstalments}`);

  } catch (error) {
    console.error('❌ Processing failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

processDisbursementFixed();