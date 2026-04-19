
The user hits `/seeker/` (or `/seeker`) and gets 404. Looking at routes, `/seeker/home` exists but bare `/seeker` does not.

Fix: add a redirect from `/seeker` to `/seeker/home` in `src/App.tsx`.

```tsx
<Route path="/seeker" element={<Navigate to="/seeker/home" replace />} />
```

Files to update:
- `src/App.tsx` — add the redirect route (Navigate is likely already imported from react-router-dom).
