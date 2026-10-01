const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const ConversationMember = require("../models/ConversationMember");
const Message = require("../models/Message");
const User = require("../models/User");
const presence = require("../services/presence");

function participantsKeyFor(userIdA, userIdB) {
  // direct chat
  return [String(userIdA), String(userIdB)].sort().join("_");
}

async function assertMember(conversationId, userId) {
  const member = await ConversationMember.findOne({ conversationId, userId });
  if (!member) {
    const err = new Error("NOT_A_MEMBER");
    err.status = 403;
    throw err;
  }
  return member;
}

// conversation records for user
async function listConversations(req, res) {
  const myMemberships = await ConversationMember.find({ userId: req.user._id });
  const conversationIds = myMemberships.map((m) => m.conversationId);
  const conversations = await Conversation.find({
    _id: { $in: conversationIds },
  }).sort({ updatedAt: -1 });

  const result = await Promise.all(
    conversations.map(async (conv) => {
      const myMembership = myMemberships.find(
        (m) => String(m.conversationId) === String(conv._id),
      );

      const allMembers = await ConversationMember.find({
        conversationId: conv._id,
      }).populate("userId", "nickname avatar");

      const lastMessage = await Message.findOne({
        conversationId: conv._id,
      }).sort({ createdAt: -1 });

      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        senderId: { $ne: req.user._id },
        ...(myMembership.lastReadMessageId
          ? { _id: { $gt: myMembership.lastReadMessageId } }
          : {}),
      });

      let displayName = conv.name;
      let otherUser = null;
      if (conv.type === "direct") {
        const other = allMembers.find(
          (m) => String(m.userId._id) !== String(req.user._id),
        );
        otherUser = other
          ? {
              userId: other.userId._id,
              nickname: other.userId.nickname,
              avatar: other.userId.avatar,
              online: presence.isOnline(String(other.userId._id)),
            }
          : null;
        displayName = otherUser?.nickname || "Unknown";
      }

      return {
        conversationId: conv._id,
        type: conv.type,
        name: displayName,
        otherUser,
        memberCount: allMembers.length,
        myRole: myMembership.role,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              createdAt: lastMessage.createdAt,
            }
          : null,
        unreadCount,
        updatedAt: conv.updatedAt,
      };
    }),
  );

  res.json(result);
}

// GET /api/conversations/:id -> full detail incl. members list.
async function getConversation(req, res) {
  await assertMember(req.params.id, req.user._id);
  const conv = await Conversation.findById(req.params.id);
  if (!conv) return res.status(404).json({ error: "NOT_FOUND" });
  const members = await ConversationMember.find({
    conversationId: conv._id,
  }).populate("userId", "nickname avatar");
  res.json({
    conversationId: conv._id,
    type: conv.type,
    name: conv.name,
    members: members.map((m) => ({
      userId: m.userId._id,
      nickname: m.userId.nickname,
      avatar: m.userId.avatar,
      role: m.role,
      online: presence.isOnline(String(m.userId._id)),
      lastReadMessageId: m.lastReadMessageId,
    })),
  });
}

// POST /api/conversations/direct { targetUserId }
async function createDirectConversation(req, res) {
  const { targetUserId } = req.body || {};
  if (!targetUserId || !mongoose.isValidObjectId(targetUserId)) {
    return res.status(400).json({ error: "INVALID_TARGET" });
  }
  if (String(targetUserId) === String(req.user._id)) {
    return res.status(400).json({ error: "CANNOT_CHAT_WITH_SELF" });
  }
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) return res.status(404).json({ error: "TARGET_NOT_FOUND" });

  const participantsKey = participantsKeyFor(req.user._id, targetUserId);

  let conversation = await Conversation.findOne({ participantsKey });
  let created = false;

  if (!conversation) {
    try {
      conversation = await Conversation.create({
        type: "direct",
        createdBy: req.user._id,
        participantsKey,
      });
      await ConversationMember.create([
        {
          conversationId: conversation._id,
          userId: req.user._id,
          role: "member",
        },
        {
          conversationId: conversation._id,
          userId: targetUserId,
          role: "member",
        },
      ]);
      created = true;
    } catch (err) {
      // Race condition: someone created the same pair a moment earlier.
      if (err.code === 11000) {
        conversation = await Conversation.findOne({ participantsKey });
      } else {
        throw err;
      }
    }
  }

  if (created) {
    req.app.get("joinUserToConversationRoom")(targetUserId, conversation._id);
    req.app.get("joinUserToConversationRoom")(req.user._id, conversation._id);
    req.app
      .get("io")
      .to(`user:${targetUserId}`)
      .emit("conversation:new", { conversationId: conversation._id });
  }

  res
    .status(created ? 201 : 200)
    .json({ conversationId: conversation._id, type: conversation.type });
}

// POST /api/conversations/group { name, memberIds: [] }
async function createGroupConversation(req, res) {
  const name = (req.body?.name || "").trim();
  const memberIds = Array.isArray(req.body?.memberIds)
    ? req.body.memberIds
    : [];
  if (!name || name.length > 50)
    return res.status(400).json({ error: "INVALID_NAME" });
  const validIds = memberIds.filter(
    (id) => mongoose.isValidObjectId(id) && String(id) !== String(req.user._id),
  );
  if (validIds.length === 0)
    return res.status(400).json({ error: "NEED_AT_LEAST_ONE_MEMBER" });

  const conversation = await Conversation.create({
    type: "group",
    name,
    createdBy: req.user._id,
  });
  await ConversationMember.create([
    { conversationId: conversation._id, userId: req.user._id, role: "owner" },
    ...validIds.map((userId) => ({
      conversationId: conversation._id,
      userId,
      role: "member",
    })),
  ]);

  const join = req.app.get("joinUserToConversationRoom");
  join(req.user._id, conversation._id);
  for (const userId of validIds) {
    join(userId, conversation._id);
    req.app
      .get("io")
      .to(`user:${userId}`)
      .emit("conversation:new", { conversationId: conversation._id });
  }

  res
    .status(201)
    .json({ conversationId: conversation._id, type: "group", name });
}

// PATCH /api/conversations/:id { name } -> owner only (this covers group rename).
async function renameConversation(req, res) {
  const member = await assertMember(req.params.id, req.user._id);
  if (member.role !== "owner")
    return res.status(403).json({ error: "OWNER_ONLY" });
  const name = (req.body?.name || "").trim();
  if (!name || name.length > 50)
    return res.status(400).json({ error: "INVALID_NAME" });
  await Conversation.findByIdAndUpdate(req.params.id, { name });
  req.app
    .get("io")
    .to(`conversation:${req.params.id}`)
    .emit("conversation:updated", { conversationId: req.params.id, name });
  res.json({ ok: true });
}

// POST /api/conversations/:id/members { userId } -> owner only.
async function addMember(req, res) {
  const member = await assertMember(req.params.id, req.user._id);
  if (member.role !== "owner")
    return res.status(403).json({ error: "OWNER_ONLY" });
  const { userId } = req.body || {};
  if (!userId || !mongoose.isValidObjectId(userId))
    return res.status(400).json({ error: "INVALID_USER" });

  const exists = await ConversationMember.findOne({
    conversationId: req.params.id,
    userId,
  });
  if (exists) return res.status(409).json({ error: "ALREADY_MEMBER" });

  await ConversationMember.create({
    conversationId: req.params.id,
    userId,
    role: "member",
  });
  req.app.get("joinUserToConversationRoom")(userId, req.params.id);
  req.app
    .get("io")
    .to(`user:${userId}`)
    .emit("conversation:new", { conversationId: req.params.id });
  req.app
    .get("io")
    .to(`conversation:${req.params.id}`)
    .emit("member:added", { conversationId: req.params.id, userId });

  res.status(201).json({ ok: true });
}

// DELETE /api/conversations/:id/members/:userId -> owner removes someone, or a member removes themself.
async function removeMember(req, res) {
  const member = await assertMember(req.params.id, req.user._id);
  const isSelf = String(req.params.userId) === String(req.user._id);
  if (!isSelf && member.role !== "owner")
    return res.status(403).json({ error: "OWNER_ONLY" });

  await ConversationMember.deleteOne({
    conversationId: req.params.id,
    userId: req.params.userId,
  });
  req.app.get("io").to(`conversation:${req.params.id}`).emit("member:removed", {
    conversationId: req.params.id,
    userId: req.params.userId,
  });

  res.json({ ok: true });
}

// GET /api/conversations/:id/messages?limit=30&before=<messageId> -> cursor pagination.
async function listMessages(req, res) {
  await assertMember(req.params.id, req.user._id);
  const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
  const filter = { conversationId: req.params.id };
  if (req.query.before && mongoose.isValidObjectId(req.query.before)) {
    filter._id = { $lt: req.query.before };
  }
  const messages = await Message.find(filter)
    .sort({ _id: -1 })
    .limit(limit)
    .populate("senderId", "nickname");

  res.json(
    messages
      .map((m) => ({
        messageId: m._id,
        conversationId: m.conversationId,
        senderId: m.senderId._id,
        senderNickname: m.senderId.nickname,
        content: m.content,
        createdAt: m.createdAt,
      }))
      .reverse(),
  );
}

module.exports = {
  listConversations,
  getConversation,
  createDirectConversation,
  createGroupConversation,
  renameConversation,
  addMember,
  removeMember,
  listMessages,
};
