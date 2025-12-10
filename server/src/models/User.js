const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    username: { type: String, unique: true, required: true, trim: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },

    role: {
      type: String,
      enum: ["ADMIN", "MANAGER", "COUNSELLOR", "ADVISOR", "OPERATION", "COLLECTION", "LEGAL"],
      required: true
    },

    branch: { type: Schema.Types.ObjectId, ref: "Branch" },

    active: { type: Boolean, default: true },
    lastLogin: { type: Date },

    createdAt: { type: Date, default: Date.now }
  },
  { minimize: false }
);

// Indexes
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ branch: 1 });

module.exports = mongoose.model("User", UserSchema);
