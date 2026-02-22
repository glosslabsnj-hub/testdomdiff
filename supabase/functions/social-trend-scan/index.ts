// Social Trend Scanner — Claude-powered trend analysis per platform
import { BRAND_VOICE_SYSTEM_PROMPT, CORS_HEADERS } from "../_shared/brand-voice.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { platform } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const userPrompt = `Analyze current social media trends for ${platform} in the faith, fitness, discipline, and personal transformation niche.

Based on your knowledge of what's been working on ${platform}, provide:

1. TRENDING FORMATS — What video/content formats are getting the most reach right now
2. HOT TOPICS — What subjects in the faith/fitness space are getting engagement
3. CONTENT GAPS — What's MISSING that Dom could own (underserved angles in the niche)
4. AUDIO/SOUND TRENDS — What sounds or audio formats are trending (for video platforms)
5. ALGORITHM TIPS — Any recent ${platform} algorithm changes Dom should know about

For each trend, provide a specific content idea Dom can film TODAY.

Return a JSON object with:
- trends: array of objects, each with:
  - title: trend name
  - description: what it is and why it's working
  - content_idea: specific idea Dom can create from this trend
  - estimated_reach: "high" | "medium" | "low"
  - urgency: "act_now" | "this_week" | "ongoing"
- content_angles: array of objects, each with:
  - angle: the unique positioning
  - why: why this works for Dom specifically
  - example_hook: a scroll-stopping hook Dom could use
- platform_tips: array of 3-5 current best practices for ${platform}
- content_gaps: array of 2-3 underserved niches Dom could dominate

Be specific and actionable. No vague advice. Dom needs to be able to act on every recommendation TODAY.

Return ONLY valid JSON. No markdown, no explanation.`;

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

    let scan;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      scan = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error("Failed to parse:", content);
      throw new Error("Failed to parse trend scan from Claude");
    }

    return new Response(
      JSON.stringify({ scan }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error scanning trends:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
