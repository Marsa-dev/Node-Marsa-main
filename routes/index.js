const router = require("express").Router();

const emailLowerCase = require("../middlewares/email-lowercase");
const authenticationMiddlware = require("../middlewares/auth");

router.use("/auth", emailLowerCase, require("./auth.route"));
router.use("/user", authenticationMiddlware, require("./user.route"));
router.use("/booking", authenticationMiddlware, require("./booking.route"));
router.use("/boat", require("./boat.route"));
router.use("/destination", require("./destination.route"));
router.use("/activity", require("./activities.route"));
router.use("/gallery", require("./gallery.route"));
router.use("/captain", require("./captain.route"));
router.use("/privacy-term", require("./privacyAndTerm.route"));
router.use("/payment", require("./payment.route"));

module.exports = router;
