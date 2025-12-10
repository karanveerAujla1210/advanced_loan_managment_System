const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Sample disbursement data
const sampleData = [
  {
    borrowerName: "Rajesh Kumar",
    phone: "9876543210",
    email: "rajesh.kumar@example.com",
    principalAmount: 50000,
    interestRate: 12,
    tenure: 12,
    loanProduct: "Personal Loan",
    branch: "Main Branch",
    disbursementDate: "2024-01-20",
    disbursementMethod: "BANK_TRANSFER"
  },
  {
    borrowerName: "Priya Sharma", 
    phone: "9876543211",
    email: "priya.sharma@example.com",
    principalAmount: 75000,
    interestRate: 10,
    tenure: 24,
    loanProduct: "Business Loan",
    branch: "Main Branch",
    disbursementDate: "2024-01-25",
    disbursementMethod: "NEFT"
  },
  {
    borrowerName: "Amit Singh",
    phone: "9876543212", 
    email: "amit.singh@example.com",
    principalAmount: 100000,
    interestRate: 11,
    tenure: 18,
    loanProduct: "Home Loan",
    branch: "North Branch",
    disbursementDate: "2024-02-10",
    disbursementMethod: "RTGS"
  },
  {
    borrowerName: "Sunita Devi",
    phone: "9876543213",
    email: "sunita.devi@example.com", 
    principalAmount: 25000,
    interestRate: 15,
    tenure: 6,
    loanProduct: "Micro Loan",
    branch: "Main Branch",
    disbursementDate: "2024-02-15",
    disbursementMethod: "CASH"
  },
  {
    borrowerName: "Vikram Patel",
    phone: "9876543214",
    email: "vikram.patel@example.com",
    principalAmount: 80000,
    interestRate: 12,
    tenure: 15,
    loanProduct: "Personal Loan", 
    branch: "South Branch",
    disbursementDate: "2024-02-20",
    disbursementMethod: "BANK_TRANSFER"
  }
];

async function importData() {
  try {
    console.log('🚀 Starting data import via API...');
    
    // First, login to get token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    console.log('✅ Login successful');
    
    let importedCount = 0;
    
    for (const data of sampleData) {
      try {
        // Create borrower
        const [firstName, ...lastNameParts] = data.borrowerName.split(' ');
        const borrowerData = {
          firstName,
          lastName: lastNameParts.join(' '),
          phone: data.phone,
          email: data.email,
          dateOfBirth: '1990-01-01',
          gender: 'MALE',
          address: {
            street: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001'
          },
          kycStatus: 'VERIFIED'
        };
        
        const borrowerResponse = await axios.post(`${API_BASE}/borrowers`, borrowerData, { headers });
        console.log(`✅ Created borrower: ${data.borrowerName}`);
        
        importedCount++;
        
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes('phone')) {
          console.log(`⚠️  Borrower ${data.borrowerName} already exists`);
        } else {
          console.error(`❌ Error creating borrower ${data.borrowerName}:`, error.response?.data?.message || error.message);
        }
      }
    }
    
    console.log(`\n🎉 Import completed!`);
    console.log(`📊 Statistics:`);
    console.log(`   New borrowers created: ${importedCount}`);
    console.log(`   Total records processed: ${sampleData.length}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error.response?.data?.message || error.message);
  }
}

// Run import
if (require.main === module) {
  importData();
}

module.exports = { importData };