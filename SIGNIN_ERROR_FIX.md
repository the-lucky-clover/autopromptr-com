# Sign-In Error Troubleshooting Guide

## Changes Made

I've improved the error handling and added diagnostic tools to help identify and fix sign-in issues on the landing page.

### 1. Enhanced Error Messages (`src/components/AuthModal.tsx`)
- ✅ Added input validation (checks for empty email/password)
- ✅ More specific error messages with emojis for better visibility
- ✅ Longer display time for error messages (7 seconds)
- ✅ Error messages now show in both 'idle' and 'error' states
- ✅ Added console logging for debugging
- ✅ Better handling of common error scenarios:
  - Invalid credentials
  - Email not confirmed
  - User not found
  - Too many requests
  - Network errors

### 2. Debug Utilities (`src/utils/authDebug.ts`)
Created helper functions to diagnose auth issues:
- `debugAuth()` - Check Supabase configuration and connection
- `testSignIn()` - Test sign-in with detailed error logging

### 3. Auth Test Page (`/auth-test`)
Created a dedicated testing page at `/auth-test` with:
- Direct Supabase sign-in test
- Hook-based sign-in test
- Connection check
- Current auth state display
- Common issues guide

### 4. Enhanced Logging
Added debug logging in:
- `Navbar.tsx` - Auth state tracking
- `AuthModal.tsx` - Sign-in flow tracking

## How to Diagnose the Error

### Step 1: Check Browser Console
1. Open the landing page (/)
2. Open DevTools (F12 or Cmd+Opt+I)
3. Go to Console tab
4. Try to sign in
5. Look for error messages starting with 🔍, 🔐, ❌, or ✅

### Step 2: Use the Auth Test Page
1. Navigate to `/auth-test`
2. Click "Check Connection" to verify Supabase is working
3. Enter test credentials
4. Click "Test Direct Sign-In" to see raw errors
5. Review the JSON result for error details

### Step 3: Common Issues & Solutions

#### Issue 1: "Invalid login credentials"
**Cause:** Wrong email/password or account doesn't exist
**Solution:**
- Verify you created an account first (click "Sign Up" instead)
- Check email spelling carefully
- Try password reset (coming soon)

#### Issue 2: "Email not confirmed"
**Cause:** Account created but email not verified
**Solution:**
- Check your email inbox (and spam folder)
- Look for verification email from Supabase
- Click the verification link
- Try resending verification email

#### Issue 3: "No account found"
**Cause:** Trying to sign in before signing up
**Solution:**
- Click "Sign Up" instead of "Sign In"
- Create an account first
- Then verify email
- Then sign in

#### Issue 4: Network/Connection errors
**Cause:** Can't reach Supabase servers
**Solution:**
- Check your internet connection
- Check browser console for CORS errors
- Verify Supabase URL is correct in `src/integrations/supabase/client.ts`
- Check if Supabase project is active

#### Issue 5: "Too many requests"
**Cause:** Rate limiting after multiple failed attempts
**Solution:**
- Wait 1-2 minutes
- Try again with correct credentials

## Testing the Fixes

### Test 1: Sign-In with Valid Account
```
1. Go to landing page (/)
2. Click avatar button → "Sign In"
3. Enter valid email and password
4. Click "Sign In"
5. Should see: "✅ Welcome back! Redirecting..."
6. Should redirect to /dashboard
```

### Test 2: Sign-In with Invalid Credentials
```
1. Go to landing page (/)
2. Click avatar button → "Sign In"
3. Enter wrong credentials
4. Click "Sign In"
5. Should see: "❌ Invalid email or password..." error message
6. Error message should be visible for 7 seconds
7. Console should show error details
```

### Test 3: Sign-In Without Account
```
1. Go to landing page (/)
2. Click avatar button → "Sign In"
3. Enter email that has no account
4. Click "Sign In"
5. Should see error about no account found
6. Should be able to switch to "Sign Up"
```

## Code Locations

| File | What Changed |
|------|-------------|
| `src/components/AuthModal.tsx` | Improved error handling, validation, messages |
| `src/components/Navbar.tsx` | Added debug logging |
| `src/utils/authDebug.ts` | New diagnostic utilities |
| `src/pages/AuthTest.tsx` | New test page |
| `src/App.tsx` | Added `/auth-test` route |

## Next Steps

1. **Run the dev server**: `npm run dev`
2. **Open browser console**: F12 or Cmd+Opt+I
3. **Try signing in**: Check what errors appear
4. **Visit `/auth-test`**: Use diagnostic tools
5. **Share the error**: Copy console errors to help debug further

## Quick Debug Commands

Run these in the browser console:

```javascript
// Check Supabase configuration
console.log('Supabase configured:', window.location.origin);

// Check current auth state
supabase.auth.getSession().then(console.log);

// Test sign-in (replace with your credentials)
supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password123'
}).then(console.log);
```

## Still Having Issues?

If errors persist:
1. Share the exact error message from console
2. Share the error from `/auth-test` page
3. Verify Supabase project is active at https://supabase.com
4. Check if RLS (Row Level Security) policies are correct
5. Verify email/password requirements (min 6 chars)
