// Sends PawTrack transactional email through Brevo to the signed-in user's own address.
//   { type: 'pin', pin: '1234' }          4-digit verification PIN
//   { type: 'auth-notification' }         "Google account connected" security notice
// Secrets: BREVO_API_KEY, BREVO_SENDER_EMAIL (a sender verified in Brevo), BREVO_SENDER_NAME (optional).
// The recipient is always the caller's own email from their Supabase session, so this cannot be used to mail strangers.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

async function sendMail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': Deno.env.get('BREVO_API_KEY')!, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: Deno.env.get('BREVO_SENDER_NAME') ?? 'PawTrack', email: Deno.env.get('BREVO_SENDER_EMAIL') },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Brevo responded ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`);
}

function pinEmail(name: string, email: string, pin: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; color: #1e293b;">
      <h2 style="color: #1a73e8; margin-top: 0;">PawTrack Pet Guardian Verification</h2>
      <p>Hello <strong>${esc(name)}</strong>,</p>
      <p>Your 4-digit verification PIN to connect and authorize pet recovery alerts for <strong>${esc(email)}</strong> is:</p>
      <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1a73e8; background: #f0f7ff; padding: 14px 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px dashed #93c5fd;">${esc(pin)}</div>
      <p style="font-size: 13px; color: #64748b;">This PIN is valid for 10 minutes. If you did not request this code, please disregard this email.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 11px; color: #94a3b8; text-align: center;">PawTrack NFC Pet Recovery &amp; Municipal Pound Network</p>
    </div>`;
}

function authNotificationEmail(name: string, email: string, when: Date): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff; color: #1e293b;">
      <h2 style="margin: 0 0 4px; font-size: 18px; color: #0f172a;">PawTrack Security Alert</h2>
      <p style="margin: 0 0 20px; font-size: 12px; color: #64748b;">Google Account Authorization Confirmation</p>
      <p style="font-size: 14.5px; line-height: 1.5; color: #334155;">Hello <strong>${esc(name)}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">Your Google account (<strong style="color: #0f172a;">${esc(email)}</strong>) was successfully connected to the <strong>PawTrack Pet Recovery &amp; Municipal Shelter Portal</strong>.</p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569;">Authorized Permissions Granted:</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; line-height: 1.7; color: #334155;">
          <li><strong>Google Profile Access:</strong> Verified your name and email address for guardian record keeping.</li>
          <li><strong>Verified Guardian Identity:</strong> Activated pet registration privileges and digital tag passes.</li>
          <li><strong>Urgent Municipal Alerts:</strong> Subscribed to instant 72-hour impound countdowns &amp; community NFC sighting alerts.</li>
        </ul>
      </div>
      <div style="font-size: 12.5px; color: #64748b; line-height: 1.6; background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 14px; border-radius: 4px; margin-bottom: 20px;">
        <strong>Security Notice:</strong> If you authorized this login, no further action is required. If you did not authorize this connection, please sign out of the portal and review your Google Account security permissions.
      </div>
      <p style="font-size: 12px; color: #94a3b8; margin: 0; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px;">
        PawTrack Inc. &bull; Compliant with Philippine Data Privacy Act (RA 10173) &amp; Google API Services Policy<br>
        Timestamp: ${when.toUTCString()}
      </p>
    </div>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405);

  if (!Deno.env.get('BREVO_API_KEY') || !Deno.env.get('BREVO_SENDER_EMAIL')) {
    return json({ error: 'Email is not configured yet.' }, 503);
  }

  // Who is calling: ask Supabase Auth about the session token
  const userRes = await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/user`, {
    headers: { Authorization: req.headers.get('Authorization') ?? '', apikey: Deno.env.get('SUPABASE_ANON_KEY') ?? '' },
  });
  const user = userRes.ok ? await userRes.json() : null;
  const email: string = user?.email ?? '';
  if (!email) return json({ error: 'Sign in first' }, 401);
  const name: string = String(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? 'Pet Guardian').slice(0, 80);

  let input: Record<string, unknown>;
  try {
    input = await req.json();
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }

  try {
    if (input.type === 'pin') {
      const pin = String(input.pin ?? '').trim();
      if (!/^\d{4}$/.test(pin)) return json({ error: 'Invalid 4-digit PIN provided' }, 400);
      await sendMail(email, `PawTrack Verification PIN [${pin}]`, pinEmail(name, email, pin));
    } else if (input.type === 'auth-notification') {
      await sendMail(email, 'Security Alert: Google Account Connected to PawTrack Pet Recovery', authNotificationEmail(name, email, new Date()));
    } else {
      return json({ error: 'Unknown email type' }, 400);
    }
  } catch (err) {
    console.error('Brevo error', (err as Error).message);
    return json({ error: 'The email could not be sent right now.' }, 502);
  }
  return json({ success: true, deliveredTo: email });
});
