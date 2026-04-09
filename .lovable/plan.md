

## Plan: Complete Sidebar Navigation for All Three Roles

### Scope Assessment

The request defines ~120+ sidebar menu items across 3 roles. Currently the app has:
- **Seeker**: 14 routes
- **Coach**: 8 routes  
- **Admin**: 21 routes

Most requested items (Dharma, Artha/Business, Kama, Moksha, Learning, Achievements, etc.) have **no existing pages**. Building all pages is a separate effort. This plan focuses on:

1. **Building the sidebar navigation structure** with all requested items
2. **Linking existing pages** where routes exist
3. **Routing to a placeholder page** for items without pages yet
4. **Applying the requested design system** (warm cream, saffron active, collapsible, profile section, scrollable groups)

### Design Specifications

- Width: 260px expanded, 70px collapsed (icons only)
- Background: Warm cream `#FFF8F0` with subtle gradient
- Active item: Saffron `#FF6B00` left border + highlight
- Collapsible groups with chevron toggles
- Profile section at top with avatar, name, badge, progress bar (seeker), streak
- Logout at bottom
- Mobile: hamburger opens sidebar as overlay sheet
- Desktop: always visible, collapse toggle at bottom
- Smooth transitions throughout

### Files to Create/Edit

| File | Action | Purpose |
|------|--------|---------|
| `src/components/SeekerLayout.tsx` | **Rewrite** | New sidebar with all Seeker groups (Purushaarth, Resources, etc.) |
| `src/components/CoachingLayout.tsx` | **Rewrite** | New sidebar with Coach groups (Seekers, Worksheet Reviews, etc.) |
| `src/components/AdminLayout.tsx` | **Rewrite** | New sidebar with Admin groups (CRM, Content, Analytics, System) |
| `src/pages/PlaceholderPage.tsx` | **Edit** | Generic placeholder accepting title param for unbuilt pages |
| `src/App.tsx` | **Edit** | Add routes for all new sidebar items pointing to PlaceholderPage |

### Sidebar Structure Summary

**Seeker** (7 groups):
- Home, Daily Practice (4 items), Assessments (5), Sessions (5), Assignments (4)
- Purushaarth: Dharma (4), Artha (15 with sub-sections), Kama (4), Moksha (4)
- Resources: Learning (5), Ambient Sounds (1), Messages (2), Achievements (3)
- Settings (4) + Logout

**Coach** (6 groups):
- Dashboard, Seekers (5), Worksheet Reviews (4), Sessions (6), Assignments (5), Assessments (3)
- Artha Coaching: Business Reviews (4)
- Communication: Messages (3), Reports (4)
- Settings + Logout

**Admin** (8 groups):
- Dashboard, Users (6), Programs (4), Enrollments (4)
- CRM: Leads (6), Payments (6)
- Content: Resources (5), Assessments (3)
- Communication: Messages (2)
- VDTS Business (4), Analytics/Reports (6)
- System/Settings (5) + Logout

### Implementation Approach

Each layout will use collapsible `<details>`/custom accordion groups (not the shadcn Sidebar component, since the current AdminLayout already uses a custom approach that works well). This keeps the implementation consistent and avoids the shadcn sidebar's mobile behavior conflicts.

Key patterns:
- Each group uses a collapsible section with chevron rotation animation
- `localStorage` remembers which groups are expanded per role
- Profile section fetches streak count (seeker) or seeker count (coach)
- New routes use `<PlaceholderPage title="Page Name" />` for unbuilt features
- ~80 new placeholder routes added to App.tsx

### Technical Details

- All nav items use `NavLink` or `Link` from react-router-dom
- Active state detection: exact match for home, startsWith for nested routes
- Collapsed mode: only icons shown, group labels hidden, tooltips on hover
- Mobile: overlay with backdrop blur, closes on nav click
- Scroll: `overflow-y-auto` on nav section, profile and logout fixed top/bottom
- Transitions: `transition-all duration-300` on sidebar width, `transition-colors` on items

