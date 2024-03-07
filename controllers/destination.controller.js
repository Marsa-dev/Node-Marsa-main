const { BadRequestError, NotFoundError } = require("../errors");
const DestinationModel = require("../models/destination.model");

exports.addDestination = async (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    throw new BadRequestError("Please provide a title");
  }
  let image;
  if (req.file) {
    image = "/" + req.file.path;
  }
  const destinationData = await DestinationModel.create({
    title,
    image,
    description,
  });

  return res.status(200).json({ success: true, data: destinationData });
};

exports.getDestinations = async (req, res) => {
  const destinations = await DestinationModel.find({
    permanentDeleted: false,
  }).sort({ createdAt: -1 });

  return res.status(200).json({ success: true, data: destinations });
};

exports.getDestination = async (req, res) => {
  const destination = await DestinationModel.findOne({
    _id: req.params.id,
    permanentDeleted: false,
  }).sort({ createdAt: -1 });
  if (!destination) {
    throw new NotFoundError("No destination with given id.");
  }

  return res.status(200).json({ success: true, data: destination });
};

exports.updateDestination = async (req, res) => {
  const destination = await DestinationModel.findOne({
    _id: req.params.id,
    permanentDeleted: false,
  }).sort({ createdAt: -1 });
  if (!destination) {
    throw new NotFoundError("No destination with given id.");
  }
  let title = destination.title;

  if (req.file) {
    destination.image = "/" + req.file.path;
  }
  if (req.body.description) {
    destination.description = req.body.description;
  }
  if (req.body.title) {
    destination.title = req.body.title;

    await destination.save();
    return res
      .status(200)
      .json({ success: true, message: "Destination updated successfully" });
  } else {
    throw new BadRequestError("Please provide a title");
  }
};

exports.deleteDestination = async (req, res) => {
  const destination = await DestinationModel.findOne({
    _id: req.params.id,
    permanentDeleted: false,
  }).sort({ createdAt: -1 });
  if (!destination) {
    throw new NotFoundError("No destination with given id.");
  }

  destination.permanentDeleted = true;
  await destination.save();

  return res
    .status(200)
    .json({ success: true, message: "Destination deleted successfully." });
};
