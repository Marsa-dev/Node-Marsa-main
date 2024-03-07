const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    activityName: String,
    description: String,
    equipment: [],
    price: Number,
    permanentDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("activitySchema", activitySchema);
