// Social Calendar Suggest — AI-generated weekly content schedule
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getBrandVoicePrompt,
  checkApiLimits,
  trackApiUsage,
  CORS_HEADERS,
  categoryDescriptions,
  platformContentTypes,
} from "../_shared/brand-voice.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

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
    const { week_start, active_platforms, posting_cadence, content_pillars } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const userPrompt = `Generate a complete week of content calendar suggestions starting from ${week_start}.

ACTIVE PLATFORMS: ${JSON.stringify(active_platforms)}
POSTING CADENCE: ${JSON.stringify(posting_cadence)}
CONTENT PILLARS: ${JSON.stringify(content_pillars)}

AVAILABLE CONTENT TYPES PER PLATFORM:
${Object.entries(platformContentTypes)
  .filter(([p]) => active_platforms?.includes(p))
  .map(([p, types]) => `- ${p}: ${types.join(", ")}`)
  .join("\n")}

AVAILABLE CATEGORIES: ${Object.keys(categoryDescriptions).join(", ")}

RULES:
- Spread content evenly across the week
- Follow the 80/20 rule (max 1 promo post per week)
- Vary categories and strategy types day to day
- Morning slots (9-11am) for educational/value content
- Afternoon slots (1-3pm) for engagement/trending
- Evening slots (6-8pm) for stories/personal
- Each slot should have a clear title and strategy type

For each suggested slot, return a JSON object:
- scheduled_date: ISO date string (YYYY-MM-DD)
- day_of_week: number 0-6 (0=Sunday)
- time_slot: "morning" | "afternoon" | "evening"
- platform: platform name (lowercase)
- content_type: specific content type for that platform
- title: Suggested content title (5-8 words)
- hook: The opening hook line that grabs attention (1-2 punchy sentences, written in Dom's voice)
- talking_points: Array of 3-5 bullet point strings — the key things to say in the video/post
- filming_tips: Brief advice on how to film/create this piece (camera angle, setting, energy, b-roll ideas)
- cta: The call-to-action line to end with (e.g. "Drop a 🔥 if you're tired of excuses")
- notes: Brief note on angle/approach and strategy
- strategy_type: "hot_take" | "trending" | "story" | "value" | "engagement" | "promo"
- category: content category

Return ONLY a valid JSON array. No markdown, no explanation.`;

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
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.8,
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
        "social-calendar-suggest",
        limits.model,
        usage.input_tokens || 0,
        usage.output_tokens || 0
      );
    }

    if (!content) throw new Error("No content in Claude response");

    let suggestions;
    try {
      // Strip all markdown code fences
      const cleaned = content.replace(/```[\w]*\n?/g, "").trim();
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      let jsonStr = jsonMatch ? jsonMatch[0] : cleaned;
      try {
        suggestions = JSON.parse(jsonStr);
      } catch {
        // Response is truncated. Walk backwards to find the last complete object.
        // Find positions of all "}," or "}\n]" patterns to locate object boundaries.
        let lastGoodEnd = -1;
        let depth = 0;
        let inString = false;
        let escape = false;
        
        for (let i = 0; i < jsonStr.length; i++) {
          const ch = jsonStr[i];
          if (escape) { escape = false; continue; }
          if (ch === '\\' && inString) { escape = true; continue; }
          if (ch === '"') { inString = !inString; continue; }
          if (inString) continue;
          if (ch === '{' || ch === '[') depth++;
          if (ch === '}' || ch === ']') {
            depth--;
            // When depth returns to 1, we just closed a top-level object in the array
            if (depth === 1 && ch === '}') {
              lastGoodEnd = i;
            }
          }
        }
        
        if (lastGoodEnd > 0) {
          jsonStr = "[" + jsonStr.substring(1, lastGoodEnd + 1) + "]";
          suggestions = JSON.parse(jsonStr);
          console.log("Recovered", suggestions.length, "slots from truncated response");
        } else {
          throw new Error("No recoverable JSON");
        }
      }
    } catch (parseErr) {
      console.error("Failed to parse:", content?.substring(0, 500));
      throw new Error("Failed to parse calendar suggestions");
    }

    return new Response(
      JSON.stringify({ suggestions, model_used: limits.model }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error suggesting calendar:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
