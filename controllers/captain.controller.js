const { BadRequestError } = require("../errors");
const CaptainModel = require("../models/captain.model");

exports.createCaptainProfile = async (req, res) => {
  const {
    fullName,
    AddressLine1,
    AddressLine2,
    city,
    State,
    credential,
    issueDate,
    expireDate,
    boatId,
  } = req.body;
  if (
    !fullName ||
    !AddressLine1 ||
    !AddressLine2 ||
    !city ||
    !State ||
    !credential ||
    !issueDate ||
    !expireDate ||
    !boatId
  ) {
    throw new BadRequestError("fill All Fields");
  }
  if (!req.files || !req.files.length) {
    throw new BadRequestError("No image files uploaded");
  }
  console.log(req.files);

  const licenseImage = req.files.map((file) => "/" + file.path);
  const data = await CaptainModel.create({
    fullName,
    AddressLine1,
    AddressLine2,
    city,
    State,
    credential,
    issueDate,
    expireDate,
    licenseImage,
    boatId,
  });
  return res.status(200).json({ success: true, data });
};

exports.getCaptain = async (req, res) => {
  const { id } = req.params;
  const data = await CaptainModel.findOne({ boatId: id }).populate("boatId");
  if (!data) {
    throw new NotFoundError("No boat found with given id");
  }
  return res.status(200).json({ success: true, data });
};
