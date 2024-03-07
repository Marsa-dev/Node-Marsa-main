const router = require("express").Router();

const authorization = require("../middlewares/authorization");
const authenticationMiddlware = require("../middlewares/auth");
const {
  addDestination,
  getDestinations,
  getDestination,
  updateDestination,
  deleteDestination,
} = require("../controllers/destination.controller");
const { upload } = require("../util/uploads");

router.get("/", getDestinations);
router.get("/:id", getDestination);

router.post(
  "/",
  authenticationMiddlware,
  authorization,
  upload.single("image"),
  addDestination
);

router.patch(
  "/:id",
  authenticationMiddlware,
  authorization,
  upload.none(),
  updateDestination
);
router.delete(
  "/:id",
  authenticationMiddlware,
  authorization,
  upload.none(),
  deleteDestination
);

module.exports = router;
