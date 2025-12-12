const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config({ path: './.env' });

const Loan = require('./src/models/Loan');

async function tagLoansToAgents() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const agentMappings = {};
    
    // Read CSV to get agent assignments
    await new Promise((resolve, reject) => {
      fs.createReadStream('./payment-collections.csv')
        .pipe(csv())
        .on('data', (row) => {
          const loanId = row['Loan ID'];
          const agent = row['Collected By'];
          if (loanId && agent) {
            agentMappings[loanId] = agent;
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Found ${Object.keys(agentMappings).length} loan-agent mappings`);

    // Update all loans with agent tags
    let updated = 0;
    const totalLoans = await Loan.countDocuments();
    
    for (const [loanId, agent] of Object.entries(agentMappings)) {
      const result = await Loan.updateOne(
        { applicationId: loanId },
        { $addToSet: { tags: `AGENT_${agent}` } }
      );
      
      if (result.modifiedCount > 0) {
        updated++;
      }
    }

    console.log(`\n📊 Update Summary:`);
    console.log(`✅ Updated: ${updated} loans`);
    console.log(`📈 Total loans in DB: ${totalLoans}`);
    console.log(`🏷️  Agent assignments completed`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

tagLoansToAgents();