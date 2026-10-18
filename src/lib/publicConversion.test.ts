import { describe, expect, it, vi } from 'vitest';
import { BOOKING_PATH, PUBLIC_CALL_URL, PUBLIC_WHATSAPP_URL, THANK_YOU_PATH, submitPublicEnquiry } from './publicConversion';

describe('public conversion', () => {
  it('uses the requested booking and confirmation destinations', () => {
    expect(BOOKING_PATH).toBe('/book-appointment');
    expect(THANK_YOU_PATH).toBe('/thank-you');
    expect(PUBLIC_CALL_URL).toBe('tel:+919607050111');
    expect(PUBLIC_WHATSAPP_URL).toBe('https://wa.me/919607050111');
  });
  it('redirects only after a successful save', async () => {
    const order: string[] = [];
    await submitPublicEnquiry(async () => { order.push('saved'); }, async () => { order.push('notified'); }, () => order.push('redirected'), vi.fn());
    expect(order).toEqual(['saved', 'redirected', 'notified']);
  });
  it('does not redirect or notify when saving fails', async () => {
    const redirect = vi.fn(); const notify = vi.fn();
    await expect(submitPublicEnquiry(async () => { throw new Error('Save failed'); }, notify, redirect, vi.fn())).rejects.toThrow('Save failed');
    expect(redirect).not.toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
  });
  it('keeps the successful redirect when notification fails', async () => {
    const redirect = vi.fn(); const warning = vi.fn();
    await submitPublicEnquiry(async () => {}, async () => { throw new Error('Email failed'); }, redirect, warning);
    expect(redirect).toHaveBeenCalledOnce();
    expect(warning).toHaveBeenCalledOnce();
  });
});