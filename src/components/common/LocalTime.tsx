import { useMemo } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { detectBrowserTz, offsetFor, shortLabelFor } from '@/lib/timezones';

interface Props {
  startAt?: string | null;
  /** Stored timezone the session was scheduled in. */
  sessionTz?: string | null;
  /** Legacy fallback when start_at is missing. */
  fallbackDate?: string | null;
  fallbackTime?: string | null;
  /** Format string for date-fns-tz (default: "HH:mm"). */
  format?: string;
  /** Show dual-zone hint when the viewer's tz differs from the session's. */
  showHint?: boolean;
  className?: string;
}

/**
 * Renders a session time in the viewer's local timezone with a small hint
 * showing the original timezone when they differ.
 *
 *   10:00 IST  • shows as 05:30 to a viewer in Berlin, with hint "10:00 IST"
 */
export default function LocalTime({
  startAt,
  sessionTz,
  fallbackDate,
  fallbackTime,
  format = 'HH:mm',
  showHint = true,
  className = '',
}: Props) {
  const viewerTz = useMemo(() => detectBrowserTz(), []);

  if (!startAt) {
    // Legacy fallback — show raw stored value.
    if (!fallbackTime && !fallbackDate) return null;
    return (
      <span className={className}>
        {fallbackDate ? `${fallbackDate} ` : ''}
        {fallbackTime?.slice(0, 5) || ''}
      </span>
    );
  }

  const local = formatInTimeZone(startAt, viewerTz, format);
  const tz = sessionTz || 'Asia/Kolkata';
  const showDual = showHint && tz !== viewerTz;
  const original = showDual ? formatInTimeZone(startAt, tz, 'HH:mm') : null;

  return (
    <span className={className}>
      <span className="font-medium">{local}</span>
      {showDual && (
        <span className="ml-1 text-[10px] text-muted-foreground">
          ({original} {shortLabelFor(tz).split(' ')[0]} • UTC{offsetFor(tz)})
        </span>
      )}
    </span>
  );
}
