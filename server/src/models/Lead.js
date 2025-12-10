const mongoose = require("mongoose");
const { Schema } = mongoose;

const LeadNoteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    text: String,
    date: { type: Date, default: Date.now }
  },
  { _id: false }
);

const LeadSchema = new Schema(
  {
    branch: { type: Schema.Types.ObjectId, ref: "Branch" },

    source: { type: String }, // campaign, walkin, referral, online
    name: { type: String },
    phone: { type: String },
    email: { type: String },

    status: {
      type: String,
      enum: ["new", "contacted", "converted", "lost"],
      default: "new"
    },

    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },

    notes: [LeadNoteSchema],

    createdAt: { type: Date, default: Date.now }
  },
  { minimize: false }
);

// Indexes
LeadSchema.index({ phone: 1 });
LeadSchema.index({ status: 1 });
LeadSchema.index({ assignedTo: 1 });

module.exports = mongoose.model("Lead", LeadSchema);
