const router = require("express").Router();

const authorization = require("../middlewares/authorization");
const authenticationMiddlware = require("../middlewares/auth");

const {
  createActivity,
  getActivity,
  deleteActivity,
  updateActivity,
  getActivityById,
} = require("../controllers/activity.controller");

router.get("/", getActivity);
router.get("/:id", getActivityById);

router.post("/", authenticationMiddlware, authorization, createActivity);
router.delete("/:id", authenticationMiddlware, authorization, deleteActivity);
router.patch("/:id", authenticationMiddlware, authorization, updateActivity);

module.exports = router;
