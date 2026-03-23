import emailjs from '@emailjs/browser';

// ═══════════════════════════════════════════════════════════
// EmailJS Configuration
// ═══════════════════════════════════════════════════════════
// 1. Sign up at https://www.emailjs.com (free: 200 emails/month)
// 2. Create an Email Service (Gmail, Outlook, etc.)
// 3. Create an Email Template:
//    - To Email: {{to_email}}
//    - Subject: 🎬 Welcome to CinemaDiscovery — You're In!
//    - Content: {{{message}}}   ← TRIPLE braces required for HTML!
// 4. Add your keys to .env:
//    VITE_EMAILJS_SERVICE_ID=your_service_id
//    VITE_EMAILJS_TEMPLATE_ID=your_template_id
//    VITE_EMAILJS_PUBLIC_KEY=your_public_key
// ═══════════════════════════════════════════════════════════

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID_HERE';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID_HERE';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY_HERE';

const buildWelcomeHTML = (userEmail: string): string => {
  const userName = userEmail.split('@')[0];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CinemaDiscovery</title>
</head>
<body style="margin:0;padding:0;background-color:#080810;font-family:Arial,Helvetica,sans-serif;">

  <!-- Top Red Border -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#080810;">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#080810,#E50914,#080810);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Main Container -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#080810;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:8px;">
              <span style="font-size:42px;font-weight:900;color:#E50914;letter-spacing:8px;font-family:Arial,Helvetica,sans-serif;">CINEMADISCOVERY</span>
            </td>
          </tr>

          <!-- Tagline -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <span style="font-size:14px;color:#9ca3af;letter-spacing:3px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">The Universe of Cinema</span>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <table role="presentation" width="80" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height:2px;background-color:#E50914;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Welcome Text -->
          <tr>
            <td align="center" style="padding-bottom:12px;">
              <span style="font-size:28px;font-weight:700;color:#FFFFFF;font-family:Arial,Helvetica,sans-serif;">Welcome, ${userName}!</span>
            </td>
          </tr>

          <!-- Subtitle -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:15px;color:#9ca3af;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Your account has been created successfully.<br>Please verify your email using the separate verification email we just sent you.</span>
            </td>
          </tr>

          <!-- Feature Box -->
          <tr>
            <td style="padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111116;border:1px solid #1f1f2e;border-radius:16px;">
                <tr>
                  <td style="padding:28px 32px 12px 32px;">
                    <span style="font-size:16px;font-weight:700;color:#FFFFFF;font-family:Arial,Helvetica,sans-serif;">You've unlocked:</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 32px 28px 32px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;font-size:15px;color:#d1d5db;font-family:Arial,Helvetica,sans-serif;">
                          <span style="color:#E50914;font-size:14px;">✦</span>&nbsp;&nbsp;500,000+ Movies &amp; TV Shows
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;font-size:15px;color:#d1d5db;font-family:Arial,Helvetica,sans-serif;">
                          <span style="color:#E50914;font-size:14px;">✦</span>&nbsp;&nbsp;CV Scores &amp; Ratings
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;font-size:15px;color:#d1d5db;font-family:Arial,Helvetica,sans-serif;">
                          <span style="color:#E50914;font-size:14px;">✦</span>&nbsp;&nbsp;Movie Battles
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;font-size:15px;color:#d1d5db;font-family:Arial,Helvetica,sans-serif;">
                          <span style="color:#E50914;font-size:14px;">✦</span>&nbsp;&nbsp;Personal Watchlist
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;font-size:15px;color:#d1d5db;font-family:Arial,Helvetica,sans-serif;">
                          <span style="color:#E50914;font-size:14px;">✦</span>&nbsp;&nbsp;CinemaDiscovery Wrapped
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;font-size:15px;color:#d1d5db;font-family:Arial,Helvetica,sans-serif;">
                          <span style="color:#E50914;font-size:14px;">✦</span>&nbsp;&nbsp;Cinematic Timeline of History
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:32px 0;">
              <a href="https://savemyreel.online" target="_blank" rel="noopener noreferrer" style="display:inline-block;background-color:#E50914;color:#ffffff;text-decoration:none;padding:16px 40px;font-size:16px;font-weight:700;font-family:Arial,Helvetica,sans-serif;border-radius:12px;letter-spacing:1px;">START EXPLORING &rarr;</a>
            </td>
          </tr>

          <!-- Bottom Divider -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height:1px;background-color:#1f1f2e;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-bottom:8px;">
              <span style="font-size:12px;color:#4b5563;font-family:Arial,Helvetica,sans-serif;">&copy; 2026 CinemaDiscovery &mdash; The Universe of Cinema</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <span style="font-size:11px;color:#374151;font-family:Arial,Helvetica,sans-serif;">You received this because you signed up at savemyreel.online</span>
            </td>
          </tr>

          <!-- Footer Links -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <a href="https://savemyreel.online/about" style="font-size:11px;color:#6b7280;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">About</a>
              <span style="color:#374151;font-size:11px;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
              <a href="https://savemyreel.online/contact" style="font-size:11px;color:#6b7280;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Contact</a>
              <span style="color:#374151;font-size:11px;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
              <a href="https://savemyreel.online/privacy" style="font-size:11px;color:#6b7280;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Unsubscribe</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

  <!-- Bottom Red Border -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#080810;">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#080810,#E50914,#080810);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
};

export const sendWelcomeEmail = async (userEmail: string): Promise<boolean> => {
  if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID_HERE') {
    console.warn('[CinemaDiscovery] EmailJS not configured — check src/lib/emailjs.ts');
    return false;
  }

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: userEmail,
        message: buildWelcomeHTML(userEmail),
      },
      EMAILJS_PUBLIC_KEY
    );
    console.log('[CinemaDiscovery] Welcome email sent!');
    return response.status === 200;
  } catch (error) {
    console.error('[CinemaDiscovery] Failed to send welcome email:', error);
    return false;
  }
};

const buildBattleResultsHTML = (winnerName: string, pct: number, battleTitle: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Battle Results</title>
</head>
<body style="margin:0;padding:0;background-color:#080810;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#080810;padding:40px 20px;">
    <tr>
      <td align="center">
        <span style="font-size:32px;font-weight:900;color:#E50914;letter-spacing:4px;">CINEMADISCOVERY</span><br><br>
        <span style="font-size:24px;color:#FFFFFF;font-weight:bold;">${battleTitle}</span><br><br>
        <div style="background-color:#111116;border:1px solid #1f1f2e;border-radius:16px;padding:30px;max-width:500px;text-align:center;">
          <h2 style="color:#facc15;font-size:28px;margin:0 0 10px 0;">We Have A Winner!</h2>
          <p style="color:#d1d5db;font-size:18px;line-height:1.5;">
            The community has spoken. <br>
            <strong style="color:#ffffff;font-size:22px;">${winnerName}</strong> <br>
            WINS with <strong style="color:#facc15;font-size:24px;">${pct}%</strong> of the votes!
          </p>
        </div><br><br>
        <a href="https://savemyreel.online/battles" style="display:inline-block;background-color:#E50914;color:#ffffff;text-decoration:none;padding:16px 40px;font-weight:bold;border-radius:12px;">VOTE IN NEXT BATTLE &rarr;</a>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const sendBattleResultsEmail = async (emails: string[], winnerName: string, pct: number, battleTitle: string) => {
  if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID_HERE') {
    console.warn('[CinemaDiscovery] EmailJS not configured');
    return;
  }
  
  const subject = "🎬 This Week's Battle Results — CinemaDiscovery";
  const html = buildBattleResultsHTML(winnerName, pct, battleTitle);

  // EmailJS limits frontend concurrency slightly, executing sequentially with tiny delay is safer.
  for (const email of emails) {
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: email,
        subject: subject,
        message: html,
      }, EMAILJS_PUBLIC_KEY);
      // await new Promise(r => setTimeout(r, 200)); // rate limit buffer
    } catch (e) {
      console.error('Failed sending battle email to:', email, e);
    }
  }
};
