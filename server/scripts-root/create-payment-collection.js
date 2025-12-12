const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

// Payment Schema
const paymentSchema = new mongoose.Schema({
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Borrower', required: true },
  paymentDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  paymentMode: { type: String, enum: ['CASH', 'CHEQUE', 'BANK_TRANSFER', 'UPI', 'CARD'], default: 'CASH' },
  referenceNumber: String,
  collectedBy: String,
  remarks: String,
  allocations: [{
    installmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Instalment' },
    principalPaid: { type: Number, default: 0 },
    interestPaid: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 }
  }],
  status: { type: String, enum: ['PENDING', 'ALLOCATED', 'CANCELLED'], default: 'PENDING' }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

async function createPaymentCollection() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Sample payment collection data
    const samplePayments = [
      {
        loanId: "CBL00000000002", // Will be converted to ObjectId
        amount: 2142.86, // Weekly EMI amount
        paymentDate: new Date('2025-03-27'),
        paymentMode: 'CASH',
        collectedBy: 'COLLECTION_AGENT_1',
        remarks: 'Week 1 collection'
      },
      {
        loanId: "CBL00000000011",
        amount: 2142.86,
        paymentDate: new Date('2025-03-27'),
        paymentMode: 'UPI',
        referenceNumber: 'UPI123456789',
        collectedBy: 'COLLECTION_AGENT_2',
        remarks: 'Week 1 collection'
      }
    ];

    console.log('Sample payment collection structure created');
    console.log('To add actual payments, use the following methods:');
    
    console.log('\n1. BULK PAYMENT ENTRY:');
    console.log('   - Import from Excel/CSV with columns: Loan ID, Amount, Date, Mode');
    console.log('   - Use payment allocation logic to distribute against installments');
    
    console.log('\n2. INDIVIDUAL PAYMENT ENTRY:');
    console.log('   - Manual entry through UI forms');
    console.log('   - Real-time payment allocation');
    
    console.log('\n3. PAYMENT MODES SUPPORTED:');
    console.log('   - CASH, CHEQUE, BANK_TRANSFER, UPI, CARD');
    
    console.log('\nPayment Schema Fields:');
    console.log('- loanId: Reference to loan');
    console.log('- borrowerId: Reference to borrower');
    console.log('- paymentDate: Collection date');
    console.log('- amount: Payment amount');
    console.log('- paymentMode: Payment method');
    console.log('- referenceNumber: Transaction reference');
    console.log('- collectedBy: Collection agent');
    console.log('- allocations: Auto-allocation to installments');
    console.log('- status: PENDING/ALLOCATED/CANCELLED');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createPaymentCollection();