const mongoose = require("mongoose");

const boatSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    craftName: String,
    waterCraftType: String,
    guestCapicty: Number,
    rentPerHour: Number,
    lat: Number,
    lng: Number,
    description: String,
    minHour: Number,
    maxHour: Number,
    images: [],
    boatType: String,
    loa: Number,
    status: { type: Boolean, default: false },
    typeOfCraftType: [],
    isSlider: { type: Boolean, default: false },
    permanentDeleted: { type: Boolean, default: false },
    experience: { type: String },
    resume: { type: String },
    isMain: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("boatSchema", boatSchema);
