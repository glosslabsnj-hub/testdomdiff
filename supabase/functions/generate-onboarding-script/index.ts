import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tier configurations matching the frontend
const TIER_CONFIGS = {
  membership: {
    name: "Solitary Confinement",
    subtitle: "Essential Orientation",
    description: "Master the basics with bodyweight training and daily routines.",
    features: [
      "Bodyweight workout library (4 templates)",
      "Morning and evening discipline routines",
      "Weekly check-ins at Roll Call",
      "Progress photo tracking",
    ],
    firstSteps: [
      { step: "Review discipline templates", location: "Discipline page", time: "2 min" },
      { step: "Set wake-up and bedtime", location: "Discipline settings", time: "1 min" },
      { step: "Browse workout library", location: "Yard Time (Workouts)", time: "2 min" },
      { step: "Complete first workout", location: "Any workout template", time: "30 min" },
      { step: "Upload starting photos", location: "Time Served (Progress)", time: "3 min" },
    ],
    navigation: [
      { name: "Yard Time", purpose: "Your bodyweight workouts" },
      { name: "Discipline", purpose: "Morning and evening routines" },
      { name: "Roll Call", purpose: "Weekly check-ins" },
      { name: "Time Served", purpose: "Progress photos" },
    ],
    specialFeatures: null,
    ctaText: "Start with your first workout in Yard Time",
  },
  transformation: {
    name: "General Population",
    subtitle: "12-Week Intake Processing",
    description: "The full 12-week sentence with structured workouts, nutrition, and community.",
    features: [
      "12-week structured program with 3 phases",
      "Daily workout videos and instructions",
      "Complete nutrition plan in Chow Hall",
      "Weekly faith lessons in Chapel",
      "Access to The Yard community",
      "Weekly group accountability call",
    ],
    firstSteps: [
      { step: "Review your 12-week program", location: "The Sentence (Program)", time: "5 min" },
      { step: "Check Week 1 workouts", location: "The Sentence", time: "3 min" },
      { step: "Review nutrition plan", location: "Chow Hall", time: "5 min" },
      { step: "Complete Day 1 workout", location: "The Sentence", time: "45 min" },
      { step: "Read Week 1 faith lesson", location: "Chapel", time: "10 min" },
    ],
    navigation: [
      { name: "The Sentence", purpose: "Your 12-week program" },
      { name: "Chow Hall", purpose: "Nutrition and meals" },
      { name: "Chapel", purpose: "Weekly faith lessons" },
      { name: "The Yard", purpose: "Community and accountability" },
      { name: "Discipline", purpose: "Daily routines" },
    ],
    specialFeatures: "Weekly Group Call: Join the live accountability call every week. Check The Yard for the schedule and meeting link.",
    ctaText: "Start Week 1, Day 1 in The Sentence",
  },
  coaching: {
    name: "Free World",
    subtitle: "Welcome to Probation",
    description: "Premium coaching with direct access to Dom, personalized programming, and 1:1 support.",
    features: [
      "Personalized training program",
      "1:1 coaching calls with Dom",
      "Direct messaging via Direct Line",
      "Custom nutrition adjustments",
      "Priority support and feedback",
      "Advanced entrepreneur training",
    ],
    firstSteps: [
      { step: "Review personalized program", location: "The Sentence", time: "5 min" },
      { step: "Schedule first coaching call", location: "Coaching Portal", time: "2 min" },
      { step: "Send intro message to Dom", location: "Direct Line (Messages)", time: "3 min" },
      { step: "Complete first workout", location: "The Sentence", time: "45 min" },
      { step: "Explore Entrepreneur Track", location: "Advanced Skills", time: "10 min" },
    ],
    navigation: [
      { name: "The Sentence", purpose: "Your custom program" },
      { name: "Coaching Portal", purpose: "Book 1:1 calls" },
      { name: "Direct Line", purpose: "Message Dom directly" },
      { name: "Advanced Skills", purpose: "Business and income strategies" },
    ],
    specialFeatures: "1:1 Coaching: You have direct access to Dom. Book your calls through the Coaching Portal and message him anytime through Direct Line. He reviews your check-ins personally and adjusts your program based on your progress.",
    ctaText: "Schedule your first coaching call in the Coaching Portal",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tier_key, video_id } = await req.json();

    if (!tier_key || !TIER_CONFIGS[tier_key as keyof typeof TIER_CONFIGS]) {
      return new Response(
        JSON.stringify({ error: "Invalid tier_key" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config = TIER_CONFIGS[tier_key as keyof typeof TIER_CONFIGS];
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the prompt for script generation
    const prompt = `You are writing a voiceover script for a fitness coaching app onboarding video. Write in Dom's voice - tough but caring, like a drill sergeant who wants you to succeed.

TIER: ${config.name}
SUBTITLE: ${config.subtitle}
DESCRIPTION: ${config.description}

FEATURES INCLUDED:
${config.features.map((f, i) => `${i + 1}. ${f}`).join("\n")}

FIRST STEPS TO COMPLETE:
${config.firstSteps.map((s, i) => `${i + 1}. ${s.step} (${s.location}) - ${s.time}`).join("\n")}

NAVIGATION GUIDE:
${config.navigation.map(n => `- ${n.name}: ${n.purpose}`).join("\n")}

${config.specialFeatures ? `SPECIAL FEATURES:\n${config.specialFeatures}` : ""}

CALL TO ACTION: ${config.ctaText}

RULES:
- Use simple, direct language (no fluff, no corporate speak)
- Short sentences (max 12 words)
- Structure: Welcome → What's included → Your first steps → Navigation → How to get help → Call to action
- Include time estimates for each step
- Total duration: 90-120 seconds of speech
- End with a clear, motivating call-to-action
- Use "you" and "your" - make it personal
- Sound like a coach, not a tutorial

OUTPUT FORMAT (JSON):
{
  "script_text": "The full narration script as one string with natural pauses marked as ...",
  "caption_lines": [
    {"text": "First caption sentence.", "start": 0, "end": 2.5},
    {"text": "Second caption sentence.", "start": 2.5, "end": 5.0}
  ],
  "scenes": [
    {"id": "welcome", "title": "Welcome", "text": "Scene narration", "duration": 10},
    {"id": "features", "title": "What's Included", "text": "Scene narration", "duration": 15}
  ],
  "estimated_duration_seconds": 90
}

Generate the script now.`;

    console.log("Generating script for tier:", tier_key);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a script writer for fitness coaching videos. Output only valid JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate script", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No content in AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON from the response
    let scriptData;
    try {
      // Extract JSON from possible markdown code blocks
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      scriptData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse script JSON:", parseError, content);
      return new Response(
        JSON.stringify({ error: "Failed to parse script response", raw: content }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the video record if video_id provided
    if (video_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase
        .from("tier_onboarding_videos")
        .update({
          script_text: scriptData.script_text,
          caption_lines: scriptData.caption_lines,
          duration_seconds: scriptData.estimated_duration_seconds,
          status: "generating_audio",
        })
        .eq("id", video_id);
    }

    console.log("Script generated successfully, duration:", scriptData.estimated_duration_seconds, "seconds");

    return new Response(
      JSON.stringify(scriptData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Script generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
