// Social Content Generator — Claude-powered, platform-specific content generation
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getBrandVoicePrompt,
  checkApiLimits,
  trackApiUsage,
  CORS_HEADERS,
  categoryDescriptions,
  strategyTypeDescriptions,
  platformFormatRules,
} from "../_shared/brand-voice.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

function getModeInstructions(mode: string): string {
  if (mode === "done_for_you") {
    return `Generate COMPLETE, READY-TO-RECORD content with:
- Exact hook written out word-for-word (the first thing Dom says — must stop the scroll)
- Full script / talking points written in Dom's actual voice (word-for-word what to say)
- Specific filming instructions: camera angle, location suggestions, what to wear, any props
- Text overlay suggestions for key moments
- Hashtag recommendations
- Ready-to-use CTA that fits naturally (NOT always "link in bio")`;
  } else {
    return `Generate FREESTYLE FRAMEWORKS with:
- Hook formula (fill-in-the-blank style)
- Prompt questions to spark Dom's own ideas
- Flexible talking point structure Dom can riff on
- Multiple angle suggestions
- CTA guidance (direction, not exact wording)`;
  }
}

function buildOverloadFallbackIdeas(params: {
  category: string;
  mode: string;
  strategyType: string;
  platform?: string;
  contentType?: string;
}) {
  const { category, mode, strategyType, platform, contentType } = params;

  const base = [
    {
      title: "Most Men Train Without Standards",
      hook: "You don't have a fitness problem — you have a discipline problem.",
      talking_points: [
        "Standards beat motivation every time.",
        "If your day has no structure, your body follows chaos.",
        "Train like your family depends on your consistency — because it does.",
      ],
      cta: "Comment 'STANDARD' if you're done with excuses.",
    },
    {
      title: "Your Morning Decides Your Muscle",
      hook: "You keep losing fat at night because you lose the war in the morning.",
      talking_points: [
        "First hour decides the next 12.",
        "Prayer, plan, then execution — no scrolling first.",
        "Consistency builds confidence faster than any supplement.",
      ],
      cta: "DM 'MORNING' and I’ll send the structure.",
    },
    {
      title: "Stop Waiting To Feel Ready",
      hook: "If you only move when you feel ready, you'll stay average forever.",
      talking_points: [
        "Readiness is earned through reps, not emotion.",
        "Your current habits are either building you or burying you.",
        "A disciplined man wins even on bad days.",
      ],
      cta: "Drop a 🔥 if you’re executing today.",
    },
  ];

  return base.map((item) => ({
    category,
    mode,
    strategy_type: strategyType,
    target_platform: platform || "",
    content_type: contentType || "",
    title: item.title,
    platforms: platform ? [platform] : ["Instagram", "TikTok", "YouTube"],
    format: "Talking to camera",
    hook: item.hook,
    talking_points: item.talking_points,
    filming_tips: "Eye-level camera, direct tone, clean background, high energy.",
    cta: item.cta,
    hashtags: ["#redeemedstrength", "#discipline", "#faithandfitness", "#mensfitness", "#noexcuses"],
    why_it_works: "Direct, conviction-heavy messaging with clear execution steps and a strong CTA.",
  }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // Validate JWT in code
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
  const supabaseAuth = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { error: authError } = await supabaseAuth.auth.getUser(authHeader.replace("Bearer ", ""));
  if (authError) {
    return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }

  try {
    const { platform, content_type, category, mode, strategy_type, calendar_context, trend_context } = await req.json();

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
    const platformRules = platform ? (platformFormatRules[platform] || "") : "";

    let contextBlock = "";
    if (calendar_context) {
      contextBlock += `\n\nCURRENT WEEK'S CALENDAR (avoid duplicate topics):\n${JSON.stringify(calendar_context)}`;
    }
    if (trend_context) {
      contextBlock += `\n\nTRENDING RIGHT NOW (incorporate where natural):\n${JSON.stringify(trend_context)}`;
    }

    const userPrompt = `Generate 3 unique content ideas for the "${finalCategory}" category using the "${finalStrategy}" strategy.

TARGET PLATFORM: ${platform || "multi-platform"}
CONTENT TYPE: ${content_type || "any"}
${platformRules ? `\nPLATFORM FORMAT RULES:\n${platformRules}` : ""}

CATEGORY FOCUS: ${categoryContext}

CONTENT STRATEGY TYPE: ${strategyContext}

${modeInstructions}
${contextBlock}

IMPORTANT RULES:
- These should NOT all sound the same — vary the angles, hooks, and approaches
- At least one idea should feel like something that could go viral
- The hooks must be scroll-stopping
- Content should feel natural coming from Dom, not from a marketing team
- NEVER use the word "journey" — Dom doesn't talk like that
- If platform is specified, format MUST match that platform's rules exactly
- DO NOT default to prison content. Dom is a hustler, a man of God, a mentor, a businessman, a controversy king, and a grinder. Prison is ONE chapter — most content should be about who Dom is TODAY: the daily grind, building his empire, stacking bread, mentoring his brother, honoring God, working his job while building a business, calling out BS, and living disciplined. Only reference prison when it's specifically relevant to the category or angle.

For each idea, provide a JSON object with these exact fields:
- category: "${finalCategory}"
- mode: "${mode}"
- strategy_type: "${finalStrategy}"
- target_platform: "${platform || ""}"
- content_type: "${content_type || ""}"
- title: Clear, compelling post title (5-8 words)
- platforms: Array of best platforms for this content
- format: How to film it
- hook: The exact opening line(s) that grab attention
- talking_points: Array of 3-5 bullet points covering what to say
- filming_tips: Plain-language instructions for how to shoot this
- cta: The call-to-action to end with
- hashtags: Array of relevant hashtags (platform-appropriate count)
- why_it_works: One sentence explaining why this content will perform well

Return ONLY a valid JSON array of 3 content idea objects. No markdown, no explanation, just the JSON array.`;

    // Dynamic prompt + cost controls
    const [systemPrompt, limits] = await Promise.all([
      getBrandVoicePrompt(),
      checkApiLimits(),
    ]);

    let response: Response | null = null;
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      response = await fetch("https://api.anthropic.com/v1/messages", {
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

      if (response.ok || (response.status !== 529 && response.status !== 503)) {
        break;
      }
      console.warn(`Anthropic returned ${response.status}, retry ${attempt + 1}/${maxRetries}`);
      await new Promise(r => setTimeout(r, (attempt + 1) * 2000));
    }

    if (!response || !response.ok) {
      const error = await response?.text();
      console.error("Anthropic API error:", error);

      // Graceful degradation for provider overloads
      if (response?.status === 529 || response?.status === 503) {
        const fallbackIdeas = buildOverloadFallbackIdeas({
          category: finalCategory,
          mode,
          strategyType: finalStrategy,
          platform,
          contentType: content_type,
        });

        return new Response(
          JSON.stringify({
            ideas: fallbackIdeas,
            model_used: "fallback-overload",
            provider_overloaded: true,
            message: "Primary AI provider is overloaded. Returned fallback ideas.",
          }),
          { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`Anthropic API returned ${response?.status}`);
    }
    const content = data.content?.[0]?.text;

    // Track usage
    const usage = data.usage;
    if (usage) {
      await trackApiUsage(
        "social-generate-content",
        limits.model,
        usage.input_tokens || 0,
        usage.output_tokens || 0
      );
    }

    if (!content) {
      throw new Error("No content in Claude response");
    }

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
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating content:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
