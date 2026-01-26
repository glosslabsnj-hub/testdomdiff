import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define a type for tier configs to ensure consistency
interface TierConfig {
  name: string;
  subtitle: string;
  description: string;
  persona: "onboarding" | "po";
  features: string[];
  detailedSteps: { step: string; location: string; details: string; time: string }[];
  navigation: { name: string; purpose: string; howTo: string }[];
  screenSlides: { id: string; screen: string; highlight_areas: { x: number; y: number; width: number; height: number }[]; duration: number; zoom_level: number }[];
  specialFeatures: string | null;
  upgradeHint: string | null;
  ctaText: string;
}

// Tier configurations with detailed features and comprehensive screen slides
const TIER_CONFIGS: Record<string, TierConfig> = {
  membership: {
    name: "Solitary Confinement",
    subtitle: "Essential Orientation",
    description: "Master the basics with bodyweight training and daily routines.",
    persona: "onboarding", // Uses authoritative but encouraging voice
    features: [
      "4 Bodyweight Workout Templates: Push Day, Pull Day, Legs Day, Full Body",
      "Morning Discipline Routine: Cold shower, prayer, movement, daily planning",
      "Evening Discipline Routine: Reflection, gratitude journaling, sleep prep",
      "Weekly Roll Call: Track weight, wins, struggles, and weekly reflection",
      "Progress Photo Tracking: Front, side, and back photos to document transformation",
      "Basic Nutrition Guidance: Simple meal templates for bulking, cutting, or maintaining",
    ],
    detailedSteps: [
      { step: "Open your dashboard", location: "Cell Block (Dashboard)", details: "This is your command center. Every feature you have access to starts here.", time: "30 sec" },
      { step: "Click 'Intake Processing' (Start Here)", location: "Dashboard tiles", details: "This is your orientation checklist. Complete each item to get fully set up.", time: "2 min" },
      { step: "Set up your Lights On / Lights Out routines", location: "Discipline page", details: "This ain't just about workouts, it's about your whole routine. Morning Lights On - cold shower, prayer, movement, planning your day. Evening Lights Out - reflection, gratitude, sleep prep. You check off each item, build that discipline every single day.", time: "3 min" },
      { step: "Set your wake-up and bedtime", location: "Discipline settings", details: "Customize when your routines start. The app will remind you.", time: "1 min" },
      { step: "Browse Yard Time workouts", location: "Workouts page", details: "You have 4 templates: Push, Pull, Legs, and Full Body. All bodyweight - no equipment needed.", time: "3 min" },
      { step: "Click on a workout to see exercises", location: "Any workout card", details: "Each exercise has instructions, reps, sets, and form tips.", time: "2 min" },
      { step: "Complete your first workout", location: "Workout detail page", details: "Follow the exercises, then mark the workout complete.", time: "30 min" },
      { step: "Go to Time Served (Progress)", location: "Progress page", details: "This is where you upload photos and track measurements.", time: "1 min" },
      { step: "Upload your starting photos", location: "Progress photos section", details: "Front, side, and back. This is Day 1 documentation for later comparison.", time: "3 min" },
      { step: "Submit your first Roll Call", location: "Check-in page", details: "Report your weight, wins this week, and any struggles. Do this every week.", time: "5 min" },
    ],
    navigation: [
      { name: "Yard Time", purpose: "Your 4 bodyweight workouts", howTo: "Click sidebar > Yard Time > Pick Push, Pull, Legs, or Full Body > Follow exercises" },
      { name: "Lights On / Lights Out", purpose: "Morning and evening discipline routines - cold shower, prayer, movement, daily planning in the AM; reflection, gratitude, sleep prep in the PM. Check off each item daily to build that iron discipline.", howTo: "Click sidebar > Discipline > See your morning and evening routines > Check off each sub-step as you complete it" },
      { name: "Roll Call", purpose: "Weekly accountability check-ins", howTo: "Click sidebar > Roll Call > Fill out the form every Sunday" },
      { name: "Time Served", purpose: "Progress photos and measurements", howTo: "Click sidebar > Time Served > Upload photos > Track weight and measurements" },
      { name: "Basic Nutrition", purpose: "Simple meal guidance", howTo: "Click sidebar > Nutrition > See templates for your goal type" },
    ],
    screenSlides: [
      { id: "dashboard-home", screen: "dashboard-overview", highlight_areas: [{ x: 15, y: 10, width: 30, height: 25 }], duration: 25, zoom_level: 1.0 },
      { id: "start-here", screen: "start-here-page", highlight_areas: [{ x: 10, y: 20, width: 80, height: 60 }], duration: 20, zoom_level: 1.1 },
      { id: "discipline-intro", screen: "discipline-routines", highlight_areas: [{ x: 5, y: 15, width: 45, height: 35 }], duration: 25, zoom_level: 1.15 },
      { id: "morning-routine", screen: "discipline-morning", highlight_areas: [{ x: 10, y: 25, width: 80, height: 50 }], duration: 20, zoom_level: 1.1 },
      { id: "workouts-library", screen: "workouts-bodyweight", highlight_areas: [{ x: 5, y: 10, width: 90, height: 70 }], duration: 30, zoom_level: 1.0 },
      { id: "workout-detail", screen: "workout-exercises", highlight_areas: [{ x: 10, y: 15, width: 80, height: 60 }], duration: 25, zoom_level: 1.1 },
      { id: "progress-page", screen: "progress-tracker", highlight_areas: [{ x: 10, y: 20, width: 35, height: 40 }], duration: 20, zoom_level: 1.1 },
      { id: "photo-upload", screen: "progress-photos", highlight_areas: [{ x: 15, y: 25, width: 70, height: 50 }], duration: 20, zoom_level: 1.0 },
      { id: "checkin-form", screen: "checkin-form", highlight_areas: [{ x: 10, y: 10, width: 80, height: 70 }], duration: 15, zoom_level: 1.0 },
    ],
    specialFeatures: null,
    upgradeHint: "Ready for more structure? Upgrade to General Population to unlock the full 12-week program, nutrition plans, faith lessons, and community access.",
    ctaText: "Head to Yard Time and crush your first workout",
  },
  transformation: {
    name: "General Population",
    subtitle: "12-Week Intake Processing",
    description: "The full 12-week sentence with structured workouts, nutrition, and community.",
    persona: "onboarding", // Uses authoritative prison-themed voice
    features: [
      "12-Week Structured Program: 3 phases - Foundation (1-4), Building (5-8), Peak (9-12)",
      "Daily Workout Videos: Follow-along training with detailed exercise instructions",
      "Complete Nutrition in Chow Hall: Personalized meal plans with macros, recipes, and shopping lists",
      "Weekly Faith Lessons in Chapel: Scripture, reflection, and spiritual growth",
      "The Yard Community: Connect with fellow inmates, share wins, ask questions",
      "Weekly Group Accountability Call: Live call with the brotherhood every week",
      "Progress Tracking: Photos, measurements, and compliance metrics over 12 weeks",
      "Work Release Skills: Income-generating skills for life after the program",
    ],
    detailedSteps: [
      { step: "Review your 12-week program", location: "The Sentence page", details: "See all 12 weeks laid out. Each week has 5-6 training days plus rest days.", time: "5 min" },
      { step: "Understand the 3 phases", location: "Program overview", details: "Weeks 1-4 build foundation. Weeks 5-8 increase intensity. Weeks 9-12 are peak performance.", time: "3 min" },
      { step: "Click Week 1 to expand", location: "Week 1 card", details: "See all the daily workouts for your first week.", time: "1 min" },
      { step: "Start Day 1 workout", location: "Week 1, Day 1", details: "Click the workout to see exercises. Follow the video if available.", time: "45 min" },
      { step: "Mark the day complete", location: "Workout detail", details: "After finishing, click 'Complete' to log it and move to Day 2.", time: "30 sec" },
      { step: "Open Chow Hall (Nutrition)", location: "Nutrition page", details: "See your meal plan for today. 4 meals with macros, ingredients, and recipes.", time: "5 min" },
      { step: "Review today's meals", location: "Meal cards", details: "Breakfast, lunch, dinner, and snacks. Click any meal for the full recipe.", time: "3 min" },
      { step: "Set up your discipline routines", location: "Discipline page", details: "Pick a morning template and customize your wake-up time.", time: "3 min" },
      { step: "Read Week 1 faith lesson", location: "Chapel page", details: "Scripture, teaching, and reflection questions. Take 10 minutes to read and pray.", time: "10 min" },
      { step: "Introduce yourself in The Yard", location: "Community page", details: "Post your goals and why you're here. Your brothers are waiting.", time: "5 min" },
      { step: "Upload starting photos", location: "Progress page", details: "Front, side, back photos. Document Day 1 for your transformation.", time: "3 min" },
      { step: "Submit your first Roll Call", location: "Check-in page", details: "Weight, wins, struggles. Do this every Sunday for accountability.", time: "5 min" },
    ],
    navigation: [
      { name: "The Sentence", purpose: "Your 12-week structured program", howTo: "Click sidebar > The Sentence > Select your week > Pick a day > Complete workout" },
      { name: "Chow Hall", purpose: "Complete meal plans with macros", howTo: "Click sidebar > Chow Hall > See today's meals > Click any meal for recipe" },
      { name: "Chapel", purpose: "Weekly faith lessons and scripture", howTo: "Click sidebar > Chapel > Read this week's lesson > Reflect and pray" },
      { name: "The Yard", purpose: "Community and brotherhood", howTo: "Click sidebar > The Yard > Post updates, share wins, connect with inmates" },
      { name: "Lights On/Out", purpose: "Daily discipline routines", howTo: "Click sidebar > Discipline > Check off morning and evening items" },
      { name: "Roll Call", purpose: "Weekly accountability", howTo: "Click sidebar > Roll Call > Submit every Sunday with your week's data" },
      { name: "Time Served", purpose: "Progress tracking", howTo: "Click sidebar > Time Served > Upload photos, track weight and measurements" },
    ],
    screenSlides: [
      { id: "dashboard-home", screen: "dashboard-overview", highlight_areas: [{ x: 15, y: 10, width: 30, height: 25 }], duration: 20, zoom_level: 1.0 },
      { id: "program-overview", screen: "program-12weeks", highlight_areas: [{ x: 5, y: 5, width: 90, height: 85 }], duration: 30, zoom_level: 1.0 },
      { id: "week1-expanded", screen: "program-week1", highlight_areas: [{ x: 10, y: 20, width: 80, height: 60 }], duration: 25, zoom_level: 1.15 },
      { id: "workout-detail", screen: "workout-detail", highlight_areas: [{ x: 10, y: 15, width: 80, height: 65 }], duration: 20, zoom_level: 1.1 },
      { id: "chow-hall", screen: "nutrition-plan", highlight_areas: [{ x: 5, y: 10, width: 90, height: 75 }], duration: 25, zoom_level: 1.0 },
      { id: "meal-detail", screen: "meal-recipe", highlight_areas: [{ x: 15, y: 20, width: 70, height: 55 }], duration: 15, zoom_level: 1.1 },
      { id: "chapel-lesson", screen: "faith-lesson", highlight_areas: [{ x: 10, y: 15, width: 80, height: 60 }], duration: 20, zoom_level: 1.1 },
      { id: "community-yard", screen: "community-yard", highlight_areas: [{ x: 10, y: 10, width: 80, height: 70 }], duration: 20, zoom_level: 1.0 },
      { id: "discipline-page", screen: "discipline-routines", highlight_areas: [{ x: 5, y: 15, width: 45, height: 35 }], duration: 15, zoom_level: 1.1 },
      { id: "progress-page", screen: "progress-tracker", highlight_areas: [{ x: 10, y: 20, width: 35, height: 40 }], duration: 15, zoom_level: 1.0 },
      { id: "checkin-form", screen: "checkin-form", highlight_areas: [{ x: 10, y: 10, width: 80, height: 70 }], duration: 15, zoom_level: 1.0 },
    ],
    specialFeatures: "Weekly Group Call: Every week, the brotherhood comes together for a live accountability call. Check The Yard community for the schedule and meeting link. Don't miss it.",
    upgradeHint: null,
    ctaText: "Start Week 1, Day 1 in The Sentence and begin your transformation",
  },
  coaching: {
    name: "Free World",
    subtitle: "Welcome to Probation",
    description: "Premium coaching with direct access to Dom, personalized programming, and 1:1 support.",
    persona: "po", // Uses P.O. (Parole Officer) professional mentor voice
    features: [
      "Personalized Training Program: Custom workouts built specifically for your goals and abilities",
      "1:1 Coaching Calls with Dom: Book 30 or 60 minute video calls for personalized guidance",
      "Direct Line Messaging: Message Dom anytime through private chat - he reviews and responds personally",
      "Custom Nutrition Adjustments: Dom adjusts your meal plan based on your progress and feedback",
      "Priority Check-In Review: Your weekly reports get personal attention and detailed feedback",
      "Advanced Entrepreneur Track: Business strategies, income building, and financial freedom skills",
      "Program Modifications: Dom adjusts your training based on your progress photos and check-ins",
      "All Gen Pop Features: 12-week structure, faith lessons, community, everything from the full program",
    ],
    detailedSteps: [
      { step: "Review your personalized program", location: "Your Program page", details: "This isn't a template - Dom built this specifically for you based on your intake.", time: "5 min" },
      { step: "Open the Coaching Portal", location: "Coaching Portal page", details: "This is your hub for booking calls and managing your coaching relationship.", time: "2 min" },
      { step: "Schedule your first 1:1 call", location: "Book Call section", details: "Pick a time that works. Your first call sets the foundation for everything.", time: "3 min" },
      { step: "Send Dom an intro message", location: "Direct Line (Messages)", details: "Introduce yourself, share your goals, ask any questions. He responds personally.", time: "5 min" },
      { step: "Review your custom nutrition plan", location: "Meal Planning page", details: "These are adjusted to your TDEE and goals. Dom can tweak them based on your feedback.", time: "5 min" },
      { step: "Complete your first workout", location: "Your Program", details: "Follow the custom training plan. Track your performance.", time: "45 min" },
      { step: "Lock in your Daily Structure with Lights On / Lights Out", location: "Daily Structure page", details: "Even though you out, you still need discipline. Morning routine - cold shower, prayer, movement, plan the day. Evening routine - reflect on wins, gratitude journaling, prep for sleep. Check off each item. Consistency is what keeps you free.", time: "3 min" },
      { step: "Explore the Entrepreneur Track", location: "Advanced Skills page", details: "Business strategies, income building, legitimate hustles. This is coaching-exclusive.", time: "10 min" },
      { step: "Connect with the Network", location: "The Network (Community)", details: "Other Free World members. Share experiences, build relationships.", time: "5 min" },
      { step: "Upload your starting photos", location: "Progress Report page", details: "Dom reviews these personally. Be thorough - front, side, back.", time: "3 min" },
      { step: "Submit your first Weekly Report", location: "Weekly Report page", details: "Weight, wins, struggles, questions. Dom reads every one and adjusts your plan.", time: "10 min" },
    ],
    navigation: [
      { name: "Your Program", purpose: "Your personalized training plan", howTo: "Click sidebar > Your Program > See your custom workouts > Track completion" },
      { name: "Coaching Portal", purpose: "Book 1:1 calls with Dom", howTo: "Click sidebar > Coaching Portal > View available times > Book your session" },
      { name: "Direct Line", purpose: "Message Dom privately", howTo: "Click sidebar > Direct Line > Type message > Dom responds within 24-48 hours" },
      { name: "Lights On / Lights Out", purpose: "Daily discipline routines - even though you out, consistency keeps you free. Morning: cold shower, prayer, movement, plan the day. Evening: reflection, gratitude, sleep prep. Check off each item daily.", howTo: "Click sidebar > Daily Structure > See your morning and evening routines > Check off each sub-step" },
      { name: "Entrepreneur Track", purpose: "Advanced business skills", howTo: "Click sidebar > Advanced Skills > Explore income strategies and business building" },
      { name: "Meal Planning", purpose: "Your personalized nutrition", howTo: "Click sidebar > Meal Planning > See meals adjusted to your TDEE" },
      { name: "The Network", purpose: "Connect with Free World members", howTo: "Click sidebar > The Network > Post, share, and connect with others on probation" },
      { name: "Weekly Report", purpose: "Your accountability check-in", howTo: "Click sidebar > Weekly Report > Submit every week - Dom reviews personally" },
    ],
    screenSlides: [
      { id: "dashboard-home", screen: "dashboard-overview", highlight_areas: [{ x: 15, y: 10, width: 30, height: 25 }], duration: 20, zoom_level: 1.0 },
      { id: "coaching-portal", screen: "coaching-portal", highlight_areas: [{ x: 10, y: 15, width: 80, height: 60 }], duration: 30, zoom_level: 1.15 },
      { id: "book-call", screen: "coaching-booking", highlight_areas: [{ x: 20, y: 20, width: 60, height: 50 }], duration: 20, zoom_level: 1.1 },
      { id: "direct-line", screen: "messages-direct", highlight_areas: [{ x: 10, y: 30, width: 80, height: 55 }], duration: 25, zoom_level: 1.1 },
      { id: "custom-program", screen: "program-custom", highlight_areas: [{ x: 5, y: 10, width: 90, height: 75 }], duration: 25, zoom_level: 1.0 },
      { id: "nutrition-plan", screen: "nutrition-custom", highlight_areas: [{ x: 10, y: 15, width: 80, height: 60 }], duration: 20, zoom_level: 1.1 },
      { id: "entrepreneur-track", screen: "advanced-skills", highlight_areas: [{ x: 10, y: 10, width: 80, height: 70 }], duration: 25, zoom_level: 1.0 },
      { id: "network-community", screen: "community-network", highlight_areas: [{ x: 10, y: 15, width: 80, height: 65 }], duration: 15, zoom_level: 1.0 },
      { id: "weekly-report", screen: "checkin-coaching", highlight_areas: [{ x: 10, y: 10, width: 80, height: 70 }], duration: 15, zoom_level: 1.0 },
      { id: "progress-photos", screen: "progress-photos", highlight_areas: [{ x: 15, y: 25, width: 70, height: 50 }], duration: 15, zoom_level: 1.0 },
    ],
    specialFeatures: "Personal Attention: Unlike other tiers, Dom personally reviews your check-ins, adjusts your program, and responds to your messages. You have direct access to your P.O. - use it. Book calls, send messages, ask questions. That's what you're paying for.",
    upgradeHint: null,
    ctaText: "Open the Coaching Portal and book your first 1:1 call with Dom",
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

    // Build persona-aware prompt - Hood P.O. voice for all tiers
    const personaInstructions = `You are a P.O. (Parole Officer) who came up from the streets himself. 
You know the struggle because you lived it. Now you're on the other side helping others get right.

VOICE CHARACTER:
- Hood white boy who made it out and is now mentoring others
- Use natural street slang but keep it professional enough for a coaching context
- Real talk, no corporate fluff. You're not reading a script, you're talking to your boy
- You genuinely want them to win because you've been where they are

SPEECH STYLE EXAMPLES:
- "Aight, let me put you on real quick..." (not "Welcome to your dashboard")
- "This right here? This is where the magic happens, feel me?" (not "This is an important feature")
- "You finna be checking this every day, no cap" (not "You'll use this daily")
- "Don't sleep on this, bro. This is where you lock in" (not "This is crucial")
- "We good? Bet. Let's keep it moving" (not "Now let's continue")
- "Real talk, this is gonna change everything for you" (not "This will be transformative")
- "That's how you handle that, simple" (not "That's the process")
- "You already know what it is" (not "As you know")

TIER-SPECIFIC CONTEXT:
${config.persona === "po" 
  ? `- This person is FREE WORLD (coaching tier) - they're on probation, out of the system
- Address them like they made it out: "You home now", "You did your time", "Now we building something real"
- They have direct access to Coach Dom - emphasize the personal relationship
- Phrases: "You on the outside now", "This your second chance", "Don't fumble this bag"`
  : `- This person is still in the SYSTEM (${config.name})
- Use prison metaphors: "cell block", "yard time", "the sentence", "roll call"
- Speak like you're checking in on someone doing their time but rooting for them
- Phrases: "You serving time in here", "This your cell block", "Time to put in work"`
}`;

    // Calculate total expected duration from screen slides
    const totalSlideDuration = config.screenSlides.reduce((acc, slide) => acc + slide.duration, 0);
    const targetDuration = Math.max(180, Math.min(300, totalSlideDuration + 30)); // 3-5 minutes

    // Build comprehensive prompt for detailed script
    const prompt = `${personaInstructions}

You're writing a comprehensive voiceover script for an onboarding video in a fitness coaching app.

TIER: ${config.name}
SUBTITLE: ${config.subtitle}
DESCRIPTION: ${config.description}

=== COMPLETE FEATURE BREAKDOWN (explain each one) ===
${config.features.map((f, i) => `${i + 1}. ${f}`).join("\n")}

=== STEP-BY-STEP WALKTHROUGH (cover all of these) ===
${config.detailedSteps.map((s, i) => `${i + 1}. ${s.step}
   Location: ${s.location}
   Details: ${s.details}
   Time needed: ${s.time}`).join("\n\n")}

=== NAVIGATION GUIDE (explain how to access each feature) ===
${config.navigation.map(n => `- ${n.name}: ${n.purpose}
  How to access: ${n.howTo}`).join("\n\n")}

${config.specialFeatures ? `=== SPECIAL FEATURES ===\n${config.specialFeatures}` : ""}

${config.upgradeHint ? `=== UPGRADE PATH ===\n${config.upgradeHint}` : ""}

CALL TO ACTION: ${config.ctaText}

=== VISUAL SYNC (match your sections to these screens) ===
${config.screenSlides.map((s, i) => `${i + 1}. [${s.id}] ${s.screen} - ${s.duration} seconds`).join("\n")}

=== CRITICAL RULES ===
1. TARGET DURATION: ${targetDuration} seconds (${Math.round(targetDuration/60)} minutes) - comprehensive walkthrough
2. PACING: Natural speaking pace, 110-120 words per minute. Conversational flow.
3. SMART PAUSES - BE STRATEGIC, NOT ROBOTIC:
   - SHORT pause "..." (1-2 sec): After a quick statement, natural breath
   - MEDIUM pause "... ..." (3-4 sec): After explaining a feature or pointing to something on screen
   - LONG pause "... ... ..." (6-8 sec): ONLY when transitioning to a COMPLETELY NEW SECTION
   - DO NOT pause after every sentence - let it flow naturally like a real conversation
   - PAUSE WHEN: Switching screens, pointing to a new area, after "click here/go to", between major topics
   - DON'T PAUSE WHEN: Mid-explanation, building up a point, casual conversational flow
   - GOOD EXAMPLE: "Aight, this right here is your dashboard. This where you see everything at once, feel me? Your workouts, your progress, all of it. ... ... Now peep this section over here. ... This your workout tracker. Click it and you can log what you did. ... ... ... Bet, let's move to nutrition."
   - BAD EXAMPLE: "This is your dashboard. ... ... ... This is where you see things. ... ... ... Your workouts are here. ... ... ..." (too robotic)
4. STRUCTURE: 
   - Hood intro / what's up (15-20 sec)
   - Dashboard quick overview (30-45 sec)  
   - Feature-by-feature breakdown with smart pauses (2-3 min)
   - How to get around / navigation (30-45 sec)
   - What to do next (20-30 sec)
   - Strong closing / call-to-action (15 sec)
5. LANGUAGE: Keep it real. Street talk but clear. Natural sentence length - not choppy.
6. PERSONALIZATION: Use "you" and "your" - make it personal, like you talking to your boy
7. FLOW: Sound like a real person explaining, not a robot reading with pauses inserted
8. NO SECTION ANNOUNCEMENTS - CRITICAL:
   - DO NOT say things like "Now let's talk about X" or "Next is your Y" or "Let's look at Z" or "Moving on to..."
   - BAD: "Now, let's look at your nutrition section. Your nutrition is..."
   - GOOD: "Your nutrition, man, don't sleep on this. This is where..."
   - BAD: "Next up, we have the Discipline page. On this page..."
   - GOOD: "Every morning, you gotta get up and handle your business. That's what Discipline is about..."
   - Just flow naturally into explaining each feature like you're talking, not reading headers
   - Never announce what you're about to explain - just explain it directly
   - Weave feature names INTO the explanation naturally, don't read them as titles

=== OUTPUT FORMAT (valid JSON only) ===
{
  "script_text": "The complete narration as one string with ... for pauses",
  "caption_lines": [
    {"text": "Caption text here.", "start": 0, "end": 3.5},
    {"text": "Next caption.", "start": 3.5, "end": 7.0}
  ],
  "estimated_duration_seconds": ${targetDuration}
}

IMPORTANT:
- Total caption duration must equal estimated_duration_seconds
- Each caption line should be a natural spoken phrase (5-15 words)

Generate the comprehensive walkthrough script now.`;

    console.log("Generating detailed script for tier:", tier_key, "persona:", config.persona, "target duration:", targetDuration);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert script writer for fitness coaching onboarding videos. Output only valid JSON with comprehensive, detailed content." },
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
    console.log("AI response structure:", JSON.stringify(data).substring(0, 500));
    
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("Empty AI response. Full response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "No content in AI response", details: JSON.stringify(data) }),
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

    // Validate minimum duration
    if (scriptData.estimated_duration_seconds < 120) {
      console.warn("Script too short, got:", scriptData.estimated_duration_seconds, "seconds");
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

    console.log("Detailed script generated successfully, duration:", scriptData.estimated_duration_seconds, "seconds");

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
