const mongoose = require("mongoose");
const User = require("../models/User");
const presence = require("../services/presence");

// GET /api/users/search?q=...
async function searchUsers(req, res) {
  const q = (req.query.q || "").trim();
  const filter = { _id: { $ne: req.user._id } };
  if (q) filter.nickname = { $regex: q, $options: "i" };
  const users = await User.find(filter).sort({ nickname: 1 }).limit(20);
  res.json(
    users.map((u) => ({
      userId: u._id,
      nickname: u.nickname,
      avatar: u.avatar,
      online: presence.isOnline(String(u._id)),
    })),
  );
}

// GET /api/users/:id
async function getUserById(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "INVALID_ID" });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "NOT_FOUND" });
  res.json({ userId: user._id, nickname: user.nickname, avatar: user.avatar });
}

// GET /api/users/me -> the caller's own profile (identified by x-user-id).
async function getMe(req, res) {
  const u = req.user;
  res.json({
    userId: u._id,
    nickname: u.nickname,
    avatar: u.avatar,
    theme: u.theme,
  });
}

async function updateMe(req, res) {
  const update = {};

  if (req.body?.nickname !== undefined) {
    const nickname = String(req.body.nickname).trim();
    if (!nickname || nickname.length > 30) {
      return res.status(400).json({ error: "INVALID_NICKNAME" });
    }
    update.nickname = nickname;
  }

  if (req.body?.theme !== undefined) {
    if (!["light", "dark"].includes(req.body.theme)) {
      return res.status(400).json({ error: "INVALID_THEME" });
    }
    update.theme = req.body.theme;
  }

  if (req.file) {
    update.avatar = `/uploads/avatars/${req.file.filename}`;
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: update },
    { new: true },
  );
  res.json({
    userId: user._id,
    nickname: user.nickname,
    avatar: user.avatar,
    theme: user.theme,
  });
}

module.exports = { searchUsers, getUserById, getMe, updateMe };
