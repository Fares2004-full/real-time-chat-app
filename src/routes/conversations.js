const express = require("express");
const identify = require("../middleware/identify");
const asyncHandler = require("../utils/asyncHandler");
const c = require("../controllers/conversationsController");

const router = express.Router();
router.use(identify);

router.get("/", asyncHandler(c.listConversations));
router.get("/:id", asyncHandler(c.getConversation));
router.post("/direct", asyncHandler(c.createDirectConversation));
router.post("/group", asyncHandler(c.createGroupConversation));
router.patch("/:id", asyncHandler(c.renameConversation)); // group rename (owner only)
router.post("/:id/members", asyncHandler(c.addMember));
router.delete("/:id/members/:userId", asyncHandler(c.removeMember));
router.get("/:id/messages", asyncHandler(c.listMessages));

module.exports = router;
