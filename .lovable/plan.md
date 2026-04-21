

## Pre-publish health check

**Build/runtime**: Dev server returns HTTP 200, no compile errors, edge function present. ✅
**Recent fixes verified**: HTML-escape helpers + subject sanitization shipped in `send-notification`, RLS hardened on `agreements`/`assessments`, `points_ledger` insert policy removed. ✅

## Outstanding security findings

| Finding | Level | Status | Action |
|---|---|---|---|
| Public INSERT on `submissions` | info | already ignored (intentional) | none |
| Plaintext passwords in `submissions` | warn | already ignored (accepted risk, documented) | none |
| HTML injection in `send-notification` | warn | **already fixed in code, but still listed open in stale scan** | mark as fixed |
| Supabase: RLS always true / public bucket listing | warn | already ignored | none |

No `level: "error"` findings remain. No actual code bugs detected.

## Single action this turn

Mark the `notify_html_inject` finding as fixed in the security dashboard so the pre-publish scan is clean. The fix itself (escapeHtml + sanitizeSubject across `buildAdminEmailHtml`, `buildApplicantEmailHtml`, and all subject lines) was applied in the previous turn — nothing else to change.

## After this
You're clear to publish. Frontend changes go live when you click **Publish → Update**; the edge function (`send-notification`) is already deployed automatically.

