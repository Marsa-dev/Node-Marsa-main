const { NotBeforeError } = require("jsonwebtoken");
const { BadRequestError } = require("../errors");
const GalleryModel = require("../models/gallery.model");

exports.addGallery = async (req, res) => {
  if (!req.file) {
    throw new BadRequestError("Please provide a image file");
  }
  const gallery = await GalleryModel.create({ image: "/" + req.file.path });

  return res.status(200).json({ success: true, data: gallery });
};

exports.getGallery = async (req, res) => {
  const galleries = await GalleryModel.find({}).sort({ createdAt: -1 });

  return res.status(200).json({ success: true, data: galleries });
};

exports.deleteGallery = async (req, res) => {
  const gallery = await GalleryModel.findByIdAndRemove(req.params.id);
  if (!gallery) {
    throw new NotBeforeError("Image not found");
  }

  return res.status(200).json({ success: true, message: "Image deleted" });
};
