/**
 * Transactional email via Brevo (https://www.brevo.com) using its HTTPS API,
 * so no SMTP client or npm dependency is needed.
 *
 * Environment:
 *   BREVO_API_KEY       API key from Brevo > SMTP & API > API Keys (starts with "xkeysib-")
 *   BREVO_SENDER_EMAIL  A sender verified in Brevo > Senders, domains & dedicated IPs
 *   BREVO_SENDER_NAME   Optional display name (default: "PawTrack")
 */
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

function isConfigured() {
  return !!(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL);
}

async function sendMail({ to, subject, html }) {
  if (!isConfigured()) throw new Error('Brevo is not configured (BREVO_API_KEY / BREVO_SENDER_EMAIL)');

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      sender: { name: process.env.BREVO_SENDER_NAME || 'PawTrack', email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html
    })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Brevo responded ${response.status}: ${detail.slice(0, 200)}`);
  }
  return response.json().catch(() => ({}));
}

module.exports = { isConfigured, sendMail };
