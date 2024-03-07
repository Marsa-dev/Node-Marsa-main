const router = require("express").Router();

const authorization = require("../middlewares/authorization");
const authenticationMiddlware = require("../middlewares/auth");
const { upload } = require("../util/uploads");
const {
  createCaptainProfile,
  getCaptain,
} = require("../controllers/captain.controller");

// router.post("/", upload.array("image"), createCaptainProfile);
router.get("/boat/:id", getCaptain);

module.exports = router;
