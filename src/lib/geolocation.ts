/**
 * geolocation.ts
 *
 * IP-based country detection for streaming availability.
 * Uses ipapi.co (free, no API key required for low volume).
 * Result is cached in sessionStorage to avoid repeated fetches on navigation.
 * Falls back to 'US' on any failure.
 */

export async function getUserCountry(): Promise<string> {
  // Check sessionStorage cache first
  try {
    const cached = sessionStorage.getItem('userCountry');
    if (cached) return cached;
  } catch {
    // sessionStorage unavailable (e.g. private browsing edge cases)
  }

  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) throw new Error('ipapi.co response not ok');
    const data = await res.json();
    const country = (data.country_code as string) || 'US';
    try {
      sessionStorage.setItem('userCountry', country);
    } catch {
      // ignore storage errors
    }
    return country;
  } catch {
    return 'US'; // Fallback
  }
}
