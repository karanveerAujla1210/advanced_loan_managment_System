const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config({ path: './.env' });

const Loan = require('./src/models/Loan');
const Instalment = require('./src/models/Instalment');
const { Payment, allocatePayment } = require('./payment-allocation');

async function processBulkPayments(csvFilePath) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const payments = [];
    
    // Read CSV file
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        payments.push({
          loanNumber: row['Loan ID'],
          amount: parseFloat(row['Amount']),
          paymentDate: new Date(row['Payment Date']),
          paymentMode: row['Payment Mode'] || 'CASH',
          referenceNumber: row['Reference Number'] || '',
          collectedBy: row['Collected By'] || 'SYSTEM',
          remarks: row['Remarks'] || 'Bulk payment entry'
        });
      })
      .on('end', async () => {
        console.log(`Processing ${payments.length} payments...`);
        
        let processed = 0;
        let errors = 0;

        for (const paymentData of payments) {
          try {
            // Find loan
            const loan = await Loan.findOne({ loanNumber: paymentData.loanNumber });
            if (!loan) {
              console.log(`❌ Loan not found: ${paymentData.loanNumber}`);
              errors++;
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
            processed++;
            
            console.log(`✅ ${paymentData.loanNumber}: ₹${paymentData.amount}${excessAmount > 0 ? ` (Excess: ₹${excessAmount})` : ''}`);
            
          } catch (error) {
            console.log(`❌ Error processing ${paymentData.loanNumber}:`, error.message);
            errors++;
          }
        }

        console.log(`\n📊 Summary:`);
        console.log(`✅ Processed: ${processed}`);
        console.log(`❌ Errors: ${errors}`);
        console.log(`📈 Total: ${payments.length}`);
        
        await mongoose.disconnect();
      });

  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

// Create sample CSV template
function createPaymentTemplate() {
  const csvContent = `Loan ID,Amount,Payment Date,Payment Mode,Reference Number,Collected By,Remarks
CBL00000000002,2142.86,2025-03-27,CASH,,AGENT_001,Week 1 EMI
CBL00000000011,2142.86,2025-03-27,UPI,UPI789012345,AGENT_002,Week 1 EMI
CBL00000000021,2142.86,2025-03-27,CASH,,AGENT_001,Week 1 EMI
CBL00000000026,2142.86,2025-03-29,BANK_TRANSFER,TXN123456,AGENT_003,Week 1 EMI
CBL00000000006,2142.86,2025-03-29,CASH,,AGENT_001,Week 1 EMI`;

  fs.writeFileSync('./payment-collections.csv', csvContent);
  console.log('✅ Payment template created: payment-collections.csv');
  console.log('\nCSV Format:');
  console.log('- Loan ID: Loan number (e.g., CBL00000000002)');
  console.log('- Amount: Payment amount');
  console.log('- Payment Date: YYYY-MM-DD format');
  console.log('- Payment Mode: CASH, UPI, BANK_TRANSFER, CHEQUE, CARD');
  console.log('- Reference Number: Transaction reference (optional)');
  console.log('- Collected By: Agent/collector name');
  console.log('- Remarks: Additional notes');
}

// Generate collection report
async function generateCollectionReport() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const collections = await Payment.aggregate([
      {
        $lookup: {
          from: 'loans',
          localField: 'loanId',
          foreignField: '_id',
          as: 'loan'
        }
      },
      {
        $lookup: {
          from: 'borrowers',
          localField: 'borrowerId',
          foreignField: '_id',
          as: 'borrower'
        }
      },
      {
        $group: {
          _id: '$collectedBy',
          totalAmount: { $sum: '$amount' },
          totalPayments: { $sum: 1 },
          paymentModes: { $push: '$paymentMode' }
        }
      }
    ]);

    console.log('\n📊 Collection Report:');
    collections.forEach(collector => {
      console.log(`👤 ${collector._id}: ₹${collector.totalAmount} (${collector.totalPayments} payments)`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Report error:', error);
  }
}

// Command line interface
const command = process.argv[2];
const filePath = process.argv[3];

switch (command) {
  case 'template':
    createPaymentTemplate();
    break;
  case 'process':
    if (!filePath) {
      console.log('Usage: node bulk-payment-processor.js process <csv-file-path>');
      process.exit(1);
    }
    processBulkPayments(filePath);
    break;
  case 'report':
    generateCollectionReport();
    break;
  default:
    console.log('Available commands:');
    console.log('  template - Create payment CSV template');
    console.log('  process <file> - Process bulk payments from CSV');
    console.log('  report - Generate collection report');
    console.log('\nExamples:');
    console.log('  node bulk-payment-processor.js template');
    console.log('  node bulk-payment-processor.js process payment-collections.csv');
    console.log('  node bulk-payment-processor.js report');
}