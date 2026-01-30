
# Multi-Tab Session Issues + Subscription Errors: Complete Fix

## Problems Identified

You're experiencing **three related but distinct issues**:

### Issue 1: Multiple Accounts in Different Tabs Don't Work
**Root Cause:** This is a fundamental limitation of how browser authentication works. Supabase stores the user session in `localStorage`, which is **shared across all tabs on the same domain**. When you log into Account B in Tab 2, it overwrites Account A's session - and when you switch back to Tab 1, it now has Account B's session.

This is **by design** for security - it prevents session confusion. However, it makes testing multiple accounts impossible without workarounds.

### Issue 2: "No Active Assignment" Flash on Tab Switch
**Root Cause:** When switching tabs, the browser can suspend/resume React, triggering re-initialization of the AuthContext. The `onAuthStateChange` listener fires, but before the profile/subscription data loads, the UI briefly shows "No active assignments." 

This was partially fixed in the previous update with the `dataLoaded` flag, but the session storage conflicts from Issue 1 can still cause this.

### Issue 3: Signup "Subscription Failed" Error
**Root Cause:** The edge function `create-user-subscription` is working (tested above with a 500 error when passed an invalid UUID), but some signups may fail due to:
- CORS headers missing the newer Supabase client headers
- Network timing issues during concurrent tab operations

---

## Solution Overview

### For Multi-Account Testing (Your Primary Need)
The **only reliable way** to test multiple different accounts simultaneously is:

1. **Use different browsers** - Chrome for Account A, Firefox for Account B, Safari for Account C
2. **Use browser profiles** - Chrome User 1, Chrome User 2, etc. (each has separate localStorage)
3. **Use incognito/private windows** - Each incognito window has isolated storage

This is not something we can fix with code - it's how browser security works. The session is stored at `localStorage['sb-wbnrmnfsxrxcxnvmowtp-auth-token']` and all tabs share it.

### For Single Account Multi-Tab (Secondary Issue)
We'll make the auth system more resilient when the **same account** is open in multiple tabs:

1. **Improve CORS headers** on the edge function to include all Supabase client headers
2. **Add session storage check** on route load to detect if the user changed
3. **Improve error handling** in subscription creation

---

## Technical Implementation

### 1. Update Edge Function CORS Headers
The current CORS headers are missing some Supabase client headers that the SDK now sends:

**Current:**
```javascript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

**Updated:**
```javascript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
```

### 2. Add User Change Detection in ProtectedRoute
Add a check to handle when the user ID changes between renders (which happens when a different account logs in via another tab):

```typescript
// In ProtectedRoute.tsx
const [lastKnownUserId, setLastKnownUserId] = useState<string | null>(null);

useEffect(() => {
  if (user && lastKnownUserId && user.id !== lastKnownUserId) {
    // User changed (different account logged in from another tab)
    // Force a full page reload to get fresh state
    window.location.reload();
  }
  if (user) {
    setLastKnownUserId(user.id);
  }
}, [user]);
```

### 3. Add Retry Logic for Subscription Creation Failures
Add more robust error handling in Login.tsx to retry if the edge function call fails:

```typescript
const createSubscriptionWithRetry = async (userId: string, email: string, planType: PlanType, attempts = 3) => {
  for (let i = 0; i < attempts; i++) {
    try {
      await createSubscriptionViaEdge(userId, email, planType);
      return;
    } catch (err) {
      if (i === attempts - 1) throw err;
      await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
};
```

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/create-user-subscription/index.ts` | Update CORS headers |
| `src/components/ProtectedRoute.tsx` | Add user change detection |
| `src/pages/Login.tsx` | Add retry logic for subscription creation |

---

## Testing Strategy for Your Demo Tonight

Since you need to demo multiple tiers, here's the recommended approach:

1. **Use 3 different browsers** (Chrome, Firefox, Safari/Edge)
2. Each browser logs into a different tier account
3. You can switch between browser windows without any session conflicts

Alternatively, use Chrome profiles:
1. Open Chrome → Click your profile icon → "Add" → Create "Tier 1 Demo"
2. Repeat for "Tier 2 Demo" and "Tier 3 Demo"  
3. Each profile is completely isolated

---

## Summary

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| Can't have 4 different accounts in 4 tabs | Browser localStorage is shared across tabs | Use different browsers or browser profiles |
| "No Active Assignment" flash | Auth state not fully loaded on tab resume | Already fixed with `dataLoaded`; adding user change detection |
| Subscription errors on signup | CORS headers incomplete + no retry logic | Update CORS headers + add retry |
| Logout not working | Async race condition | Already fixed with optimistic state clear |

The key insight is that **you cannot have different accounts logged in across tabs on the same browser profile** - this is a browser security feature, not a bug. Use separate browsers or browser profiles for multi-account testing.
