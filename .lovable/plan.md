

## Goal
Fix the Date of Birth display format in `/admin/seekers/:id` Personal Details section to show "DD-Month-Year" (e.g., "16-September-1978") instead of raw ISO date or "—".

## Root cause
In `src/pages/admin/SeekerDetailPage.tsx` line 345, the Date of Birth field uses raw `seeker.dob || '—'` instead of the existing `formatDate()` helper that formats dates as "dd MMM yyyy".

## Fix

**File: `src/pages/admin/SeekerDetailPage.tsx`**

Change line 345 from:
```ts
['Date of Birth', seeker.dob || '—'],
```

To:
```ts
['Date of Birth', formatDate(seeker.dob)],
```

The `formatDate()` helper (line 26) already formats as `'dd MMM yyyy'` which produces "16 Sep 1978". If you specifically want "16-September-1978" (full month name with hyphens), I can update the `formatDate` pattern to `'dd-MMMM-yyyy'` instead.

## Verification
1. View any seeker with a DOB set (e.g., Smita Nilesh Datar) → Personal Details shows formatted date like "16 Sep 1978".
2. View seeker without DOB → shows "—".

