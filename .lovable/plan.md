## Fix
The back link points to `/admin` which doesn't exist (404). Change it to `/seekers` so it lands on Seekers > Overview as requested.

## File
`src/pages/admin/AdminLinkedProfiles.tsx` — change `to="/admin"` → `to="/seekers"` and label from "Back to Admin" → "Back to Seekers".
