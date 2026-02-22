// Social Calendar Suggest — AI-generated weekly content schedule
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  BRAND_VOICE_SYSTEM_PROMPT,
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

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
- notes: Brief note on angle/approach
- strategy_type: "hot_take" | "trending" | "story" | "value" | "engagement" | "promo"
- category: content category

Return ONLY a valid JSON array. No markdown, no explanation.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: BRAND_VOICE_SYSTEM_PROMPT,
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

    if (!content) throw new Error("No content in Claude response");

    let suggestions;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error("Failed to parse:", content);
      throw new Error("Failed to parse calendar suggestions");
    }

    return new Response(
      JSON.stringify({ suggestions }),
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
