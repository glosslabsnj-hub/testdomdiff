

# Fix Walkthrough Audio, Mobile Controls, Skip Button & Login Loophole

## Issues Identified

### Issue 1: Audio Not Playing on Gen Pop/Solitary Walkthroughs
**Root Cause**: Both `Onboarding.tsx` and `FirstLoginVideoModal.tsx` query the `tier_onboarding_videos` table using `.single()` without filtering by `tier_config_version`. Since there are 6+ versions per tier, this query fails silently (Supabase returns an error when `.single()` finds multiple rows).

**Current Broken Code** (Onboarding.tsx lines 54-66):
```typescript
const { data: onboardingAudio } = useQuery({
  queryKey: ["onboarding-audio", tierKey],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("tier_onboarding_videos")
      .select("audio_url, status")
      .eq("tier_key", tierKey)
      .single();  // FAILS - multiple rows exist!
```

**Fix**: Query must filter by the current `tier_config_version` (currently 7) and use `.maybeSingle()` or explicitly order and limit.

---

### Issue 2: No Pause/Play Button on Mobile for Walkthrough Phase
**Root Cause**: The walkthrough video section only includes a mute button, not a play/pause button like the welcome video phase.

**Fix**: Add a play/pause button next to the mute button in the walkthrough phase controls.

---

### Issue 3: No Skip Video Button After 30 Seconds
**Root Cause**: Feature doesn't exist.

**Fix**: Add a "Skip" button that:
- Appears after 30 seconds of playback
- Is small and positioned at the bottom center
- Calls the video completion handler when clicked

---

### Issue 4: Login Page Allows Bypassing Payment
**Root Cause**: In `Login.tsx`, the "New to the system, begin processing?" link switches to signup mode where users can select a plan and create an account without payment.

**Current Text** (line 416):
```tsx
<>New to the system? <span className="text-primary hover:underline">Begin Processing</span></>
```

**Fix**: Change this to redirect users to the Programs page to choose and pay for a plan, rather than allowing direct signup with plan selection.

---

## Implementation Plan

### File 1: `src/pages/Onboarding.tsx`

**Changes:**
1. **Fix audio query** - Add version filtering to fetch the correct audio
2. **Add play/pause button** - Add to walkthrough phase controls
3. **Add skip button** - Show after 30 seconds, positioned at bottom center

### File 2: `src/components/FirstLoginVideoModal.tsx`

**Changes:**
1. **Fix audio query** - Same fix as Onboarding.tsx
2. **Add play/pause button** - Add to walkthrough phase controls  
3. **Add skip button** - Show after 30 seconds

### File 3: `src/components/OnboardingVideoPlayer.tsx`

**Changes:**
1. **Add skip button** - Show after 30 seconds (this component already has proper audio fetching via `useOnboardingVideo` hook)

### File 4: `src/pages/Login.tsx`

**Changes:**
1. **Change "Begin Processing" text** - Update to "Choose Your Program" or similar
2. **Redirect to Programs page** - Instead of switching to signup mode, navigate to `/programs`

---

## Technical Details

### Audio Query Fix (Onboarding.tsx & FirstLoginVideoModal.tsx)

```typescript
// First, fetch the current config version
const { data: configVersion } = useQuery({
  queryKey: ["tier-config-version"],
  queryFn: async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "tier_config_version")
      .single();
    return parseInt(data?.value || "1", 10);
  },
});

// Then fetch audio with version filter
const { data: onboardingAudio } = useQuery({
  queryKey: ["onboarding-audio", tierKey, configVersion],
  queryFn: async () => {
    if (!configVersion) return null;
    const { data, error } = await supabase
      .from("tier_onboarding_videos")
      .select("audio_url, status")
      .eq("tier_key", tierKey)
      .eq("tier_config_version", configVersion)
      .maybeSingle();
    
    if (error || data?.status !== "ready") return null;
    return data;
  },
  enabled: !!configVersion,
});
```

### Skip Button Component Pattern

```typescript
// Add state for skip button visibility
const [showSkipButton, setShowSkipButton] = useState(false);

// Timer to show skip button after 30 seconds
useEffect(() => {
  if (!isPlaying) return;
  
  const timer = setTimeout(() => {
    setShowSkipButton(true);
  }, 30000); // 30 seconds
  
  return () => clearTimeout(timer);
}, [isPlaying]);

// Skip button JSX (positioned at bottom center)
{showSkipButton && (
  <Button
    variant="ghost"
    size="sm"
    onClick={handleComplete}
    className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 hover:text-white text-xs"
  >
    Skip Video →
  </Button>
)}
```

### Login Page Redirect Fix

```typescript
// Change from toggle to navigation
<button
  type="button"
  onClick={() => navigate("/programs")}
  className="text-sm text-muted-foreground hover:text-foreground"
>
  New to the system? <span className="text-primary hover:underline">Choose Your Program</span>
</button>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Onboarding.tsx` | Fix audio query with version filter, add play/pause button to walkthrough, add skip button |
| `src/components/FirstLoginVideoModal.tsx` | Fix audio query with version filter, add play/pause button to walkthrough, add skip button |
| `src/components/OnboardingVideoPlayer.tsx` | Add skip button after 30 seconds |
| `src/pages/Login.tsx` | Change "Begin Processing" to redirect to Programs page |

---

## Expected Outcomes

1. **Audio works on all tiers**: Gen Pop and Solitary walkthroughs will properly fetch audio from version 7
2. **Mobile controls complete**: Users can pause/play walkthrough videos on mobile
3. **Skip option available**: After 30 seconds, users can skip the video if desired
4. **Payment loophole closed**: Users must visit Programs page to select and pay for a plan before account creation

