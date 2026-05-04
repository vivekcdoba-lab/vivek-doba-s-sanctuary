# Storage Buckets

_Generated: 2026-05-04T07:26:46.603Z_

| Bucket | Public | Purpose |
|---|---|---|
| `avatars` | ✅ | Seeker / coach profile pictures |
| `signatures` | 🔒 | E-signature image uploads for agreements & sessions |
| `resources` | 🔒 | Audio, PDF, video learning materials |
| `documents` | 🔒 | Coaching agreements, intake forms, generated reports |

## Folder conventions

- `avatars/{user_id}/avatar.{ext}` — one current avatar per user
- `signatures/{session_id}/{signer_role}-{timestamp}.png`
- `resources/{type}/{slug}.{ext}` (type ∈ audio | pdf | video)
- `documents/{seeker_id}/{doc_kind}/{filename}`

## Access pattern

Signed URLs (1h) are minted on demand for private buckets via `supabase.storage.from(...).createSignedUrl(...)`. Avatars are read directly from the public bucket.
