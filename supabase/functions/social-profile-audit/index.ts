// Social Profile Audit — Claude-powered profile analysis per platform
import { BRAND_VOICE_SYSTEM_PROMPT, CORS_HEADERS } from "../_shared/brand-voice.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { platform, current_bio, has_highlights, has_pinned_post, has_link_in_bio, handle, extra_context } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const platformSpecific: Record<string, string> = {
      instagram: `Audit Instagram profile for:
- Bio optimization (150 chars, clear value prop, emoji usage, line breaks)
- Profile picture (clear face, good lighting, on-brand)
- Highlights (organized, cover images, key categories: Workouts, Faith, Testimonials, About)
- Link in bio (use Linktree or similar, multiple destinations)
- Pinned posts (best-performing or most important)
- Content grid aesthetic (first 9 posts tell a story)
- Reel covers consistency
- Username clarity and searchability`,
      tiktok: `Audit TikTok profile for:
- Bio optimization (80 chars, clear niche, CTA)
- Profile picture and video
- Pinned videos (3 best-performing or most representative)
- Content consistency (niche clarity from first scroll)
- Engagement patterns
- Use of trending sounds and formats`,
      youtube: `Audit YouTube channel for:
- Channel description and keywords
- Channel art / banner
- Profile picture
- Shorts strategy
- Playlist organization
- Subscribe CTA in every video
- Community tab usage
- End screens and cards`,
      twitter: `Audit Twitter/X profile for:
- Bio (160 chars, clear positioning)
- Header image
- Pinned tweet (best hook or thread)
- Thread game (educational threads)
- Engagement style (replies, quote tweets)
- Posting frequency`,
    };

    const userPrompt = `Audit Dom's ${platform} profile and provide actionable improvements.

CURRENT PROFILE:
- Handle: ${handle || "not provided"}
- Bio: "${current_bio || "not provided"}"
- Has Highlights: ${has_highlights ? "Yes" : "No"}
- Has Pinned Post: ${has_pinned_post ? "Yes" : "No"}
- Has Link in Bio: ${has_link_in_bio ? "Yes" : "No"}
${extra_context ? `- Additional context: ${extra_context}` : ""}

${platformSpecific[platform] || "General profile audit"}

Return a JSON object with:
- score: number 0-100 (current profile score)
- optimized_bio: suggested improved bio text
- recommendations: array of objects, each with:
  - id: unique string identifier
  - title: short action item title
  - description: detailed what to do and why
  - priority: "high" | "medium" | "low"
  - category: "bio" | "visual" | "content" | "engagement" | "technical"
- quick_wins: array of 3 things Dom can fix in under 5 minutes
- advanced_tips: array of 2-3 longer-term optimization strategies

Speak in Dom's voice — direct, no-BS, actionable. Don't sugarcoat weak areas.

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
        max_tokens: 3000,
        system: BRAND_VOICE_SYSTEM_PROMPT,
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
    if (!content) throw new Error("No content in Claude response");

    let audit;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      audit = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error("Failed to parse:", content);
      throw new Error("Failed to parse audit from Claude");
    }

    return new Response(
      JSON.stringify({ audit }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error auditing profile:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
