## Goal
Replace the native browser `confirm(...)` popup (shown in screenshot with "An embedded page at ...lovableproject.com says") with an in-application confirmation dialog so it stays within the app's UI styling.

## Affected Files
- `src/pages/admin/AdminLinkedProfiles.tsx` — unlink action (line 77)
- `src/pages/admin/SeekerDetailPage.tsx` — unlink action (line 248)

## Approach
Use the existing shadcn `AlertDialog` component (`@/components/ui/alert-dialog`) which is already used elsewhere in the project.

### Changes per file
1. Add state: `const [unlinkTarget, setUnlinkTarget] = useState<string | null>(null);`
2. Replace the `if (!confirm(...)) return;` flow:
   - Trigger button now calls `setUnlinkTarget(group_id)` instead of `handleUnlink(group_id)` directly.
   - Move actual unlink mutation into a `confirmUnlink()` handler invoked by AlertDialog's action button.
3. Render an `<AlertDialog open={!!unlinkTarget} onOpenChange={(o) => !o && setUnlinkTarget(null)}>` with:
   - Title: "Unlink these profiles?"
   - Description: "Existing joint payments will remain visible only to the original payer."
   - Cancel + Confirm (destructive variant) buttons.

## Outcome
The unlink confirmation now appears as a styled modal within the app, matching brand UI, instead of the native browser dialog showing the lovableproject.com URL.
