const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config({ path: './.env' });

// Import models
const Loan = require('./src/models/Loan');
const Instalment = require('./src/models/Instalment');
const Borrower = require('./src/models/Borrower');

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

async function allocatePayment(loanId, paymentAmount, paymentDate) {
  // Get pending installments for the loan
  const pendingInstallments = await Instalment.find({
    loanId: loanId,
    status: 'PENDING',
    dueDate: { $lte: paymentDate }
  }).sort({ installmentNo: 1 });

  const allocations = [];
  let remainingAmount = paymentAmount;

  for (const installment of pendingInstallments) {
    if (remainingAmount <= 0) break;

    const pendingAmount = installment.totalDue - (installment.principalPaid || 0) - (installment.interestPaid || 0);
    
    if (pendingAmount > 0) {
      const allocationAmount = Math.min(remainingAmount, pendingAmount);
      
      // Allocate to interest first, then principal
      const interestDue = installment.interestDue - (installment.interestPaid || 0);
      const interestAllocation = Math.min(allocationAmount, interestDue);
      const principalAllocation = allocationAmount - interestAllocation;

      allocations.push({
        installmentId: installment._id,
        principalPaid: principalAllocation,
        interestPaid: interestAllocation,
        totalPaid: allocationAmount
      });

      // Update installment
      await Instalment.findByIdAndUpdate(installment._id, {
        $inc: {
          principalPaid: principalAllocation,
          interestPaid: interestAllocation
        },
        status: (installment.totalDue <= (installment.principalPaid || 0) + (installment.interestPaid || 0) + allocationAmount) ? 'PAID' : 'PARTIAL'
      });

      remainingAmount -= allocationAmount;
    }
  }

  return { allocations, excessAmount: remainingAmount };
}

async function processPaymentCollections() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Example: Process sample payments
    const samplePayments = [
      {
        loanNumber: "CBL00000000002",
        amount: 2142.86,
        paymentDate: new Date('2025-03-27'),
        paymentMode: 'CASH',
        collectedBy: 'AGENT_001',
        remarks: 'Week 1 EMI collection'
      },
      {
        loanNumber: "CBL00000000011", 
        amount: 2142.86,
        paymentDate: new Date('2025-03-27'),
        paymentMode: 'UPI',
        referenceNumber: 'UPI789012345',
        collectedBy: 'AGENT_002',
        remarks: 'Week 1 EMI collection'
      }
    ];

    for (const paymentData of samplePayments) {
      // Find loan by loan number
      const loan = await Loan.findOne({ loanNumber: paymentData.loanNumber });
      if (!loan) {
        console.log(`Loan not found: ${paymentData.loanNumber}`);
        continue;
      }

      // Allocate payment
      const { allocations, excessAmount } = await allocatePayment(
        loan._id, 
        paymentData.amount, 
        paymentData.paymentDate
      );

      // Create payment record
      const payment = new Payment({
        loanId: loan._id,
        borrowerId: loan.borrowerId,
        paymentDate: paymentData.paymentDate,
        amount: paymentData.amount,
        paymentMode: paymentData.paymentMode,
        referenceNumber: paymentData.referenceNumber,
        collectedBy: paymentData.collectedBy,
        remarks: paymentData.remarks,
        allocations: allocations,
        status: 'ALLOCATED'
      });

      await payment.save();
      console.log(`Payment processed for loan ${paymentData.loanNumber}: ₹${paymentData.amount}`);
      
      if (excessAmount > 0) {
        console.log(`Excess amount: ₹${excessAmount} (advance payment)`);
      }
    }

    console.log('\nPayment collection processing completed');
    
  } catch (error) {
    console.error('Error processing payments:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Function to create bulk payments from CSV/Excel data
async function createBulkPayments(paymentsData) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    for (const paymentData of paymentsData) {
      const loan = await Loan.findOne({ loanNumber: paymentData.loanNumber });
      if (loan) {
        const { allocations } = await allocatePayment(loan._id, paymentData.amount, paymentData.paymentDate);
        
        const payment = new Payment({
          loanId: loan._id,
          borrowerId: loan.borrowerId,
          ...paymentData,
          allocations,
          status: 'ALLOCATED'
        });
        
        await payment.save();
      }
    }
    
  } catch (error) {
    console.error('Bulk payment error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  processPaymentCollections();
}

module.exports = { Payment, allocatePayment, createBulkPayments };