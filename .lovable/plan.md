
# Fix Plan: Ensure Users Can Resume Onboarding After Signup

## The Problem

After signup and payment, if a user leaves the intake/onboarding flow and returns later (or the browser suspends the tab), they sometimes see "No Active Assignments" instead of resuming where they left off.

**Why this happens:**
1. The browser tab is suspended/resumed, causing React to re-mount
2. AuthContext re-fetches subscription data from the database
3. If there's any delay or transient failure, `hasAccess` becomes `false`
4. ProtectedRoute redirects to `/access-expired` because the subscription check fails

## The Expected Flow

```text
Signup → Pay → Intake Form → Watch Video → Dashboard
           ↓
    (User can leave and return at any point)
           ↓
    Resume where they left off (intake, onboarding, or dashboard)
```

## Solution Overview

Add a **"fresh signup" session flag** that persists during the onboarding flow. Routes that use `requireIntake={false}` (intake, intake-complete, onboarding) will check this flag before redirecting to `/access-expired`, giving the subscription verification extra time.

### Key Changes

1. **Extend the fresh signup protection window** — Don't redirect to `/access-expired` during onboarding if the user just signed up
2. **Add a fallback retry mechanism** — If subscription isn't found immediately, retry a few times before giving up
3. **Clear the flag only after successful dashboard access** — Not after intake completion

---

## Technical Implementation

### File 1: `src/components/ProtectedRoute.tsx`

Add logic to detect onboarding routes and give them more lenient access checking:

```typescript
// Add at the top of the component
const isOnboardingRoute = ['/intake', '/intake-complete', '/onboarding', '/freeworld-intake'].includes(location.pathname);

// Modify the access check (line ~146)
// For onboarding routes, if fresh signup flag is set, don't redirect immediately
const isFreshSignup = sessionStorage.getItem("rs_fresh_signup") === "true";

if (!requireAdmin && dataLoaded && !hasAccess) {
  // For onboarding routes during fresh signup, give extra time
  if (isOnboardingRoute && isFreshSignup && !verificationComplete) {
    // Stay in verification mode - the existing useEffect will handle retries
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verifying your subscription...</p>
      </div>
    );
  }
  return <Navigate to="/access-expired" replace />;
}
```

### File 2: `src/pages/Login.tsx`

Ensure the fresh signup flag is set before navigation and is only cleared after dashboard access:

```typescript
// Already correctly sets: sessionStorage.setItem("rs_fresh_signup", "true");
// No changes needed here
```

### File 3: `src/pages/dashboard/Dashboard.tsx`

Clear the fresh signup flag once the user successfully accesses the dashboard:

```typescript
useEffect(() => {
  // Clear fresh signup flag once user reaches dashboard
  sessionStorage.removeItem("rs_fresh_signup");
}, []);
```

### File 4: `src/components/ProtectedRoute.tsx` (additional change)

Modify the fresh signup check to be more robust:

```typescript
// Enhanced fresh signup verification
useEffect(() => {
  const checkFreshSignup = async () => {
    const isFreshSignup = sessionStorage.getItem("rs_fresh_signup") === "true";
    
    // Only run verification if:
    // 1. It's a fresh signup
    // 2. User exists
    // 3. We don't have access yet
    // 4. We're not already verifying
    // 5. We haven't already completed verification
    if (isFreshSignup && user && !hasAccess && !isVerifying && !verificationComplete) {
      setIsVerifying(true);
      
      // More aggressive retry: 8 attempts over ~10 seconds
      for (let i = 0; i < 8; i++) {
        const { data } = await supabase
          .from("subscriptions")
          .select("id, status")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();
        
        if (data) {
          await refreshSubscription();
          // DON'T remove flag here - let Dashboard do it
          break;
        }
        await new Promise(r => setTimeout(r, 500 + (i * 200))); // Progressive delay
      }
      
      setIsVerifying(false);
      setVerificationComplete(true);
    }
  };
  
  checkFreshSignup();
}, [user, hasAccess, isVerifying, verificationComplete, refreshSubscription]);
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/ProtectedRoute.tsx` | Add onboarding route detection and lenient access checking |
| `src/pages/dashboard/Dashboard.tsx` | Clear fresh signup flag on successful dashboard access |

---

## Summary

| Scenario | Before | After |
|----------|--------|-------|
| Signup → Leave intake tab → Return | "No Active Assignment" error | Resumes at intake form |
| Signup → Complete intake → Leave → Return | Sometimes "No Active Assignment" | Resumes at onboarding video |
| Signup → Complete everything → Logout → Login | Works correctly | Works correctly |
| Existing user → Tab switch | "No Active Assignment" flash | Fixed by `dataLoaded` flag |

The key insight is that the fresh signup protection window should extend through the entire onboarding flow (intake → video → dashboard), not just the initial signup. The flag is only cleared once the user successfully reaches the dashboard, ensuring they can always resume where they left off.
