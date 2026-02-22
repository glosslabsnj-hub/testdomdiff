// Social Competitor Analyze — Claude-powered competitor strategy analysis
import {
  getBrandVoicePrompt,
  checkApiLimits,
  trackApiUsage,
  CORS_HEADERS,
} from "../_shared/brand-voice.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const { competitor_handle, platform, pasted_content, notes } = await req.json();

    if (!competitor_handle || !platform) {
      throw new Error("competitor_handle and platform are required");
    }

    const userPrompt = `Analyze the following competitor in the faith/fitness/discipline/transformation space and generate actionable intelligence for Dom Different.

COMPETITOR: @${competitor_handle} on ${platform}
${notes ? `NOTES ABOUT THEM: ${notes}` : ""}

${pasted_content?.length ? `=== THEIR CONTENT (pasted samples) ===
${pasted_content.map((c: string, i: number) => `--- Post ${i + 1} ---\n${c}`).join("\n\n")}` : "No content samples provided — analyze based on what you know about this type of creator in this niche."}

Analyze and return a JSON object with:

- competitor_summary: Object with:
  - name: their name/handle
  - platform: "${platform}"
  - niche: their specific niche positioning
  - estimated_following: rough estimate if known, or "unknown"
  - strengths: array of 3-5 things they do well
  - weaknesses: array of 3-5 gaps or weaknesses in their approach

- hook_patterns: Array of objects, each with:
  - pattern: the hook formula they use
  - example: a specific example
  - effectiveness: "high" | "medium" | "low"
  - dom_adaptation: how Dom could adapt this hook pattern with his own voice

- content_strategy: Object with:
  - posting_frequency: their estimated posting frequency
  - content_mix: breakdown of their content types (percentage estimates)
  - engagement_tactics: what they do to drive engagement
  - monetization_approach: how they sell / convert

- steal_worthy_ideas: Array of 3-5 objects, each with:
  - idea: the concept to adapt
  - why_it_works: why this performs well
  - dom_version: how Dom would execute this with his unique angle
  - priority: "high" | "medium" | "low"

- differentiation: Object with:
  - what_dom_has_they_dont: array of Dom's unique advantages over this competitor
  - content_gaps: array of topics/angles this competitor misses that Dom could own
  - positioning_advice: 2-3 sentences on how Dom should position against this competitor

Return ONLY valid JSON. No markdown, no explanation.`;

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
        max_tokens: 5000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.7,
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
        "social-competitor-analyze",
        limits.model,
        usage.input_tokens || 0,
        usage.output_tokens || 0
      );
    }

    if (!content) throw new Error("No content in Claude response");

    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error("Failed to parse:", content);
      throw new Error("Failed to parse competitor analysis from Claude");
    }

    // Store analysis in DB
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      await supabase.from("social_competitor_analyses").insert({
        competitor_handle,
        platform,
        analysis_data: analysis,
        pasted_content: pasted_content || null,
        notes: notes || null,
      });
    } catch (dbError) {
      console.warn("Failed to store competitor analysis:", dbError);
    }

    return new Response(
      JSON.stringify({ analysis, model_used: limits.model }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing competitor:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
