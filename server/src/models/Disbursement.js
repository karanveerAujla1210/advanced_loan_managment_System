const mongoose = require("mongoose");
const { Schema } = mongoose;

const BankDetailsSchema = new Schema(
  {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String
  },
  { _id: false }
);

const ChequeDetailsSchema = new Schema(
  {
    chequeNumber: String,
    bankName: String,
    chequeDate: Date
  },
  { _id: false }
);

const DisbursementDocumentSchema = new Schema(
  {
    type: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const DisbursementSchema = new Schema(
  {
    disbursementId: { type: String, unique: true, required: true },

    loanId: { type: Schema.Types.ObjectId, ref: "Loan", required: true },
    borrowerId: { type: Schema.Types.ObjectId, ref: "Borrower", required: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true },

    disbursementAmount: { type: Number, required: true },
    disbursementDate: { type: Date, default: Date.now },

    disbursementMethod: {
      type: String,
      enum: ["CASH", "CHEQUE", "BANK_TRANSFER", "UPI", "NEFT", "RTGS"]
    },

    bankDetails: BankDetailsSchema,
    chequeDetails: ChequeDetailsSchema,

    disbursedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },

    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"],
      default: "PENDING"
    },

    transactionId: String,
    referenceNumber: String,

    processingFee: { type: Number, default: 0 },
    netDisbursementAmount: { type: Number, default: 0 },

    remarks: String,

    documents: [DisbursementDocumentSchema],

    failureReason: String,
    retryCount: { type: Number, default: 0 },
    lastRetryAt: Date,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { minimize: false }
);

// Indexes
DisbursementSchema.index({ disbursementId: 1 }, { unique: true });
DisbursementSchema.index({ loanId: 1 });
DisbursementSchema.index({ borrowerId: 1 });
DisbursementSchema.index({ disbursementDate: 1 });
DisbursementSchema.index({ status: 1 });
DisbursementSchema.index({ disbursedBy: 1 });

module.exports = mongoose.model("Disbursement", DisbursementSchema);