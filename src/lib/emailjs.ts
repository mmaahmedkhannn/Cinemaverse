import emailjs from '@emailjs/browser';

// To make this work, you must:
// 1. Create a free account at https://www.emailjs.com/
// 2. Add an Email Service (e.g. Gmail)
// 3. Create an Email Template with EXACTLY this format in the visual editor:
//    To Email: {{to_email}}
//    Subject: Welcome to CinemaVerse!
//    Message content:
//    {{{message}}} 
//    (Note: The triple braces {{{}}} are REQUIRED for EmailJS to render HTML properly!)
// 4. Fill in your keys below, or use environment variables!

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID_HERE';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID_HERE';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY_HERE';

export const sendWelcomeEmail = async (userEmail: string) => {
  if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID_HERE') {
    console.warn("EmailJS is not configured! Check src/lib/emailjs.ts to set it up.");
    return false;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #080810;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #080810;
          padding: 40px 20px;
          text-align: center;
        }
        .logo {
          font-size: 32px;
          font-weight: 800;
          color: #E50914;
          letter-spacing: 4px;
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        .tagline {
          font-size: 18px;
          color: #9ca3af;
          margin-bottom: 40px;
          font-weight: 300;
        }
        .content-box {
          background-color: #111116;
          border: 1px solid #1f1f2e;
          border-radius: 16px;
          padding: 30px;
          text-align: left;
          margin-bottom: 30px;
        }
        .list-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #ffffff;
        }
        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0 0 30px 0;
        }
        .feature-list li {
          font-size: 16px;
          color: #d1d5db;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
        }
        .feature-list span {
          margin-right: 12px;
          font-size: 20px;
        }
        .verification-msg {
          background-color: rgba(229, 9, 20, 0.1);
          border: 1px solid rgba(229, 9, 20, 0.3);
          border-radius: 8px;
          padding: 15px;
          color: #fca5a5;
          font-size: 14px;
          margin-bottom: 30px;
          text-align: center;
        }
        .cta-container {
          text-align: center;
        }
        .cta-button {
          display: inline-block;
          background-color: #E50914;
          color: #ffffff !important;
          text-decoration: none;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: bold;
          border-radius: 12px;
          letter-spacing: 1px;
        }
        .footer {
          margin-top: 40px;
          font-size: 12px;
          color: #4b5563;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">CINEMAVERSE</div>
        <div class="tagline">Welcome to the Universe of Cinema</div>
        
        <div class="content-box">
          <div class="list-title">You've successfully unlocked:</div>
          <ul class="feature-list">
            <li><span>🎬</span> 500,000+ Movies & TV Shows</li>
            <li><span>⭐</span> CV Scores & Ratings</li>
            <li><span>⚔️</span> Movie Battles</li>
            <li><span>📋</span> Personal Watchlist</li>
            <li><span>🎁</span> CinemaVerse Wrapped</li>
          </ul>

          <div class="verification-msg">
            Please verify your email using the separate verification email we just sent you.
          </div>

          <div class="cta-container">
            <a href="https://cinemaverse.com" class="cta-button">Start Exploring &rarr;</a>
          </div>
        </div>

        <div class="footer">
          &copy; 2026 CinemaVerse &mdash; The Universe of Cinema
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: userEmail,
        message: htmlContent,
      },
      EMAILJS_PUBLIC_KEY
    );
    return response.status === 200;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return false;
  }
};
