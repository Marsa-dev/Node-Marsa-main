const { NotFoundError, BadRequestError, ForbiddenError } = require("../errors");
const BookingModel = require("../models/booking.model");
const DestinationModel = require("../models/destination.model");
const BoatModel = require("../models/boat.model");
const calculateHoursDifference = require("../util/calculateTimeDifference");
const calculateActivitiesAmount = require("../util/calculateActivityAmount");
const checkingOverlaping = require("../util/checkingOverlapBooking");

exports.createBooking = async (req, res) => {
  const { destination, activites, boatId } = req.body;

  const findDestination = await DestinationModel.findById(destination);
  if (!findDestination) {
    throw new NotFoundError("Destination not found.");
  }

  const findBoat = await BoatModel.findById(boatId);
  if (!findBoat) {
    throw new NotFoundError("Boat not Found.");
  }

  const activitiesAmount = await calculateActivitiesAmount(activites);

  let { bookingStartTime, bookingEndTime, guestNo, comment, totalAmount } =
    req.body;

  // checking date difference
  const startTime = new Date(bookingStartTime);
  const endTime = new Date(bookingEndTime);

  // Calculate the time difference in milliseconds
  const hours = calculateHoursDifference(startTime, endTime);

  if (hours < findBoat.minHour || hours > findBoat.maxHour) {
    throw new BadRequestError(
      `The maximum and minimum hour of a boat is ${findBoat.minHour}hrs-${findBoat.maxHour}`
    );
  }

  const amount = hours * findBoat.rentPerHour + activitiesAmount;

  if (parseInt(amount) !== parseInt(totalAmount)) {
    throw new BadRequestError("Total Amount doesnot match");
  }

  // checking guest capacity
  if (guestNo > findBoat.guestCapicty) {
    throw new BadRequestError("Guests no. exceeding the limit.");
  }

  const overlapBookings = await checkingOverlaping(
    bookingStartTime,
    bookingEndTime,
    boatId
  );
  if (overlapBookings.length > 0) {
    throw new BadRequestError("Chosen time slot is not available.");
  }

  const booking = await BookingModel.create({
    destination,
    activites,
    boatId,
    bookingStartTime,
    bookingEndTime,
    guestNo,
    comment,
    totalAmount,
    userId: req.user._id,
    hours,
  });

  return res.status(200).json({
    success: true,
    message: "Booking created successfully.",
    data: booking,
  });
};

exports.addContact = async (req, res) => {
  const { id } = req.body;

  const findBooking = await BookingModel.findById(id);

  if (!findBooking) {
    throw new NotFoundError("Booking not found.");
  }
  const { name, email, phoneNo } = req.body;
  if (!name || !email || !phoneNo) {
    throw new BadRequestError("Please provide all required fields.");
  }
  findBooking.name = name;
  findBooking.email = email;
  findBooking.phoneNo = phoneNo;
  await findBooking.save();

  return res
    .status(200)
    .json({ success: true, message: "Booking created successfully." });
};

exports.currentBookings = async (req, res) => {
  const bookings = await BookingModel.find({
    userId: req.user._id,
    $or: [
      // { status: "pending" },
      // { status: "accepted" },
      { bookingStartTime: { $gte: new Date() } },
      { bookingEndTime: { $gte: new Date() } },
    ],
  }).populate("destination activites boatId");

  return res.status(200).json({ success: true, data: bookings });
};

exports.pastBookings = async (req, res) => {
  const bookings = await BookingModel.find({
    userId: req.user._id,
    $or: [
      // { status: "completed" },
      // { status: "rejected" },
      { bookingStartTime: { $lt: new Date() } },
      { bookingEndTime: { $lt: new Date() } },
    ],
  }).populate("destination activites boatId");

  return res.status(200).json({ success: true, data: bookings });
};

exports.acceptRejectBooking = async (req, res) => {
  const { id, status } = req.body;

  const findBooking = await BookingModel.findById(id).populate(
    "boatId",
    "vendorId"
  );
  if (!findBooking) {
    throw new NotFoundError("Booking not Found.");
  }
  if (
    findBooking?.boatId?.vendorId?.toString() !== req?.user?._id?.toString()
  ) {
    throw new ForbiddenError(
      "You don't have permission to perform this action."
    );
  }
  if (findBooking.status !== "pending") {
    throw new BadRequestError(`Booking is already ${findBooking.status}`);
  }

  const validStatus = ["accepted", "rejected"];
  if (!validStatus.includes(status)) {
    throw new BadRequestError("Status should be only accepted or rejected.");
  }
  if (status === "accepted") {
    findBooking.latitude = req.body.latitude;
    findBooking.longitude = req.body.longitude;
  }
  console.log(req.body);
  findBooking.status = status;
  await findBooking.save();

  res.status(200).json({ success: true, message: `Booking ${status}.` });
};

exports.getOwnerBookings = async (req, res) => {
  const vendorId = req.user._id;

  const mainBoat = await BoatModel.findOne({
    vendorId,
    isMain: true,
  });

  if (!mainBoat) {
    throw new BadRequestError("Please create boat.");
  }

  const bookings = await BookingModel.find({ boatId: mainBoat._id }).populate(
    "destination activites boatId"
  );

  return res.status(200).json({ success: true, data: bookings });
};

exports.getBookingDate = async (req, res) => {
  const { _id } = req.user._id;

  const findBoat = await BoatModel.findOne({ vendorId: _id, isMain: true });

  if (!findBoat) {
    throw new BadRequestError("No boat found.");
  }

  const bookingDatesWithTime = await BookingModel.find({
    boatId: findBoat._id,
  }).distinct("bookingStartTime");

  // Convert timestamps to dates without time
  const bookingDatesWithoutTime = bookingDatesWithTime.map(
    (bookingStartTime) => {
      const date = new Date(bookingStartTime);
      date.setHours(0, 0, 0, 0); // Set the time to midnight
      return date.toISOString(); // Convert it back to a string
    }
  );

  // Filter out duplicates
  const uniqueBookingDates = [...new Set(bookingDatesWithoutTime)];

  return res.status(200).json({ success: true, data: uniqueBookingDates });
};

exports.getBookingById = async (req, res) => {
  const { id } = req.params;

  const find = await BookingModel.findById(id)
    .populate({
      path: "userId",
      select: "-password -setNewPwd -_id -role -createdAt -updatedAt",
    })
    .populate({ path: "boatId", select: "-permanentDeleted" });

  if (!find) {
    throw new BadRequestError("No Booking found");
  }

  return res.status(200).json({ success: false, data: find });
};

exports.getAllBookings = async (req, res) => {
  const bookings = await BookingModel.find({}).sort("-1");
  return res.status(200).json({ success: true, data: bookings });
};
