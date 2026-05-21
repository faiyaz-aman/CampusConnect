const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'organizer', 'admin'], default: 'student' },
  interests: [{ type: String }], // e.g. ['tech','music','sports','arts','academic']
  emailNotificationsEnabled: { type: Boolean, default: true },
  department: { type: String, default: '' },
  year: { type: Number, default: 1 },
  followedClubs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  verifiedStatus: { type: Boolean, default: false } // relevant for organizers/clubs
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
