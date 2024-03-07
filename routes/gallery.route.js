const router = require("express").Router();

const {
  addGallery,
  deleteGallery,
  getGallery,
} = require("../controllers/gallery.controller");
const authenticationMiddlware = require("../middlewares/auth");
const authorization = require("../middlewares/authorization");
const { upload } = require("../util/uploads");

router.get("/", getGallery);

router.post(
  "/",
  authenticationMiddlware,
  authorization,
  upload.single("image"),
  addGallery
);
router.delete("/:id", authenticationMiddlware, authorization, deleteGallery);
module.exports = router;
