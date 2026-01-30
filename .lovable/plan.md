
# Fix Plan: Logout Button + "No Active Assignments" Race Condition

## Issues Identified

### Issue 1: Logout Button Not Working
**Root Cause:** The `signOut()` function in `AuthContext.tsx` is async, but the `handleLogout` in `Header.tsx` doesn't wait for the Promise to properly resolve before the page redirect happens. The Supabase signOut may not complete before `window.location.href` fires.

**Evidence:** The current implementation is:
```typescript
const handleLogout = async () => {
  await signOut();
  window.location.href = "/";
};
```

The `signOut` in AuthContext calls `supabase.auth.signOut()` which is async, but there's no guarantee the state clears before the hard redirect. Additionally, using `window.location.href` sometimes doesn't wait for async operations to settle.

---

### Issue 2: "No Active Assignments" Flash on Tab Switch
**Root Cause:** This is a **race condition** in the authentication flow. When you:
1. Leave a tab open
2. The browser suspends/resumes the tab
3. The `AuthContext` re-initializes, setting `loading=true`
4. Before profile/subscription data loads, the UI shows the "No active assignment" state from `AccessExpired.tsx`

The flow works like this:
1. User returns to tab → React re-renders
2. `ProtectedRoute` checks `hasAccess` → it's `false` because data hasn't loaded yet
3. User is redirected to `/access-expired` which shows "No Active Assignment"
4. Eventually subscription loads → `hasAccess` becomes `true` → redirects back to dashboard

This matches the "lovable-stack-overflow" guidance about separating initial load from ongoing changes.

---

## Technical Solution

### Fix 1: Logout Button
Improve the logout handler to properly clear state and use React Router navigation:

```typescript
// In Header.tsx
const handleLogout = async () => {
  try {
    await signOut();
  } finally {
    // Force full page reload to clear all state
    window.location.replace("/");
  }
};
```

Also enhance the `signOut` in `AuthContext.tsx` to:
1. Clear the user state immediately (optimistic)
2. Wait for Supabase signOut to complete
3. Return only after state is fully cleared

---

### Fix 2: "No Active Assignments" Race Condition
The issue is that `ProtectedRoute` redirects to `/access-expired` while `loading` is `false` but `hasAccess` hasn't been computed yet (subscription is still loading).

**Solution:** Add a `dataLoaded` state that only becomes `true` after the **initial** profile and subscription fetch completes. The `loading` state is currently being set to `false` by the `onAuthStateChange` handler *before* the data fetch completes in some race conditions.

**Specifically:**
1. In `AuthContext.tsx`, track when initial data fetch is complete separately from auth loading
2. In `ProtectedRoute.tsx`, don't redirect to `/access-expired` until we've confirmed the subscription data has been fetched at least once

---

## Files to Modify

### 1. `src/contexts/AuthContext.tsx`
- Add `dataLoaded` state to track when profile/subscription have been fetched at least once
- Modify `signOut` to clear `user` state immediately and wait for Supabase
- Export `dataLoaded` so ProtectedRoute can use it

### 2. `src/components/Header.tsx`
- Update `handleLogout` to use `window.location.replace()` to prevent back-button issues
- Add a small delay or use a flag to ensure signOut completes

### 3. `src/components/ProtectedRoute.tsx`
- Use the new `dataLoaded` flag from AuthContext
- Only redirect to `/access-expired` after confirming data has been loaded
- Show loading spinner while data is still being fetched for the first time

---

## Detailed Changes

### AuthContext.tsx Changes
```typescript
// Add new state
const [dataLoaded, setDataLoaded] = useState(false);

// In initial session fetch, after fetching profile/subscription:
setDataLoaded(true);

// In signOut, immediately clear user:
const signOut = async () => {
  setUser(null);  // Clear immediately
  setSession(null);
  setProfile(null);
  setSubscription(null);
  setDataLoaded(false);
  await supabase.auth.signOut();
};

// Export dataLoaded in context value
```

### ProtectedRoute.tsx Changes
```typescript
const { user, loading, hasAccess, profile, subscription, dataLoaded } = useAuth();

// Show loading if auth is loading OR if data hasn't been loaded yet
if (loading || isVerifying || !adminCheckComplete || (user && !dataLoaded)) {
  return <LoadingSpinner />;
}

// Only redirect to access-expired after confirming data has loaded
if (!requireAdmin && dataLoaded && !hasAccess) {
  return <Navigate to="/access-expired" replace />;
}
```

### Header.tsx Changes
```typescript
const handleLogout = async () => {
  await signOut();
  // Use replace to prevent back-button returning to protected page
  window.location.replace("/");
};
```

---

## Summary

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Logout button not working | `signOut` async race with page redirect | Clear state immediately + use `window.location.replace()` |
| "No Active Assignments" flash | UI renders before subscription data loads on tab resume | Track `dataLoaded` state, don't redirect until data confirmed fetched |

This will make the logout button work reliably and prevent the confusing "No active assignments" flash when switching tabs.
