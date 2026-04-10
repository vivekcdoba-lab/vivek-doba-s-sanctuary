

## Plan: UI/UX Polish — Sidebar Design, Animations, Empty States, Loading States

This plan refines the visual quality across all three layout sidebars, adds consistent empty state components, and improves loading/animation patterns.

### What Changes

| File | Action | Purpose |
|------|--------|---------|
| `src/components/SeekerLayout.tsx` | Edit | Apply gradient background, saffron active style (white text + bg), hover `#FFE5CC`, proper item heights (44px), section divider styling, fire animation on streak, slide-in animation for mobile |
| `src/components/CoachingLayout.tsx` | Edit | Same sidebar design system as Seeker |
| `src/components/AdminLayout.tsx` | Edit | Same sidebar design system as Seeker |
| `src/components/EmptyState.tsx` | Create | Reusable empty state component with icon, title, description, CTA button |
| `src/components/SkeletonCard.tsx` | Edit | Add `SkeletonAvatar`, `SkeletonTable`, `SkeletonCalendar` variants |
| `src/index.css` | Edit | Add page transition animation, validation shake keyframe |
| Multiple seeker pages | Edit | Add empty states where data can be empty (sessions, assignments, assessments, worksheet, business profile) |

### Sidebar Design Changes (All 3 Layouts)

Current issues:
- Background is flat `hsl(30,100%,97%)` — needs gradient
- Active items use transparent saffron bg — spec requires solid `#FF6B00` bg with white text
- No box-shadow on sidebar
- Hover is generic `bg-muted` — needs `#FFE5CC`
- Items are ~32px tall — spec requires 44px
- Section dividers are small — need small-caps, `#999`, proper spacing
- Mobile sidebar has no slide animation
- Streak fire has no flicker animation

Changes per layout:
1. Background: `linear-gradient(180deg, #FFF8F0, #FFF0E0)`
2. Active item: `bg-[#FF6B00] text-white font-medium` with `border-l-4 border-[#FF6B00]`
3. Hover: `hover:bg-[#FFE5CC]`
4. Item height: `h-11` (44px), padding `px-4 py-3`
5. Submenu indent: `ml-6` with 16px icons (vs 20px parent)
6. Section dividers: `uppercase text-[10px] tracking-[0.15em] text-[#999]`
7. Sidebar border + shadow: `border-r border-black/10 shadow-[2px_0_10px_rgba(0,0,0,0.05)]`
8. Collapse button: tooltip "Collapse" / "Expand"
9. Mobile: `animate-slide-in-left` on open, close on outside click (already works)
10. Streak fire: CSS `pulse-fire` animation class (already in index.css)

### EmptyState Component

```text
  ┌──────────────────────────┐
  │         📅               │
  │  Your schedule is clear! │
  │  Book a session with     │
  │  your Coach              │
  │                          │
  │  [ Schedule Session ]    │
  └──────────────────────────┘
```

Props: `icon`, `emoji`, `title`, `description`, `actionLabel`, `actionPath`

Preset empty states used in:
- `SeekerUpcomingSessions` — "Your schedule is clear!"
- `SeekerTasksEnhanced` — "All caught up!"
- `SeekerAssessments` — "Discover yourself"
- `DailyWorksheet` — "Begin your day mindfully"
- `ArthaBusinessProfile` — "Set up your business"

### Loading States

Enhance `SkeletonCard.tsx` with:
- `SkeletonAvatar` — circular pulsing placeholder
- `SkeletonTable` — rows with alternating widths
- `SkeletonCalendar` — grid of square cells

All pages that fetch data already use loading states or can wrap with these.

### Animation Additions (index.css)

- **Page transition**: Outlet wrapper with `animate-fade-in` (already exists, just needs consistent application)
- **Validation shake**: `@keyframes shake` for form errors
- **Progress bar fill**: smooth `transition: width 1s ease` (already have `progress-fill`)
- **Chart render**: handled by recharts' built-in `isAnimationActive`

### Implementation Notes

- All three layouts share the same design pattern, so changes are mechanical across them
- The `EmptyState` component is pure presentational — no DB or state changes
- Active state changes from transparent saffron overlay to solid saffron background with white text — this is the most visible change
- Mobile slide-in uses existing `slide-in-left` keyframe from tailwind config

