const { BadRequestError } = require("../errors");
const PrivacyAndTermModel = require("../models/privacyAndTerm.model");

exports.addPrivacyAndTerm = async (req, res) => {
  const { privacyPolicy, termsCondition } = req.body;
  if (!privacyPolicy || !termsCondition) {
    throw new BadRequestError(
      "Please provide privacy policy and terms condition"
    );
  }
  const privacyTerm = await PrivacyAndTermModel.updateOne(
    { identifier: "privacy_terms" },
    { privacyPolicy, termsCondition },
    { upsert: true }
  );

  return res.status(200).json({ success: true, data: privacyTerm });
};

exports.getPrivacyTerms = async (req, res) => {
  const privacyTerms = await PrivacyAndTermModel.findOne({
    identifier: "privacy_terms",
  });

  return res.status(200).json({ success: true, data: privacyTerms });
};
