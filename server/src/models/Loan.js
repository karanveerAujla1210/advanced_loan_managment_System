const mongoose = require("mongoose");
const { Schema } = mongoose;

const ChargeHistorySchema = new Schema(
  {
    type: String,
    amount: Number,
    date: Date,
    description: String,
    instalmentNo: Number
  },
  { _id: false }
);

const LegalChargeSchema = new Schema(
  {
    type: String,
    amount: Number,
    date: Date,
    weeks: Number
  },
  { _id: false }
);

const LegalSchema = new Schema(
  {
    caseId: String,
    filingDate: Date,
    oneTimeFee: Number,
    weeklyChargeAmount: Number,
    totalWeeksCharged: Number,
    totalLegalCharges: Number,
    status: String,
    nextHearingDate: Date,
    description: String,
    settlementAmount: Number,
    charges: [LegalChargeSchema]
  },
  { _id: false }
);

const TopupSchema = new Schema(
  {
    date: Date,
    amount: Number,
    previousOutstanding: Number,
    newPrincipal: Number
  },
  { _id: false }
);

const LoanSchema = new Schema(
  {
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    borrower: { type: Schema.Types.ObjectId, ref: "Borrower", required: true },
    product: { type: Schema.Types.ObjectId, ref: "LoanProduct", required: true },

    applicationId: { type: String, trim: true },

    // Financial details
    principal: { type: Number, required: true },
    processingFee: { type: Number, default: 0 },
    gstOnProcessingFee: { type: Number, default: 0 },
    netDisbursed: { type: Number, default: 0 },
    disbursedAmount: { type: Number, default: 0 },

    // Interest and repayment
    interestType: { type: String, enum: ["flat", "reducing", "dailyAPR"] },
    interestRate: { type: Number }, // interpret per interestType
    interestTotal: { type: Number, default: 0 },
    totalPayable: { type: Number, default: 0 },

    // Schedule details
    termMonths: Number,
    termDays: Number,
    installments: Number,
    frequencyDays: Number,
    emi: Number,
    startDate: Date,

    // Status and tracking
    status: {
      type: String,
      enum: [
        "applied",
        "approved",
        "disbursed",
        "active",
        "closed",
        "defaulted",
        "written_off",
        "cancelled"
      ],
      default: "applied"
    },
    repaymentFrequency: { type: String, enum: ["monthly", "weekly", "daily"] },
    scheduleGenerated: { type: Boolean, default: false },
    nextDueDate: Date,
    outstandingPrincipal: { type: Number, default: 0 },
    outstandingInterest: { type: Number, default: 0 },

    // Charges and penalties
    charges: {
      bounce: { type: Number, default: 0 },
      fieldVisit: { type: Number, default: 0 },
      legal: { type: Number, default: 0 },
      processing: { type: Number, default: 0 }
    },
    chargesHistory: [ChargeHistorySchema],

    // Legal case tracking
    legal: LegalSchema,

    // Top-up history
    topups: [TopupSchema],

    instalments: [{ type: Schema.Types.ObjectId, ref: "Instalment" }],

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    disbursedBy: { type: Schema.Types.ObjectId, ref: "User" },

    tags: [{ type: String, trim: true }],

    appliedAt: Date,
    approvedAt: Date,
    disbursedAt: Date,
    closedAt: Date,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { minimize: false }
);

// Indexes
LoanSchema.index({ borrower: 1 });
LoanSchema.index({ branch: 1 });
LoanSchema.index({ status: 1 });
LoanSchema.index({ branch: 1, status: 1 });

module.exports = mongoose.model("Loan", LoanSchema);