const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Disbursement Schema
const disbursementSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  loanId: { type: String, required: true },
  branch: { type: String, required: true },
  status: { type: String, required: true },
  type: { type: String, required: true },
  dateOfDisbursement: { type: Date, required: true },
  customerName: { type: String, required: true },
  mobileNumber: { type: Number, required: true },
  loanAmount: { type: Number, required: true },
  processingFees: { type: Number, required: true },
  gst: { type: Number, required: true },
  netDisbursement: { type: Number, required: true },
  utr: { type: String }
}, {
  timestamps: true
});

const Disbursement = mongoose.model('Disbursement', disbursementSchema);

async function importDisbursementData() {
  try {
    console.log('🚀 Starting disbursement data import...');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Read the JSON file
    const dataPath = path.join(__dirname, '..', 'Data', 'Disbursement Data.json');
    console.log(`📂 Reading data from: ${dataPath}`);
    
    if (!fs.existsSync(dataPath)) {
      throw new Error(`File not found: ${dataPath}`);
    }

    const rawData = fs.readFileSync(dataPath, 'utf8');
    const disbursementData = JSON.parse(rawData);
    
    console.log(`📊 Found ${disbursementData.length} records to import`);

    // Transform data to match schema
    const transformedData = disbursementData.map(item => ({
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

    // Clear existing data
    console.log('🗑️ Clearing existing disbursement data...');
    await Disbursement.deleteMany({});

    // Insert new data
    console.log('💾 Inserting new disbursement data...');
    const result = await Disbursement.insertMany(transformedData, { ordered: false });
    
    console.log(`✅ Successfully imported ${result.length} disbursement records!`);
    
    // Verify the import
    const count = await Disbursement.countDocuments();
    console.log(`📈 Total records in database: ${count}`);
    
    // Show some sample data
    const sampleRecords = await Disbursement.find().limit(3);
    console.log('\n📋 Sample records:');
    sampleRecords.forEach((record, index) => {
      console.log(`${index + 1}. ${record.customerName} - ${record.loanId} - ₹${record.loanAmount}`);
    });

  } catch (error) {
    console.error('❌ Error importing data:', error.message);
    
    if (error.code === 11000) {
      console.error('💡 Duplicate key error - some records may already exist');
    }
    
    process.exit(1);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the import
importDisbursementData();