const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');

// List all events for admin dashboard (pending, approved, rejected)
exports.events = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }).populate('organizer', 'name email verifiedStatus');
    res.json({ events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve or reject an event
exports.approveEvent = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const wasApprovedBefore = event.status === 'approved';
    event.status = status;
    await event.save();

    // Trigger interest notification in background if transitioned to approved
    if (status === 'approved' && !wasApprovedBefore) {
      const { notifyMatchingStudents } = require('../services/notificationService');
      notifyMatchingStudents(event).catch(err => console.error('Notification dispatch failure:', err));
    }

    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Feature or unfeature an event
exports.featureEvent = async (req, res) => {
  try {
    const { isFeatured } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.isFeatured = !!isFeatured;
    await event.save();
    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List all clubs/organizers for verification dashboard
exports.clubs = async (req, res) => {
  try {
    const clubs = await User.find({ role: 'organizer' }).sort({ createdAt: -1 });
    res.json({ clubs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify/unverify a club
exports.verifyClub = async (req, res) => {
  try {
    const { verifiedStatus } = req.body;
    const club = await User.findById(req.params.id);
    if (!club || club.role !== 'organizer') {
      return res.status(404).json({ message: 'Club/Organizer not found' });
    }

    club.verifiedStatus = !!verifiedStatus;
    await club.save();

    // Auto-approve all pending events of this club if they are now verified
    if (!!verifiedStatus) {
      const pendingEvents = await Event.find({ organizer: club._id, status: 'pending' });
      if (pendingEvents.length > 0) {
        const eventIds = pendingEvents.map(e => e._id);
        await Event.updateMany({ _id: { $in: eventIds } }, { status: 'approved' });

        // Trigger notifications asynchronously for all approved events
        const { notifyMatchingStudents } = require('../services/notificationService');
        for (const ev of pendingEvents) {
          ev.status = 'approved'; // Mutate to pass status check in service
          notifyMatchingStudents(ev).catch(err => console.error('Batch notification dispatch failure:', err));
        }
      }
    }

    res.json({ club });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// High-level campus analytics
exports.analytics = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const approvedEvents = await Event.countDocuments({ status: 'approved' });
    const pendingEvents = await Event.countDocuments({ status: 'pending' });
    const totalClubs = await User.countDocuments({ role: 'organizer' });
    const verifiedClubs = await User.countDocuments({ role: 'organizer', verifiedStatus: true });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalRegistrations = await Registration.countDocuments();

    // Department engagement aggregation
    const deptStats = await Registration.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      { $unwind: '$studentInfo' },
      {
        $group: {
          _id: '$studentInfo.department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Event category engagement aggregation
    const categoryStats = await Registration.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'eventInfo'
        }
      },
      { $unwind: '$eventInfo' },
      {
        $group: {
          _id: '$eventInfo.category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      summary: {
        totalEvents,
        approvedEvents,
        pendingEvents,
        totalClubs,
        verifiedClubs,
        totalStudents,
        totalRegistrations
      },
      departments: deptStats.map(d => ({ department: d._id || 'General', registrations: d.count })),
      categories: categoryStats.map(c => ({ category: c._id || 'Uncategorized', registrations: c.count }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
