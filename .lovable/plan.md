
# Fix: Onboarding.tsx Not Using Manual Audio Uploads

## Root Cause

The `Onboarding.tsx` page (the mandatory fullscreen orientation for new users) is NOT fetching the manually-uploaded audio from `program_welcome_videos.walkthrough_audio_url`. Instead, it only fetches the AI-generated audio from `tier_onboarding_videos`.

**Current query in Onboarding.tsx (line 47):**
```typescript
.select("video_url, walkthrough_video_url")  // ← MISSING walkthrough_audio_url
```

Meanwhile, `OnboardingVideoPlayer.tsx` (used in dashboard/StartHere) correctly fetches:
```typescript
.select("video_url, walkthrough_video_url, walkthrough_audio_url")
```

This means:
- **Admin preview (using OnboardingVideoPlayer):** Plays manual audio (correct voice)
- **New user onboarding (using Onboarding.tsx):** Plays AI audio (wrong voice)

---

## Fix

Update `Onboarding.tsx` to:
1. Fetch `walkthrough_audio_url` from `program_welcome_videos`
2. Use manual audio as priority, falling back to AI audio only if no manual upload exists

---

## Technical Changes

### File: `src/pages/Onboarding.tsx`

**Change 1:** Update the query to include `walkthrough_audio_url` (line 47)

```typescript
// Before:
.select("video_url, walkthrough_video_url")

// After:
.select("video_url, walkthrough_video_url, walkthrough_audio_url")
```

**Change 2:** Add priority logic to use manual audio first (around line 70-90)

```typescript
// Determine effective audio URL (manual takes priority over AI-generated)
const effectiveAudioUrl = videos?.walkthrough_audio_url || onboardingAudio?.audio_url;
```

**Change 3:** Update all audio source references to use `effectiveAudioUrl` instead of `onboardingAudio?.audio_url`

This includes:
- Line 105: Sync interval check
- Line 129: Audio priming check
- Line 157: Audio playback check
- Line 273: Audio element src

---

## Also Fix: FirstLoginVideoModal.tsx

Same issue likely exists there. Need to verify and apply the same fix if needed.

---

## Summary

| Component | Current Behavior | Fixed Behavior |
|-----------|-----------------|----------------|
| `Onboarding.tsx` | AI audio only | Manual → AI fallback |
| `OnboardingVideoPlayer.tsx` | Manual → AI fallback | No change needed |
| `FirstLoginVideoModal.tsx` | Needs verification | Manual → AI fallback |

After this fix, all users (admin and regular) will hear the same manually-uploaded audio that you recorded with the correct voice and script.
