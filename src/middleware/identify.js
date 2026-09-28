const mongoose = require('mongoose');
const User = require('../models/User');

// There is no real authentication. Every request after guest creation must
// carry the guest's userId in the "x-user-id" header. We only check that the
// id is well-formed and that a User document with that id actually exists.
async function identify(req, res, next) {
  const userId = req.header('x-user-id');
  if (!userId || !mongoose.isValidObjectId(userId)) {
    return res.status(401).json({ error: 'MISSING_USER_ID' });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(401).json({ error: 'GUEST_NOT_FOUND' });
  }
  req.user = user;
  next();
}

module.exports = identify;
