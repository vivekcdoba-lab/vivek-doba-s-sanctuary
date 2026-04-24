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
  const isIndia = (country || "IN") === "IN";

  const handleCountry = (v: string) => {
    onCountryChange(v);
    if (v !== "IN") {
      onStateChange("Default");
    } else if (state === "Default") {
      onStateChange("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Country {required && <span className="text-destructive">*</span>}</Label>
        <select
          value={country || "IN"}
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
            <Input value="Default" readOnly className="bg-muted/40 cursor-not-allowed" />
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
