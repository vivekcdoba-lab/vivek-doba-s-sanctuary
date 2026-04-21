// Centralized phone, state, pincode validation & E.164 helpers

export interface CountryCode {
  code: string;       // E.164 prefix e.g. "+91"
  flag: string;       // emoji
  name: string;       // display name
  maxLen: number;     // national-number digit cap
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+91',  flag: '🇮🇳', name: 'India',          maxLen: 10 },
  { code: '+1',   flag: '🇺🇸', name: 'USA',            maxLen: 10 },
  { code: '+44',  flag: '🇬🇧', name: 'UK',             maxLen: 10 },
  { code: '+971', flag: '🇦🇪', name: 'UAE',            maxLen: 9  },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore',      maxLen: 8  },
  { code: '+61',  flag: '🇦🇺', name: 'Australia',      maxLen: 9  },
  { code: '+1 ',  flag: '🇨🇦', name: 'Canada',         maxLen: 10 },
  { code: '+49',  flag: '🇩🇪', name: 'Germany',        maxLen: 11 },
  { code: '+33',  flag: '🇫🇷', name: 'France',         maxLen: 9  },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia',   maxLen: 9  },
  { code: '+974', flag: '🇶🇦', name: 'Qatar',          maxLen: 8  },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait',         maxLen: 8  },
  { code: '+968', flag: '🇴🇲', name: 'Oman',           maxLen: 8  },
  { code: '+64',  flag: '🇳🇿', name: 'New Zealand',    maxLen: 9  },
  { code: '+27',  flag: '🇿🇦', name: 'South Africa',   maxLen: 9  },
  { code: '+60',  flag: '🇲🇾', name: 'Malaysia',       maxLen: 10 },
  { code: '+66',  flag: '🇹🇭', name: 'Thailand',       maxLen: 9  },
  { code: '+81',  flag: '🇯🇵', name: 'Japan',          maxLen: 10 },
  { code: '+86',  flag: '🇨🇳', name: 'China',          maxLen: 11 },
  { code: '+55',  flag: '🇧🇷', name: 'Brazil',         maxLen: 11 },
];

export const DEFAULT_COUNTRY_CODE = '+91';

export const getCountry = (code: string): CountryCode =>
  COUNTRY_CODES.find(c => c.code.trim() === code.trim()) || COUNTRY_CODES[0];

/** Sanitize a phone string to digits-only, capped at country max length. */
export const sanitizePhone = (raw: string, code: string): string => {
  const cap = getCountry(code).maxLen;
  return (raw || '').replace(/\D/g, '').slice(0, cap);
};

/** Validate phone for the given country code. Returns error message or null. */
export const validatePhone = (code: string, phone: string): string | null => {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return 'Phone number is required';
  if (code === '+91') {
    if (digits.length !== 10) return 'Indian mobile must be exactly 10 digits';
    if (!/^[6-9]/.test(digits)) return 'Indian mobile must start with 6, 7, 8 or 9';
    return null;
  }
  if (digits.length < 7 || digits.length > 15) return 'Phone must be 7–15 digits';
  return null;
};

/** Compose an E.164 string from country code + national number. */
export const toE164 = (code: string, phone: string): string => {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  const cc = code.trim().replace(/[^\d+]/g, '');
  return `${cc}${digits}`;
};

/** Parse a stored phone string into { code, phone }. Defaults to +91 if no prefix. */
export const parseE164 = (stored: string | null | undefined): { code: string; phone: string } => {
  if (!stored) return { code: DEFAULT_COUNTRY_CODE, phone: '' };
  const s = stored.trim();
  if (!s.startsWith('+')) {
    // Legacy plain number, default India
    return { code: DEFAULT_COUNTRY_CODE, phone: s.replace(/\D/g, '').slice(-10) };
  }
  // Try longest-first match against known prefixes
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.trim().length - a.code.trim().length);
  for (const c of sorted) {
    const cc = c.code.trim();
    if (s.startsWith(cc)) {
      return { code: cc, phone: s.slice(cc.length).replace(/\D/g, '') };
    }
  }
  return { code: DEFAULT_COUNTRY_CODE, phone: s.replace(/\D/g, '').slice(-10) };
};

// ───────── Indian states & UTs ─────────
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export const STATE_OTHER = 'Other';

/** Validate Indian pincode: 6 digits, first digit 1-9. */
export const validatePincode = (pin: string): string | null => {
  if (!pin) return null; // optional
  if (!/^[1-9]\d{5}$/.test(pin)) return 'Pincode must be 6 digits (cannot start with 0)';
  return null;
};

export const sanitizePincode = (raw: string): string =>
  (raw || '').replace(/\D/g, '').slice(0, 6);
