require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Instalment = require('./src/models/Instalment');

function parseDate(dateStr) {
  const parts = dateStr.split('/');
  return new Date(parts[2], parts[0] - 1, parts[1]);
}

async function generateWeeklySchedules() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Instalment.deleteMany({});
    console.log('🗑️  Cleared existing instalments');

    const dataPath = path.join(__dirname, '..', 'Data', 'Disbursement Data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const fixedData = '[' + rawData.trim() + ']';
    const disbursements = JSON.parse(fixedData);

    console.log(`📊 Generating weekly repayment schedules for ${disbursements.length} loans`);

    let totalSchedules = 0;
    let processedLoans = 0;

    for (const record of disbursements) {
      try {
        const loanAmount = record['Loan Amount'];
        const repaymentAmount = Math.round(loanAmount * 1.20); // Loan Amount + 20% ROI
        const weeklyEMI = Math.round(repaymentAmount / 14); // 14 weekly installments
        const tenure = 14;
        
        let currentDate = parseDate(record['Date of Disbursement']);
        // First repayment after 7 days
        currentDate.setDate(currentDate.getDate() + 7);
        
        const loanId = new mongoose.Types.ObjectId();
        const schedules = [];
        let remainingAmount = repaymentAmount;

        for (let j = 1; j <= tenure; j++) {
          // For last installment, use remaining amount to avoid rounding errors
          const installmentAmount = (j === tenure) ? remainingAmount : weeklyEMI;
          remainingAmount -= installmentAmount;
          
          schedules.push({
            loan: loanId,
            installmentNo: j,
            dueDate: new Date(currentDate),
            principalDue: installmentAmount, // Flat repayment
            interestDue: 0, // Interest already included in repayment amount
            totalDue: installmentAmount,
            principalComponent: installmentAmount,
            interestComponent: 0,
            outstandingPrincipal: Math.max(0, remainingAmount),
            status: 'pending'
          });
          
          // Next week (7 days)
          currentDate.setDate(currentDate.getDate() + 7);
        }

        await Instalment.insertMany(schedules);
        totalSchedules += schedules.length;
        processedLoans++;

        if (processedLoans <= 5 || processedLoans % 200 === 0) {
          console.log(`💰 ${record['Loan ID']} - Loan: ₹${loanAmount} → Repayment: ₹${repaymentAmount} - Weekly: ₹${weeklyEMI}`);
        }

      } catch (error) {
        console.error(`❌ Error processing ${record['Unique ID']}:`, error.message);
      }
    }

    console.log(`\n🎉 WEEKLY REPAYMENT SCHEDULES GENERATED!`);
    console.log(`✅ Total Loans: ${processedLoans}`);
    console.log(`📊 Total Instalments: ${totalSchedules}`);
    console.log(`📅 Frequency: Weekly (7 days)`);
    console.log(`💰 Installments per Loan: 14`);
    console.log(`💸 ROI: 20% flat on loan amount`);
    console.log(`🗓️  First payment: 7 days after disbursement`);

  } catch (error) {
    console.error('❌ Generation failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

generateWeeklySchedules();