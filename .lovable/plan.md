

# Plan: Strengthen Password Validation

## Summary
Update the password validation in `RegisterPage.tsx` to require at least 12 characters, one uppercase letter, one number, and one special character. Update the placeholder text and error message to match.

## Changes

### File: `src/pages/RegisterPage.tsx`

1. **Replace the password length check (lines 26-28)** with a regex-based validation:
   - Minimum 12 characters
   - At least one uppercase letter (`[A-Z]`)
   - At least one number (`[0-9]`)
   - At least one special character (`[@#$%&*!?_\-+=]`)
   - Show a clear error message listing the requirements

2. **Update the password input placeholder** (around line 119) from `"Password (min 6 chars) *"` to `"Password (min 12 chars) *"`

3. **Add a hint below the password field** showing the requirements so users know before they type

No other files change. No database changes.

