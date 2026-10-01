const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 30,
  },
  avatar: { type: String, default: null }, // server path like /uploads/avatars/avatar-123.png
  theme: { type: String, enum: ["light", "dark"], default: "light" },
  lastSeenAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

userSchema.index({ nickname: 1 });

module.exports = mongoose.model("User", userSchema);
