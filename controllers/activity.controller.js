const ActivityModel = require("../models/activities.model");
const { BadRequestError } = require("../errors");

exports.createActivity = async (req, res) => {
  const { activityName, description, equipment, price } = req.body;
  if (!activityName || !description || !equipment || !price) {
    throw new BadRequestError("Fill All Required Fields");
  }
  const activity = await ActivityModel.create({
    activityName,
    description,
    equipment,
    price,
  });
  return res.status(200).json({ success: true, activity });
};

exports.getActivity = async (req, res) => {
  const data = await ActivityModel.find({
    permanentDeleted: false,
  });
  return res.status(200).json({ success: true, data });
};

exports.getActivityById = async (req, res) => {
  const { id } = req.params;

  const data = await ActivityModel.findOne({
    _id: id,
    permanentDeleted: false,
  });
  return res.status(200).json({ success: true, data });
};

exports.deleteActivity = async (req, res) => {
  const { id } = req.params;
  await ActivityModel.findByIdAndUpdate(id, { permanentDeleted: true });
  return res.status(200).json({ success: true, message: "Activity Deleted" });
};

exports.updateActivity = async (req, res) => {
  const { id } = req.params;
  const { activityName, description, equipment, price } = req.body;
  if (!activityName || !description || !equipment || !price) {
    throw new BadRequestError("Fill All Required Fields");
  }
  const activity = await ActivityModel.findOneAndUpdate(
    { _id: id },
    {
      activityName,
      description,
      equipment,
      price,
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json({ success: true, activity, message: "Acttivity Updated" });
};
