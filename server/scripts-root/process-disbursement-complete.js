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

async function processDisbursementComplete() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

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

    for (const record of disbursements) {
      try {
        console.log(`\n🔄 Processing ${record['Loan ID']} - ${record['Customer Name']}`);

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

        // Find or create borrower
        let borrower = await Borrower.findOne({ phone: record['Mobile Number'].toString() });
        if (!borrower) {
          const nameParts = record['Customer Name'].trim().split(' ');
          borrower = new Borrower({
            branch: branch._id,
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' ') || '',
            phone: record['Mobile Number'].toString(),
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
            emi: 0, // Will calculate below
            interestTotal: 0, // Will calculate below
            totalPayable: 0, // Will calculate below
            status: 'disbursed',
            disbursedAt: parseDate(record['Date of Disbursement']),
            startDate: parseDate(record['Date of Disbursement']),
            outstandingPrincipal: record['Net Disbursement'],
            outstandingInterest: 0,
            // utrNumber: record['UTR'] // Field doesn't exist in schema
          });

          // Calculate EMI using reducing balance method
          const monthlyRate = 24 / (12 * 100); // 24% annual to monthly
          const tenure = 14;
          const principal = record['Net Disbursement'];
          
          const emi = Math.round((principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1));
          const totalPayable = emi * tenure;
          const interestTotal = totalPayable - principal;

          loan.emi = emi;
          loan.totalPayable = totalPayable;
          loan.interestTotal = interestTotal;
          loan.outstandingInterest = interestTotal;

          await loan.save();
          loansCreated++;
          console.log(`💰 Created loan: ${loan.applicationId} - EMI: ₹${emi}`);
        } else {
          // Update existing loan to disbursed status
          loan.status = 'disbursed';
          loan.disbursedAt = parseDate(record['Date of Disbursement']);
          loan.disbursedAmount = record['Net Disbursement'];
          loan.netDisbursed = record['Net Disbursement'];
          // loan.utrNumber = record['UTR']; // Field doesn't exist in schema
          await loan.save();
          loansUpdated++;
          console.log(`🔄 Updated loan to disbursed: ${loan.applicationId}`);
        }

        // Create repayment schedule
        await Instalment.deleteMany({ loan: loan._id });
        
        const monthlyRate = 24 / (12 * 100);
        const tenure = 14;
        const principal = record['Net Disbursement'];
        const emi = loan.emi;
        
        let balance = principal;
        let currentDate = new Date(parseDate(record['Date of Disbursement']));
        currentDate.setMonth(currentDate.getMonth() + 1); // First EMI after 1 month

        const schedules = [];
        for (let i = 1; i <= tenure; i++) {
          const interestAmount = Math.round(balance * monthlyRate);
          const principalAmount = emi - interestAmount;
          balance = Math.max(0, balance - principalAmount);
          
          schedules.push({
            loan: loan._id,
            installmentNo: i,
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
      }
    }

    console.log(`\n🎉 DISBURSEMENT PROCESSING COMPLETE!`);
    console.log(`🏢 Branches Created: ${branchesCreated}`);
    console.log(`👤 Borrowers Created: ${borrowersCreated}`);
    console.log(`💰 Loans Created: ${loansCreated}`);
    console.log(`🔄 Loans Updated: ${loansUpdated}`);
    console.log(`📅 Instalments Created: ${schedulesCreated}`);
    console.log(`📊 Total Records Processed: ${disbursements.length}`);

    // Verification
    const disbursedCount = await Loan.countDocuments({ status: 'disbursed' });
    const totalInstalments = await Instalment.countDocuments();
    
    console.log(`\n✅ VERIFICATION:`);
    console.log(`📊 Total Disbursed Loans in DB: ${disbursedCount}`);
    console.log(`📅 Total Instalments in DB: ${totalInstalments}`);

  } catch (error) {
    console.error('❌ Processing failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

processDisbursementComplete();