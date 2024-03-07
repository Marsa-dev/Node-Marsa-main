const router = require("express").Router();

const authorization = require("../middlewares/authorization");
const { upload } = require("../util/uploads");

const {
  // createBoat,
  getSlider,
  getBoats,
  getById,
  changeSlider,
  getBoatsPublic,
  deleteBoat,
  createProfile,
  activeInactiveBoat,
  getBoatOnwerDetail,
} = require("../controllers/boat.controller");
const authenticationMiddlware = require("../middlewares/auth");

router.get("/getSlider", getSlider);
router.get("/public", getBoatsPublic);
router.get("/:id", getById);
router.get("/owner/:id", getBoatOnwerDetail);

router.post("/register", authenticationMiddlware, upload.any(), createProfile);

router.get("/", authenticationMiddlware, authorization, getBoats);
router.delete("/:id", authenticationMiddlware, authorization, deleteBoat);
router.post(
  "/activeInactiveBoat/:id",
  authenticationMiddlware,
  authorization,
  activeInactiveBoat
);
router.post(
  "/slider/:id",
  authenticationMiddlware,
  authorization,
  changeSlider
);

module.exports = router;
