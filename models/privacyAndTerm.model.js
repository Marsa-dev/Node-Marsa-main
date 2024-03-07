const mongoose = require("mongoose");

const privacyTermSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      unique: true,
      required: true,
      default: "privacy_terms",
    },
    privacyPolicy: {
      type: String,
    },
    termsCondition: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("privacyTerms", privacyTermSchema);
