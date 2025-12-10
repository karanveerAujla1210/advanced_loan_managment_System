const mongoose = require("mongoose");
const { Schema } = mongoose;

const AddressSchema = new Schema(
  {
    line1: String,
    line2: String,
    city: String,
    pincode: String,
    state: String
  },
  { _id: false }
);

const KycDocSchema = new Schema(
  {
    number: String,
    status: String,
    fileRef: String
  },
  { _id: false }
);

const OtherDocSchema = new Schema(
  {
    type: String,
    fileRef: String,
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const BankAccountSchema = new Schema(
  {
    ifsc: String,
    accNumberMasked: String,
    verified: { type: Boolean, default: false }
  },
  { _id: false }
);

const BorrowerSchema = new Schema(
  {
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },

    phone: { type: String, unique: true, required: true, trim: true },
    email: { type: String, trim: true },

    dob: { type: Date },
    gender: { type: String }, // optional enum later

    address: AddressSchema,

    kyc: {
      aadhaar: KycDocSchema,
      pan: KycDocSchema,
      otherDocs: [OtherDocSchema]
    },

    bankAccounts: [BankAccountSchema],

    riskScore: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { minimize: false }
);

// Indexes
BorrowerSchema.index({ phone: 1 }, { unique: true });
BorrowerSchema.index({ branch: 1 });

module.exports = mongoose.model("Borrower", BorrowerSchema);
