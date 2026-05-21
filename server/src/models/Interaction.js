const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  actionType: { type: String, enum: ['view', 'click', 'save', 'register', 'feedback'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Interaction', InteractionSchema);
