
Goal: make “Forgot Password?” visibly work and reliably guide the user.

What I found:
- `src/pages/LoginPage.tsx` already calls `supabase.auth.resetPasswordForEmail(...)`.
- The request is reaching the backend and returning `200`.
- But the app mounts `@/components/ui/toaster` in `src/App.tsx`, while the login page uses `toast` from `sonner`.
- Result: the click can succeed, but no popup appears because the wrong toast provider is mounted.

Plan:
1. Fix the global toast mismatch
- Update `src/App.tsx` to mount the Sonner toaster (`@/components/ui/sonner`) instead of the shadcn `toaster`.
- Keep one consistent toast system across the app, since many pages already use `toast` from `sonner`.

2. Improve the Forgot Password UX on `src/pages/LoginPage.tsx`
- Add a small sending state for the “Forgot Password?” action.
- Validate the email format before sending, so obviously invalid entries don’t silently “succeed”.
- Show clear success/error feedback with visible toast messages.
- Prevent repeated clicks while the request is in flight.

3. Make the success message less confusing
- Use a generic success message like: “If this email exists, a reset link has been sent.”
- This matches secure auth behavior and avoids confusion when the backend returns `200` for privacy reasons.

4. Verify redirect behavior
- Keep the reset link pointing to `/reset-password`, which is already routed in `src/App.tsx`.
- Double-check that `src/pages/ResetPassword.tsx` supports the emailed recovery flow, which it already appears to do.

5. Test after implementation
- Confirm clicking “Forgot Password?” with:
  - empty email → visible error toast
  - invalid email → visible validation toast
  - valid email → visible success toast
- Then test the full reset flow from the published site as well, since auth email flows are more reliable there than in preview.

Technical notes:
- Root cause is not the reset API itself; it is the UI feedback layer.
- Current mismatch:
  - App mounts: `src/components/ui/toaster.tsx`
  - Pages call: `import { toast } from 'sonner'`
- Best fix is to standardize on Sonner, not to rewrite every page.

Files to update:
- `src/App.tsx`
- `src/pages/LoginPage.tsx`

Out of scope:
- No backend/schema changes
- No auth provider changes
- No changes to `src/integrations/supabase/client.ts`
