const router = require("express").Router();
const authorization = require("../middlewares/authorization");
const authenticationMiddlware = require("../middlewares/auth");
const {
  createBooking,
  addContact,
  currentBookings,
  pastBookings,
  acceptRejectBooking,
  getOwnerBookings,
  getBookingDate,
  getBookingById,
  getAllBookings,
} = require("../controllers/booking.controller");

// customer routes
router.post("/", createBooking);
router.post("/contant", addContact);
router.get("/current", currentBookings);
router.get("/past", pastBookings);

// owner routes
router.post("/accept/reject", acceptRejectBooking);
router.get("/owner", getOwnerBookings);
router.get("/date", getBookingDate);

//Admin routes
router.get(
  "/:id",
  authenticationMiddlware,
  authorization,

  getBookingById
);
router.get(
  "/all/bookings",
  authenticationMiddlware,
  authorization,
  getAllBookings
);

module.exports = router;
