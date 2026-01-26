
# Comprehensive Onboarding Video Audio Fix

## Problem Summary

The onboarding video audio is working correctly on your desktop (admin preview) but may have issues for real users on other devices. Based on my investigation, I identified several potential causes:

1. **Inconsistent cache-busting**: Different components fetch audio with slightly different cache-busting strategies
2. **Mobile audio autoplay blocks**: Not all components handle iOS/Android audio permission requirements
3. **Audio preloading inconsistency**: Some components don't preload audio, causing delays or failures
4. **Missing "tap to enable" fallback**: Only `OnboardingVideoPlayer.tsx` has the `needsAudioTap` fallback; other components lack this

## Current State

**Database Status (tier_config_version: 7):**
- All 3 tiers have "ready" audio with correct voice ID (`rAjfUfM1BSLyNwE8ckhm`)
- membership: `audio-v7.mp3` (261 seconds)
- transformation: `audio-v7.mp3` (372 seconds)  
- coaching: `audio-v7.mp3` (291 seconds)

**Components that play onboarding audio:**
1. `OnboardingVideoPlayer.tsx` - Used by DashboardOnboardingVideo and StartHere (has mobile handling)
2. `Onboarding.tsx` - Mandatory fullscreen orientation page (MISSING mobile handling)
3. `FirstLoginVideoModal.tsx` - Modal fallback (MISSING mobile handling)

---

## Implementation Plan

### 1. Fix Onboarding.tsx (Priority: Critical)
The main onboarding page that new users see lacks the mobile audio handling that exists in `OnboardingVideoPlayer.tsx`.

**Changes:**
- Add `needsAudioTap` state for mobile audio permission handling
- Add audio "priming" on first user interaction (same pattern as OnboardingVideoPlayer)
- Add "Tap to enable narration" overlay when audio fails to autoplay
- Preload audio element to ensure it's ready when walkthrough starts
- Add `preload="auto"` to audio element

### 2. Fix FirstLoginVideoModal.tsx (Priority: High)
The modal version also lacks mobile audio handling.

**Changes:**
- Add `needsAudioTap` state and overlay
- Add audio priming on first play
- Preload audio element
- Add fallback UI for blocked audio

### 3. Standardize Cache-Busting (Priority: Medium)
Ensure all components use the exact same cache-busting strategy from `useOnboardingVideo.ts`.

**Changes in Onboarding.tsx and FirstLoginVideoModal.tsx:**
- Use the `useOnboardingVideo` hook instead of raw queries (DRY principle)
- This ensures consistent `?v=${configVersion}&t=${cacheBuster}` parameters

### 4. Add Audio Element Mounting (Priority: Medium)
Ensure the audio element is always in the DOM (not conditionally rendered) for better mobile reliability.

**Changes:**
- Mount audio element at component load (not just during walkthrough phase)
- Control playback via JavaScript instead of conditional rendering

### 5. Ensure Service Worker Doesn't Interfere (Priority: Low)
Already fixed - the service worker skips audio/video caching. No changes needed.

---

## Technical Details

### New State for Mobile Handling
```typescript
const [needsAudioTap, setNeedsAudioTap] = useState(false);
```

### Audio Priming Pattern (on first user tap)
```typescript
const handlePlay = () => {
  // Prime audio for later autoplay on mobile
  if (audioRef.current && onboardingAudio?.audio_url) {
    const audio = audioRef.current;
    audio.muted = true;
    audio.play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      })
      .catch(() => {
        audio.muted = false;
      });
  }
  // ... rest of play logic
};
```

### Tap-to-Enable Overlay Pattern
```tsx
{needsAudioTap && (
  <div
    className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm cursor-pointer"
    onClick={startWalkthroughWithAudio}
  >
    <div className="px-4 py-3 rounded-lg bg-background/80 border text-center">
      <p className="text-sm font-medium">Tap to enable narration</p>
      <p className="text-xs text-muted-foreground">Audio was blocked - tap to continue</p>
    </div>
  </div>
)}
```

### Audio Element Always Mounted
```tsx
{/* Always mount audio for mobile reliability */}
<audio
  ref={audioRef}
  src={onboardingAudio?.audio_url || ""}
  preload="auto"
  onEnded={handleWalkthroughEnd}
/>
```

---

## Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `src/pages/Onboarding.tsx` | Major | Add mobile audio handling, priming, tap overlay, use hook |
| `src/components/FirstLoginVideoModal.tsx` | Major | Add mobile audio handling, priming, tap overlay, use hook |
| `src/hooks/useOnboardingVideo.ts` | Minor | Add fallback for missing audio gracefully |

---

## Testing Checklist

After implementation, verify:
- [ ] New user on desktop sees/hears correct tier-specific audio
- [ ] New user on mobile (iOS Safari) sees/hears audio after tap
- [ ] New user on mobile (Android Chrome) sees/hears audio
- [ ] Audio matches the video timing (sync works)
- [ ] "Tap to enable narration" appears when audio is blocked
- [ ] Rewatching from StartHere plays correct audio
- [ ] No stale/cached audio plays after regeneration
