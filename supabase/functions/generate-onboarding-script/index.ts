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
    subtitle: "Cell Block Orientation",
    description: "Master the basics with bodyweight training, daily discipline routines, and basic nutrition.",
    persona: "onboarding", // Uses authoritative but encouraging voice
    features: [
      "Yard Time: 4 bodyweight workout templates - Push Day, Pull Day, Legs Day, Full Body. No equipment needed.",
      "Lights On Routine: Morning discipline - cold shower, prayer, movement, plan your day. Check off each step.",
      "Lights Out Routine: Evening discipline - reflection, gratitude journaling, sleep prep. Lock in every night.",
      "Roll Call: Weekly check-in to report weight, wins, struggles, and weekly reflection.",
      "Time Served: Progress photo tracking - front, side, and back photos to document your transformation.",
      "Basic Rations: Simple meal guidance for bulking, cutting, or maintenance. Fixed templates to keep it simple.",
      "Ask the Warden: Your AI assistant - tap the shield button anytime to ask questions or get guidance.",
    ],
    detailedSteps: [
      { step: "Check out your Cell Block", location: "Dashboard", details: "This is your home base. Every feature you got access to is right here on these tiles.", time: "30 sec" },
      { step: "Hit 'Welcome Home' first", location: "Start Here tile", details: "This is your orientation checklist. It walks you through everything step by step.", time: "2 min" },
      { step: "Set up Lights On / Lights Out", location: "Discipline page", details: "This is your daily structure. Morning routine - cold shower, prayer, movement, plan the day. Evening routine - reflect, gratitude, prep for sleep. You can edit the times to match your schedule by tapping on them.", time: "3 min" },
      { step: "Customize your routine times", location: "Discipline page", details: "Tap on any time like '5:30 AM' to change it. Set it to when you actually wake up and go to bed.", time: "1 min" },
      { step: "Browse Yard Time workouts", location: "Workouts page", details: "You got 4 templates: Push, Pull, Legs, and Full Body. All bodyweight - no gym, no equipment, no excuses.", time: "3 min" },
      { step: "Click any workout to see the exercises", location: "Workout card", details: "Each exercise shows you the reps, sets, and form tips. Listen to the audio if you need more guidance.", time: "2 min" },
      { step: "Complete your first workout", location: "Workout detail", details: "Follow along with the exercises, then mark the workout complete when you're done.", time: "30 min" },
      { step: "Go to Time Served", location: "Progress page", details: "This is where you upload photos and track your body changes over time.", time: "1 min" },
      { step: "Upload your starting photos", location: "Progress photos", details: "Front, side, and back. This is your Day 1 documentation. You'll thank yourself later.", time: "3 min" },
      { step: "Submit your first Roll Call", location: "Check-in page", details: "Report your weight, your wins this week, any struggles. Do this every week - it's your accountability.", time: "5 min" },
      { step: "Ask the Warden anything", location: "Floating shield button", details: "See that gold shield button? That's your AI Warden. Tap it to ask questions, get motivation, or troubleshoot.", time: "1 min" },
    ],
    navigation: [
      { name: "Yard Time", purpose: "Your 4 bodyweight workouts", howTo: "Tap the Yard Time tile or use the bottom nav > Pick Push, Pull, Legs, or Full Body > Follow the exercises" },
      { name: "Lights On / Lights Out", purpose: "Morning and evening discipline routines. Morning: cold shower, prayer, movement, plan the day. Evening: reflection, gratitude, sleep prep.", howTo: "Tap Discipline tile or bottom nav > Check off each step as you complete it > Edit times by tapping them" },
      { name: "Roll Call", purpose: "Weekly accountability check-ins", howTo: "Tap Roll Call tile > Fill out the form every week with weight, wins, struggles" },
      { name: "Time Served", purpose: "Progress photos and body tracking", howTo: "Tap Progress tile > Upload photos > Track your transformation over time" },
      { name: "Basic Rations", purpose: "Simple meal templates", howTo: "Tap Nutrition tile > See fixed meal templates based on your goal" },
      { name: "Ask the Warden", purpose: "Your AI guide and assistant", howTo: "Tap the gold shield button in bottom nav > Ask any question > Get instant guidance" },
    ],
    screenSlides: [
      { id: "dashboard-home", screen: "dashboard-overview", highlight_areas: [{ x: 15, y: 10, width: 30, height: 25 }], duration: 25, zoom_level: 1.0 },
      { id: "start-here", screen: "start-here-page", highlight_areas: [{ x: 10, y: 20, width: 80, height: 60 }], duration: 20, zoom_level: 1.1 },
      { id: "discipline-intro", screen: "discipline-routines", highlight_areas: [{ x: 5, y: 15, width: 45, height: 35 }], duration: 25, zoom_level: 1.15 },
      { id: "time-editing", screen: "discipline-time-edit", highlight_areas: [{ x: 10, y: 25, width: 80, height: 50 }], duration: 20, zoom_level: 1.1 },
      { id: "workouts-library", screen: "workouts-bodyweight", highlight_areas: [{ x: 5, y: 10, width: 90, height: 70 }], duration: 30, zoom_level: 1.0 },
      { id: "workout-detail", screen: "workout-exercises", highlight_areas: [{ x: 10, y: 15, width: 80, height: 60 }], duration: 25, zoom_level: 1.1 },
      { id: "progress-page", screen: "progress-tracker", highlight_areas: [{ x: 10, y: 20, width: 35, height: 40 }], duration: 20, zoom_level: 1.1 },
      { id: "photo-upload", screen: "progress-photos", highlight_areas: [{ x: 15, y: 25, width: 70, height: 50 }], duration: 20, zoom_level: 1.0 },
      { id: "checkin-form", screen: "checkin-form", highlight_areas: [{ x: 10, y: 10, width: 80, height: 70 }], duration: 15, zoom_level: 1.0 },
      { id: "warden-button", screen: "warden-chat", highlight_areas: [{ x: 70, y: 80, width: 25, height: 15 }], duration: 15, zoom_level: 1.0 },
    ],
    specialFeatures: null,
    upgradeHint: "Ready for more structure? Upgrade to General Population to unlock the full 12-week program, personalized nutrition, faith lessons, and community access.",
    ctaText: "Head to Yard Time and crush your first workout",
  },
  transformation: {
    name: "General Population",
    subtitle: "Intake Processing Complete",
    description: "The full 12-week sentence with structured programming, nutrition, faith, and community.",
    persona: "onboarding", // Uses authoritative prison-themed voice
    features: [
      "The Sentence: Your 12-week structured program - 3 phases of progressive training. Foundation (1-4), Building (5-8), Peak (9-12).",
      "Daily Workouts: 5-6 training days per week with detailed exercise instructions and audio guidance.",
      "Chow Hall: Complete nutrition with personalized meal plans, macros, recipes, and meal swap options.",
      "Lights On / Lights Out: Morning and evening discipline routines to build iron habits every day.",
      "The Chapel: Weekly faith lessons with scripture, teaching, and reflection questions.",
      "The Yard: Community access - connect with fellow inmates, share wins, get support.",
      "Roll Call: Weekly accountability check-ins with weight, wins, and progress tracking.",
      "Time Served: Progress photos and measurements to document your 12-week transformation.",
      "Work Release: Income-generating skills and resume building for life after the program.",
      "Ask the Warden: Your AI guide - tap the shield anytime for questions or motivation.",
    ],
    detailedSteps: [
      { step: "Check out your Cell Block", location: "Dashboard", details: "This is your command center. You got access to everything - training, nutrition, faith, community.", time: "30 sec" },
      { step: "Hit 'Welcome Home' first", location: "Start Here tile", details: "This checklist walks you through your full orientation. Complete each item.", time: "2 min" },
      { step: "Open The Sentence", location: "Program page", details: "This is your 12-week structured program. All 12 weeks laid out with daily workouts.", time: "3 min" },
      { step: "Understand the 3 phases", location: "Program overview", details: "Weeks 1-4 build your foundation. Weeks 5-8 ramp up intensity. Weeks 9-12 are peak performance.", time: "2 min" },
      { step: "Click Week 1 to expand", location: "Week 1 card", details: "See all the daily workouts for your first week. Each day has a specific focus.", time: "1 min" },
      { step: "Start Day 1", location: "Week 1, Day 1", details: "Click the workout, follow the exercises, mark it complete when done.", time: "45 min" },
      { step: "Set up Lights On / Lights Out", location: "Discipline page", details: "Your daily structure. Morning: cold shower, prayer, movement, plan the day. Evening: reflection, gratitude, sleep prep. Tap times to customize your schedule.", time: "3 min" },
      { step: "Open Chow Hall", location: "Nutrition page", details: "Your meal plan for the day. Breakfast, lunch, dinner, snacks - all with macros.", time: "3 min" },
      { step: "Check out meal swaps", location: "Nutrition page", details: "Don't like something? Tap the swap button to trade for an alternative meal.", time: "2 min" },
      { step: "Read your Week 1 faith lesson", location: "Chapel page", details: "Scripture, teaching, and reflection questions. Take 10 minutes to read and pray.", time: "5 min" },
      { step: "Introduce yourself in The Yard", location: "Community page", details: "Post your goals and why you're here. Your brothers are waiting to welcome you.", time: "3 min" },
      { step: "Upload your starting photos", location: "Progress page", details: "Front, side, back photos. Document Day 1 for your transformation comparison.", time: "3 min" },
      { step: "Submit your first Roll Call", location: "Check-in page", details: "Weight, wins, struggles. Do this every week for accountability.", time: "5 min" },
      { step: "Ask the Warden anything", location: "Floating shield button", details: "That gold shield button is your AI Warden. Questions, motivation, guidance - tap it anytime.", time: "1 min" },
    ],
    navigation: [
      { name: "The Sentence", purpose: "Your 12-week structured program", howTo: "Tap The Sentence tile or bottom nav > Select your week > Pick a day > Complete workout" },
      { name: "Chow Hall", purpose: "Complete meal plans with macros and swaps", howTo: "Tap Nutrition tile > See today's meals > Tap any meal for recipe > Use swap button for alternatives" },
      { name: "Lights On / Lights Out", purpose: "Daily morning and evening routines", howTo: "Tap Discipline tile or bottom nav > Check off each step > Edit times by tapping them" },
      { name: "The Chapel", purpose: "Weekly faith lessons and scripture", howTo: "Tap Faith tile > Read this week's lesson > Reflect and pray" },
      { name: "The Yard", purpose: "Community and brotherhood", howTo: "Tap Community tile > Post updates, share wins, connect with inmates" },
      { name: "Roll Call", purpose: "Weekly accountability check-ins", howTo: "Tap Check-In tile > Submit every week with weight, wins, struggles" },
      { name: "Time Served", purpose: "Progress photos and measurements", howTo: "Tap Progress tile > Upload photos > Track your transformation" },
      { name: "Work Release", purpose: "Skills and resume building", howTo: "Tap Skills tile > Explore income strategies and build your resume" },
      { name: "Ask the Warden", purpose: "Your AI guide", howTo: "Tap the gold shield in bottom nav > Ask any question" },
    ],
    screenSlides: [
      { id: "dashboard-home", screen: "dashboard-overview", highlight_areas: [{ x: 15, y: 10, width: 30, height: 25 }], duration: 20, zoom_level: 1.0 },
      { id: "start-here", screen: "start-here-page", highlight_areas: [{ x: 10, y: 20, width: 80, height: 60 }], duration: 15, zoom_level: 1.1 },
      { id: "program-overview", screen: "program-12weeks", highlight_areas: [{ x: 5, y: 5, width: 90, height: 85 }], duration: 30, zoom_level: 1.0 },
      { id: "week1-expanded", screen: "program-week1", highlight_areas: [{ x: 10, y: 20, width: 80, height: 60 }], duration: 25, zoom_level: 1.15 },
      { id: "workout-detail", screen: "workout-detail", highlight_areas: [{ x: 10, y: 15, width: 80, height: 65 }], duration: 20, zoom_level: 1.1 },
      { id: "discipline-page", screen: "discipline-routines", highlight_areas: [{ x: 5, y: 15, width: 45, height: 35 }], duration: 20, zoom_level: 1.1 },
      { id: "chow-hall", screen: "nutrition-plan", highlight_areas: [{ x: 5, y: 10, width: 90, height: 75 }], duration: 25, zoom_level: 1.0 },
      { id: "meal-swap", screen: "meal-swap", highlight_areas: [{ x: 15, y: 20, width: 70, height: 55 }], duration: 15, zoom_level: 1.1 },
      { id: "chapel-lesson", screen: "faith-lesson", highlight_areas: [{ x: 10, y: 15, width: 80, height: 60 }], duration: 20, zoom_level: 1.1 },
      { id: "community-yard", screen: "community-yard", highlight_areas: [{ x: 10, y: 10, width: 80, height: 70 }], duration: 15, zoom_level: 1.0 },
      { id: "progress-page", screen: "progress-tracker", highlight_areas: [{ x: 10, y: 20, width: 35, height: 40 }], duration: 15, zoom_level: 1.0 },
      { id: "checkin-form", screen: "checkin-form", highlight_areas: [{ x: 10, y: 10, width: 80, height: 70 }], duration: 15, zoom_level: 1.0 },
      { id: "warden-button", screen: "warden-chat", highlight_areas: [{ x: 70, y: 80, width: 25, height: 15 }], duration: 10, zoom_level: 1.0 },
    ],
    specialFeatures: "The Yard Community: You ain't in this alone. Post your wins, ask questions, connect with brothers who are on the same journey. Iron sharpens iron.",
    upgradeHint: null,
    ctaText: "Open The Sentence and start Week 1, Day 1 right now",
  },
  coaching: {
    name: "Free World",
    subtitle: "Welcome to Probation",
    description: "Premium 1:1 coaching with direct access to Dom, personalized programming, and VIP support.",
    persona: "po", // Uses P.O. (Parole Officer) professional mentor voice
    features: [
      "Coaching Portal: Book 1:1 video calls with Dom - 30 or 60 minute sessions for personalized guidance.",
      "Direct Line: Private messaging with Dom - he reads and responds personally within 24-48 hours.",
      "Daily Structure: Lights On / Lights Out routines - even though you're out, consistency keeps you free.",
      "Meal Planning: Personalized nutrition adjusted to your TDEE and goals. Dom tweaks it based on feedback.",
      "Your Program: Custom training built specifically for you based on your intake and goals.",
      "Weekly Report: Your check-ins get personal attention and detailed feedback from Dom.",
      "Empire Building: Advanced business strategies, income building, and financial freedom skills.",
      "The Network: Connect with other Free World members - share experiences, build relationships.",
      "All Gen Pop Features: 12-week structure, faith lessons, community - everything from the full program.",
      "Ask Your P.O.: Your AI assistant - tap the shield button to ask questions or get guidance anytime.",
    ],
    detailedSteps: [
      { step: "Check out your home base", location: "Dashboard", details: "You home now. This dashboard shows everything you got access to - and you got VIP access to everything.", time: "30 sec" },
      { step: "Hit 'Welcome Home' first", location: "Start Here tile", details: "This orientation walks you through everything. Complete each item to get fully set up.", time: "2 min" },
      { step: "Open the Coaching Portal", location: "Coaching Portal tile", details: "This is your hub for booking 1:1 calls with Dom. This is what separates Free World from everyone else.", time: "2 min" },
      { step: "Schedule your first call", location: "Book Call section", details: "Pick a time that works. Your first call sets the foundation for everything.", time: "3 min" },
      { step: "Send Dom an intro message", location: "Direct Line tile", details: "Introduce yourself, share your goals, ask questions. He responds personally.", time: "3 min" },
      { step: "Set up Daily Structure", location: "Daily Structure page", details: "Even though you out, you still need discipline. Morning: cold shower, prayer, movement, plan the day. Evening: reflect, gratitude, sleep prep. Tap times to customize your schedule.", time: "3 min" },
      { step: "Review your Meal Planning", location: "Nutrition page", details: "These are adjusted to your TDEE and goals. Dom can tweak them based on your feedback in calls.", time: "3 min" },
      { step: "Check out Your Program", location: "Program page", details: "This is your custom training - built specifically for you, not a template.", time: "3 min" },
      { step: "Explore Empire Building", location: "Advanced Skills page", details: "Business strategies, income building, legitimate hustles. This is Free World exclusive.", time: "5 min" },
      { step: "Connect with The Network", location: "Community page", details: "Other Free World members. Build relationships with people on the same level.", time: "3 min" },
      { step: "Upload your starting photos", location: "Progress Report page", details: "Dom reviews these personally. Be thorough - front, side, back.", time: "3 min" },
      { step: "Submit your Weekly Report", location: "Check-in page", details: "Weight, wins, struggles, questions. Dom reads every one and adjusts your plan.", time: "5 min" },
      { step: "Ask Your P.O. anything", location: "Floating shield button", details: "That gold shield button is your AI P.O. Tap it anytime for quick questions or guidance.", time: "1 min" },
    ],
    navigation: [
      { name: "Coaching Portal", purpose: "Book 1:1 calls with Dom", howTo: "Tap Coaching Portal tile > View available times > Book your session" },
      { name: "Direct Line", purpose: "Private messaging with Dom", howTo: "Tap Direct Line tile > Send a message > Dom responds within 24-48 hours" },
      { name: "Daily Structure", purpose: "Morning and evening discipline routines", howTo: "Tap Daily Structure tile or bottom nav > Check off each step > Edit times by tapping them" },
      { name: "Meal Planning", purpose: "Your personalized nutrition", howTo: "Tap Nutrition tile > See meals adjusted to your TDEE > Give feedback to Dom for tweaks" },
      { name: "Your Program", purpose: "Custom training plan", howTo: "Tap Program tile > See your personalized workouts > Track completion" },
      { name: "Empire Building", purpose: "Advanced business and income skills", howTo: "Tap Advanced Skills tile > Explore strategies for building income" },
      { name: "The Network", purpose: "Free World community", howTo: "Tap Community tile > Connect with other Free World members" },
      { name: "Weekly Report", purpose: "Your accountability check-in", howTo: "Tap Check-In tile > Submit every week > Dom reviews personally" },
      { name: "Ask Your P.O.", purpose: "Your AI assistant", howTo: "Tap the gold shield in bottom nav > Ask any question" },
    ],
    screenSlides: [
      { id: "dashboard-home", screen: "dashboard-overview", highlight_areas: [{ x: 15, y: 10, width: 30, height: 25 }], duration: 20, zoom_level: 1.0 },
      { id: "start-here", screen: "start-here-page", highlight_areas: [{ x: 10, y: 20, width: 80, height: 60 }], duration: 15, zoom_level: 1.1 },
      { id: "coaching-portal", screen: "coaching-portal", highlight_areas: [{ x: 10, y: 15, width: 80, height: 60 }], duration: 30, zoom_level: 1.15 },
      { id: "book-call", screen: "coaching-booking", highlight_areas: [{ x: 20, y: 20, width: 60, height: 50 }], duration: 20, zoom_level: 1.1 },
      { id: "direct-line", screen: "messages-direct", highlight_areas: [{ x: 10, y: 30, width: 80, height: 55 }], duration: 25, zoom_level: 1.1 },
      { id: "discipline-page", screen: "discipline-structure", highlight_areas: [{ x: 5, y: 15, width: 45, height: 35 }], duration: 20, zoom_level: 1.1 },
      { id: "nutrition-plan", screen: "nutrition-custom", highlight_areas: [{ x: 10, y: 15, width: 80, height: 60 }], duration: 20, zoom_level: 1.1 },
      { id: "custom-program", screen: "program-custom", highlight_areas: [{ x: 5, y: 10, width: 90, height: 75 }], duration: 20, zoom_level: 1.0 },
      { id: "entrepreneur-track", screen: "advanced-skills", highlight_areas: [{ x: 10, y: 10, width: 80, height: 70 }], duration: 25, zoom_level: 1.0 },
      { id: "network-community", screen: "community-network", highlight_areas: [{ x: 10, y: 15, width: 80, height: 65 }], duration: 15, zoom_level: 1.0 },
      { id: "weekly-report", screen: "checkin-coaching", highlight_areas: [{ x: 10, y: 10, width: 80, height: 70 }], duration: 15, zoom_level: 1.0 },
      { id: "progress-photos", screen: "progress-photos", highlight_areas: [{ x: 15, y: 25, width: 70, height: 50 }], duration: 15, zoom_level: 1.0 },
      { id: "po-button", screen: "po-chat", highlight_areas: [{ x: 70, y: 80, width: 25, height: 15 }], duration: 10, zoom_level: 1.0 },
    ],
    specialFeatures: "Personal Access: Unlike other tiers, Dom personally reviews your check-ins, adjusts your program, and responds to your messages. You got direct access to your P.O. - use it. Book calls, send messages, ask questions. That's what you're paying for.",
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
