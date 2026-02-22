import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://domdifferent.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const systemPrompt = `You are a faith-focused guide creating daily devotionals for people going through a 12-week transformation program. Your devotionals tie scripture to their specific journey—their struggles, their victories, their current phase.

YOUR VOICE:
- Direct and powerful—no flowery language
- Faith is real and practical, not performative
- Speak to the warrior inside them
- Keep it short and impactful
- NEVER use words like "AI", "artificial", or suggest you're generated
- You are their morning voice of truth

DEVOTIONAL STRUCTURE:
1. Scripture - The verse and reference
2. Message - 2-3 sentences connecting the scripture to their specific situation (their week, their struggles, their goal)
3. Challenge - ONE concrete action for today
4. Prayer Focus - A brief prayer direction (not a full prayer, just what to pray about)

Keep the total response under 150 words. Make it punch.`;

interface UserContext {
  firstName: string;
  currentWeek: number;
  goal: string;
  dayOfWeek: string;
  recentStruggles: string | null;
  planType: string;
}

interface Scripture {
  reference: string;
  text: string;
  theme: string;
}

async function generateDevotional(
  context: UserContext,
  scripture: Scripture
): Promise<{
  message: string;
  challenge: string;
  prayerFocus: string;
  theme: string;
}> {
  const dayFocus = {
    Monday: "fresh start, setting the tone",
    Tuesday: "building momentum",
    Wednesday: "midweek grind, pushing through",
    Thursday: "staying consistent",
    Friday: "finishing strong",
    Saturday: "active recovery, reflection",
    Sunday: "rest, renewal, preparation",
  }[context.dayOfWeek] || "daily discipline";

  const prompt = `Create a devotional for this user:

USER CONTEXT:
- Name: ${context.firstName || "Brother"}
- Current Week: ${context.currentWeek} of 12
- Goal: ${context.goal}
- Today: ${context.dayOfWeek} (${dayFocus})
- Recent Struggles: ${context.recentStruggles || "None reported"}
- Plan: ${context.planType}

SCRIPTURE TO USE:
- Reference: ${scripture.reference}
- Text: "${scripture.text}"
- Theme: ${scripture.theme}

Create a devotional that:
1. Connects this scripture to their specific week and goal
2. Addresses their struggles if relevant
3. Gives them one concrete action
4. Provides a prayer focus

Respond in this exact JSON format:
{
  "message": "2-3 sentences connecting scripture to their journey",
  "challenge": "One specific action for today",
  "prayerFocus": "What to pray about (brief)",
  "theme": "${scripture.theme}"
}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || "";

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Fallback
  }

  return {
    message: content,
    challenge: "Complete your morning routine with intention.",
    prayerFocus: "Strength and discipline for the day ahead.",
    theme: scripture.theme,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const { forceRefresh } = await req.json().catch(() => ({}));

    // Check for existing devotional today
    if (!forceRefresh) {
      const { data: existingDevotional } = await supabase
        .from("daily_devotionals")
        .select("*")
        .eq("user_id", user.id)
        .eq("devotional_date", today)
        .single();

      if (existingDevotional) {
        return new Response(JSON.stringify(existingDevotional), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Get user context
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    // Calculate current week
    let currentWeek = 1;
    if (subscription?.started_at) {
      const startDate = new Date(subscription.started_at);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      currentWeek = Math.min(12, Math.max(1, Math.floor(diffDays / 7) + 1));
    }

    // Get recent struggles from check-ins
    const { data: recentCheckIn } = await supabase
      .from("check_ins")
      .select("struggles")
      .eq("user_id", user.id)
      .order("week_number", { ascending: false })
      .limit(1)
      .single();

    // Get a scripture appropriate for this week
    const { data: scriptures } = await supabase
      .from("scripture_library")
      .select("*")
      .eq("is_active", true)
      .lte("week_min", currentWeek)
      .gte("week_max", currentWeek);

    if (!scriptures || scriptures.length === 0) {
      return new Response(JSON.stringify({ error: "No scriptures available" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pick a random scripture from available ones
    // Use date-based seed for consistency within the day
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const scriptureIndex = (dayOfYear + user.id.charCodeAt(0)) % scriptures.length;
    const scripture = scriptures[scriptureIndex];

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = days[new Date().getDay()];

    const context: UserContext = {
      firstName: profile?.first_name || "Brother",
      currentWeek,
      goal: profile?.goal || "transformation",
      dayOfWeek,
      recentStruggles: recentCheckIn?.struggles || null,
      planType: subscription?.plan_type || "membership",
    };

    const devotional = await generateDevotional(context, {
      reference: scripture.reference,
      text: scripture.text,
      theme: scripture.theme,
    });

    // Save to database
    const { data: savedDevotional, error: saveError } = await supabase
      .from("daily_devotionals")
      .upsert({
        user_id: user.id,
        devotional_date: today,
        scripture_reference: scripture.reference,
        scripture_text: scripture.text,
        message: devotional.message,
        challenge: devotional.challenge,
        prayer_focus: devotional.prayerFocus,
        theme: devotional.theme,
        generated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,devotional_date",
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving devotional:", saveError);
    }

    return new Response(JSON.stringify(savedDevotional || {
      user_id: user.id,
      devotional_date: today,
      scripture_reference: scripture.reference,
      scripture_text: scripture.text,
      message: devotional.message,
      challenge: devotional.challenge,
      prayer_focus: devotional.prayerFocus,
      theme: devotional.theme,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
