import { describe, it, expect } from 'vitest';
import {
  buildCouplePairs,
  verifyCouplePairs,
  buildRecurrenceDates,
  type CouplePairRow,
} from './useDbSessions';

const PRIMARY = '11111111-1111-1111-1111-111111111111';
const PARTNER = '22222222-2222-2222-2222-222222222222';

describe('buildCouplePairs', () => {
  it('produces 2 × count rows for a recurring couple booking', () => {
    const pairs = buildCouplePairs({
      primary_seeker_id: PRIMARY,
      partner_seeker_id: PARTNER,
      start_date: '2026-01-05',
      frequency: 'weekly',
      count: 4,
      primary_start_number: 1,
      partner_start_number: 1,
    });
    expect(pairs).toHaveLength(8);
  });

  it('shares ONE couple_group_id within an occurrence and a DIFFERENT one across occurrences', () => {
    const pairs = buildCouplePairs({
      primary_seeker_id: PRIMARY,
      partner_seeker_id: PARTNER,
      start_date: '2026-01-05',
      frequency: 'weekly',
      count: 3,
      primary_start_number: 1,
      partner_start_number: 1,
    });
    // Group rows by date
    const byDate = new Map<string, CouplePairRow[]>();
    pairs.forEach((p) => {
      const list = byDate.get(p.date) ?? [];
      list.push(p);
      byDate.set(p.date, list);
    });
    expect(byDate.size).toBe(3);
    const groupIds: string[] = [];
    byDate.forEach((rows) => {
      expect(rows).toHaveLength(2);
      expect(rows[0].couple_group_id).toBe(rows[1].couple_group_id);
      expect(rows[0].seeker_id).not.toBe(rows[1].seeker_id);
      groupIds.push(rows[0].couple_group_id);
    });
    // All occurrence group_ids must be unique
    expect(new Set(groupIds).size).toBe(groupIds.length);
  });

  it('emits exactly one primary and one partner row per occurrence', () => {
    const pairs = buildCouplePairs({
      primary_seeker_id: PRIMARY,
      partner_seeker_id: PARTNER,
      start_date: '2026-01-05',
      frequency: 'biweekly',
      count: 2,
      primary_start_number: 5,
      partner_start_number: 7,
    });
    const groups = new Map<string, CouplePairRow[]>();
    pairs.forEach((p) => {
      const list = groups.get(p.couple_group_id) ?? [];
      list.push(p);
      groups.set(p.couple_group_id, list);
    });
    groups.forEach((rows) => {
      const roles = rows.map((r) => r.couple_role).sort();
      expect(roles).toEqual(['partner', 'primary']);
    });
  });

  it('increments session_number per occurrence for both seekers independently', () => {
    const pairs = buildCouplePairs({
      primary_seeker_id: PRIMARY,
      partner_seeker_id: PARTNER,
      start_date: '2026-01-05',
      frequency: 'weekly',
      count: 3,
      primary_start_number: 10,
      partner_start_number: 4,
    });
    const primaryNums = pairs.filter((p) => p.seeker_id === PRIMARY).map((p) => p.session_number);
    const partnerNums = pairs.filter((p) => p.seeker_id === PARTNER).map((p) => p.session_number);
    expect(primaryNums).toEqual([10, 11, 12]);
    expect(partnerNums).toEqual([4, 5, 6]);
  });

  it('throws when both seekers are the same', () => {
    expect(() =>
      buildCouplePairs({
        primary_seeker_id: PRIMARY,
        partner_seeker_id: PRIMARY,
        start_date: '2026-01-05',
        frequency: 'weekly',
        count: 2,
        primary_start_number: 1,
        partner_start_number: 1,
      }),
    ).toThrow(/distinct/i);
  });

  it('uses correct dates from buildRecurrenceDates', () => {
    const dates = buildRecurrenceDates('2026-01-05', 'weekly', 3);
    const pairs = buildCouplePairs({
      primary_seeker_id: PRIMARY,
      partner_seeker_id: PARTNER,
      start_date: '2026-01-05',
      frequency: 'weekly',
      count: 3,
      primary_start_number: 1,
      partner_start_number: 1,
    });
    const pairDates = Array.from(new Set(pairs.map((p) => p.date))).sort();
    expect(pairDates).toEqual([...dates].sort());
  });
});

describe('verifyCouplePairs', () => {
  const valid = (): CouplePairRow[] =>
    buildCouplePairs({
      primary_seeker_id: PRIMARY,
      partner_seeker_id: PARTNER,
      start_date: '2026-01-05',
      frequency: 'weekly',
      count: 2,
      primary_start_number: 1,
      partner_start_number: 1,
    });

  it('returns no errors for healthy output', () => {
    expect(verifyCouplePairs(valid())).toEqual([]);
  });

  it('flags a missing sibling row', () => {
    const rows = valid();
    rows.pop(); // remove a partner row → group has only one row
    const errs = verifyCouplePairs(rows);
    expect(errs.some((e) => /1 rows \(expected 2\)/.test(e))).toBe(true);
  });

  it('flags duplicate seeker in a group', () => {
    const rows = valid();
    rows[1].seeker_id = rows[0].seeker_id;
    const errs = verifyCouplePairs(rows);
    expect(errs.some((e) => /duplicate seeker/.test(e))).toBe(true);
  });

  it('flags missing role pair', () => {
    const rows = valid();
    rows[1].couple_role = 'primary';
    const errs = verifyCouplePairs(rows);
    expect(errs.some((e) => /missing primary\/partner role pair/.test(e))).toBe(true);
  });

  it('flags date mismatch within a group', () => {
    const rows = valid();
    rows[1].date = '2030-12-31';
    const errs = verifyCouplePairs(rows);
    expect(errs.some((e) => /date mismatch/.test(e))).toBe(true);
  });
});
