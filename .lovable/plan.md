# 🔍 Dry-Run Data-Flow Audit (Jan 1 – May 31, 2026)

Scope inspected: `profiles`, `enrollments`, `payments`, `sessions`, `coach_seekers`, `program_trainers`, `daily_worksheets`, `seeker_badges`, `notifications`, and the `seed-test-notifications` edge function.

Seeker under test: **Chandrakant Wanare** (`crwanare@gmail.com`, profile `0c0a…270efa`)

---

## 🟥 CRITICAL — process / data conflicts

### 1. Duplicate enrollment for the same seeker in two LGT PLATINUM courses
The seeker has **2 active enrollments** in two different "LGT PLATINUM™" course rows:

| Course id | Name | Price | Start | End | Status | Payment |
|---|---|---|---|---|---|---|
| `79526e14…` | LGT PLATINUM™ — Life's Golden Triangle **Mastery** | ₹2,00,000 | 2026-01-26 | — | active | **pending** |
| `0239906e…` | LGT PLATINUM™ — Life's Golden Triangle | ₹1,75,000 | 2026-01-01 | 2026-05-31 | active | paid |

→ Two near-identical course records exist in `courses`. The seed used the second; the first is orphan/duplicate but still "active". Dashboards summing enrollments will double-count.

### 2. Payment totals do **not** reconcile with course price
- `payments` sum = 5 × ₹11,800 = **₹59,000** (base ₹50,000 + GST ₹9,000)
- Enrolled course price = **₹1,75,000** (or ₹2,00,000)
- Email copy said "Total fee: ₹50,000 + GST"
→ Enrollment `payment_status='paid'` is therefore **incorrect** — actually under-paid by ~₹1.16 L. Revenue / outstanding-fees reports will be wrong.

### 3. All 21 sessions have `coach_id = NULL`
Sessions were inserted without a coach. `coach_seekers` link exists (Coach Vivek Doba ↔ seeker), but sessions don't reference him.
→ Coach Day View, Coach Performance, Session Analytics, and the `send-session-invite` calendar invite to coach will all skip these sessions.

### 4. `coach_seekers` was NOT auto-created by the trigger
`auto_link_coaches_on_enrollment` should have inserted on enrollment. There is only **1** coach-seeker row, and it was created **2026-04-26 20:13** (long after enrollments). Possible causes:
- `program_trainers` had no rows when enrollments were inserted (lead trainer was added later), OR
- enrollments were inserted with a service-role bypass that didn't fire the trigger

→ For any future seed, the trigger order must be verified.

### 5. 100 % attendance + 100 % worksheets contradicts the "Down" weeks 10–12
- 148 worksheets, **all `is_submitted = true`**, 21 sessions all `attendance='present'`
- But emails for weeks 10/11/12 said "missed worksheets" + downward trend
→ Engagement analytics will show a perfect seeker, while emails told the coach the opposite. Risk score & health-status (Green/Yellow/Red) calculations will not reflect the narrative.

---

## 🟧 HIGH — links / referential gaps

### 6. Notifications were seeded only to the **seeker**
36 notifications exist for the seeker; **0 were inserted for the coach or admin** (`coachviveklgt@gmail.com`, `vivekcdoba@gmail.com`). Emails went to all 3, but in-app bell will be empty for coach/admin.

### 7. `payments.invoice_number` collisions risk
Format used: `INV-YYYYMM-<first 4 chars of seeker uuid>`. With more than one seeker per month sharing the same prefix, this can collide. Currently no UNIQUE index is enforced (need to confirm), so silent duplicates are possible.

### 8. `enrollments.end_date` missing on the duplicate active row
Course #1 has `end_date = NULL` while still `status='active'`. Reports filtering "active in May 2026" will mis-classify it as ongoing forever.

---

## 🟨 MEDIUM — email pipeline gaps in `seed-test-notifications`

### 9. Email function does **not write any DB rows**
The edge function only calls Resend; it never inserts into `notifications`, `payments`, `sessions`, etc. So if someone re-runs it, emails go out but DB stays unchanged → easy to drift out of sync with the seed SQL that built the records above.

### 10. No idempotency / dedupe key
Re-invoking will send the same 57 emails again to all 3 recipients (171 more deliveries). No "already sent" guard, no date-stamped key.

### 11. Hard-coded recipients & no audit log
- `RECIPIENTS` list is in code, not driven by `profiles`.
- No row written anywhere to record what was sent, when, to whom, or Resend message-ids.
- Resend rate (`600 ms` throttle ≈ 1.7 req/s) is fine, but there's no retry on 429/5xx.

### 12. Sender domain not verified yet
`info@vivekdoba.com` is set as `FROM`, but DNS verification is still pending. Until done, all 3 recipients will be rejected (only the Resend-verified mailbox would work). Function will report `failed = 57` on next invoke.

---

## 🟩 LOW — cosmetic / UX

### 13. Email copy says fee = ₹50,000 but DB course = ₹1,75,000
Same root cause as #2 — fix once and propagate.

### 14. Pillar rotation in reminder emails (`Dharma/Artha/Kama/Moksha`) doesn't match VDTS LGT (only 3 pillars: Dharma, Artha, Kama → Moksha is the *outcome*, not a session pillar in LGT-PLATINUM curriculum). Worth aligning with the program syllabus.

### 15. Notification titles still prefixed `[E2E]`
Old prefix from a previous seed; new seed uses `Testing —`. Two conventions co-exist → confusing in the bell UI.

---

## 📋 Proposed fix order (after your approval, in default mode)

1. **Decide canonical LGT PLATINUM course** → soft-delete the duplicate `courses` row, move enrollment, drop the orphan enrollment.
2. **Reconcile pricing** → either update course price to ₹50 K+GST (if test scenario) OR insert remaining payments & flip enrollment to `pending` until paid.
3. **Backfill `coach_id`** on the 21 sessions to `d1bbd4c2…` (Coach Vivek Doba).
4. **Insert mirrored notifications** for coach + admin (session reminders, payment alerts, badge events, missed-worksheet alerts).
5. **Mark weeks 10–12 worksheets** as `is_submitted=false` (3 days each) so analytics match the "Down" trend story.
6. **Rewrite `seed-test-notifications`** to: (a) write to `notifications` & a new `email_log` table, (b) be idempotent via a `seed_run_id`, (c) pull recipients from `profiles`, (d) retry on 429/5xx, (e) align fee + pillar copy.
7. **Add UNIQUE constraint** `payments(invoice_number)` (migration).
8. **Set `end_date`** on the orphan enrollment OR delete it.
9. **Re-run seed** once `info@vivekdoba.com` DNS is verified.

Approve to switch to default mode and apply these in order — or pick a subset.