
User is reporting that the approved seeker `crwanare@gmail.com` did not receive an email when their LGT application was approved. Let me investigate.

From the network logs I can see:
- `POST /functions/v1/send-notification` at 13:24:44 → **Failed to fetch** (CORS or function error)
- The seeker was successfully created in `profiles` (id `0c0ada4d…`, user_id `88ad868a…`)

So the approval flow worked, but the notification email failed. Two issues to verify:

1. **`approve-application` edge function does NOT send any email** — looking at the code, it only creates the user via `auth.admin.createUser` and inserts enrollment. No `sendCredentialsEmail` call like `admin-create-user` has. So the seeker never gets credentials.

2. **`send-notification` is the function being called from the client after approval** — and it's failing with "Failed to fetch". Need to check its logs and code.

3. **Resend domain `vivekdoba.com` verification** — even if emails were attempted, if the domain isn't verified in Resend, sends to `crwanare@gmail.com` (not the Resend account owner) will fail.

Let me check these and present a plan.
