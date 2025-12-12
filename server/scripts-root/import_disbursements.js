const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const Loan = require('./src/models/Loan');
const Borrower = require('./src/models/Borrower');
const Branch = require('./src/models/Branch');

async function importDisbursements() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        // Read the JSON file
        const jsonData = fs.readFileSync('C:\\Users\\DELL\\CascadeProjects\\advanced_loan_management_system\\Data\\Disbursement Data.json', 'utf8');
        const disbursements = JSON.parse(jsonData);
        
        console.log(`Found ${disbursements.length} disbursement records`);
        
        // Get or create default branch
        let defaultBranch = await Branch.findOne({ name: 'MAIN' });
        if (!defaultBranch) {
            defaultBranch = new Branch({
                name: 'MAIN',
                code: 'MAIN',
                address: 'Main Branch',
                phone: '0000000000',
                email: 'main@branch.com',
                manager: 'System',
                isActive: true
            });
            await defaultBranch.save();
        }
        
        let imported = 0;
        let skipped = 0;
        
        for (const record of disbursements) {
            try {
                // Check if loan already exists
                const existingLoan = await Loan.findOne({ applicationId: record['Loan ID'] });
                if (existingLoan) {
                    console.log(`Loan ${record['Loan ID']} already exists, skipping...`);
                    skipped++;
                    continue;
                }
                
                // Create or find borrower
                let borrower = await Borrower.findOne({ phone: record['Mobile Number'].toString() });
                if (!borrower) {
                    borrower = new Borrower({
                        name: record['Customer Name'],
                        phone: record['Mobile Number'].toString(),
                        status: 'active',
                        branch: defaultBranch._id,
                        createdAt: new Date(record['Date of Disbursement'])
                    });
                    await borrower.save();
                }
                
                // Parse disbursement date
                const disbursementDate = new Date(record['Date of Disbursement']);
                
                // Create loan record
                const loan = new Loan({
                    branch: defaultBranch._id,
                    borrower: borrower._id,
                    applicationId: record['Loan ID'],
                    principal: record['Loan Amount'],
                    processingFee: record['Processing Fees'],
                    gstOnProcessingFee: record['Gst'],
                    netDisbursed: record['Net Disbursement'],
                    disbursedAmount: record['Net Disbursement'],
                    interestType: 'reducing',
                    interestRate: 24, // Default 24% annual
                    interestTotal: record['Loan Amount'] * 0.24, // Simple calculation
                    totalPayable: record['Loan Amount'] + (record['Loan Amount'] * 0.24),
                    termMonths: 12, // Default 12 months
                    termDays: 365,
                    installments: 52, // Weekly installments
                    frequencyDays: 7,
                    emi: (record['Loan Amount'] + (record['Loan Amount'] * 0.24)) / 52,
                    startDate: disbursementDate,
                    status: 'disbursed',
                    repaymentFrequency: 'weekly',
                    scheduleGenerated: false,
                    outstandingPrincipal: record['Loan Amount'],
                    outstandingInterest: record['Loan Amount'] * 0.24,
                    appliedAt: disbursementDate,
                    disbursedAt: disbursementDate,
                    createdAt: disbursementDate,
                    updatedAt: new Date()
                });
                
                await loan.save();
                console.log(`Imported loan ${record['Loan ID']} for ${record['Customer Name']}`);
                imported++;
                
            } catch (error) {
                console.error(`Error importing loan ${record['Loan ID']}:`, error.message);
            }
        }
        
        console.log(`\nImport completed:`);
        console.log(`- Imported: ${imported} loans`);
        console.log(`- Skipped: ${skipped} loans`);
        
        // Final count check
        const totalLoans = await Loan.countDocuments();
        const disbursedLoans = await Loan.countDocuments({ status: 'disbursed' });
        
        console.log(`\nFinal database status:`);
        console.log(`- Total loans: ${totalLoans}`);
        console.log(`- Disbursed loans: ${disbursedLoans}`);
        
    } catch (error) {
        console.error('Error importing disbursements:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Connection closed');
    }
}

importDisbursements();