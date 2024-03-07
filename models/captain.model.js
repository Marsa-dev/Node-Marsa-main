const mongoose = require("mongoose");

const captainSchema = new mongoose.Schema(
  {
    fullName: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    credential: String,
    issueDate: String,
    expireDate: String,
    licenseImage: [],
    boatId: {
      type: mongoose.Types.ObjectId,
      ref: "boatSchema",
      required: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("captainSchema", captainSchema);
