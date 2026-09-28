const mongoose = require('mongoose');

const conversationMemberSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now },
  lastReadMessageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null }
});

conversationMemberSchema.index({ conversationId: 1, userId: 1 }, { unique: true });
conversationMemberSchema.index({ userId: 1 });

module.exports = mongoose.model('ConversationMember', conversationMemberSchema);
