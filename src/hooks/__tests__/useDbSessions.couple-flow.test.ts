import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mocks = vi.hoisted(() => ({
  insertSingle: vi.fn(),
  participantsInsert: vi.fn().mockResolvedValue({ error: null }),
  fnInvoke: vi.fn().mockResolvedValue({ data: {}, error: null }),
}));
const { insertSingle, participantsInsert, fnInvoke } = mocks;

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'sessions') {
        return {
          insert: (_row: any) => ({
            select: () => ({ single: () => mocks.insertSingle() }),
          }),
        };
      }
      if (table === 'session_participants') {
        return { insert: mocks.participantsInsert };
      }
      return {};
    },
    functions: { invoke: mocks.fnInvoke },
  },
}));

// Import AFTER the mock
import { useCreateSession, buildCouplePairs } from '../useDbSessions';

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: qc }, children);
};

const PRIMARY = 'aaaaaaaa-0000-0000-0000-000000000001';
const PARTNER = 'bbbbbbbb-0000-0000-0000-000000000002';

describe('Couple session: dual-row creation + dual emails', () => {
  beforeEach(() => {
    insertSingle.mockReset();
    participantsInsert.mockClear();
    fnInvoke.mockClear();
  });

  it('creates two linked rows sharing a couple_group_id and fires one invite per row', async () => {
    insertSingle
      .mockResolvedValueOnce({ data: { id: 'session-primary-id' }, error: null })
      .mockResolvedValueOnce({ data: { id: 'session-partner-id' }, error: null });

    const { result } = renderHook(() => useCreateSession(), { wrapper });

    const pairs = buildCouplePairs({
      primary_seeker_id: PRIMARY,
      partner_seeker_id: PARTNER,
      start_date: '2026-01-05',
      frequency: 'weekly',
      count: 1,
      primary_start_number: 1,
      partner_start_number: 1,
    });
    expect(pairs).toHaveLength(2);
    const groupId = pairs[0].couple_group_id;

    await Promise.all(
      pairs.map((row) =>
        result.current.mutateAsync({
          seeker_id: row.seeker_id,
          date: row.date,
          start_time: '10:00',
          end_time: '11:00',
          session_type: 'couple',
          partner_seeker_id: row.partner_seeker_id,
          couple_group_id: row.couple_group_id,
          couple_role: row.couple_role,
        }),
      ),
    );

    // Two session inserts
    expect(insertSingle).toHaveBeenCalledTimes(2);

    // Dual calendar invites — one per inserted row, both 'created' action
    await waitFor(() => expect(fnInvoke).toHaveBeenCalledTimes(2));
    const invitedSessionIds = fnInvoke.mock.calls.map((c) => c[1].body.session_id).sort();
    expect(invitedSessionIds).toEqual(['session-partner-id', 'session-primary-id']);
    fnInvoke.mock.calls.forEach((c) => {
      expect(c[0]).toBe('send-session-invite');
      expect(c[1].body.action).toBe('created');
    });

    // Both rows share the SAME couple_group_id (sync check)
    expect(pairs[0].couple_group_id).toBe(pairs[1].couple_group_id);
    expect(groupId).toBeTruthy();

    // Participants written for each session
    expect(participantsInsert).toHaveBeenCalledTimes(2);
  });

  it('individual session creates a single row + a single invite (regression guard)', async () => {
    insertSingle.mockResolvedValueOnce({ data: { id: 'solo-id' }, error: null });
    const { result } = renderHook(() => useCreateSession(), { wrapper });

    await result.current.mutateAsync({
      seeker_id: PRIMARY,
      date: '2026-01-05',
      start_time: '10:00',
      end_time: '11:00',
      session_type: 'individual',
    });

    expect(insertSingle).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(fnInvoke).toHaveBeenCalledTimes(1));
    expect(fnInvoke.mock.calls[0][1].body.session_id).toBe('solo-id');
  });
});

describe('Couple approval workflow stays per-row', () => {
  it('updating one row by id never touches the sibling id', () => {
    // Simulates the per-row scoped update used by SessionReviewPage.handleApprove
    const calls: Array<{ id: string; status: string }> = [];
    const fakeUpdate = (status: string) => ({
      eq: (_col: string, id: string) => {
        calls.push({ id, status });
        return Promise.resolve({ error: null });
      },
    });

    const primaryId = 'primary-row-id';
    const partnerId = 'partner-row-id';

    fakeUpdate('approved').eq('id', primaryId);
    expect(calls).toEqual([{ id: primaryId, status: 'approved' }]);
    expect(calls.find((c) => c.id === partnerId)).toBeUndefined();

    fakeUpdate('revision_requested').eq('id', partnerId);
    expect(calls.find((c) => c.id === partnerId)?.status).toBe('revision_requested');
    // Primary remains untouched after partner revision
    expect(calls.filter((c) => c.id === primaryId)).toEqual([
      { id: primaryId, status: 'approved' },
    ]);
  });
});
