const mongoose = require("mongoose");
const { Schema } = mongoose;

const InstalmentChargeSchema = new Schema(
  {
    type: String, // bounce, field_visit, penalty_payment
    amount: Number,
    date: Date,
    description: String
  },
  { _id: false }
);

const InstalmentSchema = new Schema(
  {
    loan: { type: Schema.Types.ObjectId, ref: "Loan", required: true },
    installmentNo: { type: Number, required: true },

    dueDate: { type: Date, required: true },

    // Due amounts (original schedule)
    principalDue: { type: Number, default: 0 },
    interestDue: { type: Number, default: 0 },
    penaltyDue: { type: Number, default: 0 },
    totalDue: { type: Number, default: 0 },

    // Remaining amounts (after payments)
    principalComponent: { type: Number, default: 0 },
    interestComponent: { type: Number, default: 0 },
    penaltyComponent: { type: Number, default: 0 },

    outstandingPrincipal: { type: Number, default: 0 },

    // Payment tracking
    totalPaid: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "partial", "paid", "overdue"],
      default: "pending"
    },
    paidAt: { type: Date },

    // Additional charges
    charges: [InstalmentChargeSchema],

    // Overdue tracking
    overdueDays: { type: Number, default: 0 },
    lastPenaltyCalculated: { type: Date },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { minimize: false }
);

// Indexes
InstalmentSchema.index({ loan: 1, installmentNo: 1 }, { unique: true });
InstalmentSchema.index({ loan: 1, dueDate: 1 });
InstalmentSchema.index({ status: 1 });
InstalmentSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model("Instalment", InstalmentSchema);