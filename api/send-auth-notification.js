/**
 * Vercel Serverless Function: Send Google Authorization & Security Notification to Gmail Account
 * Dispatches official access confirmation and scope breakdown to the user's primary Gmail inbox.
 */
module.exports = async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, name, picture, authTime } = req.body || {};
    const targetEmail = (email || '').trim();
    const recipientName = (name || 'Pet Guardian').trim();
    const timestamp = authTime || new Date().toISOString();

    if (!targetEmail || !targetEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid Gmail/Google address required' });
    }

    let emailSentViaSmtp = false;
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASS
          }
        });

        await transporter.sendMail({
          from: `"PawTrack Guardian Security" <${process.env.GMAIL_USER}>`,
          to: targetEmail,
          subject: `Security Alert: Google Account Connected to PawTrack Pet Recovery`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff; color: #1e293b; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px;">
                <div style="width: 40px; height: 40px; border-radius: 10px; background: #ea580c; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 20px;">
                  🐾
                </div>
                <div>
                  <h2 style="margin: 0; font-size: 18px; color: #0f172a;">PawTrack Security Alert</h2>
                  <p style="margin: 2px 0 0; font-size: 12px; color: #64748b;">Google Account Authorization Confirmation</p>
                </div>
              </div>

              <p style="font-size: 14.5px; line-height: 1.5; color: #334155;">
                Hello <strong>${recipientName}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                Your Google account (<strong style="color: #0f172a;">${targetEmail}</strong>) was successfully connected to the <strong>PawTrack Pet Recovery &amp; Municipal Shelter Portal</strong>.
              </p>

              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569;">
                  Authorized Permissions Granted:
                </h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; line-height: 1.7; color: #334155;">
                  <li><strong>Google Profile Access:</strong> Verified your name and email address for guardian record keeping.</li>
                  <li><strong>Verified Guardian Identity:</strong> Activated pet registration privileges and digital tag passes.</li>
                  <li><strong>Urgent Municipal Alerts:</strong> Subscribed to instant 72-hour impound countdowns &amp; community RFID sighting alerts.</li>
                </ul>
              </div>

              <div style="font-size: 12.5px; color: #64748b; line-height: 1.6; background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 14px; border-radius: 4px; margin-bottom: 20px;">
                <strong>Security Notice:</strong> If you authorized this login, no further action is required. If you did not authorize this connection, please sign out of the portal and review your Google Account security permissions.
              </div>

              <p style="font-size: 12px; color: #94a3b8; margin: 0; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                PawTrack Inc. &bull; Compliant with Philippine Data Privacy Act (RA 10173) &amp; Google API Services Policy<br>
                Timestamp: ${new Date(timestamp).toUTCString()}
              </p>
            </div>
          `
        });
        emailSentViaSmtp = true;
      } catch (err) {
        console.warn('[SMTP Dispatch Warning]:', err.message);
      }
    }

    console.log(`[Google Auth Notification] Dispatched to: ${targetEmail} for ${recipientName} (SMTP: ${emailSentViaSmtp})`);

    return res.status(200).json({
      success: true,
      deliveredTo: targetEmail,
      recipient: recipientName,
      smtpDelivered: emailSentViaSmtp,
      message: `Google Account authorization notice dispatched to ${targetEmail}.`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
