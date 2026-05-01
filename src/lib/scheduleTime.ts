// Helpers to enforce "no past scheduling" and pre-fill dialogs with current
// local time across Admin & Coach schedule pages.
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

/** Today's date as YYYY-MM-DD in the given IANA timezone. */
export function todayInTz(tz: string): string {
  return formatInTimeZone(new Date(), tz, 'yyyy-MM-dd');
}

/** HH:MM in the given IANA timezone. */
export function nowHHMM(tz: string): string {
  return formatInTimeZone(new Date(), tz, 'HH:mm');
}

/** Current HH:MM rounded UP to the next `stepMin` minutes (default 15). */
export function nowRoundedHHMM(tz: string, stepMin = 15): string {
  const hhmm = nowHHMM(tz);
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m;
  const rounded = Math.ceil((total + 1) / stepMin) * stepMin; // strictly future
  const rh = Math.floor((rounded % (24 * 60)) / 60);
  const rm = rounded % 60;
  return `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}`;
}

/** Add one hour to an HH:MM string (wraps within day). */
export function addOneHourHHMM(t: string): string {
  if (!t || t.length < 4) return t;
  const [hStr, mStr] = t.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return t;
  const next = (h + 1) % 24;
  return `${String(next).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** True iff (date, HH:MM, tz) resolves to a moment strictly in the future. */
export function isFutureLocal(date: string, time: string, tz: string): boolean {
  if (!date || !time) return false;
  try {
    const utc = fromZonedTime(`${date} ${time.length === 5 ? time + ':00' : time}`, tz);
    return utc.getTime() > Date.now();
  } catch {
    return false;
  }
}

/** Current local moment formatted "DD-Mon-YYYY HH:mm". */
export function nowLabel(tz: string): string {
  return formatInTimeZone(new Date(), tz, 'dd-MMM-yyyy HH:mm');
}
