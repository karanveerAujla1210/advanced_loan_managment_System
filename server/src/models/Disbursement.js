const mongoose = require('mongoose');

const disbursementSchema = new mongoose.Schema({
  uniqueId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  loanId: {
    type: String,
    required: true,
    trim: true
  },
  branch: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  status: {
    type: String,
    required: true,
    enum: ['ACTIVE', 'CLOSED', 'PENDING', 'CANCELLED'],
    default: 'ACTIVE'
  },
  type: {
    type: String,
    required: true,
    enum: ['Fresh', 'Top-up', 'Renewal'],
    default: 'Fresh'
  },
  dateOfDisbursement: {
    type: Date,
    required: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  mobileNumber: {
    type: Number,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v.toString());
      },
      message: 'Mobile number must be 10 digits'
    }
  },
  loanAmount: {
    type: Number,
    required: true,
    min: 0
  },
  processingFees: {
    type: Number,
    required: true,
    min: 0
  },
  gst: {
    type: Number,
    required: true,
    min: 0
  },
  netDisbursement: {
    type: Number,
    required: true,
    min: 0
  },
  utr: {
    type: String,
    trim: true,
    sparse: true // Allows multiple null values
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
disbursementSchema.index({ uniqueId: 1 });
disbursementSchema.index({ loanId: 1 });
disbursementSchema.index({ branch: 1 });
disbursementSchema.index({ dateOfDisbursement: -1 });
disbursementSchema.index({ customerName: 1 });
disbursementSchema.index({ mobileNumber: 1 });

// Virtual for formatted disbursement date
disbursementSchema.virtual('formattedDate').get(function() {
  return this.dateOfDisbursement.toLocaleDateString('en-IN');
});

// Virtual for formatted amounts
disbursementSchema.virtual('formattedLoanAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.loanAmount);
});

disbursementSchema.virtual('formattedNetDisbursement').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.netDisbursement);
});

// Static method to get disbursement statistics
disbursementSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalDisbursements: { $sum: 1 },
        totalLoanAmount: { $sum: '$loanAmount' },
        totalNetDisbursement: { $sum: '$netDisbursement' },
        totalProcessingFees: { $sum: '$processingFees' },
        totalGST: { $sum: '$gst' },
        avgLoanAmount: { $avg: '$loanAmount' },
        minLoanAmount: { $min: '$loanAmount' },
        maxLoanAmount: { $max: '$loanAmount' }
      }
    }
  ]);

  return stats[0] || {};
};

// Static method to get branch-wise statistics
disbursementSchema.statics.getBranchStatistics = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: '$branch',
        count: { $sum: 1 },
        totalLoanAmount: { $sum: '$loanAmount' },
        totalNetDisbursement: { $sum: '$netDisbursement' },
        avgLoanAmount: { $avg: '$loanAmount' }
      }
    },
    {
      $sort: { totalLoanAmount: -1 }
    }
  ]);
};

// Static method to get monthly disbursement trends
disbursementSchema.statics.getMonthlyTrends = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$dateOfDisbursement' },
          month: { $month: '$dateOfDisbursement' }
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$loanAmount' },
        totalNetDisbursement: { $sum: '$netDisbursement' }
      }
    },
    {
      $sort: { '_id.year': -1, '_id.month': -1 }
    }
  ]);
};

// Pre-save middleware to calculate net disbursement if not provided
disbursementSchema.pre('save', function(next) {
  if (!this.netDisbursement) {
    this.netDisbursement = this.loanAmount - this.processingFees - this.gst;
  }
  next();
});

const Disbursement = mongoose.model('Disbursement', disbursementSchema);

module.exports = Disbursement;