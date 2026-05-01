# Plan: Show Profile Picture on Seeker Home

Add the seeker's profile picture (avatar) to the hero banner on `/seeker/home`, next to the greeting. Tapping it opens the profile page.

## Change

In `src/pages/seeker/SeekerHome.tsx` hero banner:

- Add a circular 56×56 avatar to the left of "🌅 Good morning, {Name}!".
- Source: `profile.avatar_url` (already in auth store).
- Fallback: first letter of name on a translucent chip when no avatar is set.
- Wrap in a `<Link to="/seeker/profile">` so it doubles as a profile shortcut.
- Keep the existing ॐ watermark and tagline; restructure the banner with a flex row so the greeting wraps cleanly on mobile.

## Visual

```text
┌────────────────────────────────────────────┐
│ ◯ avatar   🌅 Good morning, Vivek!     ॐ  │
│            "Balance your Triangle…"        │
└────────────────────────────────────────────┘
```

## Files

- Edit: `src/pages/seeker/SeekerHome.tsx` (hero banner block only)

No DB changes, no removals. Purely additive per preservation policy.
