

## Diagnosis

The `apply-lgt` form captures 80+ fields and stores them all in `submissions.form_data` (camelCase keys: `dob`, `gender`, `bloodGroup`, `pincode`, `hometown`, `industry`, `designation`, `revenue`, `teamSize`, `website`, `yearsInBiz`, etc.).

But `supabase/functions/approve-application/index.ts` only copies **6 fields** (`city`, `state`, `company`, `occupation`, `phone`, `whatsapp`) into `profiles` on approval. Every other field — DOB, gender, blood group, designation, industry, experience, revenue, team size, LinkedIn, pincode, hometown — is silently dropped, so the admin **/seekers/:id** Personal Details + Professional Details tabs render `—` for them.

The `profiles` table already has all the necessary columns (`dob`, `gender`, `blood_group`, `pincode`, `hometown`, `designation`, `industry`, `experience_years`, `revenue_range`, `team_size`, `linkedin_url`). No schema change required.

## Fix (single file)

**`supabase/functions/approve-application/index.ts`**

Add a `buildProfilePayload(fd, sub)` helper that maps every relevant `form_data` key (and the form's known aliases) to the corresponding `profiles` column. Apply it in **both** branches:

1. **Existing user** branch (line ~208): replace the small inline `update({...})` with the full payload.
2. **New user** branch (line ~277): replace the partial `profileUpdate` with the full payload (preserving `must_change_password` flags for temp-password users).

Field mapping (form_data key → profiles column):

| Source key (form_data) | profiles column | Notes |
|---|---|---|
| `dob` | `dob` | YYYY-MM-DD already |
| `gender` | `gender` | |
| `bloodGroup` | `blood_group` | |
| `pincode` | `pincode` | |
| `hometown` | `hometown` | |
| `city` | `city` | |
| `state` | `state` | |
| `phone` / `mobile` | `phone` | E.164 if `mobileCode` present |
| `whatsapp` / `phone` | `whatsapp` | |
| `company` / `companyName` | `company` | |
| `profession` / `occupation` | `occupation` | |
| `designation` | `designation` | |
| `industry` | `industry` | |
| `yearsInBiz` (string) | `experience_years` | parseInt, only if numeric |
| `revenue` / `annualRevenue` | `revenue_range` | |
| `teamSize` (string e.g. "2-5") | `team_size` | parse leading int; nullable |
| `website` / `linkedin` | `linkedin_url` | prefer `linkedin`, fall back to `website` if it contains `linkedin.com` |
| `marriageAnniversary` | `marriage_anniversary` | nullable date |

Empty strings → `null` (not `""`) so DB defaults / `—` rendering stay clean and unique constraints don't trip.

**Helper sketch** (illustrative, not the literal code):
```ts
function s(v: any) { return (v ?? '').toString().trim() || null; }
function int(v: any) { const n = parseInt(String(v ?? '').match(/\d+/)?.[0] ?? ''); return Number.isFinite(n) ? n : null; }
function buildProfilePayload(fd: Record<string, any>, sub: any) {
  return {
    dob: s(fd.dob),
    gender: s(fd.gender),
    blood_group: s(fd.bloodGroup),
    pincode: s(fd.pincode),
    hometown: s(fd.hometown),
    city: s(fd.city),
    state: s(fd.state),
    phone: s(fd.phone) ?? s(sub.mobile),
    whatsapp: s(fd.whatsapp) ?? s(fd.phone),
    company: s(fd.company) ?? s(fd.companyName),
    occupation: s(fd.profession) ?? s(fd.occupation) ?? s(fd.designation),
    designation: s(fd.designation),
    industry: s(fd.industry),
    experience_years: int(fd.yearsInBiz),
    revenue_range: s(fd.revenue) ?? s(fd.annualRevenue),
    team_size: int(fd.teamSize),
    linkedin_url: s(fd.linkedin) ?? (s(fd.website)?.includes('linkedin') ? s(fd.website) : null),
    marriage_anniversary: s(fd.marriageAnniversary),
  };
}
```

Then in both branches: spread that payload into the existing `.update({...})` call (existing branch) and `.update({ ...buildProfilePayload(fd, sub), must_change_password: ..., password_change_prompted: ... })` (new branch). Strip null keys before sending so we don't overwrite existing values with null on the existing-user branch.

## Backfill for existing approved seekers

The user said "this is the case for all seekers". So existing approved profiles also miss data. Run a one-time UPDATE that re-reads each approved `submissions.form_data` and fills missing profile columns. Logic:

```sql
-- For each approved submission, only fill columns that are currently NULL/empty on the matched profile
-- (matched by lower(email) = lower(sub.email))
```

This is a data update, so it'll go through the insert/update tool, not a migration. Same field map as above. Empty source values are skipped.

## Out of scope

- No changes to `profiles` schema (columns already exist).
- No changes to `submissions` schema or the form.
- No change to the credentials email template.
- The dozens of "soft" fields that have no profile column (e.g., `lifePurpose`, `coreValues`, `wheelScores`, `frequentEmotions`, challenges, hobbies, fears, partner info, emergency contact details, sleep/water/exercise) remain in `submissions.form_data`. They are still visible to admins via the submissions/applications detail view — out of scope here. If you want them surfaced on `/seekers/:id`, that's a separate UI task to add an "Application Intake" tab that reads from `submissions.form_data`. Tell me and I'll plan it.

## Verification

1. After deploy, approve a fresh `apply-lgt` submission → admin `/seekers/:id` shows DOB, Gender, Blood Group, Pincode, Hometown, Designation, Industry, Experience, Revenue Range, Team Size, LinkedIn populated.
2. Re-approval of an already-approved submission doesn't blank out fields (null-stripping).
3. Run the backfill → Smita Nilesh Datar (and all other existing approved seekers) now show their captured data.
4. Phone/whatsapp uniqueness constraints still respected (we don't overwrite existing non-empty phone with a different number on the existing-user branch).

