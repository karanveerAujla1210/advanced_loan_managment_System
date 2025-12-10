const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

// Payment schema
const paymentSchema = new mongoose.Schema({
  loanId: String,
  amount: Number,
  paymentDate: Date,
  paymentMode: String,
  referenceNumber: String,
  collectedBy: String,
  remarks: String,
  createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);

async function importPayments() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const payments = [];
    
    fs.createReadStream('payment-collections.csv')
      .pipe(csv())
      .on('data', (row) => {
        payments.push({
          loanId: row['Loan ID'],
          amount: parseFloat(row['Amount']),
          paymentDate: new Date(row['Payment Date']),
          paymentMode: row['Payment Mode'],
          referenceNumber: row['Reference Number'] || null,
          collectedBy: row['Collected By'],
          remarks: row['Remarks']
        });
      })
      .on('end', async () => {
        await Payment.insertMany(payments);
        console.log(`Imported ${payments.length} payments`);
        mongoose.connection.close();
      });
  } catch (error) {
    console.error('Import failed:', error);
  }
}

importPayments();