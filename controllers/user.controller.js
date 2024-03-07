const { NotFoundError, BadRequestError } = require("../errors");
const UserModel = require("../models/user.model");
const BoatModel = require("../models/boat.model");
const BookingModel = require("../models/booking.model");

exports.updateProfile = async (req, res) => {
  let { _id, fullName, profilePic } = req.user;
  if (req.body.fullName) {
    fullName = req.body.fullName;
  }
  if (req.file) {
    profilePic = "/" + req.file.path;
  }
  await UserModel.findByIdAndUpdate(_id, {
    fullName,
    profilePic,
  });
  const updatedUser = await UserModel.findById(_id).select(
    "-password -setNewPwd"
  );
  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
};

exports.me = async (req, res) => {
  const boats = await BoatModel.find({
    vendorId: req.user._id,
  });
  const mainBoat = boats.find((boat) => boat.isMain === true);
  let bookingCount = 0;
  if (mainBoat) {
    const boatIds = boats.map((boat) => boat._id);
    const bookings = await BookingModel.find({ boatId: { $in: boatIds } });
    bookingCount = bookings.length;
  }
  // req.user.bookingCount = bookingCount;
  res.status(200).json({
    success: true,
    data: {
      ...req.user._doc,
      bookingCount,
      experience: mainBoat ? mainBoat.experience : null,
      boatCount: boats.length,
    },
  });
};

exports.all = async (req, res) => {
  const users = await UserModel.find({ role: { $ne: "admin" } })
    .select("-password -setNewPwd")
    .sort({
      createdAt: -1,
    });

  return res.status(200).json({ success: true, data: users });
};

exports.activeInactiveUser = async (req, res) => {
  const { id } = req.body;

  const user = await UserModel.findById(id);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  await UserModel.findByIdAndUpdate(user._id, { blocked: !user.blocked });

  return res
    .status(200)
    .json({ success: true, message: "Updated successfully" });
};

exports.wishList = async (req, res) => {
  const { wishlist } = req.user;
  const { id } = req.body;
  const find = await BoatModel.findById(id);
  if (!find) {
    throw new NotFoundError("Not Found");
  }

  const findBoat = wishlist.find((item) => item.toString() === id.toString());
  let message;
  if (findBoat) {
    await UserModel.findByIdAndUpdate(req.user._id, {
      $pull: { wishlist: id },
    });
    message = "Boat Remove From Wishlist";
  } else {
    await UserModel.findByIdAndUpdate(req.user._id, {
      $addToSet: { wishlist: id },
    });
    message = "Boat Added to Wishlist";
  }
  const user = await UserModel.findById(req.user._id).select(
    "-password -setNewPwd"
  );

  return res.status(200).json({ success: true, message, data: user });
};

exports.getWishlist = async (req, res) => {
  const { user } = req;
  await user.populate("wishlist");
  return res.status(200).json({ success: true, data: user.wishlist });
};

exports.disableAccount = async (req, res) => {
  const id = req.user._id;
  const check = await UserModel.findById(id);
  if (!check) {
    throw new BadRequestError("No User Found");
  }
  await UserModel.findOneAndUpdate(
    { _id: id },
    { blocked: true },
    { new: true }
  );
  return res
    .status(200)
    .json({ success: true, message: "Your Account has Been Disable" });
};
