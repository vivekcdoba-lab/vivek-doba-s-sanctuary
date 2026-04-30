import { useMemo } from 'react';
import { fromZonedTime, toZonedTime, formatInTimeZone } from 'date-fns-tz';
import TimezonePicker from './TimezonePicker';
import { detectBrowserTz, offsetFor } from '@/lib/timezones';

interface DateTimeTzInputProps {
  /** Local date YYYY-MM-DD as the scheduler perceives it (in `timezone`). */
  date: string;
  /** Local start time HH:MM in `timezone`. */
  startTime: string;
  /** Local end time HH:MM in `timezone`. */
  endTime?: string;
  /** IANA timezone the scheduler is entering the time in. */
  timezone: string;
  onChange: (next: { date: string; startTime: string; endTime: string; timezone: string }) => void;
  hideEnd?: boolean;
  showLabels?: boolean;
}

/**
 * Composite control: date + start + end + timezone with a live preview line
 * showing what the scheduled moment looks like in the viewer's local zone.
 */
export default function DateTimeTzInput({
  date,
  startTime,
  endTime = '',
  timezone,
  onChange,
  hideEnd = false,
  showLabels = true,
}: DateTimeTzInputProps) {
  const browserTz = useMemo(() => detectBrowserTz(), []);

  const addOneHour = (t: string): string => {
    if (!t || t.length < 4) return t;
    const [hStr, mStr] = t.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m)) return t;
    const next = (h + 1) % 24;
    return `${String(next).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const update = (
    patch: Partial<{ date: string; startTime: string; endTime: string; timezone: string }>,
  ) => {
    const merged = { date, startTime, endTime, timezone, ...patch };
    // Auto-default end time to start + 1h when start changes and end is empty
    // or still matches the previously-derived end (i.e. coach hasn't customized it).
    if (patch.startTime !== undefined && patch.startTime) {
      const previousDerivedEnd = addOneHour(startTime);
      if (!merged.endTime || merged.endTime === previousDerivedEnd) {
        merged.endTime = addOneHour(patch.startTime);
      }
    }
    onChange(merged);
  };

  const previewLocal = useMemo(() => {
    if (!date || !startTime) return null;
    try {
      const utc = fromZonedTime(`${date} ${startTime}:00`, timezone);
      const local = formatInTimeZone(utc, browserTz, 'EEE, MMM d • HH:mm');
      return { local, isSame: browserTz === timezone };
    } catch {
      return null;
    }
  }, [date, startTime, timezone, browserTz]);

  return (
    <div className="space-y-3">
      <div>
        {showLabels && <label className="text-xs font-medium text-muted-foreground">Date</label>}
        <input
          type="date"
          value={date}
          onChange={(e) => update({ date: e.target.value })}
          className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background"
        />
      </div>

      <div className={hideEnd ? '' : 'grid grid-cols-2 gap-3'}>
        <div>
          {showLabels && (
            <label className="text-xs font-medium text-muted-foreground">Start time</label>
          )}
          <input
            type="time"
            value={startTime}
            onChange={(e) => update({ startTime: e.target.value })}
            className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background"
          />
        </div>
        {!hideEnd && (
          <div>
            {showLabels && (
              <label className="text-xs font-medium text-muted-foreground">End time</label>
            )}
            <input
              type="time"
              value={endTime}
              onChange={(e) => update({ endTime: e.target.value })}
              className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background"
            />
          </div>
        )}
      </div>

      <TimezonePicker value={timezone} onChange={(tz) => update({ timezone: tz })} />

      {previewLocal && !previewLocal.isSame && (
        <div className="text-[11px] text-muted-foreground bg-muted/40 border border-border rounded-lg px-3 py-2">
          <span className="font-medium text-foreground">{startTime}</span> in{' '}
          <span className="font-medium">{timezone}</span> (UTC{offsetFor(timezone)}) ={' '}
          <span className="font-medium text-primary">{previewLocal.local}</span> your local time (
          {browserTz})
        </div>
      )}
    </div>
  );
}

/** Convert local zoned date+time → UTC ISO string for DB storage. */
export function toUtcIso(date: string, time: string, timezone: string): string | null {
  if (!date || !time) return null;
  try {
    const utc = fromZonedTime(`${date} ${time.length === 5 ? time + ':00' : time}`, timezone);
    return utc.toISOString();
  } catch {
    return null;
  }
}

/** Convert a UTC ISO timestamp back to a target zone for display. */
export function fromUtcIso(utcIso: string, targetTz: string): Date {
  return toZonedTime(utcIso, targetTz);
}

/** Format a stored UTC ISO timestamp in the viewer's tz (or any tz). */
export function formatUtc(utcIso: string, tz: string, fmt: string): string {
  return formatInTimeZone(utcIso, tz, fmt);
}
