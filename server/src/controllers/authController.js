const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sign = (user) => jwt.sign(
  { id: user._id, role: user.role, name: user.name, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

exports.register = async (req, res) => {
  const { name, email, password, role, interests, department, year } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name, email, passwordHash,
    role: role === 'organizer' ? 'organizer' : (role === 'admin' ? 'admin' : 'student'),
    interests: Array.isArray(interests) ? interests : [],
    department: department || '',
    year: Number(year) || 1,
    followedClubs: [],
    verifiedStatus: role === 'admin' // Admins are automatically verified
  });
  res.json({ token: sign(user), user: publicUser(user) });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ token: sign(user), user: publicUser(user) });
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json({ user: publicUser(user) });
};

exports.updateInterests = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { interests: Array.isArray(req.body.interests) ? req.body.interests : [] },
    { new: true }
  );
  res.json({ user: publicUser(user) });
};

exports.toggleFollowClub = async (req, res) => {
  try {
    const { clubId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const index = user.followedClubs.indexOf(clubId);
    if (index === -1) {
      user.followedClubs.push(clubId);
    } else {
      user.followedClubs.splice(index, 1);
    }
    await user.save();
    res.json({ user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

function publicUser(u) {
  return { 
    id: u._id, 
    name: u.name, 
    email: u.email, 
    role: u.role, 
    interests: u.interests,
    department: u.department,
    year: u.year,
    followedClubs: u.followedClubs || [],
    verifiedStatus: u.verifiedStatus || false
  };
}
