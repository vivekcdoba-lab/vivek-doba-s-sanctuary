/**
 * Common IANA timezones grouped by region for the TimezonePicker.
 * The current UTC offset is computed live so DST shifts stay accurate.
 */
export interface TzOption {
  zone: string;
  label: string;
}

export const TIMEZONE_GROUPS: { region: string; zones: TzOption[] }[] = [
  {
    region: 'India & South Asia',
    zones: [
      { zone: 'Asia/Kolkata', label: 'India Standard Time (Mumbai, Delhi)' },
      { zone: 'Asia/Karachi', label: 'Pakistan (Karachi)' },
      { zone: 'Asia/Dhaka', label: 'Bangladesh (Dhaka)' },
      { zone: 'Asia/Kathmandu', label: 'Nepal (Kathmandu)' },
      { zone: 'Asia/Colombo', label: 'Sri Lanka (Colombo)' },
    ],
  },
  {
    region: 'Middle East',
    zones: [
      { zone: 'Asia/Dubai', label: 'UAE (Dubai)' },
      { zone: 'Asia/Riyadh', label: 'Saudi Arabia (Riyadh)' },
      { zone: 'Asia/Qatar', label: 'Qatar (Doha)' },
    ],
  },
  {
    region: 'Europe',
    zones: [
      { zone: 'Europe/London', label: 'UK (London)' },
      { zone: 'Europe/Berlin', label: 'Germany (Berlin)' },
      { zone: 'Europe/Paris', label: 'France (Paris)' },
      { zone: 'Europe/Amsterdam', label: 'Netherlands (Amsterdam)' },
      { zone: 'Europe/Madrid', label: 'Spain (Madrid)' },
      { zone: 'Europe/Rome', label: 'Italy (Rome)' },
      { zone: 'Europe/Zurich', label: 'Switzerland (Zurich)' },
    ],
  },
  {
    region: 'Americas',
    zones: [
      { zone: 'America/New_York', label: 'USA Eastern (New York)' },
      { zone: 'America/Chicago', label: 'USA Central (Chicago)' },
      { zone: 'America/Denver', label: 'USA Mountain (Denver)' },
      { zone: 'America/Los_Angeles', label: 'USA Pacific (Los Angeles)' },
      { zone: 'America/Toronto', label: 'Canada (Toronto)' },
      { zone: 'America/Sao_Paulo', label: 'Brazil (São Paulo)' },
    ],
  },
  {
    region: 'Asia Pacific',
    zones: [
      { zone: 'Asia/Singapore', label: 'Singapore' },
      { zone: 'Asia/Hong_Kong', label: 'Hong Kong' },
      { zone: 'Asia/Tokyo', label: 'Japan (Tokyo)' },
      { zone: 'Asia/Shanghai', label: 'China (Shanghai)' },
      { zone: 'Asia/Bangkok', label: 'Thailand (Bangkok)' },
      { zone: 'Australia/Sydney', label: 'Australia (Sydney)' },
      { zone: 'Australia/Melbourne', label: 'Australia (Melbourne)' },
      { zone: 'Pacific/Auckland', label: 'New Zealand (Auckland)' },
    ],
  },
  {
    region: 'Africa',
    zones: [
      { zone: 'Africa/Johannesburg', label: 'South Africa (Johannesburg)' },
      { zone: 'Africa/Cairo', label: 'Egypt (Cairo)' },
      { zone: 'Africa/Nairobi', label: 'Kenya (Nairobi)' },
    ],
  },
  {
    region: 'UTC',
    zones: [{ zone: 'UTC', label: 'UTC (Coordinated Universal Time)' }],
  },
];

/** Detect the viewer's browser timezone, falling back to Asia/Kolkata. */
export function detectBrowserTz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch {
    return 'Asia/Kolkata';
  }
}

/** Pretty current offset for a zone, e.g. "+05:30" or "-04:00". */
export function offsetFor(zone: string, date: Date = new Date()): string {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      timeZoneName: 'shortOffset',
    });
    const parts = fmt.formatToParts(date);
    const tz = parts.find((p) => p.type === 'timeZoneName')?.value || '';
    const m = tz.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!m) return tz.replace(/^GMT/, '') || 'UTC';
    const sign = m[1];
    const hh = m[2].padStart(2, '0');
    const mm = (m[3] || '00').padStart(2, '0');
    return `${sign}${hh}:${mm}`;
  } catch {
    return '';
  }
}

/** Short label for a zone — uses the IANA city name when no friendly label exists. */
export function shortLabelFor(zone: string): string {
  const flat = TIMEZONE_GROUPS.flatMap((g) => g.zones);
  const hit = flat.find((z) => z.zone === zone);
  if (hit) return hit.label;
  return zone.split('/').pop()?.replace(/_/g, ' ') || zone;
}
