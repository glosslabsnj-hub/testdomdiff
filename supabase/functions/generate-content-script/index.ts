// Content Script Generator — creates detailed, step-by-step filming scripts
// Written so Dom can follow it with ZERO guesswork — explained like to a 3-year-old
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getBrandVoicePrompt,
  checkApiLimits,
  trackApiUsage,
  CORS_HEADERS,
  categoryDescriptions,
  platformFormatRules,
} from "../_shared/brand-voice.ts";

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
      title,
      platform = "instagram",
      content_type = "Reel",
      category = "hustle",
      hook_idea,
      talking_points,
      content_post_id,
      topic,
      situation,
    } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const categoryContext = categoryDescriptions[category] || categoryDescriptions.hustle;
    const platformRules = platformFormatRules[platform] || "";

    const [systemPrompt, limits] = await Promise.all([
      getBrandVoicePrompt(),
      checkApiLimits(),
    ]);

    // Dom's real-world context — his IG, competitors, what he's about
    const domContext = `
=== DOM'S REAL INSTAGRAM & SOCIAL CONTEXT ===
Instagram handle: @domdifferent_
Current followers: 50,000+ and grinding to 1M
Platform: Redeemed Strength / DomDifferent.com
Location: Hamilton, New Jersey
Daily life: Works a regular job during the day, grinds content and coaching at night, trains every single day no matter what

=== DOM'S COMPETITORS (study these — Dom needs to OUTPERFORM them) ===
- @davidgoggins — the "stay hard" king, 12M+ followers. Dom respects Goggins but Dom has something Goggins doesn't: faith, humor, and relatability. Dom is the street version of Goggins.
- @andyfrisella — 75 Hard creator, business mogul. Dom has the same intensity but is more raw, more street, less polished.
- @ctfletcher — ex-powerlifter, prison time, rebuilt himself. Similar vibe but Dom is younger, more active, more hustler.
- @wes_watson — prison fitness, motivational. Direct competitor. But Dom's story is more nuanced — faith + family + business + training all together.
- @mikechandler — faith + fighting. Dom appreciates the faith angle but goes harder on the street/hustle side.
- @cameron_hanes — discipline and running/hunting. Good work ethic content. Dom brings more edge.

=== WHAT MAKES DOM'S CONTENT HIT DIFFERENT ===
- Dom is CURRENTLY in the trenches — not speaking from a mansion or a podcast studio. He's at his job, in his apartment, in the park, at the beach. REAL settings.
- He films on his PHONE. Not a RED camera. Not a studio. That rawness IS the brand.
- He combines 5 things no other creator combines: faith + prison + street + fitness + business hustle
- His energy shifts: one moment he's aggressive and intense, the next he's deep and vulnerable about his faith or his family, then he snaps back to "let's get this bread bro"
- He makes you feel like you're HIS boy. Not a follower. Not a subscriber. His boy.
- He's building something FROM NOTHING and documenting the whole grind. That's powerful.

=== HOW TO USE DOM'S CURRENT SITUATION IN SCRIPTS ===
When Dom tells you what he's doing right now (at the beach, at work, in the gym, walking his dog, cooking, at church, with his brother), the script should:
1. USE the actual environment — the sounds, the visuals, the energy of that specific place
2. CONNECT the moment to a bigger lesson — a beach sunrise isn't just pretty, it's proof that God gave you another day to go harder
3. CONTRAST the past vs now — "I used to watch the sunrise through cell bars, now I'm here by choice, training by choice, free by choice"
4. Make the viewer FEEL like they're there WITH Dom — not watching a produced video
5. Use the setting for CREATIVE b-roll — not generic "workout footage" but specific shots that only work in THAT location
6. Find the STORY in the moment — every situation has a lesson if you look at it through Dom's lens
`;

    // Build the user prompt — if situation is provided, use freeform mode
    let userPrompt: string;

    if (situation) {
      // QUICK SCRIPT MODE — Dom just tells us what's happening
      userPrompt = `DOM JUST TOLD YOU WHAT HE'S DOING RIGHT NOW. Generate a KILLER script from this:

"${situation}"

${domContext}

You need to take what Dom just said — that raw idea, that moment he's in — and turn it into an INCREDIBLE piece of content. Not a generic workout video. Not a motivational speech. A REAL, thought-out piece of content that tells a story, hits people in the chest, and makes them stop scrolling.

THINK about what makes this moment special. THINK about what lesson Dom can pull from this. THINK about how to film it in a way nobody else would. THINK about the hook that'll make someone stop mid-scroll.

Dom said "${situation}" — now build something legendary from it.

PLATFORM: ${platform}
CONTENT TYPE: ${content_type}
${platformRules ? `PLATFORM RULES: ${platformRules}` : ""}

=== CRITICAL SCRIPT REQUIREMENTS ===

1. Write EXACTLY what Dom should say — word for word. Not bullet points. Not suggestions. EXACT WORDS.
2. Write it in Dom's REAL voice — street, gritty, raw, confident, "bro" energy, natural cursing where it fits. This ain't no corporate script.
3. The hook MUST stop the scroll in under 2 seconds. Make it aggressive, provocative, or shocking. Connect it to the situation Dom described.
4. USE THE SETTING — Dom told you where he is and what he's doing. The script should be BUILT around that specific moment. The environment IS the content.
5. Every section needs camera/delivery notes explained like you're telling a 3-year-old how to film it. Tell him exactly where to point the phone, what angle, what to show.
6. Include SPECIFIC b-roll ideas for THIS situation — not generic stuff. If he's at the beach, tell him to film the waves, his footprints in the sand, close-up of his face with the sunrise behind him.
7. FIND THE DEEPER MESSAGE — don't just script a workout. Script a STORY. What's the lesson? What's the connection to Dom's past? What will make someone feel something?
8. The CTA should feel natural, not salesy. Dom doesn't beg — he invites.
9. This should be the kind of content that goes VIRAL because it's raw, real, and nobody else is making it like this.
10. Dom is street. Dom is gritty. Dom doesn't hold back. Some scripts should have that "I work harder than you, fuck you" energy. Some should be deep and spiritual. Read the situation and match the energy.`;
    } else {
      // STRUCTURED MODE — traditional form-based input
      userPrompt = `Generate a DETAILED, STEP-BY-STEP content script that Dom can follow with ZERO guesswork.

${domContext}

TITLE: ${title || topic || "Untitled"}
PLATFORM: ${platform}
CONTENT TYPE: ${content_type}
CATEGORY: ${categoryContext}
${platformRules ? `PLATFORM RULES: ${platformRules}` : ""}
${hook_idea ? `HOOK IDEA TO BUILD FROM: ${hook_idea}` : ""}
${talking_points ? `EXISTING TALKING POINTS: ${JSON.stringify(talking_points)}` : ""}

=== CRITICAL SCRIPT REQUIREMENTS ===

1. Write EXACTLY what Dom should say — word for word. Not bullet points. Not suggestions. EXACT WORDS.
2. Write it in Dom's REAL voice — street, gritty, raw, confident, "bro" energy, natural cursing where it fits. This ain't no corporate script.
3. The hook MUST stop the scroll in under 2 seconds. Make it aggressive, provocative, or shocking.
4. Every section needs camera/delivery notes explained like you're telling a 3-year-old how to film it.
5. Include SPECIFIC b-roll ideas — not "show workout footage" but "film close-up of hands gripping pull-up bar, knuckles white, 3-second clip"
6. The CTA should feel natural, not salesy. Dom doesn't beg — he invites.
7. This script should sound like Dom talking to his boy on FaceTime, not reading a teleprompter.
8. Some scripts need to be HARD — "I work harder than you, fuck you" energy. Show Dom's grittiness, his street, his toughness.
9. Dom doesn't sugarcoat ANYTHING. If the topic calls for intensity, GO THERE.
10. DO NOT make this sound like every other fitness creator. Dom is an ex-con who built himself from nothing in a cell. That edge should come through.`;
    }

    // Common JSON output schema appended to both modes
    userPrompt += `

Return a JSON object with this EXACT structure:
{
  "title": "Script title (5-8 words, catchy, Dom-style)",
  "platform": "${platform}",
  "content_type": "${content_type}",
  "category": "${category}",
  "script": {
    "hook": {
      "what_to_say": "EXACT words Dom opens with — aggressive, scroll-stopping, raw",
      "how_to_say_it": "Delivery notes: energy level, facial expression, speed, tone",
      "camera_notes": "Exactly how to frame this shot — angle, distance, location, what's visible",
      "duration": "3-5 seconds"
    },
    "body": [
      {
        "section": "Section name (e.g., 'The Reality Check', 'The Grind', 'The Lesson')",
        "what_to_say": "EXACT script — word for word what Dom says. Multiple sentences. In Dom's actual voice with his actual phrases. Make it REAL.",
        "how_to_say_it": "Delivery: energy changes, pauses, emphasis, look at camera vs away, walk vs stand",
        "b_roll_notes": "SPECIFIC visual suggestions for THIS setting — exact shots to film, angles, durations"
      }
    ],
    "cta": {
      "what_to_say": "Exact closing words — natural, not salesy",
      "on_screen_text": "Text overlay for the CTA moment"
    },
    "caption": "Full Instagram/platform caption with personality — NOT corporate, NOT generic. Dom's voice. Include line breaks for readability.",
    "hashtags": ["#relevant", "#hashtags", "#here"],
    "thumbnail_idea": "Specific thumbnail concept — facial expression, text overlay, background, what makes someone click",
    "filming_checklist": [
      "Step 1: specific prep instruction for THIS situation",
      "Step 2: specific filming instruction",
      "Step 3: etc."
    ],
    "total_duration": "estimated total video length",
    "equipment_needed": "what Dom needs (phone, tripod, etc.)"
  }
}

The body should have 2-4 sections depending on content length.
Each body section's "what_to_say" should be 2-5 sentences of EXACT script in Dom's voice.

REMEMBER: Dom is street. Dom is gritty. Dom doesn't hold back. The script should sound like HIM, not like a marketing agency wrote it. Use "bro", use real talk, use intensity. Some scripts should make you uncomfortable — that's Dom's superpower.

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
        max_tokens: 6000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.85,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Script generation error:", error);
      throw new Error(`Anthropic API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    // Track usage
    if (data.usage) {
      await trackApiUsage(
        "generate-content-script",
        limits.model,
        data.usage.input_tokens || 0,
        data.usage.output_tokens || 0
      );
    }

    if (!content) {
      throw new Error("No content in Claude response");
    }

    let scriptData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      scriptData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error("Failed to parse script:", content);
      throw new Error("Failed to parse script from AI");
    }

    // Save to DB
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: saved, error: saveError } = await supabaseService
      .from("content_scripts")
      .insert({
        content_post_id: content_post_id || null,
        script_data: scriptData.script || scriptData,
        platform,
        title: scriptData.title || title || topic,
        content_type,
        category,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Failed to save script:", saveError);
    }

    return new Response(
      JSON.stringify({
        script: scriptData,
        saved_id: saved?.id || null,
        model_used: limits.model,
      }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating script:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
