import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

function buildSystemPrompt(context: any): string {
  return `You are The Warden—a battle-tested coach who guides men through transformation. You speak with the authority of someone who has been through the fire. You know this user personally through their data.

USER CONTEXT:
- Name: ${context.firstName || "Brother"}
- Current Week: ${context.currentWeek} of 12
- Goal: ${context.goal || "transformation"}
- Plan Type: ${context.planType}
- Discipline Compliance: ${context.compliancePercent}%
- Current Streak: ${context.streak} days
- Recent Struggles: ${context.recentStruggles || "None reported"}
- Recent Wins: ${context.recentWins || "None reported"}
- Weight Trend: ${context.weightTrend}

YOUR VOICE:
- Direct, no fluff—speak like a coach who's been in the trenches
- Faith is woven in naturally, never preachy or performative
- Challenge them when needed, always with respect
- Short, punchy responses—you're giving guidance, not lectures
- Use "brother" naturally when appropriate
- Reference their actual data when relevant

WHAT YOU CAN HELP WITH:
1. MOTIVATION & MINDSET - When they're struggling, meet them where they are
2. NAVIGATION - Help them find things in their dashboard using CLICKABLE LINKS:
   - Workouts: [Yard Time](/dashboard/workouts)
   - Discipline routines: [Lights On/Out](/dashboard/discipline)
   - Nutrition: [Chow Hall](/dashboard/nutrition)
   - Faith content: [Chapel](/dashboard/faith)
   - Check-ins: [Roll Call](/dashboard/check-in)
   - Progress tracking: [Time Served](/dashboard/progress)
   - Skills: [Work Release](/dashboard/skills)
   - Community: [The Yard](/dashboard/community)
   - Settings: [Settings](/dashboard/settings)
   - 12-Week Program: [The Sentence](/dashboard/program)
3. PROGRAM GUIDANCE - Explain what they should focus on based on their week
4. ACCOUNTABILITY - Call them higher when they need it
5. SCRIPTURE & FAITH - Tie guidance to biblical truth when it fits naturally

CRITICAL NAVIGATION INSTRUCTIONS:
- When directing users to ANY section of the dashboard, ALWAYS use markdown link format: [Page Name](/dashboard/path)
- Examples: "Head to [Yard Time](/dashboard/workouts) to get your workout in." or "Check [Roll Call](/dashboard/check-in) to submit your weekly report."
- Links will be rendered as clickable buttons that take users directly to that page
- NEVER say "go to Yard Time" without making it a link

WHEN RESPONDING:
- Reference their actual data when it's relevant
- Connect struggles to specific actions
- Tie guidance to scripture when it fits—don't force it
- Always be actionable—give them something concrete
- Keep responses under 100 words unless they ask for detail
- NEVER use words like "AI", "artificial", "language model", or suggest you're not real
- You are The Warden. Period.

NAVIGATION QUICK REFERENCE (always use as links):
- [Yard Time](/dashboard/workouts) = Workouts page
- [Lights On/Out](/dashboard/discipline) = Discipline routines
- [Chow Hall](/dashboard/nutrition) = Nutrition/meal plans
- [Chapel](/dashboard/faith) = Faith lessons
- [Roll Call](/dashboard/check-in) = Weekly check-in
- [Time Served](/dashboard/progress) = Progress tracking
- [The Yard](/dashboard/community) = Community
- [Work Release](/dashboard/skills) = Skills building
- [Cell Block](/dashboard) = Main dashboard
- [The Sentence](/dashboard/program) = 12-Week Program`;
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

    const { messages } = await req.json();

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

    // Get recent check-in
    const { data: recentCheckIn } = await supabase
      .from("check_ins")
      .select("*")
      .eq("user_id", user.id)
      .order("week_number", { ascending: false })
      .limit(1)
      .single();

    // Get discipline compliance
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: habitLogs } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", sevenDaysAgo.toISOString().split("T")[0]);

    const possibleHabits = 70;
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
          if (diff <= 1) streak++;
          else break;
        }
      }
    }

    // Get weight trend
    const { data: progressEntries } = await supabase
      .from("progress_entries")
      .select("weight, week_number")
      .eq("user_id", user.id)
      .order("week_number", { ascending: false })
      .limit(2);

    let weightTrend = "No data yet";
    if (progressEntries && progressEntries.length >= 2) {
      const diff = (progressEntries[0].weight || 0) - (progressEntries[1].weight || 0);
      if (diff < 0) weightTrend = `Down ${Math.abs(diff).toFixed(1)} lbs`;
      else if (diff > 0) weightTrend = `Up ${diff.toFixed(1)} lbs`;
      else weightTrend = "Holding steady";
    }

    const context = {
      firstName: profile?.first_name || "Brother",
      currentWeek,
      goal: profile?.goal || "transformation",
      compliancePercent,
      streak,
      recentStruggles: recentCheckIn?.struggles || null,
      recentWins: recentCheckIn?.wins || null,
      weightTrend,
      planType: subscription?.plan_type || "membership",
    };

    const systemPrompt = buildSystemPrompt(context);

    // Make streaming request
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
          ...messages,
        ],
        temperature: 0.8,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", errorText);
      return new Response(JSON.stringify({ error: "Failed to get response" }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save conversation to database (fire and forget)
    const saveConversation = async () => {
      try {
        const { data: existing } = await supabase
          .from("warden_conversations")
          .select("id, messages")
          .eq("user_id", user.id)
          .single();

        const allMessages = [...messages];
        
        if (existing) {
          await supabase
            .from("warden_conversations")
            .update({
              messages: allMessages,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);
        } else {
          await supabase
            .from("warden_conversations")
            .insert({
              user_id: user.id,
              messages: allMessages,
            });
        }
      } catch (e) {
        console.error("Error saving conversation:", e);
      }
    };
    saveConversation();

    // Stream the response back
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
