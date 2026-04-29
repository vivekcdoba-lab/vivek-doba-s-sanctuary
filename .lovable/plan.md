## Goal

1. Make **"Daily Live Mindfulness Session"** a first-class category so Admin can quickly tag uploads.
2. Build a dedicated **Seeker page** that beautifully showcases today's live session + the past 30 days of recordings, so seekers who missed (or want to repeat) can practice anytime.

---

## Part 1 — Admin: Upload Resource

File: `src/pages/admin/AdminUploadResource.tsx`

- Add to `DEFAULT_CATEGORIES`:
  - `Daily Live Mindfulness Session`
  - `Daily Affirmations Recording`
  - `Guided Meditation Replay`
- These will appear automatically in the existing Category dropdown (sorted, deduped with DB categories).
- Same dropdown is reused on `AdminVideos` / `AdminAudios` / `ResourcesPage` filters — no extra change needed there.

No DB migration required (category is free-text on `learning_content`).

---

## Part 2 — New Seeker Page: Daily Mindfulness

Route: `/seeker/daily-mindfulness`
File: `src/pages/seeker/SeekerDailyMindfulness.tsx` (new)

### Layout (top → bottom)

```text
+------------------------------------------------------+
|  🌅 Daily Mindfulness Practice                       |
|  "Miss the live? Practice anytime."                  |
|  [Streak: 5 days 🔥]   [Today: Apr 29]               |
+------------------------------------------------------+

[ TODAY'S SESSION — featured hero card ]
  • Large thumbnail / play button
  • Title, duration, language, coach
  • "▶ Practice Now" (opens existing player modal)
  • If no upload yet today → friendly empty state
    "Today's session will appear here after Guruji uploads it."

[ THIS WEEK ]  horizontal scroll row of 7 day-cards
  Mon ✓  Tue ✓  Wed ✓  Thu ✓  Fri (today)  Sat —  Sun —
  (✓ = completed, dot = available, — = not yet)

[ RECENT RECORDINGS ]  grid (last 30 days)
  Card per session with date chip, duration, progress bar
  Filters: All • Not Practiced • Completed • Bookmarked
  Search by title

[ MY PRACTICE STATS ]  small strip
  • Sessions practiced this month
  • Total minutes
  • Current streak
```

### Data source
Reuses existing `learning_content` table — filter:
- `category = 'Daily Live Mindfulness Session'`
- `is_active = true`
- `visibility` honored by existing RLS

Reuses `user_content_progress` for completion / bookmarks / resume position (already wired in video/audio pages).

### Player
Reuse the existing `ResourcePreviewModal` (handles video/audio/PDF, view-only, no download).

### Visuals
- Soft saffron→gold gradient hero (`gradient-saffron`)
- Lotus / sunrise emoji accents (🌅 🪷 🧘)
- Card hover `card-hover`, `btn-press`
- Skeletons while loading
- Empty state with calming illustration + CTA "Browse all meditations"

---

## Part 3 — Navigation entry

File: `src/components/SeekerLayout.tsx`

Add inside the existing **MOKSHA (Liberation)** group, at the top:

```ts
{ icon: Sunrise, label: 'Daily Mindfulness', path: '/seeker/daily-mindfulness' },
```

Also add a **Quick Action** tile (replacing or beside "Meditate") in `src/components/dashboard/QuickActionsBar.tsx` so it's reachable from Seeker Home in one tap.

---

## Part 4 — Routing

File: `src/App.tsx`

Add lazy import + route near the other seeker routes:

```tsx
<Route path="/seeker/daily-mindfulness" element={<SeekerDailyMindfulness />} />
```

---

## Files touched

- `src/pages/admin/AdminUploadResource.tsx` — extend default categories
- `src/pages/seeker/SeekerDailyMindfulness.tsx` — **new**
- `src/components/SeekerLayout.tsx` — sidebar link
- `src/components/dashboard/QuickActionsBar.tsx` — quick action tile
- `src/App.tsx` — route

No DB migration. No new tables. Fully reuses existing `learning_content`, `user_content_progress`, `ResourcePreviewModal`, and visibility/RLS rules.
