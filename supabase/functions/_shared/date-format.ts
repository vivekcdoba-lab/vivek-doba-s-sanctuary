// Deno-compatible mirror of src/lib/dateFormat.ts
// Standard display format across all VDTS emails: "DD-Month-YYYY"

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
  // For "YYYY-MM-DD" strings (no time), construct in local context to avoid TZ shift.
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(input as any);
  return isNaN(d.getTime()) ? null : d;
}

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
