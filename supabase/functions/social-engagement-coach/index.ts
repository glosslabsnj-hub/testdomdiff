// Social Engagement Coach — handles comment replies, collab outreach DMs, engagement strategy
// Everything in Dom's voice. Everything explained simply.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getBrandVoicePrompt,
  checkApiLimits,
  trackApiUsage,
  CORS_HEADERS,
} from "../_shared/brand-voice.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

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
    const body = await req.json();
    const { mode } = body;

    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const [systemPrompt, limits] = await Promise.all([
      getBrandVoicePrompt(),
      checkApiLimits(),
    ]);

    let userPrompt: string;

    if (mode === "comment_reply") {
      // ─── COMMENT REPLY MODE ───
      const { comment, context, comment_type } = body;

      userPrompt = `You are Dom Different's social media engagement coach. A comment was left on Dom's content. Generate the PERFECT reply.

THE COMMENT: "${comment}"
${context ? `CONTEXT (what the post was about): ${context}` : ""}
${comment_type ? `COMMENT TYPE: ${comment_type}` : ""}

=== DOM'S COMMENT STRATEGY ===
Dom's comments are a GROWTH WEAPON. Every reply should do one or more of these:
1. EXTEND THE CONVERSATION — ask a follow-up question so they reply again (doubles engagement)
2. SHOW PERSONALITY — Dom's replies should make people want to follow him. Witty, real, street, funny when appropriate
3. BUILD COMMUNITY — make the commenter feel seen and respected. They're part of the squad now
4. HANDLE HATERS WITH CLASS — Dom doesn't get defensive. He either clowns them (respectfully), agrees and pivots, or drops a one-liner that makes the hater look foolish while Dom looks mature
5. PLANT SEEDS — subtly mention the program, his coaching, or his story WITHOUT being salesy. If someone asks "how do I start?" Dom can naturally bring up Redeemed Strength

=== COMMENT TYPES & HOW TO HANDLE ===
- SUPPORTERS/FANS: Show love back. Ask them a question. Make them feel like family. "That's facts bro, what's your biggest win this week?" energy
- HATERS/TROLLS: Never get emotional. Options: (a) agree and redirect ("You right, I am crazy. Crazy enough to change my whole life from a cell 💪"), (b) one-liner that shuts it down, (c) ignore if it's just noise
- QUESTIONS: Answer genuinely but keep it concise. If the answer is complex, invite them to DM or check the program
- OTHER CREATORS: Show respect, suggest collab energy, be the bigger person always
- GENERIC ("fire 🔥", "💪💪"): Quick but personal reply that makes them feel seen

=== RESPONSE RULES ===
- Keep it SHORT — 1-3 sentences max. Comments aren't essays
- Sound like Dom talking, not a brand manager
- Use emojis sparingly but naturally (💪🔥💯 are Dom's go-tos)
- Never use corporate language
- Never be defensive or insecure
- Always leave the door open for more engagement

Return JSON:
{
  "reply": "The actual reply Dom should post — exact words",
  "strategy": "1-2 sentence explanation of WHY this reply works (for Dom to learn from)",
  "engagement_tip": "Quick tip about engaging with this type of comment in the future",
  "alternative": "An optional second reply option with a different tone"
}

Return ONLY valid JSON.`;

    } else if (mode === "collab_dm") {
      // ─── COLLAB OUTREACH DM MODE ───
      const { target_handle, target_name, target_niche, target_followers, collab_idea } = body;

      userPrompt = `You are Dom Different's social media strategist. Dom wants to reach out to a potential collaborator. Generate a PERFECT outreach DM.

TARGET CREATOR:
- Handle: @${target_handle || "unknown"}
- Name: ${target_name || "Unknown"}
- Niche: ${target_niche || "fitness/lifestyle"}
- Followers: ${target_followers || "unknown"}
${collab_idea ? `COLLAB IDEA: ${collab_idea}` : ""}

=== WHO IS DOM (for context) ===
- @domdifferent_ on Instagram, 50K+ followers, growing fast
- Ex-federal inmate who rebuilt his entire life through faith, fitness, and discipline
- Runs Redeemed Strength — a faith-based fitness transformation platform
- Based in Hamilton, NJ
- Content: training, faith, hustle, discipline, hot takes, street wisdom
- Goal: 1M followers, Instagram-first

=== DM OUTREACH RULES ===
1. NEVER beg or be desperate. Dom is bringing VALUE to the table, not asking for a favor
2. Open with genuine compliment about their specific content (not generic flattery)
3. Immediately establish what Dom brings: unique story, engaged audience, real content
4. Propose a SPECIFIC collab idea — not "we should collab sometime" but "here's exactly what I'm thinking"
5. Keep it SHORT — busy creators don't read novels. 3-5 sentences MAX for first message
6. Sound like Dom — casual, confident, real. Not like a brand manager or PR person
7. Include a hook that makes them curious to respond
8. End with something easy to reply to — a question, not a demand

=== DM TYPES ===
Generate 3 different DM options:
1. THE DIRECT ONE — straight to the point, confident, "let's work" energy
2. THE RELATIONSHIP BUILDER — focus on genuine connection first, collab mention is subtle
3. THE VALUE PROPOSITION — lead with what Dom can offer them, specific mutual benefit

Return JSON:
{
  "dm_direct": "The direct outreach DM — short, confident, specific",
  "dm_relationship": "The relationship-building DM — warm, genuine, subtle",
  "dm_value": "The value proposition DM — what's in it for both of us",
  "follow_up": "A follow-up message to send if they don't reply in 3-5 days",
  "collab_ideas": ["Specific collab idea 1", "Specific collab idea 2", "Specific collab idea 3"],
  "strategy_notes": "Brief strategy notes about approaching this specific creator"
}

Return ONLY valid JSON.`;

    } else if (mode === "engagement_strategy") {
      // ─── GENERAL ENGAGEMENT STRATEGY ───
      const { current_followers, engagement_rate, posting_frequency } = body;

      userPrompt = `You are Dom Different's growth strategist. Generate a SPECIFIC, actionable engagement strategy for TODAY.

CURRENT STATS:
- Followers: ${current_followers || "~50,000"}
- Engagement Rate: ${engagement_rate || "unknown"}
- Posting Frequency: ${posting_frequency || "unknown"}

=== GENERATE A DAILY ENGAGEMENT PLAYBOOK ===
Think about EXACTLY what Dom should do today to grow. Not vague advice — SPECIFIC actions with time estimates.

Consider:
- How many comments to leave on other creators' posts (and which creators)
- How many DMs to send (and what kind)
- Stories to post (and when)
- Comments to reply to on his own posts
- Hashtag strategy for today
- Best times to post based on his audience
- Engagement pods or groups to participate in
- How to leverage trending topics/sounds TODAY

Return JSON:
{
  "daily_actions": [
    {
      "action": "What to do — specific and clear",
      "when": "When to do it (e.g., '7:00 AM', 'After posting', 'Evening')",
      "time_needed": "How long it takes (e.g., '15 min')",
      "why": "Why this matters — explained simply",
      "how": "Step-by-step how to do it — like explaining to a 3-year-old"
    }
  ],
  "posting_schedule": {
    "best_times": ["Time 1", "Time 2", "Time 3"],
    "why": "Why these times work for Dom's audience"
  },
  "engagement_targets": {
    "comments_to_leave": 20,
    "dms_to_send": 5,
    "stories_to_post": 3,
    "replies_to_own_comments": "all within first hour"
  },
  "creators_to_engage": [
    {
      "handle": "@example",
      "why": "Why engaging with this creator helps Dom grow",
      "what_to_comment": "Example comment to leave"
    }
  ],
  "todays_hashtag_sets": [
    ["#set1hashtag1", "#set1hashtag2"],
    ["#set2hashtag1", "#set2hashtag2"]
  ],
  "growth_tip": "One powerful growth insight for today — specific to Dom's current stage"
}

Return ONLY valid JSON.`;

    } else {
      return new Response(
        JSON.stringify({ error: "Invalid mode. Use: comment_reply, collab_dm, or engagement_strategy" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

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
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Engagement coach error:", error);
      throw new Error(`Anthropic API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (data.usage) {
      await trackApiUsage(
        "social-engagement-coach",
        limits.model,
        data.usage.input_tokens || 0,
        data.usage.output_tokens || 0
      );
    }

    if (!content) {
      throw new Error("No content in response");
    }

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error("Failed to parse response:", content);
      throw new Error("Failed to parse AI response");
    }

    return new Response(
      JSON.stringify({ result, mode, model_used: limits.model }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in engagement coach:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
