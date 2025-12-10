const fs = require('fs');
const path = require('path');

// Read the payment collections JSON file
const inputFile = path.join(__dirname, 'payment-collections.json');
const outputFile = path.join(__dirname, 'payment-collections-with-schedule.json');

try {
    // Read the JSON file
    const rawData = fs.readFileSync(inputFile, 'utf8');
    const payments = JSON.parse(rawData);
    
    // Group payments by Loan ID and add schedule numbers
    const loanSchedules = {};
    const processedPayments = [];
    
    payments.forEach((payment, index) => {
        const loanId = payment.LoanID;
        
        // Initialize schedule counter for this loan if not exists
        if (!loanSchedules[loanId]) {
            loanSchedules[loanId] = 1;
        }
        
        // Add schedule number to payment
        const processedPayment = {
            ...payment,
            ScheduleNumber: loanSchedules[loanId],
            UniquePaymentId: `${loanId}_SCH_${loanSchedules[loanId].toString().padStart(3, '0')}`
        };
        
        processedPayments.push(processedPayment);
        
        // Increment schedule counter for this loan
        loanSchedules[loanId]++;
    });
    
    // Write processed data to new file
    fs.writeFileSync(outputFile, JSON.stringify(processedPayments, null, 2));
    
    // Generate summary report
    const summary = {
        totalPayments: processedPayments.length,
        uniqueLoans: Object.keys(loanSchedules).length,
        loanSummary: {}
    };
    
    // Create loan summary
    Object.keys(loanSchedules).forEach(loanId => {
        const loanPayments = processedPayments.filter(p => p.LoanID === loanId);
        const totalAmount = loanPayments.reduce((sum, p) => sum + (parseFloat(p.Amount) || 0), 0);
        
        summary.loanSummary[loanId] = {
            paymentCount: loanSchedules[loanId] - 1,
            totalAmount: totalAmount,
            firstPayment: loanPayments[0]['Payment Date'],
            lastPayment: loanPayments[loanPayments.length - 1]['Payment Date']
        };
    });
    
    // Write summary report
    const summaryFile = path.join(__dirname, 'payment-summary-report.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
    console.log('✅ Processing completed successfully!');
    console.log(`📊 Total payments processed: ${summary.totalPayments}`);
    console.log(`🏦 Unique loans found: ${summary.uniqueLoans}`);
    console.log(`📁 Files created:`);
    console.log(`   - ${outputFile}`);
    console.log(`   - ${summaryFile}`);
    
    // Display top 10 loans by payment count
    const sortedLoans = Object.entries(summary.loanSummary)
        .sort((a, b) => b[1].paymentCount - a[1].paymentCount)
        .slice(0, 10);
    
    console.log('\n📈 Top 10 loans by payment count:');
    sortedLoans.forEach(([loanId, data], index) => {
        console.log(`${index + 1}. ${loanId}: ${data.paymentCount} payments, ₹${data.totalAmount.toFixed(2)}`);
    });
    
} catch (error) {
    console.error('❌ Error processing payments:', error.message);
}