const mongoose = require('mongoose');
require('dotenv').config();

const Loan = require('./src/models/Loan');

async function countLoans() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const totalLoans = await Loan.countDocuments();
        const statusCounts = await Loan.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        console.log(`Total Loan Cases: ${totalLoans}`);
        console.log('\nBy Status:');
        statusCounts.forEach(s => console.log(`${s._id}: ${s.count}`));
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

countLoans();