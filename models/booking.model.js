const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User" },
    destination: { type: mongoose.Types.ObjectId, ref: "destinationSchema" },
    activites: [{ type: mongoose.Types.ObjectId, ref: "activitySchema" }],
    // date: Date,
    // timeFrom: String,
    // timeTo: String,
    bookingStartTime: Date,
    bookingEndTime: Date,
    guestNo: Number,
    hours: Number,
    comment: String,
    latitude: String,
    longitude: String,
    name: String,
    email: String,
    phoneNo: String,
    totalAmount: Number,
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "rejected", "paid"],
      default: "pending",
    },
    boatId: {
      type: mongoose.Types.ObjectId,
      ref: "boatSchema",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("bookingSchema", bookingSchema);
