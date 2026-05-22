const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const Interaction = require('../models/Interaction');
const Feedback = require('../models/Feedback');

// Helper to calculate event capacity statistics
const getCapacityStats = async (eventId, capacity) => {
  const seatsBooked = await Registration.countDocuments({
    event: eventId,
    status: { $in: ['registered', 'attended'] }
  });
  const seatsAvailable = Math.max(0, capacity - seatsBooked);
  return { seatsBooked, seatsAvailable };
};

// List approved events, with optional filters
exports.list = async (req, res) => {
  try {
    const { category, search, mode, sort } = req.query;
    let filter = { status: 'approved' };

    if (category) {
      filter.category = category;
    }
    if (mode) {
      filter.mode = mode;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { date: 1 };
    if (sort === 'popular') {
      sortOption = { date: 1 };
    } else if (sort === 'soon') {
      sortOption = { date: 1 };
    }

    const events = await Event.find(filter)
      .sort(sortOption)
      .populate('organizer', 'name email verifiedStatus');

    const enrichedEvents = await Promise.all(events.map(async (ev) => {
      const { seatsBooked, seatsAvailable } = await getCapacityStats(ev._id, ev.capacity);
      const evObj = ev.toObject();
      evObj.seatsBooked = seatsBooked;
      evObj.seatsAvailable = seatsAvailable;
      return evObj;
    }));

    res.json({ events: enrichedEvents });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single event
exports.get = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email verifiedStatus');
    if (!event) return res.status(404).json({ message: 'Not found' });
    
    const { seatsBooked, seatsAvailable } = await getCapacityStats(event._id, event.capacity);
    const evObj = event.toObject();
    evObj.seatsBooked = seatsBooked;
    evObj.seatsAvailable = seatsAvailable;

    let userRegistration = null;
    if (req.user) {
      userRegistration = await Registration.findOne({ event: event._id, user: req.user.id });
    }

    res.json({ event: evObj, userRegistration });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create event
exports.create = async (req, res) => {
  try {
    const { title, description, category, date, location, tags, mode, capacity, posterUrl, buildingName, coordinates, endTime } = req.body;
    if (!title || !category || !date || !location)
      return res.status(400).json({ message: 'Missing fields' });

    // Check if the organizer is verified for auto-approval
    const creator = await User.findById(req.user.id);
    const status = creator && creator.verifiedStatus ? 'approved' : 'pending';

    // Calculate default endTime if not provided
    let finalEndTime = endTime ? new Date(endTime) : null;
    if (!finalEndTime && date) {
      finalEndTime = new Date(new Date(date).getTime() + 2 * 60 * 60 * 1000); // 2 hours default
    }

    const event = await Event.create({
      title,
      description,
      category,
      date,
      location,
      organizer: req.user.id,
      tags: Array.isArray(tags) ? tags : [],
      mode: mode || 'in-person',
      capacity: Number(capacity) || 100,
      posterUrl: posterUrl || '',
      status,
      endTime: finalEndTime,
      buildingName: buildingName || '',
      coordinates: coordinates || undefined
    });

    // Trigger matching notifications asynchronously if approved instantly
    if (status === 'approved') {
      const { notifyMatchingStudents } = require('../services/notificationService');
      notifyMatchingStudents(event).catch(err => console.error('Notification dispatch failure:', err));
    }

    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update event
exports.update = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Not found' });
    if (String(event.organizer) !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    if (req.body.capacity !== undefined) {
      const newCapacity = Number(req.body.capacity);
      const activeBookings = await Registration.countDocuments({
        event: event._id,
        status: { $in: ['registered', 'attended'] }
      });
      if (newCapacity < activeBookings) {
        return res.status(400).json({ 
          message: `Cannot reduce capacity to ${newCapacity}. There are already ${activeBookings} active registrations.` 
        });
      }
    }

    Object.assign(event, req.body);
    await event.save();
    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove event
exports.remove = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Not found' });
    if (String(event.organizer) !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    await event.deleteOne();
    await Registration.deleteMany({ event: event._id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student registers for an event
exports.register = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    // Check capacity
    const count = await Registration.countDocuments({ 
      event: event._id, 
      status: { $in: ['registered', 'attended'] } 
    });

    let status = 'registered';
    if (count >= event.capacity) {
      status = 'waitlisted';
    }

    // Generate unique code for check-in using crypto
    const crypto = require('crypto');
    const qrString = 'QR-' + crypto.randomBytes(6).toString('hex').toUpperCase();

    // Avoid unique constraint error if a student has a cancelled/waitlisted registration
    let reg = await Registration.findOne({ event: event._id, user: req.user.id });
    if (reg) {
      if (reg.status === 'registered' || reg.status === 'attended') {
        return res.status(409).json({ message: 'Already registered' });
      }
      if (reg.status === 'waitlisted') {
        return res.status(409).json({ message: 'Already waitlisted' });
      }
      // Reactivate cancelled registration
      reg.status = status;
      reg.qrCodeString = qrString;
      reg.checkedInAt = undefined;
      reg.scannedBy = undefined;
      await reg.save();
    } else {
      reg = await Registration.create({ 
        event: req.params.id, 
        user: req.user.id,
        status: status,
        qrCodeString: qrString
      });
    }

    // Log the interaction
    await Interaction.create({
      user: req.user.id,
      event: req.params.id,
      actionType: 'register'
    });

    // Send ticket email asynchronously if registered
    const studentUser = await User.findById(req.user.id);
    const organizerUser = await User.findById(event.organizer);
    const { sendTicketEmail } = require('../services/mailService');
    
    if (status === 'registered' && studentUser) {
      const dateString = new Date(event.date).toLocaleString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      sendTicketEmail({
        toEmail: studentUser.email,
        studentName: studentUser.name,
        eventName: event.title,
        dateString,
        location: event.location,
        organizerName: organizerUser ? organizerUser.name : 'Campus Club',
        qrCodeString: qrString,
        ticketId: reg._id.toString()
      }).catch(err => console.error('Failed to send registration email:', err));
    }

    res.json({ registration: reg });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: 'Already registered' });
    res.status(500).json({ message: e.message });
  }
};

// Organizer views registrations
exports.registrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Not found' });
    if (String(event.organizer) !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    const regs = await Registration.find({ event: event._id }).populate('user', 'name email department year');
    res.json({ registrations: regs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Organizer checks in student (QR attendance check-in)
// Organizer checks in student (QR attendance check-in)
exports.checkin = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ errorCode: 'MISSING_CODE', message: 'Missing check-in code' });

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ errorCode: 'EVENT_NOT_FOUND', message: 'Event not found' });
    if (String(event.organizer) !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ errorCode: 'FORBIDDEN', message: 'Forbidden' });

    // Look for registration across ALL events first to verify if it's the wrong event!
    const regAnywhere = await Registration.findOne({ qrCodeString: code }).populate('user', 'name email department');
    if (!regAnywhere) {
      return res.status(404).json({ errorCode: 'INVALID_TICKET', message: 'Ticket not found / invalid code' });
    }

    // Now check if it belongs to this event
    if (String(regAnywhere.event) !== String(event._id)) {
      return res.status(400).json({ 
        errorCode: 'WRONG_EVENT', 
        message: 'This ticket is for another campus event!' 
      });
    }

    if (regAnywhere.status === 'cancelled') {
      return res.status(400).json({ errorCode: 'CANCELLED_TICKET', message: 'This registration was cancelled.' });
    }

    if (regAnywhere.status === 'waitlisted') {
      return res.status(400).json({ errorCode: 'WAITLISTED_TICKET', message: 'This student is still waitlisted for this event.' });
    }

    if (regAnywhere.status === 'attended') {
      return res.status(400).json({ 
        errorCode: 'ALREADY_CHECKED_IN', 
        message: `${regAnywhere.user?.name || 'Student'} is already checked in!` 
      });
    }

    // Mark as attended
    regAnywhere.status = 'attended';
    regAnywhere.checkedInAt = new Date();
    regAnywhere.scannedBy = req.user.id;
    await regAnywhere.save();

    // Send check-in ticket email asynchronously
    const organizerUser = await User.findById(event.organizer);
    const { sendCheckinEmail } = require('../services/mailService');
    const checkedInTime = new Date().toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    sendCheckinEmail({
      toEmail: regAnywhere.user.email,
      studentName: regAnywhere.user.name,
      eventName: event.title,
      dateString: new Date(event.date).toLocaleDateString(),
      location: event.location,
      organizerName: organizerUser ? organizerUser.name : 'Campus Club',
      qrCodeString: code,
      ticketId: regAnywhere._id.toString(),
      checkedInTime
    }).catch(err => console.error('Failed to send check-in email:', err));

    res.json({ message: 'Checked in successfully!', user: regAnywhere.user });
  } catch (err) {
    res.status(500).json({ errorCode: 'SERVER_ERROR', message: err.message });
  }
};

// Submit feedback/rating for an event
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, review } = req.body;
    if (!rating) return res.status(400).json({ message: 'Rating is required' });

    // Ensure student registered or attended
    const reg = await Registration.findOne({ event: req.params.id, user: req.user.id });
    if (!reg) return res.status(403).json({ message: 'You must RSVP to provide feedback' });

    const fb = await Feedback.create({
      user: req.user.id,
      event: req.params.id,
      rating: Number(rating),
      review: review || ''
    });

    await Interaction.create({
      user: req.user.id,
      event: req.params.id,
      actionType: 'feedback'
    });

    res.json({ feedback: fb });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'You already left feedback for this event!' });
    res.status(500).json({ message: err.message });
  }
};

// Get feedback list
exports.getFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ event: req.params.id }).populate('user', 'name');
    res.json({ feedbacks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle bookmark save
exports.toggleSave = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Interaction.findOne({ user: req.user.id, event: id, actionType: 'save' });
    if (existing) {
      await existing.deleteOne();
      return res.json({ saved: false });
    } else {
      await Interaction.create({ user: req.user.id, event: id, actionType: 'save' });
      return res.json({ saved: true });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Check if bookmarked
exports.isSaved = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Interaction.findOne({ user: req.user.id, event: id, actionType: 'save' });
    res.json({ saved: !!existing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List user's bookmarks and registered events
exports.myActivity = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user.id }).populate({
      path: 'event',
      populate: { path: 'organizer', select: 'name' }
    });
    
    const saves = await Interaction.find({ user: req.user.id, actionType: 'save' }).populate({
      path: 'event',
      populate: { path: 'organizer', select: 'name' }
    });

    res.json({
      registrations,
      saves: saves.filter(s => s.event !== null).map(s => s.event)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🧠 Advanced personalized recommendation engine
exports.recommended = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const interests = (user.interests || []).map(s => s.toLowerCase());
    const followed = (user.followedClubs || []).map(id => String(id));

    // Find all approved future events
    const events = await Event.find({ status: 'approved', date: { $gte: new Date() } })
      .populate('organizer', 'name email verifiedStatus');

    const now = Date.now();

    // Fetch all registrations to compute popular trends by department
    const allRegs = await Registration.find().populate('user', 'department');

    const scored = events.map(ev => {
      let score = 0;
      const reasons = [];

      // 1. Featured boost
      if (ev.isFeatured) {
        score += 50;
        reasons.push('Featured Event ✦');
      }

      // 2. Interest match
      const cat = (ev.category || '').toLowerCase();
      if (interests.includes(cat)) {
        score += 30;
        reasons.push('Vibe Match 🎯');
      }

      // 3. Followed club boost
      const orgId = String(ev.organizer?._id || ev.organizer);
      if (followed.includes(orgId)) {
        score += 25;
        reasons.push('Followed Club ⚡');
      }

      // 4. Verified club boost
      if (ev.organizer && ev.organizer.verifiedStatus) {
        score += 15;
        reasons.push('Verified Org ✓');
      }

      // 5. Department popularity
      const deptRegsCount = allRegs.filter(r => {
        return r.event && String(r.event) === String(ev._id) && r.user && r.user.department === user.department;
      }).length;
      if (deptRegsCount > 0) {
        score += Math.min(20, deptRegsCount * 5);
        reasons.push('Popular in Dept 🔥');
      }

      // 6. Recency / proximity deduction (score penalty for distant events)
      const daysUntil = Math.max(0.1, (new Date(ev.date).getTime() - now) / (1000 * 60 * 60 * 24));
      score -= daysUntil * 0.5;

      return {
        event: ev,
        score,
        reasons: reasons.length > 0 ? reasons : ['Trending 📈'],
        matched: interests.includes(cat) || followed.includes(orgId)
      };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Take top 25 and enrich capacity stats
    const topScored = scored.slice(0, 25);
    const enrichedScored = await Promise.all(topScored.map(async (item) => {
      const { seatsBooked, seatsAvailable } = await getCapacityStats(item.event._id, item.event.capacity);
      const evObj = item.event.toObject();
      evObj.seatsBooked = seatsBooked;
      evObj.seatsAvailable = seatsAvailable;
      item.event = evObj;
      return item;
    }));

    res.json({ events: enrichedScored });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student cancels registration (with auto-promotion of waitlist)
exports.cancelRSVP = async (req, res) => {
  try {
    const reg = await Registration.findOne({ event: req.params.id, user: req.user.id });
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    
    if (reg.status === 'cancelled') {
      return res.status(400).json({ message: 'Registration is already cancelled' });
    }

    const wasActive = reg.status === 'registered';
    reg.status = 'cancelled';
    await reg.save();

    // Log the cancellation interaction
    await Interaction.create({
      user: req.user.id,
      event: req.params.id,
      actionType: 'cancel'
    });

    // If the cancelled registration was active, promote the oldest waitlisted student!
    if (wasActive) {
      const oldestWaitlist = await Registration.findOne({
        event: req.params.id,
        status: 'waitlisted'
      }).sort({ createdAt: 1 });

      if (oldestWaitlist) {
        oldestWaitlist.status = 'registered';
        await oldestWaitlist.save();

        // Send email to promoted user
        const event = await Event.findById(req.params.id);
        const promotedUser = await User.findById(oldestWaitlist.user);
        const organizerUser = event ? await User.findById(event.organizer) : null;
        
        if (event && promotedUser) {
          const { sendTicketEmail } = require('../services/mailService');
          const dateString = new Date(event.date).toLocaleString(undefined, { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          });

          sendTicketEmail({
            toEmail: promotedUser.email,
            studentName: promotedUser.name,
            eventName: event.title,
            dateString,
            location: event.location,
            organizerName: organizerUser ? organizerUser.name : 'Campus Club',
            qrCodeString: oldestWaitlist.qrCodeString,
            ticketId: oldestWaitlist._id.toString()
          }).catch(err => console.error('Failed to send promotion email:', err));
        }
      }
    }

    res.json({ message: 'RSVP cancelled successfully', registration: reg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Heuristic to resolve coordinates based on venue string
const resolveCoordinates = (locationStr) => {
  if (!locationStr) return null;
  const lower = locationStr.toLowerCase();
  if (lower.includes('engineering')) {
    return { buildingName: 'Engineering Block', x: 35, y: 38 };
  } else if (lower.includes('amphitheater') || lower.includes('amphi')) {
    return { buildingName: 'Campus Amphitheater', x: 68, y: 24 };
  } else if (lower.includes('student center') || lower.includes('cafeteria') || lower.includes('lounge')) {
    return { buildingName: 'Student Center', x: 50, y: 62 };
  } else if (lower.includes('gym') || lower.includes('sports') || lower.includes('arena') || lower.includes('stadium')) {
    return { buildingName: 'Sports Arena', x: 82, y: 45 };
  } else if (lower.includes('seminar') || lower.includes('hall 102') || lower.includes('hall b') || lower.includes('lecture')) {
    return { buildingName: 'Seminar Hall', x: 22, y: 70 };
  } else if (lower.includes('library')) {
    return { buildingName: 'Central Library', x: 48, y: 28 };
  }
  return null;
};

// Retrieve currently live approved events
exports.liveEvents = async (req, res) => {
  try {
    const now = new Date();
    // Fetch approved events currently active
    const events = await Event.find({
      status: 'approved',
      $or: [
        {
          date: { $lte: now },
          endTime: { $gte: now }
        },
        {
          date: { $lte: now },
          endTime: { $exists: false },
          // fallback: assume 2 hours duration
          $expr: {
            $gte: [
              { $add: ["$date", 2 * 60 * 60 * 1000] },
              now
            ]
          }
        }
      ]
    }).populate('organizer', 'name email verifiedStatus');

    // Enrich coordinates for in-person events if not already set
    const enriched = events.map(ev => {
      const evObj = ev.toObject();
      if (evObj.mode === 'in-person' && (!evObj.coordinates || evObj.coordinates.x === undefined || evObj.coordinates.y === undefined)) {
        const resolved = resolveCoordinates(evObj.location);
        if (resolved) {
          evObj.buildingName = evObj.buildingName || resolved.buildingName;
          evObj.coordinates = evObj.coordinates || {};
          evObj.coordinates.x = resolved.x;
          evObj.coordinates.y = resolved.y;
        }
      }
      return evObj;
    });

    res.json({ events: enriched });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
