# Profile Pic Edit Dialog + Move GST Above Discount

Two small, focused changes.

## 1. Profile picture: clickable avatar with EDIT badge → "Upload or Camera" dialog

**File:** `src/components/AvatarUploader.tsx`

- Make the avatar circle a `<button>`. Clicking it (or the new edit badge) opens a chooser dialog titled **"Update profile picture"** with two large buttons: **Upload** and **Camera**.
  - Upload → triggers the hidden `<input type="file">` (existing flow).
  - Camera → opens the existing camera capture dialog (existing flow).
- Add a small circular **pencil EDIT badge** at the bottom-right of the avatar (always visible) so users discover the action.
- Add a `compact?: boolean` prop. When `true`, the side-by-side Upload/Camera buttons and helper text are hidden — only the avatar + edit badge show. The chooser dialog is the only entry point.
- Existing call sites (which currently show side buttons) keep working unchanged because `compact` defaults to `false`.
- While uploading, show a spinner overlay on the avatar and disable both the avatar button and edit badge.

No changes to upload logic, storage path, RLS, or the `onChange` contract.

## 2. Pricing Summary: move "Include GST?" above "Discount (₹)"

**File:** `src/components/FeeStructureForm.tsx`

- **Remove** the "Include GST?" block from the top "Course Selection & Pricing Rules" card (currently around lines 181–208). The top card will then contain only the **Primary Course** selector.
- **Insert** the same "Include GST?" block into the "Pricing Summary" card (below the invoice table) **immediately above** the "Discount (₹)" row.
- Resulting Pricing Summary order:
  1. Bundled Courses (Free)
  2. **Include GST?** ← moved here
  3. Discount (₹)
  4. Totals box (Subtotal / Discount / GST / Total Investment / Total sessions / Coaching window)

No state, calculation, or save-logic changes — just JSX relocation. The `f.include_gst` / `f.gst_rate` setters are unchanged.

## Out of Scope

- No DB / storage / RLS changes.
- No changes to the invoice table rows.
- No changes to admin SeekerDetailPage usage of `<AvatarUploader />` — it will automatically gain the edit badge + click-to-open behavior, and we'll pass `compact` where it makes sense (admin header & seeker profile header) so the side buttons disappear and the click-on-pic flow becomes the single entry point.
