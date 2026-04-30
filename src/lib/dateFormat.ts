// Centralized date formatter for VDTS app — display only.
// Standard format across the entire application: "DD-Month-YYYY"
// e.g. "30-April-2026", "30-अप्रैल-2026", "30-एप्रिल-2026"
// Database storage, ISO payloads, ICS files, <input type="date"> values
// remain ISO YYYY-MM-DD. Use this only for human display.

export type Lang = 'en' | 'hi' | 'mr';

export const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTHS_HI = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर',
];

export const MONTHS_MR = [
  'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
  'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर',
];

function monthsFor(lang: Lang): string[] {
  if (lang === 'hi') return MONTHS_HI;
  if (lang === 'mr') return MONTHS_MR;
  return MONTHS_EN;
}

function toDate(input: string | Date | number | null | undefined): Date | null {
  if (input == null || input === '') return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  const d = new Date(input as any);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format a date as "DD-Month-YYYY".
 * Returns empty string for null/invalid input.
 */
export function formatDateDMY(
  input: string | Date | number | null | undefined,
  lang: Lang = 'en',
): string {
  const d = toDate(input);
  if (!d) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const month = monthsFor(lang)[d.getMonth()];
  const yyyy = d.getFullYear();
  return `${dd}-${month}-${yyyy}`;
}

/**
 * Format a date and time as "DD-Month-YYYY • HH:MM"
 */
export function formatDateTimeDMY(
  input: string | Date | number | null | undefined,
  lang: Lang = 'en',
): string {
  const d = toDate(input);
  if (!d) return '';
  const datePart = formatDateDMY(d, lang);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${datePart} • ${hh}:${mm}`;
}
