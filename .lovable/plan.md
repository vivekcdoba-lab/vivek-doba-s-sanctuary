

## Problem

The **Applications Review** page (`/applications`) exists in the codebase and is routed correctly, but it was removed (or never added) to the admin sidebar navigation in `AdminLayout.tsx`. This page handles review of submissions from:
- Book a 45-minute Discovery Call
- Register for a One-Day Workshop  
- Apply for Life's Golden Triangle – Premier Program

## Plan

### 1. Add "Applications" link to the admin sidebar

**File:** `src/components/AdminLayout.tsx`

Add a new nav item under the **LEADS (CRM)** group (or create an **APPLICATIONS** group under the ENROLLMENTS section — whichever fits better). The most logical placement is in the **ENROLLMENTS** group since applications feed into enrollments:

- Icon: `Inbox` (already imported)
- Label: "Applications Review"
- Path: `/applications`

This single change will restore sidebar access to the existing, fully functional Applications page.

### Technical Details

- The `ApplicationsPage` component already exists at `src/pages/admin/ApplicationsPage.tsx`
- The route `<Route path="/applications" element={<ApplicationsPage />} />` already exists in `App.tsx`
- Only the sidebar `adminNav` array in `AdminLayout.tsx` needs updating — add one item to the ENROLLMENTS group's `items` array

