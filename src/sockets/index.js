const mongoose = require("mongoose");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const ConversationMember = require("../models/ConversationMember");
const Message = require("../models/Message");
const presence = require("../services/presence");

async function membersSharingAConversationWith(userId) {
  const myMemberships = await ConversationMember.find({ userId }).select(
    "conversationId",
  );
  const conversationIds = myMemberships.map((m) => m.conversationId);
  const others = await ConversationMember.find({
    conversationId: { $in: conversationIds },
    userId: { $ne: userId },
  }).select("userId");
  return [...new Set(others.map((m) => String(m.userId)))];
}
// io ==> Server instance
function attachSocketHandlers(io) {
  // socket ==> connection between a single client and the server
  io.use(async (socket, next) => {
    const { userId } = socket.handshake.auth || {};
    if (!userId || !mongoose.isValidObjectId(userId))
      return next(new Error("MISSING_USER_ID"));
    const user = await User.findById(userId);
    if (!user) return next(new Error("GUEST_NOT_FOUND"));
    socket.data.userId = String(userId);
    socket.data.nickname = user.nickname;
    next();
  });
  // client connected to the server
  io.on("connection", async (socket) => {
    const userId = socket.data.userId;

    socket.join(`user:${userId}`); // room for user ==> mult tabs or devices

    const memberships = await ConversationMember.find({ userId });
    // room for each coversation he involved in
    memberships.forEach((m) => socket.join(`conversation:${m.conversationId}`));

    const { becameOnline } = presence.addSocket(userId, socket.id);
    if (becameOnline) {
      const peers = await membersSharingAConversationWith(userId);
      peers.forEach((peerId) =>
        io
          .to(`user:${peerId}`) 
          .emit("presence:update", { userId, online: true }),
      );
    } // i am back mother fuckers

    socket.on(
      "message:send",
      async ({ conversationId, content, tempId } = {}, ack) => {
        try {
          if (!mongoose.isValidObjectId(conversationId))
            throw badRequest("INVALID_CONVERSATION");
          const text = (content || "").trim();
          if (!text || text.length > 4000) throw badRequest("INVALID_CONTENT");

          const member = await ConversationMember.findOne({
            conversationId,
            userId,
          });
          if (!member) throw badRequest("NOT_A_MEMBER");

          const message = await Message.create({
            conversationId,
            senderId: userId,
            content: text,
          });
          await Conversation.findByIdAndUpdate(conversationId, {
            updatedAt: new Date(),
          });

          const payload = {
            messageId: message._id,
            conversationId,
            senderId: userId,
            senderNickname: socket.data.nickname,
            content: text,
            createdAt: message.createdAt,
            tempId: tempId || null,
          };
          io.to(`conversation:${conversationId}`).emit("message:new", payload);
          if (ack) ack({ ok: true, message: payload });
        } catch (err) {
          handleError(socket, ack, err);
        }
      },
    );

    socket.on(
      "message:read",
      async ({ conversationId, messageId } = {}, ack) => {
        try {
          if (
            !mongoose.isValidObjectId(conversationId) ||
            !mongoose.isValidObjectId(messageId)
          ) {
            throw badRequest("INVALID_INPUT");
          }
          const member = await ConversationMember.findOne({
            conversationId,
            userId,
          });
          if (!member) throw badRequest("NOT_A_MEMBER");

         
          if (
            !member.lastReadMessageId ||
            String(member.lastReadMessageId) < String(messageId)
          ) {
            member.lastReadMessageId = messageId;
            await member.save();
          }
          io.to(`conversation:${conversationId}`).emit("message:read:ack", {
            conversationId,
            userId,
            messageId,
          });
          if (ack) ack({ ok: true });
        } catch (err) {
          handleError(socket, ack, err);
        }
      },
    );

    socket.on("typing:start", ({ conversationId } = {}) => {
      if (!mongoose.isValidObjectId(conversationId)) return;
      socket.to(`conversation:${conversationId}`).emit("typing:start", {
        conversationId,
        userId,
        nickname: socket.data.nickname,
      });
    });

    socket.on("typing:stop", ({ conversationId } = {}) => {
      if (!mongoose.isValidObjectId(conversationId)) return;
      socket
        .to(`conversation:${conversationId}`)
        .emit("typing:stop", { conversationId, userId });
    });

    socket.on("disconnect", async () => {
      const { becameOffline } = presence.removeSocket(userId, socket.id);
      if (becameOffline) {
        const lastSeenAt = new Date();
        await User.findByIdAndUpdate(userId, { lastSeenAt });
        const peers = await membersSharingAConversationWith(userId);
        peers.forEach((peerId) =>
          io
            .to(`user:${peerId}`)
            .emit("presence:update", { userId, online: false, lastSeenAt }),
        );
      }
    });
  });


  function joinUserToConversationRoom(userId, conversationId) {
    io.in(`user:${userId}`).socketsJoin(`conversation:${conversationId}`);
  }
  return { joinUserToConversationRoom };
}

function badRequest(code) {
  const err = new Error(code);
  err.status = 400;
  return err;
}

function handleError(socket, ack, err) {
  const payload = { error: err.message || "SERVER_ERROR" };
  if (ack) ack({ ok: false, ...payload });
  else socket.emit("error", payload);
}

module.exports = attachSocketHandlers;
