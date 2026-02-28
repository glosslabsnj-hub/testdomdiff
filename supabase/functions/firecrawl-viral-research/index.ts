// FireCrawl Viral Research — scrapes viral content sources for trends & patterns
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CORS_HEADERS,
  getBrandVoicePrompt,
  checkApiLimits,
  trackApiUsage,
} from "../_shared/brand-voice.ts";

const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // Validate auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { error: authError } = await supabaseAuth.auth.getUser(
    authHeader.replace("Bearer ", "")
  );
  if (authError) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const {
      url,
      research_type = "general",
      competitor_handle,
    } = await req.json();

    if (!FIRECRAWL_API_KEY) {
      throw new Error("FIRECRAWL_API_KEY not configured. Set it with: npx supabase secrets set FIRECRAWL_API_KEY=your_key");
    }

    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Build target URL based on research type
    let targetUrl = url;
    if (!targetUrl) {
      if (competitor_handle) {
        targetUrl = `https://www.instagram.com/${competitor_handle.replace(/^@/, "")}/`;
      } else {
        // Default: scrape trending content sources
        targetUrl = "https://www.instagram.com/explore/";
      }
    }

    // Call FireCrawl API to scrape the page
    const crawlResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url: targetUrl,
        formats: ["markdown"],
        waitFor: 3000,
      }),
    });

    if (!crawlResponse.ok) {
      const errorText = await crawlResponse.text();
      console.error("FireCrawl API error:", crawlResponse.status, errorText);
      throw new Error(`FireCrawl API error: ${crawlResponse.status}`);
    }

    const crawlData = await crawlResponse.json();
    const scrapedContent = crawlData.data?.markdown || crawlData.data?.content || "";

    // Use Claude to analyze scraped content for viral patterns
    const [systemPrompt, limits] = await Promise.all([
      getBrandVoicePrompt(),
      checkApiLimits(),
    ]);

    const analysisPrompt = `Analyze this scraped content from ${targetUrl} and extract viral content intelligence for Dom Different's Instagram strategy.

SCRAPED CONTENT:
${scrapedContent.substring(0, 8000)}

RESEARCH TYPE: ${research_type}
${competitor_handle ? `COMPETITOR: @${competitor_handle}` : ""}

Extract and return a JSON object with:
{
  "viral_hooks": [
    { "hook": "exact hook text or pattern", "why_it_works": "explanation", "dom_adaptation": "how Dom would use this" }
  ],
  "content_patterns": [
    { "pattern": "pattern name", "description": "what it is", "frequency": "how common", "dom_angle": "how Dom should use it" }
  ],
  "trending_formats": [
    { "format": "format name", "description": "how it works", "example": "example", "fit_for_dom": "why it fits Dom" }
  ],
  "trending_audio": [
    { "name": "audio/sound name", "description": "what it is", "use_case": "how to use it" }
  ],
  "hashtag_clusters": [
    { "primary": "#main_hashtag", "related": ["#related1", "#related2"], "estimated_reach": "high/medium/low" }
  ],
  "key_takeaways": ["actionable insight 1", "actionable insight 2"]
}

If content is limited or unavailable, provide your best analysis based on current Instagram trends for fitness/faith/discipline content creators. Always frame suggestions through Dom's lens — gritty, street-smart, raw, real, no corporate BS.

Return ONLY valid JSON. No markdown, no explanation.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: limits.model,
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: analysisPrompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Anthropic API error:", error);
      throw new Error(`Anthropic API returned ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.content?.[0]?.text;

    // Track usage
    if (aiData.usage) {
      await trackApiUsage(
        "firecrawl-viral-research",
        limits.model,
        aiData.usage.input_tokens || 0,
        aiData.usage.output_tokens || 0
      );
    }

    let researchResults;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      researchResults = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error("Failed to parse research results:", content);
      throw new Error("Failed to parse viral research from AI");
    }

    // Cache in DB
    await supabaseService.from("viral_research_results").insert({
      source_url: targetUrl,
      research_type,
      data: researchResults,
      fetched_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ research: researchResults, source_url: targetUrl }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in viral research:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
