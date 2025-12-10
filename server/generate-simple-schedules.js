require('dotenv').config();
const mongoose = require('mongoose');
const Instalment = require('./src/models/Instalment');

async function generateSimpleSchedules() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing instalments
    await Instalment.deleteMany({});
    console.log('🗑️  Cleared existing instalments');

    // Create sample loan data directly
    const sampleLoans = [
      {
        _id: new mongoose.Types.ObjectId(),
        applicationId: 'CBL00000000002',
        principal: 25000,
        interestRate: 24,
        termMonths: 12,
        disbursedAt: new Date('2025-03-20')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        applicationId: 'CBL00000000011',
        principal: 25000,
        interestRate: 24,
        termMonths: 12,
        disbursedAt: new Date('2025-03-20')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        applicationId: 'UBL00001',
        principal: 250000,
        interestRate: 24,
        termMonths: 12,
        disbursedAt: new Date('2025-03-21')
      }
    ];

    let totalSchedules = 0;

    for (const loan of sampleLoans) {
      const principal = loan.principal;
      const rate = loan.interestRate / 100 / 12; // Monthly rate
      const tenure = loan.termMonths;
      
      // Calculate EMI
      const emi = Math.round((principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1));
      
      let balance = principal;
      let currentDate = new Date(loan.disbursedAt);
      const schedule = [];

      for (let i = 1; i <= tenure; i++) {
        const interestAmount = Math.round(balance * rate);
        const principalAmount = emi - interestAmount;
        balance = Math.max(0, balance - principalAmount);
        
        schedule.push({
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

      await Instalment.insertMany(schedule);
      console.log(`💰 Generated ${schedule.length} instalments for ${loan.applicationId} - EMI: ₹${emi}`);
      totalSchedules += schedule.length;
    }

    console.log(`\n📈 Generated ${totalSchedules} total instalments for ${sampleLoans.length} loans`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

generateSimpleSchedules();