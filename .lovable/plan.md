
# Add Manual Audio Upload for Walkthrough Videos

## Overview

Add the ability to upload a custom audio file for each tier's walkthrough video directly in the admin dashboard. This gives you full control over the audio narration, bypassing the AI-generated audio system when needed.

---

## Architecture Decision

**Two options for storing manual audio:**

| Option | Pros | Cons |
|--------|------|------|
| A. Add to `program_welcome_videos` table | Simpler, co-located with walkthrough video | Different from AI audio location |
| B. Add to `tier_onboarding_videos` table | Audio stays together (AI + manual) | Requires migration + more complex logic |

**Recommended: Option A** - Add `walkthrough_audio_url` column to `program_welcome_videos` table. This keeps the manual uploads together (video + audio) and is simpler to implement.

---

## Database Changes

Add a new column to `program_welcome_videos`:

```sql
ALTER TABLE program_welcome_videos 
ADD COLUMN walkthrough_audio_url TEXT;
```

---

## Storage

Use the existing `tier-walkthroughs` bucket (already public) to store audio files alongside walkthrough videos.

**File path pattern:** `{tierKey}/audio-{timestamp}.mp3`

---

## UI Changes (WelcomeVideosManager.tsx)

Add an audio upload section inside the "Walkthrough Video" tab for each tier:

```text
┌─────────────────────────────────────────────────────────┐
│  Walkthrough Video Tab                                  │
├─────────────────────────────────────────────────────────┤
│  [Screen Recording Walkthrough]                         │
│  📹 Video Preview (if uploaded)                         │
│  📤 Upload Walkthrough Video                            │
│  🔗 Or paste video URL                                  │
│                                                         │
│  ─────────────────────────────────────────             │
│                                                         │
│  [Narration Audio] NEW                                 │
│  🔊 Audio Preview (if uploaded)                        │
│  📤 Upload Audio File (MP3/WAV)                        │
│  🔗 Or paste audio URL                                  │
│  ℹ️ Overrides AI-generated audio when set              │
└─────────────────────────────────────────────────────────┘
```

**Changes:**
- Add `handleAudioUpload` function (similar to `handleFileUpload`)
- Add audio preview player when audio exists
- Add audio file input accepting `.mp3, .wav, .m4a`
- Add text input for direct audio URL paste
- Add helper text explaining this overrides AI audio

---

## Player Logic Changes (OnboardingVideoPlayer.tsx)

Modify the audio source priority:

```text
1. Manual audio (walkthrough_audio_url) - if uploaded, use this
2. AI-generated audio (tier_onboarding_videos.audio_url) - fallback
3. No audio - silent video playback
```

**Code change:**
```typescript
// Fetch from program_welcome_videos now includes audio
const { data, error } = await supabase
  .from("program_welcome_videos")
  .select("video_url, walkthrough_video_url, walkthrough_audio_url")
  .eq("plan_type", tierKey)
  .single();

// Audio source priority
const audioUrl = walkthroughAudioUrl || onboardingData?.audio_url;
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/admin/WelcomeVideosManager.tsx` | Add audio upload UI, audio preview, handleAudioUpload function |
| `src/components/OnboardingVideoPlayer.tsx` | Fetch and use manual audio, priority logic |
| Database Migration | Add `walkthrough_audio_url` column |

---

## Audio Upload Details

**Accepted formats:** MP3, WAV, M4A, AAC  
**Max file size:** 50MB (audio files are typically small)  
**Storage bucket:** `tier-walkthroughs` (already exists and is public)

---

## Summary

This gives you two ways to set walkthrough audio:

1. **AI-Generated (current):** Use the TierOnboardingManager to generate script + ElevenLabs audio
2. **Manual Upload (new):** Upload your own pre-recorded audio file in WelcomeVideosManager

Manual uploads take priority, so you can override any tier's AI audio by simply uploading a file.
