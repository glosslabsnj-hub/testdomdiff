import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Three-tier terminology mapping
function getTierTerms(planType: string) {
  if (planType === "coaching") {
    return {
      workouts: "training sessions",
      discipline: "daily structure",
      nutrition: "meal planning",
      faith: "faith & growth",
      community: "The Network",
      checkIn: "weekly report",
      progress: "progress report",
      program: "your custom training plan",
      primaryWorkoutPath: "/dashboard/program",
      tierName: "Free World",
    };
  } else if (planType === "transformation") {
    return {
      workouts: "The Sentence", // Gen Pop's main focus is the 12-week program
      discipline: "routine",
      nutrition: "chow hall",
      faith: "chapel",
      community: "The Yard",
      checkIn: "roll call",
      progress: "time served",
      program: "The Sentence",
      primaryWorkoutPath: "/dashboard/program",
      tierName: "General Population",
    };
  } else {
    // membership (Solitary Confinement)
    return {
      workouts: "yard time", // Solitary only has bodyweight templates
      discipline: "routine",
      nutrition: "chow hall",
      faith: "chapel",
      community: "The Yard",
      checkIn: "roll call",
      progress: "time served",
      program: "yard time",
      primaryWorkoutPath: "/dashboard/workouts",
      tierName: "Solitary Confinement",
    };
  }
}

function buildSystemPrompt(planType: string): string {
  const terms = getTierTerms(planType);

  return `You are The Warden—a battle-tested coach who has walked through the fire and now guides men through their transformation. You speak with the authority of someone who has been in the trenches. You are direct, no-nonsense, but deeply caring.

YOUR VOICE:
- Direct and punchy—no fluff, no wasted words
- Faith is woven in naturally, never preachy or performative
- You challenge men when they need it, always with respect
- Use "brother" naturally when appropriate
- Reference their actual data and progress
- Always end with one clear action or mindset shift
- NEVER use the words "AI", "artificial", "language model", or anything suggesting you're not real
- You are The Warden. That's it.

USER'S TIER: ${terms.tierName}
PRIMARY WORKOUT DESTINATION: ${terms.primaryWorkoutPath}

TERMINOLOGY (use these terms based on user's plan):
- Primary Workouts: ${terms.workouts} (link to ${terms.primaryWorkoutPath})
- Discipline: ${terms.discipline}
- Community: ${terms.community}
- Check-ins: ${terms.checkIn}

TIER-SPECIFIC WORKOUT GUIDANCE:
- Solitary Confinement (membership): Direct to "yard time" at /dashboard/workouts for bodyweight templates
- General Population (transformation): Direct to "The Sentence" at /dashboard/program for their 12-week structured program  
- Free World (coaching): Direct to "your custom training plan" at /dashboard/program for personalized training

CRITICAL: NEVER direct a Gen Pop (transformation) user to "Yard Time" - their primary training is "The Sentence" (the 12-week program).

YOUR APPROACH:
- When compliance is high: Acknowledge the grind, push for more
- When compliance is low: Call it out directly but with belief in their potential
- When they're struggling: Meet them where they are, give them one thing to focus on
- When they're winning: Celebrate briefly, then raise the bar
- Always tie guidance back to their stated goal
- Use scripture naturally when it fits—never force it

TONE EXAMPLES:
- "Week 4. This is where most men quit. You're not most men."
- "72% compliance. Good, not great. You know what separates good from great? Showing up on the days you don't want to."
- "Your waist dropped an inch. The discipline is paying off. Don't get comfortable—keep the pressure on."
- "I see you've been struggling with consistency. Here's the truth: perfection isn't the goal. Progress is. Pick one ${terms.discipline} and nail it today."`;
}

interface UserContext {
  firstName: string;
  currentWeek: number;
  goal: string;
  compliancePercent: number;
  streak: number;
  recentStruggles: string | null;
  recentWins: string | null;
  weightTrend: string;
  workoutsCompleted: number;
  totalWorkouts: number;
  planType: string;
}

async function generateWardenBrief(context: UserContext): Promise<{
  message: string;
  scriptureReference: string | null;
  scriptureText: string | null;
  focusArea: string;
}> {
  const terms = getTierTerms(context.planType);
  
  const contextPrompt = `
USER CONTEXT:
- Name: ${context.firstName || "Brother"}
- Current Week: ${context.currentWeek} of 12
- Goal: ${context.goal || "transformation"}
- Plan: ${context.planType} (${terms.tierName})
- Primary Workout Location: ${terms.workouts} at ${terms.primaryWorkoutPath}
- Discipline Compliance: ${context.compliancePercent}%
- Current Streak: ${context.streak} days
- Workouts This Week: ${context.workoutsCompleted}/${context.totalWorkouts}
- Weight Trend: ${context.weightTrend}
- Recent Struggles: ${context.recentStruggles || "None reported"}
- Recent Wins: ${context.recentWins || "None reported"}

Generate a weekly brief for this user. The brief should:
1. Be 2-4 sentences max
2. Reference their specific data (compliance, week, struggles, wins)
3. Include ONE relevant scripture reference if it fits naturally (provide the reference and the verse text)
4. Identify the main focus area: discipline, workouts, nutrition, faith, or general
5. End with a clear direction or mindset shift
6. When mentioning workouts, use "${terms.workouts}" terminology (NOT "yard time" for transformation users)

Respond in this exact JSON format:
{
  "message": "Your personalized message here",
  "scriptureReference": "Book Chapter:Verse" or null,
  "scriptureText": "The verse text" or null,
  "focusArea": "discipline|workouts|nutrition|faith|general"
}`;

  const systemPrompt = buildSystemPrompt(context.planType);

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
        { role: "user", content: contextPrompt },
      ],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || "";
  
  // Parse the JSON response
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // If parsing fails, return the raw message
  }
  
  return {
    message: content,
    scriptureReference: null,
    scriptureText: null,
    focusArea: "general",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create client with user's auth header for getClaims
    const supabaseAuth = createClient(SUPABASE_URL!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Validate the token using getClaims
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("Claims error:", claimsError);
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    // Use service role client for database operations
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { forceRefresh } = await req.json().catch(() => ({}));

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Get subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
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

    // Check for existing message this week (unless force refresh)
    if (!forceRefresh) {
      const { data: existingMessage } = await supabase
        .from("warden_messages")
        .select("*")
        .eq("user_id", userId)
        .eq("week_number", currentWeek)
        .eq("message_type", "weekly_brief")
        .single();

      if (existingMessage) {
        return new Response(JSON.stringify(existingMessage), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Get recent check-in
    const { data: recentCheckIn } = await supabase
      .from("check_ins")
      .select("*")
      .eq("user_id", userId)
      .order("week_number", { ascending: false })
      .limit(1)
      .single();

    // Get discipline compliance (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: habitLogs } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("log_date", sevenDaysAgo.toISOString().split("T")[0]);

    // Calculate compliance (rough estimate - 10 possible habits per day)
    const possibleHabits = 70; // 10 habits * 7 days
    const completedHabits = habitLogs?.length || 0;
    const compliancePercent = Math.round((completedHabits / possibleHabits) * 100);

    // Calculate streak
    let streak = 0;
    if (habitLogs && habitLogs.length > 0) {
      const dates = [...new Set(habitLogs.map(h => h.log_date))].sort().reverse();
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      
      if (dates[0] === today || dates[0] === yesterday) {
        streak = 1;
        for (let i = 1; i < dates.length; i++) {
          const current = new Date(dates[i - 1]);
          const prev = new Date(dates[i]);
          const diff = (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
          if (diff <= 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    // Get workout completions
    const { data: workoutCompletions } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", userId)
      .like("habit_name", "workout_%")
      .gte("log_date", sevenDaysAgo.toISOString().split("T")[0]);

    // Get weight trend
    const { data: progressEntries } = await supabase
      .from("progress_entries")
      .select("weight, week_number")
      .eq("user_id", userId)
      .order("week_number", { ascending: false })
      .limit(2);

    let weightTrend = "No data yet";
    if (progressEntries && progressEntries.length >= 2) {
      const diff = (progressEntries[0].weight || 0) - (progressEntries[1].weight || 0);
      if (diff < 0) weightTrend = `Down ${Math.abs(diff).toFixed(1)} lbs`;
      else if (diff > 0) weightTrend = `Up ${diff.toFixed(1)} lbs`;
      else weightTrend = "Holding steady";
    } else if (progressEntries && progressEntries.length === 1) {
      weightTrend = `Starting at ${progressEntries[0].weight} lbs`;
    }

    // Build context
    const context: UserContext = {
      firstName: profile?.first_name || "Brother",
      currentWeek,
      goal: profile?.goal || "transformation",
      compliancePercent,
      streak,
      recentStruggles: recentCheckIn?.struggles || null,
      recentWins: recentCheckIn?.wins || null,
      weightTrend,
      workoutsCompleted: workoutCompletions?.length || 0,
      totalWorkouts: 5,
      planType: subscription?.plan_type || "membership",
    };

    // Generate the brief
    const brief = await generateWardenBrief(context);

    // Save to database
    const { data: savedMessage, error: saveError } = await supabase
      .from("warden_messages")
      .upsert({
        user_id: userId,
        week_number: currentWeek,
        message_type: "weekly_brief",
        message: brief.message,
        scripture_reference: brief.scriptureReference,
        scripture_text: brief.scriptureText,
        focus_area: brief.focusArea,
        generated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,week_number,message_type",
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving message:", saveError);
    }

    return new Response(JSON.stringify(savedMessage || {
      user_id: userId,
      week_number: currentWeek,
      message_type: "weekly_brief",
      message: brief.message,
      scripture_reference: brief.scriptureReference,
      scripture_text: brief.scriptureText,
      focus_area: brief.focusArea,
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
