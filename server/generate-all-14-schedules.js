require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Instalment = require('./src/models/Instalment');

async function generateAll14Schedules() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Instalment.deleteMany({});
    console.log('🗑️  Cleared existing instalments');

    const dataPath = path.join(__dirname, '..', 'Data', 'Disbursement Data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const fixedData = '[' + rawData.trim() + ']';
    const disbursements = JSON.parse(fixedData);

    console.log(`📊 Generating 14-installment schedules for ${disbursements.length} loans`);

    let totalSchedules = 0;
    let processedLoans = 0;
    const batchSize = 100;

    for (let i = 0; i < disbursements.length; i += batchSize) {
      const batch = disbursements.slice(i, i + batchSize);
      const schedulesBatch = [];

      for (const record of batch) {
        try {
          const principal = record['Loan Amount'];
          const monthlyRate = 24 / (12 * 100); // 24% annual to monthly
          const tenure = 14;
          
          const emi = Math.round((principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1));
          
          let balance = principal;
          let currentDate = new Date(record['Date of Disbursement']);
          const loanId = new mongoose.Types.ObjectId();

          for (let j = 1; j <= tenure; j++) {
            const interestAmount = Math.round(balance * monthlyRate);
            const principalAmount = emi - interestAmount;
            balance = Math.max(0, balance - principalAmount);
            
            schedulesBatch.push({
              loan: loanId,
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

          processedLoans++;

        } catch (error) {
          console.error(`❌ Error processing ${record['Unique ID']}:`, error.message);
        }
      }

      if (schedulesBatch.length > 0) {
        await Instalment.insertMany(schedulesBatch);
        totalSchedules += schedulesBatch.length;
        console.log(`📦 Batch ${Math.floor(i/batchSize) + 1}: ${schedulesBatch.length} instalments created`);
      }
    }

    console.log(`\n🎉 REPAYMENT SCHEDULES GENERATED SUCCESSFULLY!`);
    console.log(`✅ Total Loans: ${processedLoans}`);
    console.log(`📊 Total Instalments: ${totalSchedules}`);
    console.log(`💰 Instalments per Loan: 14`);
    console.log(`📅 Tenure: 14 months`);
    console.log(`💸 Interest Rate: 24% annual`);

  } catch (error) {
    console.error('❌ Generation failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

generateAll14Schedules();