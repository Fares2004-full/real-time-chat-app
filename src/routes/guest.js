const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { createGuest } = require("../controllers/guestController");

const router = express.Router();

// POST /api/guest { nickname } -> creates a new guest
router.post("/", asyncHandler(createGuest));

module.exports = router;
