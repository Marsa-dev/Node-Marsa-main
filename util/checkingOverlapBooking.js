const BookingModel = require("../models/booking.model");

const checkingOverlaping = async (bookingStartTime, bookingEndTime, boatId) => {
  return await BookingModel.find({
    boatId: boatId, // Bookings for the same boat
    $or: [{ status: "accepted" }, { status: "paid" }],
    $or: [
      // Check for overlapping time intervals
      {
        bookingStartTime: { $lt: bookingEndTime },
        bookingEndTime: { $gt: bookingStartTime },
      },
      // Check if the new booking is entirely within an existing one
      {
        bookingStartTime: { $gte: bookingStartTime },
        bookingEndTime: { $lte: bookingEndTime },
      },
    ],
  });
};

module.exports = checkingOverlaping;
