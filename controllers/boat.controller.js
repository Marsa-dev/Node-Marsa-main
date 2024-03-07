const { BadRequestError, NotFoundError } = require("../errors");
const BoatModel = require("../models/boat.model");
const CaptainModel = require("../models/captain.model");
const UserModel = require("../models/user.model");
const BookingModel = require("../models/booking.model");

exports.createBoat = async (req, res) => {
  const {
    craftName,
    waterCraftType,
    guestCapicty,
    RentPerHour,
    description,
    minHour,
    maxHour,
    lng,
    lat,
    boatType,
    typeOfCraftType,
  } = req.body;
  if (
    !craftName ||
    !waterCraftType ||
    !guestCapicty ||
    !RentPerHour ||
    !description ||
    !minHour ||
    !maxHour ||
    !boatType ||
    !lat ||
    !lng ||
    !typeOfCraftType
  ) {
    throw new BadRequestError("fill All Fields");
  }
  const Images = req.files.map((file) => "/" + file.path);
  const data = await BoatModel.create({
    vendorId: req.user._id,
    craftName,
    waterCraftType,
    guestCapicty,
    RentPerHour,
    description,
    minHour,
    maxHour,
    lat,
    lng,
    boatType,
    typeOfCraftType,
    Images,
  });
  return res.status(200).json({ success: true, data });
};

exports.getBoats = async (req, res) => {
  const data = await BoatModel.find({ permanentDeleted: false }).sort({
    createdAt: -1,
  });
  return res.status(200).json({ success: true, data });
};

exports.getBoatsPublic = async (req, res) => {
  const data = await BoatModel.find({
    permanentDeleted: false,
    status: true,
  }).sort({
    updatedAt: -1,
  });
  return res.status(200).json({ success: true, data });
};

exports.getSlider = async (req, res) => {
  const sliderData = await BoatModel.find({
    isSlider: true,
    permanentDeleted: false,
    status: true,
  }).sort({
    updatedAt: -1,
  });
  return res.status(200).json({ success: true, data: sliderData });
};

exports.getById = async (req, res) => {
  const { id } = req.params;
  const data = await BoatModel.findById(id).populate(
    "vendorId",
    "fullName profilePic"
  );
  if (!data) {
    throw new NotFoundError("Boat Not Found");
  }
  return res.status(200).json({ success: true, data });
};

exports.changeSlider = async (req, res) => {
  const { id } = req.params;
  const data = await BoatModel.findById(id);
  if (!data) {
    throw new NotFoundError("Boat Not Found");
  }

  const slider = await BoatModel.findByIdAndUpdate(
    { _id: id },
    { isSlider: !data.isSlider },
    { new: true }
  );

  return res
    .status(200)
    .json({ success: true, message: "updated SuccessFully", data: slider });
};

exports.deleteBoat = async (req, res) => {
  const { id } = req.params;
  const data = await BoatModel.findById(id);
  if (!data) {
    throw new NotFoundError("Boat Not Found");
  }

  data.permanentDeleted = true;
  await data.save();

  return res
    .status(200)
    .json({ success: true, message: "Boat deleted successfully" });
};

exports.activeInactiveBoat = async (req, res) => {
  const { id } = req.params;
  const data = await BoatModel.findById(id);
  if (!data) {
    throw new NotFoundError("Boat Not Found");
  }
  data.status = !data.status;
  await data.save();
  return res.status(200).json({
    success: true,
    message: data.status
      ? "Boat active successfully"
      : "Boat inactive successfully",
  });
};

exports.createProfile = async (req, res) => {
  const findBoat = await BoatModel.findOne({
    vendorId: req.user._id,
    isMain: true,
  });
  if (findBoat) {
    throw new BadRequestError("You have already created boat.");
  }
  // console.log(req.files);
  // console.log(req.body);
  const {
    craftName,
    waterCraftType,
    guestCapicty,
    rentPerHour,
    description,
    minHour,
    maxHour,
    boatType,
    typeOfCraftType,
    experience,
    resume,
    loa,
    // fullName,
    // addressLine1,
    // addressLine2,
    // city,
    // state,
    // credential,
    // issueDate,
    // expireDate,
  } = req.body;

  if (
    !craftName ||
    !waterCraftType ||
    !guestCapicty ||
    !rentPerHour ||
    !description ||
    !minHour ||
    !maxHour ||
    !loa ||
    !boatType
  ) {
    throw new BadRequestError("Fill in all required fields.");
  }

  if (!req.files || req.files.length === 0) {
    throw new BadRequestError("No image files uploaded.");
  }

  const boatImages = req.files
    .filter((file) => file.fieldname === "boatImages")
    .map((file) => "/" + file.path);

  const licenseImages = req.files
    .filter((file) => file.fieldname === "licenseImages")
    .map((file) => "/" + file.path);

  if (boatImages.length === 0) {
    throw new BadRequestError("Please provide boat images.");
  }

  if (licenseImages.length < 2) {
    throw new BadRequestError(
      "Please provide both side of picture for licence."
    );
  }

  const boat = await BoatModel.create({
    vendorId: req.user._id,
    craftName,
    waterCraftType,
    guestCapicty,
    rentPerHour,
    description,
    minHour,
    maxHour,
    boatType,
    loa,
    typeOfCraftType,
    images: boatImages,
    experience,
    resume,
    isMain: true,
  });

  const captain = await CaptainModel.create({
    // fullName,
    // addressLine1,
    // addressLine2,
    // city,
    // state,
    // credential,
    // issueDate,
    // expireDate,
    licenseImage: licenseImages,
    boatId: boat._id,
    createdBy: req.user._id,
  });

  return res.status(200).json({ success: true, data: { boat, captain } });
};

exports.getBoatOnwerDetail = async (req, res) => {
  const { id } = req.params;
  const user = await UserModel.findById(id).select("fullName profilePic");
  if (!user) {
    throw new NotFoundError("User not found");
  }
  const bookings = await BookingModel.find({ vendorId: id });

  return res.status(200).json({
    success: true,
    data: {
      fullName: user.fullName,
      profilePic: user.profilePic,
      bookingCount: bookings.length,
    },
  });
};
