## Fix
Replace the back link with a "Back" button using `navigate(-1)` so it returns to the previous page (e.g., a specific seeker's overview like `Seekers > Chandrakant Wanare`) rather than always landing on the seekers list.

## File
`src/pages/admin/AdminLinkedProfiles.tsx`

## Changes
- Import `useNavigate` from `react-router-dom`.
- Replace the `<RouterLink to="/seekers">` with a `<button onClick={() => navigate(-1)}>` styled identically.
- Label: "Back".

This preserves browser history context so the admin returns wherever they came from (Seeker detail page, registry, etc.).
