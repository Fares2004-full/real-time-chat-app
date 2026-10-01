const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const guestRoutes = require("./routes/guest");
const usersRoutes = require("./routes/users");
const conversationsRoutes = require("./routes/conversations");

function createApp() {
  const app = express();

  // const uploadsDir = path.join(process.cwd(), "uploads");
  // fs.mkdirSync(path.join(uploadsDir, "avatars"), { recursive: true });
  // app.use("/uploads", express.static(uploadsDir));

  // app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));// middleware

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
  app.use(express.json());

  app.get("/api/health", (req, res) => res.json({ ok: true }));
  app.use("/api/guest", guestRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/conversations", conversationsRoutes);

  // centralized error handler - assertMember() and friends throw { status, message }.
  app.use((err, req, res, next) => {
    console.error(err);
    res
      .status(err.status || 500)
      .json({ error: err.message || "SERVER_ERROR" });
  });

  return app;
}

module.exports = createApp;
