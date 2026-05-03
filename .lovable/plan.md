## Goal
Add a "Back" link at the top of the Admin → Linked Profiles page so admins can quickly return to the previous admin screen.

## File
- `src/pages/admin/AdminLinkedProfiles.tsx`

## Change
Add a back link above the page title that navigates to `/admin` (admin dashboard).

```tsx
import { Search, Link2, Unlink, Plus, Loader2, Users, ArrowLeft } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
```

In the JSX (above the existing `<div className="flex flex-col sm:flex-row...">` header):

```tsx
<RouterLink
  to="/admin"
  className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
>
  <ArrowLeft className="w-4 h-4" />
  Back to Admin
</RouterLink>
```

Styled to match the existing `BackToHome` component pattern.
