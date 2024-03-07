const router = require("express").Router();
const authenticationMiddlware = require("../middlewares/auth");

const {
  createPayment,
  paymentCallBack,
  getwalletbyMonth,
  getWalletBytoday,
  getWalletByYear,
  createPaymentIntent,
} = require("../controllers/payment.controller");

router.post("/", authenticationMiddlware, createPayment);
router.post("/intent", authenticationMiddlware, createPaymentIntent);
router.get("/callback", paymentCallBack);
router.get("/getwalletbyMonth", authenticationMiddlware, getwalletbyMonth);
router.get("/getWalletBytoday", authenticationMiddlware, getWalletBytoday);
router.get("/getWalletByYear", authenticationMiddlware, getWalletByYear);

module.exports = router;
