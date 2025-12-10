const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config({ path: './.env' });

const Loan = require('./src/models/Loan');
const Payment = require('./src/models/Payment');
const Borrower = require('./src/models/Borrower');

async function importCSVPayments() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const payments = [];
    
    // Read CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream('./payment-collections.csv')
        .pipe(csv())
        .on('data', (row) => {
          payments.push({
            loanId: row['Loan ID'],
            amount: parseFloat(row['Amount']),
            paymentDate: new Date(row['Payment Date']),
            paymentMode: row['Payment Mode'].toLowerCase(),
            referenceNumber: row['Reference Number'] || null,
            collectedBy: row['Collected By'],
            remarks: row['Remarks']
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Found ${payments.length} payment records`);

    let imported = 0;
    let errors = 0;
    let skipped = 0;

    for (const payment of payments) {
      try {
        // Find loan by loan ID (stored in applicationId field)
        const loan = await Loan.findOne({ applicationId: payment.loanId }).populate('borrower');

        if (!loan) {
          console.log(`❌ Loan not found: ${payment.loanId} (Create this loan first)`);
          skipped++;
          continue;
        }

        // Check if payment already exists
        const existingPayment = await Payment.findOne({
          loan: loan._id,
          amount: payment.amount,
          collectedAt: payment.paymentDate,
          reference: payment.referenceNumber
        });

        if (existingPayment) {
          console.log(`⏭️  Payment already exists for loan: ${payment.loanId}`);
          skipped++;
          continue;
        }

        // Create new payment record
        const newPayment = new Payment({
          loan: loan._id,
          borrower: loan.borrower._id,
          amount: payment.amount,
          mode: payment.paymentMode,
          reference: payment.referenceNumber,
          collectedAt: payment.paymentDate,
          branch: loan.branch,
          notes: payment.remarks
        });

        await newPayment.save();
        imported++;

        console.log(`✅ Imported payment for loan ${payment.loanId}: ₹${payment.amount}`);

      } catch (error) {
        console.log(`❌ Error processing payment for ${payment.loanId}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`✅ Successfully imported: ${imported} payments`);
    console.log(`⏭️  Skipped (loan not found/duplicates): ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📈 Total processed: ${payments.length}`);
    
    if (imported > 0) {
      const totalAmount = payments.filter((_, i) => i < imported).reduce((sum, p) => sum + p.amount, 0);
      console.log(`💰 Total amount imported: ₹${totalAmount.toFixed(2)}`);
    }

  } catch (error) {
    console.error('Import error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

// Run the import
importCSVPayments();