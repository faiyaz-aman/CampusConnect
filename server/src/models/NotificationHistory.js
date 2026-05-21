const mongoose = require('mongoose');

const NotificationHistorySchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
  sentAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Strict duplicate protection at the database level
NotificationHistorySchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('NotificationHistory', NotificationHistorySchema);
