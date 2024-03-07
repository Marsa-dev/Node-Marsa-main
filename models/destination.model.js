const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema(
  {
    title: String,
    image: String,
    description: String,
    permanentDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("destinationSchema", destinationSchema);
