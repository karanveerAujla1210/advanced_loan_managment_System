const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function cleanAndImportData() {
  try {
    console.log('🚀 Starting data cleaning and import...');
    
    // Read and clean the JSON file
    const dataPath = path.join(__dirname, '..', 'Data', 'Disbursement Data.json');
    console.log('📂 Reading and cleaning data...');
    
    let rawData = fs.readFileSync(dataPath, 'utf8');
    
    // Fix NaN values in JSON
    rawData = rawData.replace(/:\s*NaN/g, ': null');
    
    const disbursementData = JSON.parse(rawData);
    console.log(`📊 Found ${disbursementData.length} records`);

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully!');

    // Clean data and insert
    const cleanData = disbursementData.map(item => ({
      uniqueId: item['Unique ID'],
      loanId: item['Loan ID'],
      branch: item['Branch'],
      status: item['Status'],
      type: item['Type'],
      dateOfDisbursement: new Date(item['Date of Disbursement']),
      customerName: item['Customer Name'],
      mobileNumber: item['Mobile Number'],
      loanAmount: item['Loan Amount'],
      processingFees: item['Processing Fees'],
      gst: item['Gst'],
      netDisbursement: item['Net Disbursement'],
      utr: item['UTR'] || null
    }));

    // Drop existing collection and insert new data
    await mongoose.connection.db.collection('disbursements').drop().catch(() => {});
    const result = await mongoose.connection.db.collection('disbursements').insertMany(cleanData);
    
    console.log(`✅ Successfully imported ${result.insertedCount} records!`);
    
    // Verify
    const count = await mongoose.connection.db.collection('disbursements').countDocuments();
    console.log(`📈 Total records in database: ${count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
  }
}

cleanAndImportData();