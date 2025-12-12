const mongoose = require('mongoose');

const borrowerSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true },
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fatherName: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
    maritalStatus: { type: String, enum: ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'] }
  },
  contact: {
    phone: { type: String, required: true },
    alternatePhone: String,
    email: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String
    }
  },
  kyc: {
    aadharNumber: String,
    panNumber: String,
    documents: [{
      type: String,
      url: String,
      uploadedAt: Date
    }]
  },
  financial: {
    monthlyIncome: Number,
    occupation: String,
    employer: String,
    bankAccount: {
      accountNumber: String,
      ifscCode: String,
      bankName: String
    }
  },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'BLACKLISTED'], default: 'ACTIVE' },
  creditScore: Number,
  notes: [{ text: String, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, createdAt: Date }]
}, { timestamps: true });

module.exports = mongoose.model('Borrower', borrowerSchema);