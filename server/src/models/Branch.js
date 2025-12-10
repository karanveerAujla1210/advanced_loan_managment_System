const mongoose = require("mongoose");
const { Schema } = mongoose;

const BranchSchema = new Schema(
  {
    code: { type: String, unique: true, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    manager: { type: Schema.Types.ObjectId, ref: "User" },
    timezone: { type: String, default: "Asia/Kolkata" }
  },
  { timestamps: true }
);

// Indexes
BranchSchema.index({ code: 1 }, { unique: true });
BranchSchema.index({ manager: 1 });

module.exports = mongoose.model("Branch", BranchSchema);
