require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Instalment = require('./src/models/Instalment');

async function generateCorrectSchedules() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Instalment.deleteMany({});
    console.log('🗑️  Cleared existing instalments');

    const dataPath = path.join(__dirname, '..', 'Data', 'Disbursement Data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const fixedData = '[' + rawData.trim() + ']';
    const disbursements = JSON.parse(fixedData);

    console.log(`📊 Processing ${disbursements.length} loans with 14 installments each`);

    let totalSchedules = 0;
    let processedLoans = 0;

    for (const record of disbursements.slice(0, 5)) { // Process first 5 for testing
      try {
        const principal = record['Loan Amount'];
        const annualRate = 24; // 24% annual
        const tenure = 14; // 14 installments
        
        // Calculate monthly rate
        const monthlyRate = annualRate / (12 * 100);
        
        // Calculate EMI using reducing balance formula
        const emi = Math.round((principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1));
        
        let balance = principal;
        let currentDate = new Date(record['Date of Disbursement']);
        const schedule = [];
        const loanId = new mongoose.Types.ObjectId();

        for (let i = 1; i <= tenure; i++) {
          const interestAmount = Math.round(balance * monthlyRate);
          const principalAmount = emi - interestAmount;
          balance = Math.max(0, balance - principalAmount);
          
          schedule.push({
            loan: loanId,
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
          
          // Move to next month
          currentDate.setMonth(currentDate.getMonth() + 1);
        }

        await Instalment.insertMany(schedule);
        console.log(`💰 ${record['Loan ID']} - ₹${principal} - EMI: ₹${emi} - 14 installments`);
        
        totalSchedules += schedule.length;
        processedLoans++;

      } catch (error) {
        console.error(`❌ Error processing ${record['Unique ID']}:`, error.message);
      }
    }

    console.log(`\n📈 Schedule Generation Complete:`);
    console.log(`✅ Processed: ${processedLoans} loans`);
    console.log(`📊 Generated: ${totalSchedules} instalments (${totalSchedules/processedLoans} per loan)`);

  } catch (error) {
    console.error('❌ Generation failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

generateCorrectSchedules();