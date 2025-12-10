require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Instalment = require('./src/models/Instalment');

async function generateAllSchedules() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing instalments
    await Instalment.deleteMany({});
    console.log('🗑️  Cleared existing instalments');

    // Read disbursement data
    const dataPath = path.join(__dirname, '..', 'Data', 'Disbursement Data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const fixedData = '[' + rawData.trim() + ']';
    const disbursements = JSON.parse(fixedData);

    console.log(`📊 Processing ${disbursements.length} loans for schedule generation`);

    let totalSchedules = 0;
    let processedLoans = 0;

    for (const record of disbursements) {
      try {
        const principal = record['Loan Amount'];
        const rate = 24 / 100 / 12; // 24% annual, monthly rate
        const tenure = 12; // 12 months
        
        // Calculate EMI using reducing balance method
        const emi = Math.round((principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1));
        
        let balance = principal;
        let currentDate = new Date(record['Date of Disbursement']);
        const schedule = [];
        const loanId = new mongoose.Types.ObjectId();

        for (let i = 1; i <= tenure; i++) {
          const interestAmount = Math.round(balance * rate);
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
          
          currentDate.setMonth(currentDate.getMonth() + 1);
        }

        await Instalment.insertMany(schedule);
        console.log(`💰 ${record['Loan ID']} - ${record['Customer Name']} - ₹${principal} - EMI: ₹${emi}`);
        
        totalSchedules += schedule.length;
        processedLoans++;

      } catch (error) {
        console.error(`❌ Error processing ${record['Unique ID']}:`, error.message);
      }
    }

    console.log(`\n📈 Schedule Generation Complete:`);
    console.log(`✅ Processed: ${processedLoans} loans`);
    console.log(`📊 Generated: ${totalSchedules} instalments`);
    console.log(`💰 Average: ${Math.round(totalSchedules / processedLoans)} instalments per loan`);

  } catch (error) {
    console.error('❌ Generation failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

generateAllSchedules();