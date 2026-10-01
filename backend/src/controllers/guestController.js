const User = require("../models/User");

async function createGuest(req, res) {
  const nickname = (req.body?.nickname || "").trim();
  if (!nickname || nickname.length > 30) {
    return res.status(400).json({ error: "INVALID_NICKNAME" });
  }
  const user = await User.create({ nickname });
  res
    .status(201)
    .json({ userId: user._id, nickname: user.nickname, theme: user.theme });
}

module.exports = { createGuest };
