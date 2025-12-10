require('dotenv').config();
const mongoose = require('mongoose');

// Simple schemas for direct import
const BorrowerSchema = new mongoose.Schema({
  borrowerId: { type: String, unique: true },
  firstName: String,
  lastName: String,
  phone: { type: String, unique: true },
  email: String,
  dateOfBirth: Date,
  gender: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  kycStatus: { type: String, default: 'VERIFIED' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const LoanSchema = new mongoose.Schema({
  loanNumber: { type: String, unique: true },
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Borrower' },
  principalAmount: Number,
  interestRate: Number,
  tenure: Number,
  emiAmount: Number,
  applicationDate: Date,
  disbursementDate: Date,
  status: { type: String, default: 'ACTIVE' },
  loanType: String
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: String,
  password: String,
  role: { type: String, default: 'ADMIN' },
  displayName: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Borrower = mongoose.model('Borrower', BorrowerSchema);
const Loan = mongoose.model('Loan', LoanSchema);
const User = mongoose.model('User', UserSchema);

// Sample data
const sampleBorrowers = [
  {
    borrowerId: "BOR001",
    firstName: "Rajesh",
    lastName: "Kumar",
    phone: "9876543210",
    email: "rajesh.kumar@example.com",
    dateOfBirth: new Date('1985-05-15'),
    gender: "MALE",
    address: {
      street: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001"
    }
  },
  {
    borrowerId: "BOR002",
    firstName: "Priya",
    lastName: "Sharma",
    phone: "9876543211",
    email: "priya.sharma@example.com",
    dateOfBirth: new Date('1990-08-22'),
    gender: "FEMALE",
    address: {
      street: "456 Park Avenue",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001"
    }
  },
  {
    borrowerId: "BOR003",
    firstName: "Amit",
    lastName: "Singh",
    phone: "9876543212",
    email: "amit.singh@example.com",
    dateOfBirth: new Date('1988-12-10'),
    gender: "MALE",
    address: {
      street: "789 Garden Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001"
    }
  }
];

const sampleLoans = [
  {
    loanNumber: "LN001",
    principalAmount: 50000,
    interestRate: 12,
    tenure: 12,
    emiAmount: 4442,
    applicationDate: new Date('2024-01-15'),
    disbursementDate: new Date('2024-01-20'),
    loanType: "Personal Loan"
  },
  {
    loanNumber: "LN002",
    principalAmount: 75000,
    interestRate: 10,
    tenure: 24,
    emiAmount: 3465,
    applicationDate: new Date('2024-01-20'),
    disbursementDate: new Date('2024-01-25'),
    loanType: "Business Loan"
  },
  {
    loanNumber: "LN003",
    principalAmount: 100000,
    interestRate: 11,
    tenure: 18,
    emiAmount: 6217,
    applicationDate: new Date('2024-02-05'),
    disbursementDate: new Date('2024-02-10'),
    loanType: "Home Loan"
  }
];

async function importData() {
  try {
    console.log('🚀 Starting direct MongoDB import...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);

    // Create admin user if not exists
    let adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@loancrm.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: admin123
        role: 'ADMIN',
        displayName: 'System Administrator'
      });
      console.log('✅ Created admin user');
    }

    // Import borrowers
    let borrowerCount = 0;
    const borrowerIds = [];
    
    for (const borrowerData of sampleBorrowers) {
      try {
        const borrower = await Borrower.create(borrowerData);
        borrowerIds.push(borrower._id);
        console.log(`✅ Created borrower: ${borrowerData.firstName} ${borrowerData.lastName}`);
        borrowerCount++;
      } catch (error) {
        if (error.code === 11000) {
          const existing = await Borrower.findOne({ phone: borrowerData.phone });
          borrowerIds.push(existing._id);
          console.log(`⚠️  Borrower ${borrowerData.firstName} ${borrowerData.lastName} already exists`);
        } else {
          console.error(`❌ Error creating borrower:`, error.message);
        }
      }
    }

    // Import loans
    let loanCount = 0;
    for (let i = 0; i < sampleLoans.length && i < borrowerIds.length; i++) {
      try {
        const loanData = {
          ...sampleLoans[i],
          borrowerId: borrowerIds[i]
        };
        
        await Loan.create(loanData);
        console.log(`✅ Created loan: ${loanData.loanNumber}`);
        loanCount++;
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️  Loan ${sampleLoans[i].loanNumber} already exists`);
        } else {
          console.error(`❌ Error creating loan:`, error.message);
        }
      }
    }

    console.log(`\n🎉 Import completed!`);
    console.log(`📊 Statistics:`);
    console.log(`   New borrowers created: ${borrowerCount}`);
    console.log(`   New loans created: ${loanCount}`);
    console.log(`   Total borrowers: ${await Borrower.countDocuments()}`);
    console.log(`   Total loans: ${await Loan.countDocuments()}`);
    console.log(`   Total users: ${await User.countDocuments()}`);

  } catch (error) {
    console.error('❌ Import failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run import
if (require.main === module) {
  importData();
}

module.exports = { importData };