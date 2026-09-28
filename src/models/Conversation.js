const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['direct', 'group'], required: true },
    name: { type: String, trim: true, maxlength: 50, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participantsKey: { type: String, default: null }
  },
  { timestamps: true }
);

conversationSchema.index({ participantsKey: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Conversation', conversationSchema);
