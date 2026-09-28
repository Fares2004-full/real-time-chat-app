const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const identify = require("../middleware/identify");
const presence = require("../services/presence");
const uploadImage =  require("../middleware/uploadImage");


const router = express.Router();

// GET /api/users/search?q=... search for users by nickname (case-insensitive, partial match)
router.get("/search", identify, async (req, res) => {
  const q = (req.query.q || "").trim();
  const filter = { _id: { $ne: req.user._id } };
  if (q) filter.nickname = { $regex: q, $options: "i" }; // options case insensitive
  const users = await User.find(filter).sort({ nickname: 1 }).limit(20);
  res.json(
    users.map((u) => ({
      userId: u._id,
      nickname: u.nickname,
      online: presence.isOnline(String(u._id)),
    })),
  );
});


router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "INVALID_ID" });
  }
  const user = await User.findById(req.params.id);
  console.log(user)
  if (!user) return res.status(404).json({ error: "NOT_FOUND" });
  res.json({ userId: user._id, nickname: user.nickname });
});

router.patch("/:id", uploadImage().single("avatar"), async (req, res) => {
  const id = req.params.id;
    const avatar = req.file ? req.file.path : undefined;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "INVALID_ID" });
  }
  const user = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        avatar,
      },
    },
    { returnDocument: "after"},
  );
  if (!user) return res.status(404).json({ error: "NOT_FOUND" });
   console.log("req.file ===> ", req.file);

res.json({ status: "OK", data: user });});


module.exports = router;
