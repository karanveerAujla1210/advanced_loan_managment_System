// server/importData.js
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const Disbursement = require("./src/models/Disbursement.js");
const Payment = require("./src/models/Payment.js");

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  }
}

// Import Disbursement Data
async function importDisbursements() {
  const filePath = path.join("..", "Data", "Disbursement Data.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  
  // Fix JSON format - wrap in array brackets
  const fixedJson = `[${raw}]`;
  const data = JSON.parse(fixedJson);

  console.log(`📦 Found ${data.length} disbursement records`);

  // Transform data to match Disbursement schema
  const transformedData = data.map(item => ({
    uniqueId: item["Unique ID"],
    loanId: item["Loan ID"],
    branch: item["Branch"],
    status: item["Status"],
    type: item["Type"],
    dateOfDisbursement: new Date(item["Date of Disbursement"]),
    customerName: item["Customer Name"],
    mobileNumber: item["Mobile Number"],
    loanAmount: item["Loan Amount"],
    processingFees: item["Processing Fees"],
    gst: item["Gst"],
    netDisbursement: item["Net Disbursement"],
    utr: item["UTR"]
  }));

  await Disbursement.deleteMany({});
  const result = await Disbursement.insertMany(transformedData);

  console.log(`✅ Inserted ${result.length} disbursement documents`);
}

// Import Payment Collection Data
async function importPayments() {
  const filePath = path.join("..", "Data", "payment-collections.json");
  
  if (!fs.existsSync(filePath)) {
    console.log("⚠️ Payment collections file not found, skipping...");
    return;
  }
  
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

  console.log(`📦 Found ${data.length} payment collection records`);

  await Payment.deleteMany({});
  const result = await Payment.insertMany(data);

  console.log(`✅ Inserted ${result.length} payment documents`);
}

// Main Runner
async function run() {
  await connectDB();
  console.log("🚀 Starting Data Import...\n");

  await importDisbursements();
  await importPayments();

  console.log("\n🎉 Data Import Completed Successfully");
  process.exit();
}

run();