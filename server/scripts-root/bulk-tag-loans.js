const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const Loan = require('./src/models/Loan');

async function bulkTagLoans() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Agent distribution for 1245 loans
    const agents = ['AGENT_001', 'AGENT_002', 'AGENT_003'];
    const loansPerAgent = Math.ceil(1245 / agents.length);
    
    let updated = 0;
    const totalLoans = await Loan.countDocuments();
    
    // Get all loans and assign agents in batches
    const loans = await Loan.find({}, { _id: 1, applicationId: 1 });
    
    for (let i = 0; i < loans.length; i++) {
      const agentIndex = Math.floor(i / loansPerAgent);
      const agent = agents[agentIndex] || agents[agents.length - 1];
      
      await Loan.updateOne(
        { _id: loans[i]._id },
        { $addToSet: { tags: `AGENT_${agent}` } }
      );
      
      updated++;
      
      if (updated % 100 === 0) {
        console.log(`Tagged ${updated} loans...`);
      }
    }

    console.log(`\n📊 Bulk Tagging Summary:`);
    console.log(`✅ Tagged: ${updated} loans`);
    console.log(`📈 Total loans: ${totalLoans}`);
    console.log(`👥 Agents: ${agents.join(', ')}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

bulkTagLoans();