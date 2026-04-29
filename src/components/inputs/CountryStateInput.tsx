import { useMemo } from "react";
import { State } from "country-state-city";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import StatePincodeInput from "./StatePincodeInput";

export const COUNTRIES: { code: string; name: string }[] = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "SG", name: "Singapore" },
  { code: "NZ", name: "New Zealand" },
  { code: "MY", name: "Malaysia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "NL", name: "Netherlands" },
  { code: "IE", name: "Ireland" },
  { code: "ZA", name: "South Africa" },
  { code: "QA", name: "Qatar" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "OM", name: "Oman" },
  { code: "KW", name: "Kuwait" },
  { code: "BH", name: "Bahrain" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "HK", name: "Hong Kong" },
  { code: "TH", name: "Thailand" },
  { code: "ID", name: "Indonesia" },
  { code: "PH", name: "Philippines" },
  { code: "VN", name: "Vietnam" },
  { code: "LK", name: "Sri Lanka" },
  { code: "NP", name: "Nepal" },
  { code: "BD", name: "Bangladesh" },
  { code: "OTHER", name: "Other" },
];

const STATE_OTHER = "Other";

interface Props {
  country: string;
  state: string;
  pincode: string;
  onCountryChange: (v: string) => void;
  onStateChange: (v: string) => void;
  onPincodeChange: (v: string) => void;
  required?: boolean;
}

const CountryStateInput = ({
  country,
  state,
  pincode,
  onCountryChange,
  onStateChange,
  onPincodeChange,
  required,
}: Props) => {
  const selectedCountry = country || "IN";
  const isIndia = selectedCountry === "IN";

  // Load states for non-India countries (ISO-3166-2 subdivisions)
  const countryStates = useMemo(() => {
    if (isIndia || selectedCountry === "OTHER") return [];
    try {
      return State.getStatesOfCountry(selectedCountry) || [];
    } catch {
      return [];
    }
  }, [selectedCountry, isIndia]);

  const stateNames = countryStates.map((s) => s.name);
  const isCustomState = !!state && state !== "Default" && stateNames.length > 0 && !stateNames.includes(state);
  const dropdownValue = isCustomState ? STATE_OTHER : state;

  const handleCountry = (v: string) => {
    onCountryChange(v);
    // Clear state on country change so user picks fresh from new list
    onStateChange("");
  };

  const handleStateDropdown = (v: string) => {
    if (v === STATE_OTHER) {
      onStateChange(""); // clear so the free-text input appears empty for typing
    } else {
      onStateChange(v);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Country {required && <span className="text-destructive">*</span>}</Label>
        <select
          value={selectedCountry}
          onChange={(e) => handleCountry(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>

      {isIndia ? (
        <StatePincodeInput
          state={state}
          pincode={pincode}
          onStateChange={onStateChange}
          onPincodeChange={onPincodeChange}
          required={required}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>State / Region</Label>
            {stateNames.length > 0 ? (
              <>
                <select
                  value={dropdownValue || ""}
                  onChange={(e) => handleStateDropdown(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select state / region</option>
                  {countryStates.map((s) => (
                    <option key={s.isoCode} value={s.name}>{s.name}</option>
                  ))}
                  <option value={STATE_OTHER}>{STATE_OTHER}</option>
                </select>
                {(dropdownValue === STATE_OTHER || isCustomState) && (
                  <Input
                    value={isCustomState ? state : ""}
                    onChange={(e) => onStateChange(e.target.value.slice(0, 80))}
                    placeholder="Type state / region"
                    className="mt-1.5"
                    autoFocus
                  />
                )}
              </>
            ) : (
              <Input
                value={state === "Default" ? "" : state}
                onChange={(e) => onStateChange(e.target.value.slice(0, 80))}
                placeholder="State / Region"
              />
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Postal / ZIP Code {required && <span className="text-destructive">*</span>}</Label>
            <Input
              value={pincode}
              onChange={(e) => onPincodeChange(e.target.value.slice(0, 12))}
              placeholder="Postal / ZIP code"
              maxLength={12}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryStateInput;
