// emailService.js
// No Nodemailer needed! We use standard web traffic which Render cannot block.

const sendBrevoEmail = async (payload) => {
  const apiKey = process.env.EMAIL_PASS; // We will map your Brevo API key here
  const senderEmail = process.env.EMAIL_USER; // Your verified Brevo sender email

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: "CampusConnect", email: senderEmail },
        to: [{ email: payload.toEmail }],
        subject: payload.subject,
        htmlContent: payload.htmlContent
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✉️ Email successfully delivered to ${payload.toEmail}:`, data.messageId || data);
      return { success: true };
    } else {
      console.error(`❌ Brevo API rejected delivery:`, data);
      return { success: false, error: data.message || 'API Error' };
    }
  } catch (err) {
    console.error(`❌ Network error connecting to Brevo:`, err);
    return { success: false, error: err.message };
  }
};

const sendTicketEmail = async ({ toEmail, studentName, eventName, dateString, location, organizerName, qrCodeString, ticketId }) => {
  const qrImageLink = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrCodeString}`;

  const htmlContent = `
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
            <tr><td style="padding: 4px 0; font-weight: bold; width: 120px;">Event Name:</td><td style="padding: 4px 0;">${eventName}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: bold;">Date & Time:</td><td style="padding: 4px 0;">${dateString}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: bold;">Venue:</td><td style="padding: 4px 0;">${location}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: bold;">Ticket ID:</td><td style="padding: 4px 0; font-family: monospace; color: #6366f1;">${ticketId}</td></tr>
          </table>
        </div>
        <div style="text-align: center; margin: 25px 0;">
          <div style="display: inline-block; padding: 12px; background: #ffffff; border: 2px dashed #6366f1; border-radius: 12px;">
            <img src="${qrImageLink}" alt="QR Entry Ticket" style="width: 200px; height: 200px; display: block;" />
            <div style="font-family: monospace; font-size: 12px; color: #0f172a; margin-top: 8px; font-weight: bold; letter-spacing: 2px;">${qrCodeString}</div>
          </div>
        </div>
      </div>
    </div>`;

  return await sendBrevoEmail({ toEmail, subject: `🎟️ Entry Ticket Confirmed: ${eventName}`, htmlContent });
};

const sendCheckinEmail = async ({ toEmail, studentName, eventName, dateString, location, organizerName, qrCodeString, ticketId, checkedInTime }) => {
  const qrImageLink = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrCodeString}`;

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 15px;">
        <h2 style="color: #10b981; margin: 0; font-family: sans-serif;">CampusConnect ✦</h2>
        <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">Check-in Successful ✓</p>
      </div>
      <div style="padding: 20px 0;">
        <p style="font-size: 16px; color: #1e293b;">Hi <strong>${studentName}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.5;">
          Welcome! You have been successfully checked in for <strong>${eventName}</strong>.
        </p>
        <div style="background-color: #f0fdf4; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #10b981;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
            <tr><td style="padding: 4px 0; font-weight: bold; width: 120px;">Event Name:</td><td style="padding: 4px 0;">${eventName}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: bold;">Check-in Time:</td><td style="padding: 4px 0;">${checkedInTime}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: bold;">Ticket ID:</td><td style="padding: 4px 0; font-family: monospace; color: #10b981;">${ticketId}</td></tr>
          </table>
        </div>
      </div>
    </div>`;

  return await sendBrevoEmail({ toEmail, subject: `✅ Check-in Verified: ${eventName}`, htmlContent });
};

module.exports = { sendTicketEmail, sendCheckinEmail };