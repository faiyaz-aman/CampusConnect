const nodemailer = require('nodemailer');
const User = require('../models/User');
const NotificationHistory = require('../models/NotificationHistory');

// Map user interest keys to matching tags/keywords (normalization & expansion layer)
const INTEREST_KEYWORDS = {
  tech: ['tech', 'technology', 'hackathon', 'coding', 'ai', 'programming', 'software', 'developer', 'web', 'computer', 'science', 'engineering'],
  music: ['music', 'concert', 'singing', 'band', 'dj', 'instrument', 'dance', 'performance', 'musical'],
  sports: ['sports', 'cricket', 'football', 'basketball', 'soccer', 'gym', 'workout', 'fitness', 'tournament', 'match', 'game', 'athletics'],
  arts: ['arts', 'painting', 'drawing', 'drama', 'theatre', 'acting', 'comedy', 'craft', 'design', 'exhibition', 'photography'],
  academic: ['academic', 'lecture', 'seminar', 'workshop', 'study', 'research', 'exam', 'career', 'education', 'learning', 'talk'],
  cultural: ['cultural', 'festival', 'fest', 'celebration', 'exhibition', 'heritage', 'traditional'],
  workshops: ['workshops', 'workshop', 'bootcamp', 'training', 'tutorial', 'seminar'],
  entrepreneurship: ['entrepreneurship', 'startup', 'business', 'pitch', 'funding', 'marketing', 'finance', 'incubation']
};

/**
 * Checks if a user's interests match an event's attributes
 */
const isMatch = (userInterests, event) => {
  if (!userInterests || userInterests.length === 0) return false;

  const normalizedInterests = userInterests.map(i => i.toLowerCase().trim());
  const category = (event.category || '').toLowerCase().trim();
  const tags = (event.tags || []).map(t => t.toLowerCase().trim());
  const title = (event.title || '').toLowerCase();
  const description = (event.description || '').toLowerCase();

  for (const interest of normalizedInterests) {
    // Get all matching keywords/tags for this interest (e.g. "tech" matches "coding", "ai", etc.)
    const associatedKeywords = INTEREST_KEYWORDS[interest] || [interest];
    
    // 1. Exact Category Match
    if (associatedKeywords.includes(category) || interest === category) {
      return true;
    }

    // 2. Tag Overlap Match
    const hasTagOverlap = tags.some(tag => 
      associatedKeywords.includes(tag) || tag === interest
    );
    if (hasTagOverlap) {
      return true;
    }

    // 3. Keyword Match in Title or Description
    const hasKeywordMatch = associatedKeywords.some(keyword => {
      // Create a regex to match the keyword as a whole word boundary
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return regex.test(title) || regex.test(description);
    });
    if (hasKeywordMatch) {
      return true;
    }
  }

  return false;
};

/**
 * Formats and sends a personalized interest-matched event notification email
 */
const sendEventNotificationEmail = async ({ student, event, organizerName }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = Number(process.env.EMAIL_PORT) || 587;

  if (!emailUser || !emailPass) {
    console.warn('⚠️ Mail configuration missing in environment. Event notification email not sent.');
    return { success: false, reason: 'Email credentials not configured in server .env' };
  }

  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465,
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  const eventLink = `${clientOrigin}/events/${event._id}`;

  const dateString = new Date(event.date).toLocaleString(undefined, { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const categoryEmoji = {
    tech: '💻',
    music: '🎵',
    sports: '🏆',
    arts: '🎨',
    academic: '📚'
  }[(event.category || '').toLowerCase()] || '✨';

  const mailOptions = {
    from: `"CampusConnect Updates" <${emailUser}>`,
    to: student.email,
    subject: `🔔 New ${event.category} Event Matches Your Interest: ${event.title}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px;">
          <h2 style="color: #6366f1; margin: 0; font-weight: 800; letter-spacing: 0.5px;">CampusConnect ✦</h2>
          <p style="color: #64748b; font-size: 14px; margin: 6px 0 0 0;">Personalized Vibe Alert</p>
        </div>
        
        <div style="padding: 25px 0;">
          <p style="font-size: 16px; color: #1e293b; margin-top: 0;">Hi <strong>${student.name}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
            A new campus event matching your selected vibe <strong>#${event.category}</strong> has just been published! Check out the details:
          </p>
          
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #6366f1; margin-bottom: 25px;">
            <h3 style="color: #0f172a; margin: 0 0 12px 0; font-size: 18px; font-weight: 700;">
              ${categoryEmoji} ${event.title}
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; width: 110px; color: #64748b;">Category:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">#${event.category}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Date & Time:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${dateString}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Venue:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${event.location}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Organizer:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${organizerName}</td>
              </tr>
            </table>
            
            ${event.description ? `
              <div style="margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5; font-style: italic;">
                  "${event.description.length > 180 ? event.description.substring(0, 180) + '...' : event.description}"
                </p>
              </div>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${eventLink}" style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 30px; font-size: 14px; font-weight: bold; border-radius: 9999px; box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2); transition: background-color 0.2s;">
              View Event ✦
            </a>
          </div>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
          <p style="font-size: 11px; color: #94a3b8; margin: 0 0 8px 0;">
            You received this automated notification because you are subscribed to <strong>#${event.category}</strong> alerts on CampusConnect.
          </p>
          <p style="font-size: 11px; color: #94a3b8; margin: 0;">
            To manage your alerts or unsubscribe, visit your <a href="${clientOrigin}/interests" style="color: #6366f1; text-decoration: none; font-weight: 600;">Vibe Preferences</a>.
          </p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Interest alert email successfully delivered to ${student.email}: ${info.messageId}`);
    return { success: true };
  } catch (err) {
    console.error(`❌ Interest alert delivery error for ${student.email}:`, err);
    return { success: false, error: err.message };
  }
};

/**
 * Finds matching students for an event and dispatches notifications asynchronously
 */
const notifyMatchingStudents = async (event) => {
  try {
    if (!event || event.status !== 'approved') {
      console.log(`[NotificationService] Event "${event?.title}" is not approved/live. Skipping notifications.`);
      return;
    }

    // 1. Find all student users with notifications enabled
    const students = await User.find({
      role: 'student',
      emailNotificationsEnabled: { $ne: false } // match if not explicitly false (handles existing seed data)
    });

    if (students.length === 0) {
      console.log('[NotificationService] No students found with notifications enabled.');
      return;
    }

    // 2. Fetch organizer name
    let organizerName = 'Campus Organizer';
    if (event.organizer) {
      const org = await User.findById(event.organizer);
      if (org) organizerName = org.name;
    }

    // 3. Filter matching students
    const matches = students.filter(student => isMatch(student.interests, event));
    console.log(`[NotificationService] Found ${matches.length} matching students (out of ${students.length}) for event "${event.title}"`);

    // 4. Send email and record history for each matching student asynchronously
    // Using a background non-blocking execution style
    for (const student of matches) {
      // Enforce duplicate protection:
      // Try to create the notification history record. If unique constraint fails, it throws 11000.
      try {
        await NotificationHistory.create({
          event: event._id,
          user: student._id,
          status: 'sent'
        });
      } catch (dbErr) {
        if (dbErr.code === 11000) {
          // Already sent! Skip to prevent duplicate
          console.log(`[NotificationService] Duplicate prevention active: Notification already sent to ${student.email} for event ${event._id}`);
          continue;
        }
        // For other DB errors, log and continue
        console.error(`[NotificationService] Failed to record notification history for ${student.email}:`, dbErr);
        continue;
      }

      // Dispatch email asynchronously
      sendEventNotificationEmail({
        student,
        event,
        organizerName
      }).catch(mailErr => {
        console.error(`[NotificationService] Asynchronous mail send failed for ${student.email}:`, mailErr);
        // Update history status to failed if needed (optional)
        NotificationHistory.updateOne(
          { event: event._id, user: student._id },
          { status: 'failed' }
        ).catch(e => console.error('Failed to update notification status:', e));
      });
    }
  } catch (err) {
    console.error('[NotificationService] Unexpected error in notifyMatchingStudents:', err);
  }
};

module.exports = {
  isMatch,
  notifyMatchingStudents,
  sendEventNotificationEmail
};
