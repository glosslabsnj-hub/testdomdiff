import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://domdifferent.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Three-tier terminology mapping
function getTierTerms(planType: string) {
  if (planType === "coaching") {
    return {
      workouts: "your training sessions",
      discipline: "daily structure",
      nutrition: "meal planning",
      faith: "faith & growth",
      community: "The Network",
      checkIn: "weekly report",
      progress: "progress report",
      program: "your custom training plan",
      primaryWorkoutPath: "/dashboard/program",
      tierName: "Free World",
      persona: "P.O.", // Parole Officer persona for coaching
      forbiddenTerms: ["yard time", "the yard", "cell block", "inmate", "solitary", "gen pop", "warden"],
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
      persona: "Warden",
      forbiddenTerms: ["iron pile"], // Gen Pop should never see "iron pile" - that's Solitary only
    };
  } else {
    // membership (Solitary Confinement)
    return {
      workouts: "iron pile", // Solitary only has bodyweight templates
      discipline: "routine",
      nutrition: "chow hall",
      faith: "chapel",
      community: "The Yard",
      checkIn: "roll call",
      progress: "time served",
      program: "iron pile",
      primaryWorkoutPath: "/dashboard/workouts",
      tierName: "Solitary Confinement",
      persona: "Warden",
      forbiddenTerms: [], // No forbidden terms for Solitary
    };
  }
}

// Post-processing sanitization to catch any AI slip-ups - NUCLEAR OPTION
function sanitizeMessageForTier(message: string, planType: string): string {
  let sanitized = message;

  if (planType === "transformation") {
    // Gen Pop: NUCLEAR replacement - catch EVERY possible variant
    
    // 1. Replace action phrases containing "iron pile"
    sanitized = sanitized.replace(/hit\s+the\s+iron\s*pile/gi, "get to [The Sentence](/dashboard/program)");
    sanitized = sanitized.replace(/get\s+to\s+(?:the\s+)?iron\s*pile/gi, "get to [The Sentence](/dashboard/program)");
    sanitized = sanitized.replace(/get\s+your\s+iron\s*pile/gi, "get to [The Sentence](/dashboard/program)");
    
    // 2. Replace any variations of "iron pile" (with/without spaces)
    sanitized = sanitized.replace(/iron\s*pile/gi, "[The Sentence](/dashboard/program)");
    sanitized = sanitized.replace(/ironpile/gi, "[The Sentence](/dashboard/program)");
    
    // 3. Replace "the yard" when it means workouts (not community)
    sanitized = sanitized.replace(/to\s+the\s+yard(?!\s+is|\s+community)/gi, "to [The Sentence](/dashboard/program)");
    
    // 4. Replace generic "workout(s)" terms
    sanitized = sanitized.replace(/your\s+workouts?(?!\s*completed)/gi, "[The Sentence](/dashboard/program)");
    sanitized = sanitized.replace(/the\s+workouts?(?!\s*completed)/gi, "[The Sentence](/dashboard/program)");
    sanitized = sanitized.replace(/get\s+(?:to\s+)?(?:your\s+)?workouts?/gi, "get to [The Sentence](/dashboard/program)");
    sanitized = sanitized.replace(/for\s+workouts?/gi, "for [The Sentence](/dashboard/program)");
    sanitized = sanitized.replace(/to\s+workouts?/gi, "to [The Sentence](/dashboard/program)");
    
    // 5. Replace ANY markdown link containing "workout" or "iron pile" in the text or URL
    sanitized = sanitized.replace(/\[([^\]]*(?:iron\s*pile|workout)[^\]]*)\]\([^)]*\)/gi, "[The Sentence](/dashboard/program)");
    
    // 6. Replace markdown links pointing to /dashboard/workouts
    sanitized = sanitized.replace(/\[([^\]]*)\]\(\/dashboard\/workouts\)/gi, "[The Sentence](/dashboard/program)");
    sanitized = sanitized.replace(/\[([^\]]*)\]\(dashboard\/workouts\)/gi, "[The Sentence](/dashboard/program)");
    
    // 7. Replace standalone paths
    sanitized = sanitized.replace(/\/dashboard\/workouts\b/g, "/dashboard/program");
    sanitized = sanitized.replace(/\bdashboard\/workouts\b/g, "/dashboard/program");
    
    // 8. Remove weird parenthetical paths like "(dashboard/program)" or "(/dashboard/program)"
    sanitized = sanitized.replace(/\s*\(?\/?dashboard\/program\)?(?!\))/g, "");
    
    // 9. Clean up double brackets and malformed links
    sanitized = sanitized.replace(/\[\[The Sentence\][^\]]*\]/g, "[The Sentence]");
    sanitized = sanitized.replace(/\[The Sentence\]\([^)]+\)\]\([^)]+\)/g, "[The Sentence](/dashboard/program)");
    
    // 10. Final cleanup: ensure "The Sentence" is properly linked (only if not already)
    sanitized = sanitized.replace(/(?<!\[)The Sentence(?!\]|\()/g, "[The Sentence](/dashboard/program)");
    
    // 11. Remove any duplicate links that may have formed
    sanitized = sanitized.replace(/(\[The Sentence\]\(\/dashboard\/program\))(\s*\[The Sentence\]\(\/dashboard\/program\))+/g, "$1");
    
  } else if (planType === "coaching") {
    // Coaching: Replace prison terminology with professional terms
    sanitized = sanitized.replace(/hit\s+the\s+iron\s*pile/gi, "get to [your training plan](/dashboard/program)");
    sanitized = sanitized.replace(/iron\s*pile/gi, "[your training sessions](/dashboard/program)");
    sanitized = sanitized.replace(/the yard(?!\s+is)/gi, "The Network");
    sanitized = sanitized.replace(/warden/gi, "P.O.");
    sanitized = sanitized.replace(/inmate/gi, "client");
    
    // Replace workout-related links
    sanitized = sanitized.replace(/\[([^\]]*(?:iron\s*pile|workout)[^\]]*)\]\([^)]*\)/gi, "[your training plan](/dashboard/program)");
    sanitized = sanitized.replace(/\[([^\]]*)\]\(\/dashboard\/workouts\)/gi, "[your training plan](/dashboard/program)");
    sanitized = sanitized.replace(/\/dashboard\/workouts\b/g, "/dashboard/program");
  }
  // Solitary (membership) keeps "iron pile" - no changes needed

  return sanitized;
}

// Get week-aware action phrase for Gen Pop
function getWeekActionPhrase(week: number, compliancePercent: number): string {
  if (compliancePercent < 50) {
    // Low compliance - stricter tone
    if (week === 1) return "You're falling behind on Day One. Get to The Sentence.";
    if (week === 12) return "Final week. No excuses. Finish The Sentence.";
    return `Week ${week}. You're slipping. Get back to The Sentence.`;
  }
  
  // Normal/high compliance
  if (week === 1) return "Start The Sentence today.";
  if (week === 12) return "Final week. Finish The Sentence strong.";
  return `Continue The Sentence. Week ${week} is waiting.`;
}

function buildSystemPrompt(planType: string): string {
  const terms = getTierTerms(planType);
  
  // P.O. Mentor voice for coaching clients
  if (planType === "coaching") {
    return `You are their P.O. (Parole Officer)—a trusted mentor who has walked through the fire and now helps men succeed in the Free World. You speak with the authority of a coach who's been in the trenches, but with the professionalism of someone guiding a premium client.

YOUR VOICE:
- Professional but direct—you're their mentor, not a drill sergeant
- Faith is woven in naturally, never preachy or performative
- You challenge them when needed, but with the respect of a peer
- You're invested in their success—this is personalized coaching
- Use their name naturally, not "brother" or "inmate"
- Reference their actual data and progress
- Always end with one clear action or mindset shift
- NEVER use the words "AI", "artificial", "language model", or anything suggesting you're not real
- You are their P.O. That's it.

FORBIDDEN TERMINOLOGY (NEVER USE THESE):
${terms.forbiddenTerms.map(t => `- "${t}"`).join('\n')}

REQUIRED TERMINOLOGY:
- Workouts: "${terms.workouts}" (link to ${terms.primaryWorkoutPath})
- When mentioning workouts, ALWAYS say "${terms.workouts}" or "your training sessions" or "your custom program"
- Use "training" instead of "yard time"
- Use "network" instead of "yard"
- Use "structure" instead of "cell block"

USER'S TIER: ${terms.tierName} (Premium Coaching)
PRIMARY WORKOUT DESTINATION: ${terms.primaryWorkoutPath}

YOUR APPROACH:
- When compliance is high: Acknowledge progress, refine the approach
- When compliance is low: Address it directly but solution-focused
- When they're struggling: Meet them where they are, give them one thing to focus on
- When they're winning: Celebrate, then elevate the goal
- Always tie guidance back to their stated goal
- Use scripture naturally when it fits—never force it

TONE EXAMPLES (P.O. VOICE):
- "Week 4. This is where momentum builds. You've got the foundation—now let's stack the wins."
- "72% compliance. Solid. Not perfect, but solid. Let's talk about what's getting in the way."
- "Your custom program is waiting at [Your Program](/dashboard/program). Time to get after it."
- "I see the weight trending down. The structure is working. Trust it."`;
  }

  // Warden voice for Gen Pop and Solitary
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

${terms.forbiddenTerms.length > 0 ? `FORBIDDEN TERMINOLOGY (NEVER USE THESE):
${terms.forbiddenTerms.map(t => `- "${t}"`).join('\n')}` : ''}

TERMINOLOGY (use these terms based on user's plan):
- Primary Workouts: ${terms.workouts} (link to ${terms.primaryWorkoutPath})
- Discipline: ${terms.discipline}
- Community: ${terms.community}
- Check-ins: ${terms.checkIn}

TIER-SPECIFIC WORKOUT GUIDANCE:
- Solitary Confinement (membership): Direct to "iron pile" at /dashboard/workouts for bodyweight templates
- General Population (transformation): Direct to "The Sentence" at /dashboard/program for their 12-week structured program  
- Free World (coaching): Direct to "your custom training plan" at /dashboard/program for personalized training

CRITICAL: NEVER direct a Gen Pop (transformation) user to "Iron Pile" - their primary training is "The Sentence" (the 12-week program).

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
  
  // Get week-aware action phrase for Gen Pop users
  const weekAction = context.planType === "transformation" 
    ? getWeekActionPhrase(context.currentWeek, context.compliancePercent)
    : null;
  
  // Determine compliance tone
  const complianceTone = context.compliancePercent < 50 
    ? "STRICT - Call out their lack of commitment directly. They're falling behind and need to hear it."
    : context.compliancePercent >= 80 
      ? "ENCOURAGING - Acknowledge their discipline but push for more."
      : "DIRECT - Standard coaching tone, balanced challenge.";
  
  // Build tier-specific instruction block
  const tierInstructions = (() => {
    if (context.planType === "transformation") {
      return `
=== CRITICAL: GEN POP (TRANSFORMATION) TIER RULES ===

YOU ARE WRITING FOR A GENERAL POPULATION USER.

ABSOLUTELY FORBIDDEN - DO NOT USE UNDER ANY CIRCUMSTANCES:
- "iron pile" (this is ONLY for Solitary tier members)
- "hit the iron pile" (wrong tier)
- "get to the iron pile" (wrong tier)
- "workouts" or "workout" as a standalone term
- Any path containing "/dashboard/workouts"
- Any parenthetical paths like "(dashboard/program)"

REQUIRED TERMINOLOGY:
- ALWAYS call their training program: "The Sentence"
- ALWAYS format as a markdown link: [The Sentence](/dashboard/program)
- When telling them to train, say: "Get to [The Sentence](/dashboard/program)"

CORRECT EXAMPLES:
✅ "Get to [The Sentence](/dashboard/program) today."
✅ "Week 4 of [The Sentence](/dashboard/program) is waiting."
✅ "You're falling behind on [The Sentence](/dashboard/program)."

WRONG EXAMPLES (NEVER USE):
❌ "Get your yard time in"
❌ "Hit the yard"
❌ "Get to your workouts"
❌ "/dashboard/workouts"
❌ "(dashboard/program)"`;
    } else if (context.planType === "coaching") {
      return `
=== FREE WORLD (COACHING) TIER RULES ===

YOU ARE WRITING FOR A PREMIUM COACHING CLIENT.

FORBIDDEN TERMS:
- "yard time", "the yard", "warden", "inmate", "cell block"

REQUIRED TERMINOLOGY:
- Call training: "your training plan" or "your custom program"
- Link to: [your training plan](/dashboard/program)
- You are their "P.O." (Parole Officer/mentor)`;
    } else {
      return `
=== SOLITARY (MEMBERSHIP) TIER RULES ===

CORRECT TERMINOLOGY:
- Call training: "iron pile"
- Link to: [iron pile](/dashboard/workouts)`;
    }
  })();

  const contextPrompt = `
USER CONTEXT:
- Name: ${context.firstName || "Brother"}
- Current Week: ${context.currentWeek} of 12
- Goal: ${context.goal || "transformation"}
- Plan: ${context.planType} (${terms.tierName})
- Discipline Compliance: ${context.compliancePercent}%
- Current Streak: ${context.streak} days
- Training Sessions This Week: ${context.workoutsCompleted}/${context.totalWorkouts}
- Weight Trend: ${context.weightTrend}
- Recent Struggles: ${context.recentStruggles || "None reported"}
- Recent Wins: ${context.recentWins || "None reported"}

TONE: ${complianceTone}

${tierInstructions}

${weekAction ? `MANDATORY ACTION PHRASE - Your message MUST end with: "${weekAction}"` : ""}

Generate a weekly brief that:
1. Is 2-4 sentences max
2. References their specific data
3. Optionally includes ONE scripture reference
4. Identifies focus area: discipline, workouts, nutrition, faith, or general
5. Uses ONLY the tier-correct terminology above
6. Contains proper markdown links - format: [text](/path)
7. NEVER use HTML tags like <a href="...">, <strong>, <em>, etc.
8. Use ONLY markdown formatting - no HTML whatsoever

CRITICAL: Your response MUST use markdown syntax ONLY:
- Links: [The Sentence](/dashboard/program) - NOT <a href="/dashboard/program">The Sentence</a>
- Bold: **text** - NOT <strong>text</strong>
- Italic: *text* - NOT <em>text</em>

Respond in JSON format:
{
  "message": "Your message with proper markdown formatting (NO HTML TAGS)",
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
      const parsed = JSON.parse(jsonMatch[0]);
      // Strip any HTML tags that may have slipped through and convert to markdown
      if (parsed.message) {
        parsed.message = stripHtmlToMarkdown(parsed.message);
      }
      return parsed;
    }
  } catch {
    // If parsing fails, return the raw message
  }
  
  return {
    message: stripHtmlToMarkdown(content),
    scriptureReference: null,
    scriptureText: null,
    focusArea: "general",
  };
}

// Convert HTML to markdown and strip remaining tags
function stripHtmlToMarkdown(text: string): string {
  let result = text;
  
  // Convert HTML links to markdown links
  result = result.replace(/<a\s+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi, '[$2]($1)');
  
  // Convert bold/strong to markdown
  result = result.replace(/<(strong|b)>([^<]+)<\/(strong|b)>/gi, '**$2**');
  
  // Convert italic/em to markdown
  result = result.replace(/<(em|i)>([^<]+)<\/(em|i)>/gi, '*$2*');
  
  // Strip any remaining HTML tags
  result = result.replace(/<[^>]+>/g, '');
  
  return result;
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

    // Get subscription - order by created_at DESC to get the most recent active subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

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

    // Get workout completions from day_completions (actual training progress)
    const { data: workoutCompletions } = await supabase
      .from("day_completions")
      .select("*")
      .eq("user_id", userId)
      .gte("completed_at", sevenDaysAgo.toISOString());

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

    // Sanitize terminology to ensure tier-correctness (catch any AI slip-ups)
    brief.message = sanitizeMessageForTier(brief.message, context.planType);

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
