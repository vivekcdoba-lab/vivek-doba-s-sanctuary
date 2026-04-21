import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { COUNTRY_CODES, sanitizePhone, DEFAULT_COUNTRY_CODE } from '@/lib/phoneValidation';

interface PhoneInputProps {
  countryCode: string;
  phone: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneChange: (phone: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

const PhoneInput = ({
  countryCode,
  phone,
  onCountryCodeChange,
  onPhoneChange,
  label,
  required,
  placeholder = 'Mobile number',
  disabled,
  id,
}: PhoneInputProps) => {
  const cc = countryCode || DEFAULT_COUNTRY_CODE;

  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="flex gap-2">
        <select
          value={cc.trim()}
          onChange={(e) => onCountryCodeChange(e.target.value)}
          disabled={disabled}
          className="h-10 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 min-w-[110px]"
          aria-label="Country code"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={`${c.code}-${c.name}`} value={c.code.trim()}>
              {c.flag} {c.code.trim()}
            </option>
          ))}
        </select>
        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => onPhoneChange(sanitizePhone(e.target.value, cc))}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default PhoneInput;
