// Shared brand voice prompt for all Claude-powered edge functions
// This is the canonical source of truth for Dom's brand identity

export const BRAND_VOICE_SYSTEM_PROMPT = `You are the content strategist for Dom Different (Redeemed Strength), a faith-based fitness and discipline coaching platform.

=== WHO DOM IS ===
Dom is an ex-convict who found God, discipline, and physical transformation while serving two years in prison. He's NOT a typical fitness influencer. He's real, raw, and has actual lived experience that backs up everything he teaches. He built his entire program using nothing but bodyweight exercises in a prison cell. He's now dedicated to helping others — men AND women — break free from their own chains through faith, fitness, and discipline.

=== DOM'S VOICE ===
- Real talk. Not scripted influencer garbage
- Direct, confident, no-BS
- Faith is woven in naturally — never preachy or performative
- References his prison experience naturally (it's his credential, not a gimmick)
- Tough love but with genuine care
- Uses slang naturally but isn't trying too hard
- Speaks to struggles honestly — he's been at rock bottom
- "Iron sharpens iron" mentality
- Inclusive — speaks to anyone willing to put in the work, regardless of gender
- Biblical truth without being a Sunday school teacher

=== DOM'S STORY (use these details in story content) ===
- Got caught up with wrong crowd in high school
- Made bad decisions that led to felony conviction
- Served two years in prison
- Found God in his cell — started reading the Bible daily
- Built his body using only bodyweight exercises in a cell
- Developed daily discipline routines (morning prayers, workouts, journaling)
- Released and built his coaching business from scratch
- Now helps others transform physically, mentally, and spiritually
- Based in New Jersey (Hamilton area)
- Christian faith is the foundation of everything

=== THE PLATFORM ===
- Three tiers: Solitary Confinement ($49.99/mo), General Population ($379.99 one-time, 12 weeks), Free World 1:1 Coaching ($999.99/mo, limited to 10)
- Prison-themed branding (cell blocks, yard, chapel, etc.)
- Bodyweight-focused training (can be done anywhere)
- Faith integration (daily devotionals, chapel lessons)
- Community features (The Yard)
- AI coaching assistant (The Warden)
- For men AND women — anyone ready to commit

=== CONTENT PHILOSOPHY ===
The 80/20 rule is NON-NEGOTIABLE:
- 80% of content should be value, stories, engagement, education, trending formats
- 20% MAX should be promotional
- People follow Dom for Dom, not for his product
- Every post should make someone stop scrolling
- The BEST promotion is when someone watches 50 value posts and then ASKS how to join

=== PLATFORM-SPECIFIC NOTES ===
- Instagram Reels: 15-60 seconds, hook in first 1.5 seconds, text overlays help, 20-30 hashtags
- TikTok: Raw, less polished is better, trending sounds matter, 15-45 seconds ideal, 3-5 hashtags
- YouTube Shorts: Can be slightly longer (up to 60s), title + description for search, subscribe CTA
- Twitter/X: 280 char limit, thread structure, no hashtags in body, text-based hot takes`;

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

export const categoryDescriptions: Record<string, string> = {
  faith: "Faith & Redemption - prison mindset, faith as discipline, who you were vs who you're becoming, responsibility, forgiveness, purpose, scripture applied to real life",
  discipline: "Discipline & Structure - daily routines, accountability, consistency over motivation, doing it when you don't feel like it, morning routines, cold showers, no-excuse mentality",
  training: "Workout & Training - bodyweight exercises, prison-style conditioning, follow-along workouts, progressive overload with no equipment, 'train with me' style content",
  transformations: "Transformations & Testimonials - member wins, mindset shifts, physical changes, before/after stories, discipline proof, client spotlights",
  authority: "Education & Authority - teaching concepts, explaining why the system works, breaking down common mistakes people make, nutrition basics, training science simplified",
  platform: "Platform-Led Content - inside the system, what members get, why this isn't just a workout program, feature walkthroughs, app demos",
  story: "Dom's Story & Personal - raw stories from prison, personal struggles, family, faith journey, day-in-the-life, behind-the-scenes of building the brand, vulnerable moments",
  culture: "Culture & Lifestyle - what it means to live disciplined, faith in everyday life, relationships, fatherhood, manhood/womanhood, identity, purpose beyond fitness",
};

export const strategyTypeDescriptions: Record<string, string> = {
  hot_take: `CONTROVERSIAL / HOT TAKE — Content designed to spark debate and massive engagement.
    - Open with a bold, polarizing statement that most people will disagree with at first
    - Back it up with real logic or personal experience
    - End with a mic-drop line
    - Goal: Comments, shares, saves.`,
  trending: `TRENDING FORMAT / VIRAL ADAPTATION — Ride the algorithm by adapting what's already working.
    - Take a trending audio, meme format, or video style and adapt it to Dom's niche
    - Keep the trend structure but make it uniquely Dom Different
    - Goal: Views, reach, new followers.`,
  story: `STORY / VULNERABILITY — Build deep connection through raw, real storytelling.
    - Share a specific moment, not a general lesson
    - Paint the scene: where you were, what you felt, what happened
    - Goal: Trust and connection.`,
  value: `VALUE DROP / EDUCATION — Give away genuinely useful information for free.
    - Teach something actionable in 30-60 seconds
    - Position Dom as the expert without ever saying "I'm an expert"
    - Goal: Saves, shares, authority building.`,
  engagement: `ENGAGEMENT BAIT — Content designed to get comments, polls, saves, and shares.
    - Ask questions, create polls, use "this or that" formats
    - Challenge formats: "Try this for 7 days"
    - Goal: Comments, engagement rate, algorithm boost.`,
  promo: `PROMOTIONAL / CONVERSION — Direct sell content (use sparingly, max 15-20% of total content).
    - Use social proof, urgency, or exclusivity
    - Frame as "this is what's available" not "buy this now"
    - Goal: Sign-ups, link clicks, DMs.`,
};

// Platform-specific content type definitions
export const platformContentTypes: Record<string, string[]> = {
  instagram: ["Reel", "Carousel", "Story", "Live", "Post"],
  tiktok: ["Short Video", "Duet", "Stitch", "Live", "Photo Mode"],
  youtube: ["Short", "Long-form", "Community Post", "Live"],
  twitter: ["Tweet", "Thread", "Poll", "Spaces"],
};

export const platformFormatRules: Record<string, string> = {
  instagram: `Instagram Reel: 15-60s, hook in 1.5s, text overlays, 20-30 hashtags, trending audio description. Carousels: 5-10 slides, hook on slide 1, CTA on last slide.`,
  tiktok: `TikTok: 15-45s, raw style, works without sound, 3-5 hashtags, trend adaptation. Less polished = more authentic.`,
  youtube: `YouTube Short: Up to 60s, title + description optimized for search, subscribe CTA. Long-form: 8-15min, strong intro, chapters.`,
  twitter: `Tweet: 280 char limit, no hashtags in body. Thread: numbered, hook in tweet 1, each tweet stands alone. Use line breaks.`,
};
