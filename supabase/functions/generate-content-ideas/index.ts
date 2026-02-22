// Content Strategy Engine — generates strategic social media content for Dom Different
// NOT just promotional scripts — this is a full content strategy system

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://domdifferent.com",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// ============================================================
// CONTENT CATEGORIES — What the content is ABOUT
// ============================================================
const categoryDescriptions: Record<string, string> = {
  faith: "Faith & Redemption - prison mindset, faith as discipline, who you were vs who you're becoming, responsibility, forgiveness, purpose, scripture applied to real life",
  discipline: "Discipline & Structure - daily routines, accountability, consistency over motivation, doing it when you don't feel like it, morning routines, cold showers, no-excuse mentality",
  training: "Workout & Training - bodyweight exercises, prison-style conditioning, follow-along workouts, progressive overload with no equipment, 'train with me' style content",
  transformations: "Transformations & Testimonials - member wins, mindset shifts, physical changes, before/after stories, discipline proof, client spotlights",
  authority: "Education & Authority - teaching concepts, explaining why the system works, breaking down common mistakes people make, nutrition basics, training science simplified",
  platform: "Platform-Led Content - inside the system, what members get, why this isn't just a workout program, feature walkthroughs, app demos",
  story: "Dom's Story & Personal - raw stories from prison, personal struggles, family, faith journey, day-in-the-life, behind-the-scenes of building the brand, vulnerable moments",
  culture: "Culture & Lifestyle - what it means to live disciplined, faith in everyday life, relationships, fatherhood, manhood/womanhood, identity, purpose beyond fitness",
};

// ============================================================
// CONTENT STRATEGY TYPES — HOW the content is positioned
// ============================================================
const strategyTypeDescriptions: Record<string, string> = {
  hot_take: `CONTROVERSIAL / HOT TAKE — Content designed to spark debate and massive engagement.
    - Open with a bold, polarizing statement that most people will disagree with at first
    - Back it up with real logic or personal experience
    - End with a mic-drop line
    - These get shared because people feel strongly
    - Examples: "Most gym memberships are a waste of money", "Motivation is a lie", "Your trainer doesn't care about you"
    - Goal: Comments, shares, saves. NOT direct selling.`,

  trending: `TRENDING FORMAT / VIRAL ADAPTATION — Ride the algorithm by adapting what's already working.
    - Take a trending audio, meme format, or video style and adapt it to Dom's niche
    - Reference the trend specifically so Dom knows what to search for
    - Keep the trend structure but make the content uniquely Dom Different
    - These work because the algorithm is already pushing this format
    - Examples: "Day in my life as an ex-con fitness coach", POV formats, "Things that just hit different" trends
    - Goal: Views, reach, new followers.`,

  story: `STORY / VULNERABILITY — Build deep connection through raw, real storytelling.
    - Share a specific moment, not a general lesson
    - Paint the scene: where you were, what you felt, what happened
    - The more specific and vulnerable, the more it resonates
    - These build the parasocial relationship that converts followers to customers
    - Examples: "The night before I went to prison", "The first time I prayed and actually meant it", "Why I almost quit this business"
    - Goal: Followers feel like they KNOW Dom. Trust. Connection.`,

  value: `VALUE DROP / EDUCATION — Give away genuinely useful information for free.
    - Teach something actionable in 30-60 seconds
    - "Here's exactly how to..." format
    - Make people screenshot, save, or send to a friend
    - Position Dom as the expert without ever saying "I'm an expert"
    - Examples: "3 bodyweight exercises better than bench press", "How to meal prep in 20 minutes", "The morning routine that changed my life"
    - Goal: Saves, shares, authority building. People come back for more.`,

  engagement: `ENGAGEMENT BAIT — Content designed to get comments, polls, saves, and shares.
    - Ask questions, create polls, use "this or that" formats
    - "Rate my...", "Which is harder...", "What would you choose..."
    - Challenge formats: "Try this for 7 days"
    - Duet/stitch invitations
    - These boost your engagement rate which helps ALL your other content perform
    - Examples: "Rate my prison workout 1-10", "Reply with your morning routine", "Can you do 50 push-ups without stopping?"
    - Goal: Comments, engagement rate, algorithm boost.`,

  promo: `PROMOTIONAL / CONVERSION — Direct sell content (use sparingly, max 15-20% of total content).
    - Only after you've given tons of value
    - Use social proof, urgency, or exclusivity
    - Frame as "this is what's available" not "buy this now"
    - Best when tied to a story or transformation
    - Examples: "What my clients get that free YouTube can't give them", "Why I limited coaching to 10 people", "Inside look at the platform"
    - Goal: Sign-ups, link clicks, DMs.`,
};

// ============================================================
// DOM'S BRAND IDENTITY — Deep understanding of who Dom is
// ============================================================
const BRAND_VOICE_SYSTEM_PROMPT = `You are the content strategist for Dom Different (Redeemed Strength), a faith-based fitness and discipline coaching platform.

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
- Instagram Reels: 15-60 seconds, hook in first 1.5 seconds, text overlays help
- TikTok: Raw, less polished is better, trending sounds matter, 15-45 seconds ideal
- YouTube Shorts: Can be slightly longer (up to 60s), thumbnail matters less
- Twitter/X: Text-based hot takes, threads for value, images for engagement

OUTPUT REQUIREMENTS:
- Content must be immediately filmable with just a phone
- Hooks must grab attention in the first 1-2 seconds
- Every piece should feel authentic to Dom's actual voice
- Include specific filming instructions so Dom knows exactly what to do
- Platform recommendations should be strategic, not random`;

// ============================================================
// MODE INSTRUCTIONS
// ============================================================
function getModeInstructions(mode: string): string {
  if (mode === "done_for_you") {
    return `Generate COMPLETE, READY-TO-RECORD content with:
- Exact hook written out word-for-word (the first thing Dom says — must stop the scroll)
- Full script / talking points written in Dom's actual voice (word-for-word what to say)
- Specific filming instructions: camera angle, location suggestions, what to wear, any props
- Text overlay suggestions for key moments
- Hashtag recommendations (5-8 relevant hashtags)
- Best posting time suggestion
- Ready-to-use CTA that fits naturally (NOT always "link in bio")`;
  } else {
    return `Generate FREESTYLE FRAMEWORKS with:
- Hook formula (fill-in-the-blank style like "Most people [problem]. Here's why [solution]...")
- Prompt questions to spark Dom's own ideas
- Flexible talking point structure Dom can riff on
- Multiple angle suggestions (different ways to approach the same topic)
- CTA guidance (direction, not exact wording)
- Platform adaptation notes`;
  }
}

// ============================================================
// REQUEST HANDLER
// ============================================================
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, mode, strategy_type } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Pick random category if "surprise"
    const finalCategory = category === "surprise"
      ? Object.keys(categoryDescriptions)[Math.floor(Math.random() * Object.keys(categoryDescriptions).length)]
      : category;

    // Pick random strategy type if "surprise" — weighted toward non-promo
    const strategyWeights = ["hot_take", "hot_take", "trending", "trending", "story", "story", "value", "value", "value", "engagement", "engagement", "promo"];
    const finalStrategy = strategy_type === "surprise"
      ? strategyWeights[Math.floor(Math.random() * strategyWeights.length)]
      : strategy_type || "value";

    const categoryContext = categoryDescriptions[finalCategory] || categoryDescriptions.faith;
    const strategyContext = strategyTypeDescriptions[finalStrategy] || strategyTypeDescriptions.value;
    const modeInstructions = getModeInstructions(mode);

    const userPrompt = `Generate 3 unique content ideas for the "${finalCategory}" category using the "${finalStrategy}" content strategy.

CATEGORY FOCUS: ${categoryContext}

CONTENT STRATEGY TYPE: ${strategyContext}

${modeInstructions}

IMPORTANT RULES:
- These should NOT all sound the same — vary the angles, hooks, and approaches
- At least one idea should feel like something that could go viral
- The hooks must be scroll-stopping — if the first line doesn't make someone stop, it's trash
- Content should feel natural coming from Dom, not from a marketing team
- If the strategy is "trending", reference a SPECIFIC current trend format (POV, day-in-my-life, "things that hit different", green screen, etc.)
- If the strategy is "hot_take", the take should be genuinely controversial, not just mildly spicy
- If the strategy is "story", include specific sensory details that paint a picture
- NEVER use the word "journey" — Dom doesn't talk like that

For each idea, provide a JSON object with these exact fields:
- category: "${finalCategory}"
- mode: "${mode}"
- strategy_type: "${finalStrategy}"
- title: Clear, compelling post title (5-8 words)
- platforms: Array of best platforms for this content (choose from: "Instagram", "TikTok", "YouTube", "Twitter")
- format: How to film it (e.g., "Talking to camera", "Workout clip", "Voiceover with B-roll", "Screen walkthrough", "POV style", "Green screen reaction")
- hook: The exact opening line(s) that grab attention — this is the MOST IMPORTANT part
- talking_points: Array of 3-5 bullet points covering what to say (in Dom's voice)
- filming_tips: Plain-language instructions for how to shoot this, including camera angle, setting, energy level
- cta: The call-to-action to end with (make it feel natural, not salesy)
- hashtags: Array of 5-8 relevant hashtags
- why_it_works: One sentence explaining why this content will perform well (helps Dom understand the strategy)

Return ONLY a valid JSON array of 3 content idea objects. No markdown, no explanation, just the JSON array.`;

    const response = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: BRAND_VOICE_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.9,
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI Gateway error:", error);
      throw new Error(`AI Gateway returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    let ideas;
    try {
      // Try to extract JSON from the response (handle potential markdown wrapping)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        ideas = JSON.parse(jsonMatch[0]);
      } else {
        ideas = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse content ideas from AI");
    }

    return new Response(
      JSON.stringify({ ideas }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating content:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
