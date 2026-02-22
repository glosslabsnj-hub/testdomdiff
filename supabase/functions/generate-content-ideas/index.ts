// Content Strategy Engine — generates strategic social media content for Dom Different
// Now uses the shared brand-voice module for consistent identity across all functions

import {
  getBrandVoicePrompt,
  checkApiLimits,
  trackApiUsage,
  CORS_HEADERS,
  categoryDescriptions,
  strategyTypeDescriptions,
} from "../_shared/brand-voice.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

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
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { category, mode, strategy_type } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    // Pick random category if "surprise"
    const cats = Object.keys(categoryDescriptions);
    const finalCategory = category === "surprise"
      ? cats[Math.floor(Math.random() * cats.length)]
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
- DO NOT default to prison content. Dom is a hustler, a man of God, a mentor, a businessman, a controversy king, and a grinder. Prison is ONE chapter — most content should be about who Dom is TODAY: the daily grind, building his empire, stacking bread, mentoring his brother, honoring God, working his job while building a business, calling out BS, and living disciplined. Only reference prison when it's specifically relevant to the category or angle.

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

    // Dynamic prompt + cost controls
    const [systemPrompt, limits] = await Promise.all([
      getBrandVoicePrompt(),
      checkApiLimits(),
    ]);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: limits.model,
        max_tokens: 6000,
        system: systemPrompt,
        messages: [
          { role: "user", content: userPrompt },
        ],
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Anthropic API error:", error);
      throw new Error(`Anthropic API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    // Track usage
    const usage = data.usage;
    if (usage) {
      await trackApiUsage(
        "generate-content-ideas",
        limits.model,
        usage.input_tokens || 0,
        usage.output_tokens || 0
      );
    }

    if (!content) {
      throw new Error("No content in Claude response");
    }

    // Parse the JSON from the response
    let ideas;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        ideas = JSON.parse(jsonMatch[0]);
      } else {
        ideas = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse Claude response:", content);
      throw new Error("Failed to parse content ideas from Claude");
    }

    return new Response(
      JSON.stringify({ ideas, model_used: limits.model }),
      {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating content:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }
});
