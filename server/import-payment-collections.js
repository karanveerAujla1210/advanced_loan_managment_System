const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config({ path: './.env' });

const Loan = require('./src/models/Loan');
const Instalment = require('./src/models/Instalment');
const Borrower = require('./src/models/Borrower');

// Payment Schema
const paymentSchema = new mongoose.Schema({
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Borrower', required: true },
  loanNumber: { type: String, required: true },
  paymentDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  paymentMode: { type: String, enum: ['CASH', 'CHEQUE', 'BANK_TRANSFER', 'UPI', 'CARD'], default: 'UPI' },
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

// Function to convert Excel date serial number to JavaScript Date
function excelDateToJSDate(serial) {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
}

// Function to allocate payment to installments
async function allocatePayment(loanId, paymentAmount, paymentDate) {
  const pendingInstallments = await Instalment.find({
    loanId: loanId,
    $expr: {
      $lt: [
        { $add: [{ $ifNull: ['$principalPaid', 0] }, { $ifNull: ['$interestPaid', 0] }] },
        '$totalDue'
      ]
    }
  }).sort({ installmentNo: 1 });

  const allocations = [];
  let remainingAmount = paymentAmount;

  for (const installment of pendingInstallments) {
    if (remainingAmount <= 0) break;

    const paidAmount = (installment.principalPaid || 0) + (installment.interestPaid || 0);
    const pendingAmount = installment.totalDue - paidAmount;
    
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
      const newPrincipalPaid = (installment.principalPaid || 0) + principalAllocation;
      const newInterestPaid = (installment.interestPaid || 0) + interestAllocation;
      const newStatus = (newPrincipalPaid + newInterestPaid >= installment.totalDue) ? 'PAID' : 'PARTIAL';

      await Instalment.findByIdAndUpdate(installment._id, {
        principalPaid: newPrincipalPaid,
        interestPaid: newInterestPaid,
        status: newStatus
      });

      remainingAmount -= allocationAmount;
    }
  }

  return { allocations, excessAmount: remainingAmount };
}

async function importPaymentCollections() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Read payment collections data
    const paymentData = JSON.parse(fs.readFileSync('../Data/payment-collections.json', 'utf8'));
    console.log(`Found ${paymentData.length} payment records`);

    let imported = 0;
    let errors = 0;
    let skipped = 0;

    for (const payment of paymentData) {
      try {
        const loanNumber = payment.LoanID;
        
        // Find loan by loan number
        const loan = await Loan.findOne({ loanNumber: loanNumber });
        if (!loan) {
          console.log(`❌ Loan not found: ${loanNumber}`);
          skipped++;
          continue;
        }

        // Convert Excel date to JavaScript Date
        let paymentDate;
        if (typeof payment['Payment Date'] === 'number') {
          paymentDate = excelDateToJSDate(payment['Payment Date']);
        } else {
          paymentDate = new Date(payment['Payment Date']);
        }

        // Check if payment already exists
        const existingPayment = await Payment.findOne({
          loanNumber: loanNumber,
          referenceNumber: payment['Reference Number_1'] || payment['Reference Number'],
          amount: payment.Amount
        });

        if (existingPayment) {
          skipped++;
          continue;
        }

        // Allocate payment to installments
        const { allocations, excessAmount } = await allocatePayment(
          loan._id, 
          payment.Amount, 
          paymentDate
        );

        // Create payment record
        const newPayment = new Payment({
          loanId: loan._id,
          borrowerId: loan.borrowerId,
          loanNumber: loanNumber,
          paymentDate: paymentDate,
          amount: payment.Amount,
          paymentMode: 'UPI',
          referenceNumber: payment['Reference Number_1'] || payment['Reference Number'],
          collectedBy: payment['Collected By'] || 'SYSTEM',
          remarks: payment.Remarks || '',
          allocations: allocations,
          status: 'ALLOCATED'
        });

        await newPayment.save();
        imported++;

        if (imported % 100 === 0) {
          console.log(`Processed ${imported} payments...`);
        }

        if (excessAmount > 0) {
          console.log(`⚠️  Excess amount for ${loanNumber}: ₹${excessAmount}`);
        }

      } catch (error) {
        console.log(`❌ Error processing payment for ${payment.LoanID}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`✅ Successfully imported: ${imported} payments`);
    console.log(`⏭️  Skipped (duplicates/not found): ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📈 Total processed: ${paymentData.length}`);

    // Generate summary statistics
    const totalPayments = await Payment.countDocuments();
    const totalAmount = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    console.log(`\n💰 Payment Statistics:`);
    console.log(`Total payments in database: ${totalPayments}`);
    console.log(`Total amount collected: ₹${totalAmount[0]?.total || 0}`);

  } catch (error) {
    console.error('Import error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

// Run the import
importPaymentCollections();