const express = require("express");
const identify = require("../middleware/identify");
const uploadImage = require("../middleware/uploadImage");
const asyncHandler = require("../utils/asyncHandler");
const {
  searchUsers,
  getUserById,
  getMe,
  updateMe,
} = require("../controllers/usersController");

const router = express.Router();

//search and /me must stay above /:id so they are not captured by it.
router.get("/search", identify, asyncHandler(searchUsers)); // ?q=nick
router.get("/me", identify, asyncHandler(getMe)); // my profile
router.patch(
  "/me",
  identify,
  uploadImage().single("avatar"),
  asyncHandler(updateMe),
); // nickname / theme / avatar
router.get("/:id", asyncHandler(getUserById)); // public lookup

module.exports = router;
