# Admin Avatar + Sessions Counter on Seeker Profile

## Problem

1. The big circle on `/seekers/:id` (admin Seeker 360 page) only renders **initials** (e.g. "CW" for Chandrakant Wanare). There is no way for either the admin or the seeker to upload a profile picture from this view.
2. Admin sees no Attended / Remaining session count next to that avatar — they have to scroll to find it.

## Fix

### 1. Mount AvatarUploader on the admin Seeker 360 header

`src/pages/admin/SeekerDetailPage.tsx` (lines 433–440) — replace the static gradient initials circle with the existing `<AvatarUploader>` component.

```tsx
<AvatarUploader
  profileId={seeker.id}
  targetUserId={seeker.user_id}   // upload into the SEEKER's folder, not admin's
  avatarUrl={seeker.avatar_url}
  fallbackName={seeker.full_name}
  size={80}
  onChange={(url) => setSeeker((s: any) => ({ ...s, avatar_url: url }))}
/>
```

This automatically gives admin both **camera capture** and **file upload** (already built into `AvatarUploader.tsx`). Storage RLS already permits admin uploads (`Users can upload own avatar` policy includes `OR is_admin(auth.uid())`).

The same uploader is already wired on the seeker's own `/seeker/profile` page, so seekers continue to be able to update their own picture.

### 2. Show Attended / Remaining counters next to the avatar

Use the existing `useSeekerSessionCount(seeker.id)` hook plus the active enrollment's `fee_structures.total_sessions` (already loaded in the page) to render two small chips beside the name:

```
🟢 Attended: 7    ⏳ Remaining: 17
```

Layout: small pill badges in the header row, visible at a glance, color-coded (green for attended, amber for remaining, gray when no fee structure exists yet).

### 3. Make sure existing seeker upload still works

No change needed — `SeekerProfile.tsx` already mounts the uploader. The bucket policy already lets a seeker write under their own folder.

## Technical Details

**Files edited:**
- `src/pages/admin/SeekerDetailPage.tsx` — swap initials block for `AvatarUploader`, add session-count chips, add hook import.

**No DB / migration changes** — storage policies, the avatars bucket, and the hook all already exist.

**No new dependencies.**

## Out of Scope

- Merging the two duplicate "Chandrakant Wanare" profiles found in the database (`e2fb3a77…` and `0c0ada4d…`) — that's a separate data-cleanup task.
- Editing avatar anywhere else (it already works in `/seeker/profile`, `AdminAdmins`, etc.).
