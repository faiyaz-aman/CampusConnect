const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, required: true }, // tech / music / sports / arts / academic
  date: { type: Date, required: true },
  location: { type: String, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String }],
  mode: { type: String, enum: ['in-person', 'virtual'], default: 'in-person' },
  capacity: { type: Number, default: 100 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  posterUrl: { type: String, default: '' },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
