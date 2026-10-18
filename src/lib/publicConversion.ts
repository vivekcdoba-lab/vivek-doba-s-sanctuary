export const BOOKING_PATH = '/book-appointment';
export const THANK_YOU_PATH = '/thank-you';
export const PUBLIC_WHATSAPP_URL = 'https://wa.me/919607050111';
export const PUBLIC_CALL_URL = 'tel:+919607050111';

/** Saving is mandatory; an email notification failure must not invalidate a saved enquiry. */
export async function submitPublicEnquiry(
  save: () => Promise<void>,
  notify: () => Promise<void>,
  onSaved: () => void,
  onNotificationError: () => void,
) {
  await save();
  onSaved();
  try { await notify(); } catch { onNotificationError(); }
}