// Opens an external URL in a new top-level browser tab.
// Uses window.top when available so navigation escapes the Lovable preview iframe
// (sites like wa.me, instagram.com, youtube.com, facebook.com send X-Frame-Options: DENY
// and refuse to load inside iframes — clicks from inside the iframe get blocked
// with ERR_BLOCKED_BY_RESPONSE unless we open in the top window).
export function openExternal(url: string) {
  try {
    const target = (window.top ?? window) as Window;
    const win = target.open(url, '_blank', 'noopener,noreferrer');
    if (win) win.opener = null;
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export const WHATSAPP_SUPPORT_MESSAGE =
  "Namaste, I run a business and would like to understand which program fits me.";

export function openWhatsApp(phone = '919607050111', message = WHATSAPP_SUPPORT_MESSAGE) {
  openExternal(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
}
