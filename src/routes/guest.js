const express = require('express');
const User = require('../models/User');

const router = express.Router();

// POST /api/guest { nickname } -> creates a new guest 
router.post('/', async (req, res) => {
  const nickname = (req.body?.nickname || '').trim();
  if (!nickname || nickname.length > 30) {
    return res.status(400).json({ error: 'INVALID_NICKNAME' });
  }
  const user = await User.create({ nickname });
  res.status(201).json({ userId: user._id, nickname: user.nickname });
});

module.exports = router;
