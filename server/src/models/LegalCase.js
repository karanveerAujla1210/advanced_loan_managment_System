const mongoose = require("mongoose");
const { Schema } = mongoose;

const NoticeSchema = new Schema(
  {
    type: String,
    date: Date,
    fileRef: String
  },
  { _id: false }
);

const CourtDateSchema = new Schema(
  {
    date: Date,
    notes: String
  },
  { _id: false }
);

const SettlementOfferSchema = new Schema(
  {
    amount: Number,
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    date: Date
  },
  { _id: false }
);

const LegalCaseSchema = new Schema(
  {
    loan: { type: Schema.Types.ObjectId, ref: "Loan", required: true },
    borrower: { type: Schema.Types.ObjectId, ref: "Borrower", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },

    stage: {
      type: String,
      enum: ["notice_sent", "case_filed", "court", "settled", "written_off"],
      default: "notice_sent"
    },

    notices: [NoticeSchema],
    assignedLawyer: { type: Schema.Types.ObjectId, ref: "User" },

    courtDates: [CourtDateSchema],

    settlementOffer: SettlementOfferSchema,

    createdAt: { type: Date, default: Date.now }
  },
  { minimize: false }
);

// Indexes
LegalCaseSchema.index({ loan: 1 });
LegalCaseSchema.index({ stage: 1 });

module.exports = mongoose.model("LegalCase", LegalCaseSchema);
