import { useMemo } from 'react';
import { Globe } from 'lucide-react';
import { TIMEZONE_GROUPS, offsetFor, detectBrowserTz } from '@/lib/timezones';

interface TimezonePickerProps {
  value: string;
  onChange: (zone: string) => void;
  className?: string;
  /** Render label-less variant (just the select). */
  compact?: boolean;
}

/**
 * Grouped native <select> with live UTC offsets next to each zone.
 * Defaults to the viewer's browser timezone for "Your device".
 */
export default function TimezonePicker({
  value,
  onChange,
  className = '',
  compact = false,
}: TimezonePickerProps) {
  const browserTz = useMemo(() => detectBrowserTz(), []);
  const isCustomZone = useMemo(
    () => !TIMEZONE_GROUPS.some((g) => g.zones.some((z) => z.zone === value)),
    [value],
  );

  return (
    <div className={className}>
      {!compact && (
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Globe className="w-3 h-3" /> Timezone
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${compact ? '' : 'mt-1'} border border-input rounded-lg px-3 py-2 text-sm bg-background`}
      >
        <optgroup label="— Your device —">
          <option value={browserTz}>
            {browserTz} (UTC{offsetFor(browserTz)}) — your local
          </option>
        </optgroup>
        {isCustomZone && value !== browserTz && (
          <optgroup label="— Currently selected —">
            <option value={value}>
              {value} (UTC{offsetFor(value)})
            </option>
          </optgroup>
        )}
        {TIMEZONE_GROUPS.map((g) => (
          <optgroup key={g.region} label={g.region}>
            {g.zones.map((z) => (
              <option key={z.zone} value={z.zone}>
                {z.label} (UTC{offsetFor(z.zone)})
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
