const nodemailer = require('nodemailer');

const sendTicketEmail = async ({ toEmail, studentName, eventName, dateString, location, organizerName, qrCodeString, ticketId }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = Number(process.env.EMAIL_PORT) || 465;

  if (!emailUser || !emailPass) {
    console.warn('⚠️ Mail configuration missing in environment. Email not sent.');
    return { success: false, reason: 'Email credentials not configured in server .env' };
  }

  // Set up the transporter configuration dynamically using your environmental properties
  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465, 
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  const qrImageLink = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrCodeString}`;

  // 🌟 FIX: Only ONE mailOptions object declared here!
  const mailOptions = {
    // If you use Resend, this needs to be 'onboarding@resend.dev'. If using Gmail, use your email user variable.
    from: emailHost.includes('resend') ? '"CampusConnect" <onboarding@resend.dev>' : `"CampusConnect Updates" <${emailUser}>`,
    to: toEmail,
    subject: `🎟️ Entry Ticket Confirmed: ${eventName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 15px;">
          <h2 style="color: #6366f1; margin: 0; font-family: sans-serif;">CampusConnect ✦</h2>
          <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">Your entry pass is secured!</p>
        </div>
        
        <div style="padding: 20px 0;">
          <p style="font-size: 16px; color: #1e293b;">Hi <strong>${studentName}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">
            You have successfully registered for <strong>${eventName}</strong> organized by <strong>${organizerName}</strong>. Show the QR code ticket below at the door to check in.
          </p>
          
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #6366f1;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
              <tr>
                <td style="padding: 4px 0; font-weight: bold; width: 120px;">Event Name:</td>
                <td style="padding: 4px 0;">${eventName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: bold;">Date & Time:</td>
                <td style="padding: 4px 0;">${dateString}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: bold;">Venue:</td>
                <td style="padding: 4px 0;">${location}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: bold;">Ticket ID:</td>
                <td style="padding: 4px 0; font-family: monospace; color: #6366f1;">${ticketId}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
            <div style="display: inline-block; padding: 12px; background: #ffffff; border: 2px dashed #6366f1; border-radius: 12px;">
              <img src="${qrImageLink}" alt="QR Entry Ticket" style="width: 200px; height: 200px; display: block;" />
              <div style="font-family: monospace; font-size: 12px; color: #0f172a; margin-top: 8px; font-weight: bold; letter-spacing: 2px;">
                ${qrCodeString}
              </div>
            </div>
            <p style="font-size: 11px; color: #64748b; margin-top: 10px;">One scan = one entry. Duplicate entries will be flagged.</p>
          </div>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #94a3b8;">
          This is an automated ticket confirmation from CampusConnect. See you at the event!
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email successfully delivered to ${toEmail}: ${info.messageId}`);
    return { success: true };
  } catch (err) {
    console.error(`❌ Mail delivery error for ${toEmail}:`, err);
    return { success: false, error: err.message };
  }
};

const sendCheckinEmail = async ({ toEmail, studentName, eventName, dateString, location, organizerName, qrCodeString, ticketId, checkedInTime }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = Number(process.env.EMAIL_PORT) || 465;

  if (!emailUser || !emailPass) {
    console.warn('⚠️ Mail configuration missing in environment. Check-in email not sent.');
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

  const qrImageLink = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrCodeString}`;

  const mailOptions = {
    from: emailHost.includes('resend') ? '"CampusConnect" <onboarding@resend.dev>' : `"CampusConnect Updates" <${emailUser}>`,
    to: toEmail,
    subject: `✅ Check-in Verified: ${eventName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 15px;">
          <h2 style="color: #10b981; margin: 0; font-family: sans-serif;">CampusConnect ✦</h2>
          <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">Check-in Successful ✓</p>
        </div>
        
        <div style="padding: 20px 0;">
          <p style="font-size: 16px; color: #1e293b;">Hi <strong>${studentName}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">
            Welcome! You have been successfully checked in for <strong>${eventName}</strong> organized by <strong>${organizerName}</strong>. 
          </p>
          
          <div style="background-color: #f0fdf4; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #10b981;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
              <tr>
                <td style="padding: 4px 0; font-weight: bold; width: 120px;">Event Name:</td>
                <td style="padding: 4px 0;">${eventName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: bold;">Check-in Time:</td>
                <td style="padding: 4px 0;">${checkedInTime}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: bold;">Venue:</td>
                <td style="padding: 4px 0;">${location}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: bold;">Ticket ID:</td>
                <td style="padding: 4px 0; font-family: monospace; color: #10b981;">${ticketId}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
            <p style="font-size: 13px; color: #475569; font-weight: bold; margin-bottom: 12px;">Your Checked-in QR Ticket:</p>
            <div style="display: inline-block; padding: 12px; background: #ffffff; border: 2px dashed #10b981; border-radius: 12px;">
              <img src="${qrImageLink}" alt="QR Entry Ticket" style="width: 200px; height: 200px; display: block;" />
              <div style="font-family: monospace; font-size: 12px; color: #0f172a; margin-top: 8px; font-weight: bold; letter-spacing: 2px;">
                ${qrCodeString}
              </div>
            </div>
            <p style="font-size: 11px; color: #64748b; margin-top: 10px;">This ticket is marked as scanned in our database.</p>
          </div>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #94a3b8;">
          Thank you for participating! Enjoy the event!
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Check-in confirmation email successfully delivered to ${toEmail}: ${info.messageId}`);
    return { success: true };
  } catch (err) {
    console.error(`❌ Check-in mail delivery error for ${toEmail}:`, err);
    return { success: false, error: err.message };
  }
};

module.exports = { sendTicketEmail, sendCheckinEmail };