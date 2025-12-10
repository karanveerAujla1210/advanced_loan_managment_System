require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Instalment = require('./src/models/Instalment');

function parseDate(dateStr) {
  // Convert "03/20/2025" to proper date
  const parts = dateStr.split('/');
  return new Date(parts[2], parts[0] - 1, parts[1]); // year, month-1, day
}

async function generateFinalSchedules() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Instalment.deleteMany({});
    console.log('🗑️  Cleared existing instalments');

    const dataPath = path.join(__dirname, '..', 'Data', 'Disbursement Data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const fixedData = '[' + rawData.trim() + ']';
    const disbursements = JSON.parse(fixedData);

    console.log(`📊 Generating schedules for ${disbursements.length} loans`);

    let totalSchedules = 0;
    let processedLoans = 0;

    for (const record of disbursements) {
      try {
        const principal = record['Loan Amount'];
        const monthlyRate = 24 / (12 * 100);
        const tenure = 14;
        
        const emi = Math.round((principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1));
        
        let balance = principal;
        let currentDate = parseDate(record['Date of Disbursement']);
        const loanId = new mongoose.Types.ObjectId();
        const schedules = [];

        for (let j = 1; j <= tenure; j++) {
          const interestAmount = Math.round(balance * monthlyRate);
          const principalAmount = emi - interestAmount;
          balance = Math.max(0, balance - principalAmount);
          
          schedules.push({
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

        await Instalment.insertMany(schedules);
        totalSchedules += schedules.length;
        processedLoans++;

        if (processedLoans % 100 === 0) {
          console.log(`📈 Processed ${processedLoans} loans...`);
        }

      } catch (error) {
        console.error(`❌ Error processing ${record['Unique ID']}:`, error.message);
      }
    }

    console.log(`\n🎉 REPAYMENT SCHEDULES GENERATED!`);
    console.log(`✅ Loans Processed: ${processedLoans}`);
    console.log(`📊 Total Instalments: ${totalSchedules}`);
    console.log(`💰 Average per Loan: ${Math.round(totalSchedules/processedLoans)}`);

  } catch (error) {
    console.error('❌ Generation failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

generateFinalSchedules();