const router = require("express").Router();

const authorization = require("../middlewares/authorization");
const authenticationMiddlware = require("../middlewares/auth");
const {
  addPrivacyAndTerm,
  getPrivacyTerms,
} = require("../controllers/privacyAndTerm.controller");

router.post("/", authenticationMiddlware, authorization, addPrivacyAndTerm);
router.get("/", getPrivacyTerms);

module.exports = router;
