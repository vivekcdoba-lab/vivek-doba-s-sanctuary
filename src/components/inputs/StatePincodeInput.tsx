import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { INDIAN_STATES, STATE_OTHER, sanitizePincode } from '@/lib/phoneValidation';

interface StatePincodeInputProps {
  state: string;        // selected state OR free-text "Other" value when isOther
  pincode: string;
  onStateChange: (state: string) => void;
  onPincodeChange: (pin: string) => void;
  required?: boolean;
}

const StatePincodeInput = ({
  state,
  pincode,
  onStateChange,
  onPincodeChange,
  required,
}: StatePincodeInputProps) => {
  // If the stored state isn't in the standard list (and isn't empty), treat it as Other
  const isOther = !!state && !INDIAN_STATES.includes(state);
  const dropdownValue = isOther ? STATE_OTHER : state;

  const handleDropdown = (v: string) => {
    if (v === STATE_OTHER) {
      // Clear so user can type a custom value
      onStateChange('');
    } else {
      onStateChange(v);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label>State {required && <span className="text-destructive">*</span>}</Label>
        <select
          value={dropdownValue || ''}
          onChange={(e) => handleDropdown(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Select state</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
          <option value={STATE_OTHER}>{STATE_OTHER}</option>
        </select>
        {(dropdownValue === STATE_OTHER || (isOther && state === '')) && (
          <Input
            value={isOther ? state : ''}
            onChange={(e) => onStateChange(e.target.value)}
            placeholder="Type state / region"
            autoFocus
          />
        )}
      </div>
      <div className="space-y-1.5">
        <Label>Pincode {required && <span className="text-destructive">*</span>}</Label>
        <Input
          inputMode="numeric"
          value={pincode}
          onChange={(e) => onPincodeChange(sanitizePincode(e.target.value))}
          placeholder="6-digit pincode"
          maxLength={6}
        />
      </div>
    </div>
  );
};

export default StatePincodeInput;
