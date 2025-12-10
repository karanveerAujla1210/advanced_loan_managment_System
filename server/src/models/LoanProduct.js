const mongoose = require("mongoose");
const { Schema } = mongoose;

const FeeSchema = new Schema(
  {
    type: String,    // processing, insurance, late
    amount: Number,
    percent: Number
  },
  { _id: false }
);

const LoanProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, unique: true, required: true, trim: true },
    description: { type: String },

    interestRate: { type: Number, required: true }, // interpret based on interestType
    interestType: { type: String, enum: ["flat", "reducing"], required: true },

    defaultTermMonths: { type: Number },
    frequency: { type: String, enum: ["monthly", "weekly", "daily"] },

    fees: [FeeSchema],

    active: { type: Boolean, default: true },

    createdAt: { type: Date, default: Date.now }
  },
  { minimize: false }
);

// Index
LoanProductSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model("LoanProduct", LoanProductSchema);
