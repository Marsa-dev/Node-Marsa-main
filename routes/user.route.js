const router = require("express").Router();

const {
  updateProfile,
  me,
  all,
  activeInactiveUser,
  wishList,
  getWishlist,
  disableAccount,
} = require("../controllers/user.controller");

const authorization = require("../middlewares/authorization");
const { upload } = require("../util/uploads");

router.patch("/update", upload.single("profilePic"), updateProfile);
router.get("/me", me);
router.post("/wishList", wishList);
router.get("/wishList", getWishlist);

// admin routes
router.get("/all", authorization, all);
router.post("/activeInactiveUser", authorization, activeInactiveUser);
router.patch("/disableAccount", disableAccount);

module.exports = router;
