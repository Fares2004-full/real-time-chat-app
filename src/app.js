const express = require('express');
const cors = require('cors');
const path = require("path")

const guestRoutes = require('./routes/guest');
const usersRoutes = require('./routes/users');
const conversationsRoutes = require('./routes/conversations');

function createApp() {
  const app = express();

app .use("/uploads",express.static(path.join(__dirname,"uploads")))

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
  app.use(express.json());

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api/guest', guestRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/conversations', conversationsRoutes);

  // centralized error handler - assertMember() and friends throw { status, message }.
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'SERVER_ERROR' });
  });

  return app;
}

module.exports = createApp;
