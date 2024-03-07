const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String },
  intentId: { type: String },
  bookingId: {
    type: mongoose.Types.ObjectId,
    ref: "bookingSchema",
  },
  amount: String,
  status: String,
  userId: { type: mongoose.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("payment", paymentSchema);
