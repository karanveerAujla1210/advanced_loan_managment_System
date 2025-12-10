require('dotenv').config();
const mongoose = require('mongoose');
const Loan = require('./src/models/Loan');
const Instalment = require('./src/models/Instalment');

const MONGO_URI = process.env.MONGO_URI;

// EMI calculation using reducing balance method
function calculateEMI(principal, rate, tenure) {
  const monthlyRate = rate / (12 * 100);
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
              (Math.pow(1 + monthlyRate, tenure) - 1);
  return Math.round(emi);
}

// Generate instalment schedule
function generateSchedule(loan, startDate) {
  const schedule = [];
  const principal = loan.principal;
  const rate = loan.interestRate || 24; // Default 24% annual
  const tenure = loan.termMonths || 12; // Default 12 months
  const emi = calculateEMI(principal, rate, tenure);
  
  let balance = principal;
  let currentDate = new Date(startDate);
  
  for (let i = 1; i <= tenure; i++) {
    const interestAmount = Math.round((balance * rate) / (12 * 100));
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
    
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return schedule;
}

async function generateAllSchedules() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all loans without schedules
    const loans = await Loan.find({ scheduleGenerated: { $ne: true } });
    console.log(`📊 Found ${loans.length} loans without schedules`);

    let generated = 0;
    let errors = 0;

    for (const loan of loans) {
      try {
        // Check if schedule already exists
        const existingSchedule = await Instalment.findOne({ loan: loan._id });
        if (existingSchedule) {
          console.log(`⏭️  Schedule exists for loan ${loan.applicationId}`);
          continue;
        }

        // Generate schedule
        const startDate = loan.disbursedAt || loan.startDate || new Date();
        const schedule = generateSchedule(loan, startDate);
        
        // Save instalments
        await Instalment.insertMany(schedule);
        
        // Update loan
        await Loan.findByIdAndUpdate(loan._id, {
          scheduleGenerated: true,
          instalments: schedule.length,
          nextDueDate: schedule[0]?.dueDate,
          emi: schedule[0]?.totalDue || 0
        });

        console.log(`💰 Generated schedule for ${loan.applicationId} - ${schedule.length} instalments`);
        generated++;

      } catch (error) {
        console.error(`❌ Error processing loan ${loan.applicationId}:`, error.message);
        errors++;
      }
    }

    console.log(`\n📈 Schedule Generation Summary:`);
    console.log(`✅ Generated: ${generated} schedules`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total processed: ${generated + errors}`);

  } catch (error) {
    console.error('❌ Generation failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

generateAllSchedules();