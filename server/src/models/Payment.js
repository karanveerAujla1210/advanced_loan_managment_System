const mongoose = require("mongoose");
const { Schema } = mongoose;

const PaymentSchema = new Schema(
  {
    loan: { type: Schema.Types.ObjectId, ref: "Loan", required: true },
    instalment: { type: Schema.Types.ObjectId, ref: "Instalment" },
    borrower: { type: Schema.Types.ObjectId, ref: "Borrower" },

    amount: { type: Number, required: true },

    mode: {
      type: String,
      enum: ["cash", "bank", "upi", "cheque"],
      required: true
    },

    reference: { type: String },

    collectedBy: { type: Schema.Types.ObjectId, ref: "User" },
    collectedAt: { type: Date, default: Date.now },

    branch: { type: Schema.Types.ObjectId, ref: "Branch" },

    notes: { type: String },

    createdAt: { type: Date, default: Date.now }
  },
  { minimize: false }
);

// Indexes
PaymentSchema.index({ loan: 1 });
PaymentSchema.index({ collectedAt: 1 });
PaymentSchema.index({ reference: 1 });

module.exports = mongoose.model("Payment", PaymentSchema);
