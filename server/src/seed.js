require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');
const Interaction = require('./models/Interaction');
const Feedback = require('./models/Feedback');

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI missing in .env');
  
  console.log('🌱 Seeding database...');
  await mongoose.connect(uri);

  // Clear collections
  await User.deleteMany({});
  await Event.deleteMany({});
  await Registration.deleteMany({});
  await Interaction.deleteMany({});
  await Feedback.deleteMany({});

  console.log('🧹 Old data wiped clean.');

  // Hashes for passwords
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Admins
  const admin = await User.create({
    name: 'Sarah Connor (Admin)',
    email: 'admin@college.edu',
    passwordHash,
    role: 'admin',
    department: 'Administration',
    year: 4,
    verifiedStatus: true
  });

  // 2. Create Clubs/Organizers
  const codingClub = await User.create({
    name: 'Coding Club',
    email: 'coding@college.edu',
    passwordHash,
    role: 'organizer',
    department: 'Computer Science',
    verifiedStatus: true // Already verified
  });

  const musicClub = await User.create({
    name: 'Music & Symphony Club',
    email: 'music@college.edu',
    passwordHash,
    role: 'organizer',
    department: 'Fine Arts',
    verifiedStatus: true
  });

  const debateClub = await User.create({
    name: 'Debate Society',
    email: 'debate@college.edu',
    passwordHash,
    role: 'organizer',
    department: 'Humanities',
    verifiedStatus: false // Awaiting verification
  });

  // 3. Create Students
  const student1 = await User.create({
    name: 'Alex Johnson',
    email: 'alex@college.edu',
    passwordHash,
    role: 'student',
    interests: ['tech', 'academic'],
    department: 'Computer Science',
    year: 2,
    followedClubs: [codingClub._id]
  });

  const student2 = await User.create({
    name: 'Maya Lin',
    email: 'maya@college.edu',
    passwordHash,
    role: 'student',
    interests: ['music', 'arts'],
    department: 'Fine Arts',
    year: 3,
    followedClubs: [musicClub._id]
  });

  const student3 = await User.create({
    name: 'Liam Neeson',
    email: 'liam@college.edu',
    passwordHash,
    role: 'student',
    interests: ['sports', 'tech'],
    department: 'Mechanical Engineering',
    year: 1,
    followedClubs: []
  });

  console.log('👥 Users created.');

  // 4. Create Events
  const now = new Date();

  // Hackathon - Tech, Approved, Featured
  const event1 = await Event.create({
    title: 'CodeRed Hackathon 2026',
    description: 'The ultimate 24-hour sprint. Build, pitch, and win prizes up to $5000. Food, energy drinks, and premium stickers are on us! All departments welcome.',
    category: 'tech',
    date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    location: 'Engineering Block Hall B',
    buildingName: 'Engineering Block',
    coordinates: { x: 35, y: 38 },
    organizer: codingClub._id,
    tags: ['hackathon', 'coding', 'ai'],
    mode: 'in-person',
    capacity: 150,
    status: 'approved',
    isFeatured: true,
    posterUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800'
  });

  // Battle of Bands - Music, Approved, Not Featured
  const event2 = await Event.create({
    title: 'Spring Rock Battle of the Bands',
    description: 'Watch the top 8 college bands battle it out for the title of Rock Champion. Crowd voting determines the winner, so bring your friends!',
    category: 'music',
    date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    location: 'Campus Amphitheater',
    buildingName: 'Campus Amphitheater',
    coordinates: { x: 68, y: 24 },
    organizer: musicClub._id,
    tags: ['rock', 'livemusic', 'instruments'],
    mode: 'in-person',
    capacity: 300,
    status: 'approved',
    isFeatured: false,
    posterUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800'
  });

  // Debate Workshop - Academic, Pending Approval
  const event3 = await Event.create({
    title: 'Art of Rhetoric: Debate Mastery',
    description: 'Learn the advanced tactics of argumentation, logical fallacies, and high-impact public speaking from regional debate champions.',
    category: 'academic',
    date: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
    endTime: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    location: 'Seminar Room 102',
    buildingName: 'Seminar Hall',
    coordinates: { x: 22, y: 70 },
    organizer: debateClub._id,
    tags: ['speaking', 'rhetoric', 'debate'],
    mode: 'in-person',
    capacity: 40,
    status: 'pending',
    isFeatured: false,
    posterUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800'
  });

  // AI Workshop - Tech, Approved
  const event4 = await Event.create({
    title: 'Building with Large Language Models',
    description: 'Hands-on coding workshop exploring prompt engineering, vector databases, and agentic workflows. Bring your laptop and your API keys.',
    category: 'tech',
    date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
    endTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    location: 'Zoom webinar link',
    organizer: codingClub._id,
    tags: ['ai', 'llms', 'python'],
    mode: 'virtual',
    capacity: 500,
    status: 'approved',
    isFeatured: false,
    posterUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800'
  });

  // NEW LIVE EVENT 1: Esports Championship at Student Center
  const liveEvent1 = await Event.create({
    title: 'Campus Esports Championship',
    description: 'FIFA, Valorant, and Super Smash Bros finals! Free pizza, soda, and exclusive gaming merch. Live stream on the big screen!',
    category: 'sports',
    date: new Date(now.getTime() - 1 * 60 * 60 * 1000), // started 1 hour ago
    endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000), // ends in 3 hours
    location: 'Student Center Lounge',
    buildingName: 'Student Center',
    coordinates: { x: 50, y: 62 },
    organizer: codingClub._id,
    tags: ['gaming', 'esports', 'tournament'],
    mode: 'in-person',
    capacity: 80,
    status: 'approved',
    isFeatured: true,
    posterUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'
  });

  // NEW LIVE EVENT 2: Acoustic Sunset Jam Session at Amphitheater
  const liveEvent2 = await Event.create({
    title: 'Acoustic Sunset Jam Session',
    description: 'Grab a hot cider and listen to unplugged covers and original acoustic music by campus songwriters. Bring your acoustic guitar or voice!',
    category: 'music',
    date: new Date(now.getTime() - 30 * 60 * 1000), // started 30 mins ago
    endTime: new Date(now.getTime() + 1.5 * 60 * 60 * 1000), // ends in 1.5 hours
    location: 'Campus Amphitheater Steps',
    buildingName: 'Campus Amphitheater',
    coordinates: { x: 68, y: 24 },
    organizer: musicClub._id,
    tags: ['unplugged', 'acoustic', 'sunset', 'vocals'],
    mode: 'in-person',
    capacity: 100,
    status: 'approved',
    isFeatured: false,
    posterUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800'
  });

  console.log('📅 Events created.');

  // 5. Create Registrations
  // Alex and Liam register for Hackathon
  await Registration.create({ event: event1._id, user: student1._id, status: 'registered', qrCodeString: 'QR-ALEXCODE1' });
  await Registration.create({ event: event1._id, user: student3._id, status: 'registered', qrCodeString: 'QR-LIAMCODE2' });
  
  // Maya registers for Battle of Bands and AI Workshop
  await Registration.create({ event: event2._id, user: student2._id, status: 'registered', qrCodeString: 'QR-MAYABAND3' });
  await Registration.create({ event: event4._id, user: student2._id, status: 'registered', qrCodeString: 'QR-MAYAAI4' });

  // Maya and Liam register for the Esports Championship
  await Registration.create({ event: liveEvent1._id, user: student2._id, status: 'registered', qrCodeString: 'QR-MAYAESPORTS5' });
  await Registration.create({ event: liveEvent1._id, user: student3._id, status: 'registered', qrCodeString: 'QR-LIAMESPORTS6' });

  // 6. Create Saves (Interactions)
  // Alex saves AI Workshop
  await Interaction.create({ user: student1._id, event: event4._id, actionType: 'save' });
  // Maya saves Hackathon
  await Interaction.create({ user: student2._id, event: event1._id, actionType: 'save' });

  console.log('✅ Mock data seeded successfully!');
  await mongoose.disconnect();
  console.log('🔌 Database connection closed.');
}

seed().catch(err => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
