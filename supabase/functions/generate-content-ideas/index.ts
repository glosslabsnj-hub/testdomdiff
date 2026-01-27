// Content generation edge function for Content Engine

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const categoryDescriptions: Record<string, string> = {
  faith: "Faith & Redemption - prison mindset, faith as discipline, who you were vs who you're becoming, responsibility, forgiveness, purpose",
  discipline: "Discipline & Structure - daily routines, accountability, consistency over motivation, doing it when you don't feel like it",
  training: "Workout & Training - training inside the platform, follow-along workouts, progress over perfection, 'train with me' style",
  transformations: "Transformations & Testimonials - member wins, mindset shifts, physical changes, discipline proof",
  authority: "Education & Authority - teaching concepts, explaining why the system works, breaking down common mistakes men make",
  platform: "Platform-Led Content - inside the system, what members get, why this isn't just a workout program, feature walkthroughs",
};

const BRAND_VOICE_SYSTEM_PROMPT = `You are a content strategist for Redeemed Strength, a faith-based fitness coaching platform founded by Dom Different.

BRAND VOICE:
- Masculine, disciplined, grounded
- Faith-based but never preachy
- Direct and real, no influencer gimmicks
- References prison metaphors and redemption themes naturally
- Uses "iron sharpens iron" mentality
- Tough love, biblical truth, no excuses
- Sounds like real life, not marketing copy

PLATFORM CONTEXT:
Redeemed Strength helps men transform physically, mentally, and spiritually through disciplined training rooted in Christian faith. Many members are looking for accountability, structure, and purpose beyond typical gym programs.

CONTENT GOAL:
Every piece of content should:
1. Provide genuine value
2. Build trust and authority
3. Lead naturally back to the platform
4. Never sound salesy or desperate

OUTPUT REQUIREMENTS:
Generate content ideas that are:
- Immediately actionable
- Easy to film (no fancy equipment needed)
- Authentic to Dom's voice
- Designed to perform on short-form video platforms`;

function getModeInstructions(mode: string): string {
  if (mode === "done_for_you") {
    return `Generate COMPLETE, READY-TO-RECORD content with:
- Exact hook written out word-for-word (attention-grabbing first 1-2 lines)
- Specific talking points (word-for-word what to say)
- Clear filming instructions in plain language
- Ready-to-use CTA that ties back to Redeemed Strength`;
  } else {
    return `Generate FREESTYLE FRAMEWORKS with:
- Hook formula (fill-in-the-blank style like "Most men [problem]. Here's why [solution]...")
- Prompt questions to spark ideas
- Flexible talking point structure
- CTA guidance (direction, not exact wording)`;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, mode } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Pick random category if "surprise"
    const finalCategory = category === "surprise"
      ? Object.keys(categoryDescriptions)[Math.floor(Math.random() * Object.keys(categoryDescriptions).length)]
      : category;

    const categoryContext = categoryDescriptions[finalCategory] || categoryDescriptions.faith;
    const modeInstructions = getModeInstructions(mode);

    const userPrompt = `Generate 3 unique content ideas for the "${finalCategory}" category.

CATEGORY FOCUS: ${categoryContext}

${modeInstructions}

For each idea, provide a JSON object with these exact fields:
- category: "${finalCategory}"
- mode: "${mode}"
- title: Clear, compelling post title (5-8 words)
- platforms: Array of best platforms for this content (choose from: "Instagram", "TikTok", "YouTube", "Twitter")
- format: How to film it (e.g., "Talking to camera", "Workout clip", "Voiceover with B-roll", "Screen walkthrough")
- hook: The exact opening line(s) that grab attention
- talking_points: Array of 3-5 bullet points covering what to say
- filming_tips: Plain-language instructions for how to shoot this
- cta: The call-to-action to end with

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
        temperature: 0.8,
        max_tokens: 4000,
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
