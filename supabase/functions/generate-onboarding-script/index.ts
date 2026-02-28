import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://domdifferent.com",
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
// CRITICAL: Each tier must have COMPLETELY DISTINCT features, terminology, and narrative
const TIER_CONFIGS: Record<string, TierConfig> = {
  membership: {
    name: "Solitary Confinement",
    subtitle: "Cell Block Orientation",
    description: "You're in ISOLATION. Stripped down to the basics. Bodyweight-only training, daily discipline, basic nutrition. This is where you prove yourself before earning more access.",
    persona: "onboarding", // Uses authoritative but encouraging voice
    features: [
      "IRON PILE - Your ONLY workout access: 4 bodyweight templates (Push, Pull, Legs, Full Body). No equipment, no gym - just you and the cell floor. This is your gym now.",
      "LIGHTS ON ROUTINE - Your morning structure: Wake up, cold shower, prayer, movement, plan the day. Check off each step. No excuses.",
      "LIGHTS OUT ROUTINE - Your evening lockdown: Reflection, gratitude journaling, sleep prep. Every night, same routine. Discipline builds discipline.",
      "ROLL CALL - Weekly accountability: Report your weight, wins, and struggles. This is how I track if you're putting in work or faking it.",
      "TIME SERVED - Progress documentation: Front, side, back photos. Document your transformation from Day 1. You'll need the proof later.",
      "BASIC RATIONS - Simple nutrition: Fixed meal templates for bulking, cutting, or maintenance. Nothing fancy - just fuel.",
      "ASK THE WARDEN - Your AI guide: That gold shield button is your only lifeline. Questions, motivation, guidance - tap it anytime.",
      "⛔ LOCKED: The Chapel (faith lessons) - You gotta earn this. Upgrade to Gen Pop.",
      "⛔ LOCKED: The Yard (community) - No community access in Solitary. That's the point.",
      "⛔ LOCKED: The Sentence (12-week program) - You don't get structure until you prove yourself.",
      "⛔ LOCKED: Chow Hall (personalized nutrition) - Basic Rations only. No swaps, no custom meals.",
      "⛔ LOCKED: Work Release (skills) - No income building access until you level up.",
    ],
    detailedSteps: [
      { step: "Check out your Cell Block", location: "Dashboard", details: "This is your cell. These tiles show what you GOT and what you DON'T. You're in isolation, so it's stripped down.", time: "30 sec" },
      { step: "Hit 'Intake Processing' first", location: "Intake Processing tile", details: "See that tile that says 'Intake Processing'? That's your Week 0 orientation. Complete every item on that checklist or you're already slipping.", time: "2 min" },
      { step: "Set up Lights On / Lights Out", location: "Discipline page", details: "Your daily structure. Morning routine, evening routine. Tap the times to set them to YOUR schedule. This is non-negotiable.", time: "3 min" },
      { step: "Customize your routine times", location: "Discipline page", details: "Tap on any time like '5:30 AM' to change it. Match it to when you actually wake up.", time: "1 min" },
      { step: "Browse Iron Pile workouts", location: "Workouts page", details: "4 templates. That's it. Push, Pull, Legs, Full Body. All bodyweight. No gym needed. No excuses accepted.", time: "3 min" },
      { step: "Click any workout to see exercises", location: "Workout card", details: "Each exercise has reps, sets, form tips. Audio guidance if you need it. Execute.", time: "2 min" },
      { step: "Complete your first workout", location: "Workout detail", details: "Follow the exercises, mark it done. Your first day serving time.", time: "30 min" },
      { step: "Go to Time Served", location: "Progress page", details: "This is where you document the transformation. Photos don't lie.", time: "1 min" },
      { step: "Upload starting photos", location: "Progress photos", details: "Front, side, back. This is Day 1. You'll compare this to Week 12. Don't skip it.", time: "3 min" },
      { step: "Submit your first Roll Call", location: "Check-in page", details: "Weight, wins, struggles. Do this every week. This is how you stay accountable.", time: "5 min" },
      { step: "Ask the Warden anything", location: "Floating shield button", details: "That gold shield? That's the Warden. Your AI guide. Questions, motivation - tap it.", time: "1 min" },
    ],
    navigation: [
      { name: "Iron Pile", purpose: "Your 4 bodyweight-only workouts (Push, Pull, Legs, Full Body)", howTo: "Tap Iron Pile tile > Pick a workout > Complete exercises > Mark done" },
      { name: "Lights On / Lights Out", purpose: "Daily discipline routines - morning and evening", howTo: "Tap Discipline tile > Check off each step > Tap times to customize schedule" },
      { name: "Roll Call", purpose: "Weekly check-ins", howTo: "Tap Roll Call tile > Submit weight, wins, struggles every week" },
      { name: "Time Served", purpose: "Progress photos", howTo: "Tap Progress tile > Upload front/side/back photos" },
      { name: "Basic Rations", purpose: "Fixed meal templates", howTo: "Tap Nutrition tile > See your simple meal guidance" },
      { name: "Ask the Warden", purpose: "AI guide", howTo: "Tap gold shield button > Ask questions anytime" },
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
    specialFeatures: "SOLITARY REALITY: You're isolated for a reason. You got the basics - the Iron Pile workout templates, discipline routines, basic nutrition. That's it. No community, no structured program, no faith lessons. Prove you can handle this and you can move to General Population where the real transformation begins.",
    upgradeHint: "Ready to get out of isolation? Upgrade to GENERAL POPULATION to unlock: The Sentence (12-week program), Chow Hall (personalized nutrition), The Chapel (faith lessons), The Yard (community), and Work Release (skills). That's where the full transformation happens.",
    ctaText: "Get to the Iron Pile and complete your first workout. Prove you belong here.",
  },
  transformation: {
    name: "General Population",
    subtitle: "Intake Processing Complete",
    description: "You made it out of Solitary. Now you're in GENERAL POPULATION - the FULL 12-week transformation program. You got access to everything: structured training, complete nutrition, faith lessons, community. This is where real transformation happens.",
    persona: "onboarding", // Uses authoritative prison-themed voice
    features: [
      "THE SENTENCE - Your 12-week structured program: 3 phases of progressive training. Weeks 1-4 Foundation (build the base). Weeks 5-8 Building (ramp up intensity). Weeks 9-12 Peak (maximum performance). This is YOUR path.",
      "DAILY WORKOUTS - 5-6 training days per week: Full equipment access. Detailed exercise instructions with video demos. Audio guidance. Real training, not templates.",
      "CHOW HALL - Complete personalized nutrition: Meal plans built for YOUR goals and body. Breakfast, lunch, dinner, snacks - all with macros. MEAL SWAPS when you don't like something. No more Basic Rations.",
      "LIGHTS ON / LIGHTS OUT - Daily discipline routines: Morning structure (cold shower, prayer, movement, plan). Evening lockdown (reflection, gratitude, sleep prep). Customize times to your schedule.",
      "THE CHAPEL - Weekly faith lessons: Scripture, teaching, reflection questions. This ain't just physical - we're building your spirit too. 12 weeks of lessons that align with your training phases.",
      "THE YARD - Community access UNLOCKED: Connect with your people. Share wins. Ask questions. Get support. Iron sharpens iron - you got a team now.",
      "ROLL CALL - Weekly accountability check-ins: Weight, measurements, wins, struggles. Report every week. Stay accountable.",
      "TIME SERVED - Progress tracking: Photos (front, side, back) and measurements. Document Week 1 to Week 12. Watch the transformation happen.",
      "WORK RELEASE - Skills building: Resume builder, interview prep, job search tools. Prepare for life after the program.",
      "ASK THE WARDEN - Your AI guide: That gold shield button. Questions, motivation, form checks - tap anytime.",
    ],
    detailedSteps: [
      { step: "Check out your Cell Block", location: "Dashboard", details: "This is Gen Pop. Full access. Training, nutrition, faith, community - all unlocked.", time: "30 sec" },
      { step: "Hit 'Intake Processing' first", location: "Intake Processing tile", details: "See that 'Intake Processing' tile? That's your Week 0 orientation. Complete every item on that checklist. Get fully set up.", time: "2 min" },
      { step: "Open THE SENTENCE", location: "Program page", details: "This is your 12-week structured program. Not templates - a REAL progressive program.", time: "3 min" },
      { step: "Understand the 3 phases", location: "Program overview", details: "Foundation (1-4) builds your base. Building (5-8) ramps intensity. Peak (9-12) is maximum performance. Trust the process.", time: "2 min" },
      { step: "Expand Week 1", location: "Week 1 card", details: "See every daily workout for Week 1. Each day has a specific focus. Follow the order.", time: "1 min" },
      { step: "Start Day 1", location: "Week 1, Day 1", details: "Click the workout. Follow every exercise. Mark complete when done. Day 1 of your sentence starts NOW.", time: "45 min" },
      { step: "Set up Lights On / Lights Out", location: "Discipline page", details: "Morning and evening discipline. Tap the times to match YOUR schedule. This is daily non-negotiable.", time: "3 min" },
      { step: "Open CHOW HALL", location: "Nutrition page", details: "Your personalized meal plan. Breakfast, lunch, dinner, snacks. Macros calculated for YOU.", time: "3 min" },
      { step: "Try a meal swap", location: "Nutrition page", details: "Don't like something? Tap the swap button. Trade for alternatives. You got options now.", time: "2 min" },
      { step: "Read Week 1 Chapel lesson", location: "Chapel page", details: "Faith lessons align with your training phase. Scripture, teaching, reflection. 10 minutes.", time: "5 min" },
      { step: "Introduce yourself in The Yard", location: "Community page", details: "Post your goals. Share why you're here. Your people are waiting. Iron sharpens iron.", time: "3 min" },
      { step: "Upload Day 1 photos", location: "Progress page", details: "Front, side, back. This is your starting point. You'll compare Week 12 to this.", time: "3 min" },
      { step: "Submit first Roll Call", location: "Check-in page", details: "Weight, wins, struggles. Every week. Stay accountable.", time: "5 min" },
      { step: "Ask the Warden", location: "Floating shield button", details: "Gold shield button. Your AI guide. Questions, motivation - tap it anytime.", time: "1 min" },
    ],
    navigation: [
      { name: "The Sentence", purpose: "Your complete 12-week structured program", howTo: "Tap The Sentence tile > Select week > Pick day > Complete workout" },
      { name: "Chow Hall", purpose: "Personalized nutrition with meal swaps", howTo: "Tap Nutrition tile > See today's meals > Tap meal for recipe > Swap button for alternatives" },
      { name: "Lights On / Lights Out", purpose: "Daily discipline routines", howTo: "Tap Discipline tile > Check off steps > Tap times to customize" },
      { name: "The Chapel", purpose: "Weekly faith lessons aligned to program phases", howTo: "Tap Faith tile > Read this week's lesson > Reflect and pray" },
      { name: "The Yard", purpose: "Community - your people in the program", howTo: "Tap Community tile > Post, share wins, connect" },
      { name: "Roll Call", purpose: "Weekly accountability", howTo: "Tap Check-In tile > Submit weight, wins, struggles every week" },
      { name: "Time Served", purpose: "Progress photos and measurements", howTo: "Tap Progress tile > Upload photos > Track transformation" },
      { name: "Work Release", purpose: "Skills for after the program", howTo: "Tap Skills tile > Resume builder, interview prep" },
      { name: "Ask the Warden", purpose: "AI guide", howTo: "Tap gold shield button > Ask anything" },
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
    specialFeatures: "THE YARD COMMUNITY: You got a team now. Post your wins. Ask questions when you're struggling. Share what's working. Iron sharpens iron - this is where accountability lives. You ain't alone in Gen Pop.",
    upgradeHint: null,
    ctaText: "Open The Sentence and start Week 1, Day 1. Your 12-week transformation begins NOW.",
  },
  coaching: {
    name: "Free World",
    subtitle: "Welcome to Probation",
    description: "You're OUT. You did your time. Now you're in the FREE WORLD - premium 1:1 coaching with DIRECT access to Coach Dom. Personal calls, private messaging, custom programming. This is VIP. This is how you stay free.",
    persona: "po", // Uses P.O. (Parole Officer) professional mentor voice
    features: [
      "COACHING PORTAL - Book 1:1 video calls with Dom: 30 or 60 minute sessions. Face to face. Personal guidance. This is what separates Free World from everyone else.",
      "DIRECT LINE - Private messaging with Dom: Send messages anytime. He reads and responds PERSONALLY within 24-48 hours. Not AI. Not support. Dom himself.",
      "CUSTOM PROGRAM - Training built for YOU: Based on your intake, your goals, your equipment. Not a template. Dom builds this specifically for your situation.",
      "MEAL PLANNING - Personalized nutrition: Adjusted to YOUR TDEE and goals. Dom tweaks based on your feedback during calls. Real customization.",
      "DAILY STRUCTURE - Even though you're out, discipline keeps you free: Morning routine (cold shower, prayer, movement, plan). Evening lockdown (reflection, gratitude, prep). Tap times to customize.",
      "WEEKLY REPORT - Dom personally reviews: Your check-ins get actual attention. He reads your weight, wins, struggles - and adjusts your plan based on what you report.",
      "EMPIRE BUILDING - FREE WORLD EXCLUSIVE: Advanced business strategies, income building, financial freedom. This is how you build after you're out. Not available to inmates.",
      "THE NETWORK - Free World community: Connect with other coaching clients. People on YOUR level. Build relationships that matter.",
      "ALL GEN POP ACCESS - Everything from The Sentence: 12-week structure, faith lessons, full community. You get EVERYTHING plus the VIP features.",
      "ASK YOUR P.O. - Your AI assistant: Gold shield button. Quick questions when Dom's not available. Guidance anytime.",
    ],
    detailedSteps: [
      { step: "Check out your home base", location: "Dashboard", details: "You're home now. Free World. This dashboard shows VIP access to everything - coaching, custom program, direct messaging, all of it.", time: "30 sec" },
      { step: "Hit 'Welcome Home' first", location: "Start Here tile", details: "Complete this orientation. Get fully set up before your first call with Dom.", time: "2 min" },
      { step: "Open the COACHING PORTAL", location: "Coaching Portal tile", details: "This is the crown jewel. This is why you're Free World. Book calls with Dom directly.", time: "2 min" },
      { step: "Schedule your first call", location: "Book Call section", details: "Pick a time that works. This first call sets the foundation. Come prepared with your goals.", time: "3 min" },
      { step: "Send Dom an intro message", location: "Direct Line tile", details: "This is private. Introduce yourself. Share your story. Ask questions. He responds personally.", time: "3 min" },
      { step: "Set up Daily Structure", location: "Daily Structure page", details: "Just because you're out doesn't mean discipline stops. Morning and evening routines. Tap times to customize.", time: "3 min" },
      { step: "Review your Meal Planning", location: "Nutrition page", details: "Personalized to YOUR TDEE and goals. Dom can tweak during your calls based on feedback.", time: "3 min" },
      { step: "Check Your Custom Program", location: "Program page", details: "This is YOUR training - not The Sentence, not templates. Built specifically for you.", time: "3 min" },
      { step: "Explore EMPIRE BUILDING", location: "Advanced Skills page", details: "Free World exclusive. Business strategies, income building, financial freedom. Build your empire.", time: "5 min" },
      { step: "Connect with The Network", location: "Community page", details: "Other Free World members. Your level. Build relationships with people who made it out.", time: "3 min" },
      { step: "Upload starting photos", location: "Progress Report page", details: "Dom reviews these personally. Front, side, back. He uses these to track your progress.", time: "3 min" },
      { step: "Submit first Weekly Report", location: "Check-in page", details: "Weight, wins, struggles, questions. Dom reads every one. He adjusts your program based on this.", time: "5 min" },
      { step: "Ask Your P.O.", location: "Floating shield button", details: "Gold shield button. Your AI P.O. for quick questions when Dom's busy.", time: "1 min" },
    ],
    navigation: [
      { name: "Coaching Portal", purpose: "Book 1:1 video calls with Dom personally", howTo: "Tap Coaching Portal tile > View available times > Book session" },
      { name: "Direct Line", purpose: "Private messaging - Dom responds personally", howTo: "Tap Direct Line tile > Send message > Response within 24-48 hours" },
      { name: "Custom Program", purpose: "Training built specifically for YOU", howTo: "Tap Program tile > See your personalized workouts" },
      { name: "Meal Planning", purpose: "Personalized nutrition Dom can adjust", howTo: "Tap Nutrition tile > Review your custom plan > Give feedback in calls" },
      { name: "Daily Structure", purpose: "Morning/evening discipline routines", howTo: "Tap Daily Structure tile > Check off steps > Tap times to customize" },
      { name: "Empire Building", purpose: "Free World exclusive business strategies", howTo: "Tap Advanced Skills tile > Access income building strategies" },
      { name: "The Network", purpose: "Free World community", howTo: "Tap Community tile > Connect with other coaching clients" },
      { name: "Weekly Report", purpose: "Check-ins Dom personally reviews", howTo: "Tap Check-In tile > Submit every week > Dom adjusts program" },
      { name: "Ask Your P.O.", purpose: "AI assistant for quick questions", howTo: "Tap gold shield button > Ask anything" },
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
    specialFeatures: "VIP ACCESS: Dom personally reviews your check-ins. Dom personally adjusts your program. Dom personally responds to your messages. You got DIRECT ACCESS to your P.O. - not AI, not support, Dom himself. Book calls. Send messages. Ask questions. This is what Free World is about.",
    upgradeHint: null,
    ctaText: "Open the Coaching Portal and book your first 1:1 call with Dom. This is what you paid for.",
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
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build persona-aware prompt - Hood P.O. voice with DISTINCT tier identity
    const tierIdentity = tier_key === "membership" 
      ? `=== SOLITARY CONFINEMENT IDENTITY ===
This person is in ISOLATION - the entry-level tier. They have LIMITED access.
- They're LOCKED OUT of: The Chapel, The Yard, The Sentence, Chow Hall personalization, Work Release
- They ONLY have: Yard Time (4 bodyweight workouts), Basic Rations, Discipline routines, Roll Call, Progress photos
- NARRATIVE: They're proving themselves before earning more access. Stripped down to basics.
- TERMINOLOGY: "Cell Block", "Intake Processing" (NOT "Welcome Home"), "Yard Time", "Basic Rations", "Time Served", "Roll Call", "Ask the Warden"
- IMPORTANT: The orientation tile is called "INTAKE PROCESSING" for Solitary - NOT "Welcome Home". Use that exact name.
- TONE: Acknowledge their limitations but emphasize they're building foundation. Tease what they could unlock.
- CRITICAL: Mention locked features and upgrade path at the end`
      : tier_key === "transformation"
      ? `=== GENERAL POPULATION IDENTITY ===
This person is in GEN POP - the FULL 12-week transformation program. They have FULL access.
- They have UNLOCKED: The Sentence (12-week program), Chow Hall (personalized nutrition), The Chapel (faith), The Yard (community), Work Release (skills)
- This is the CORE experience - structured progression, community, complete transformation
- NARRATIVE: They're doing their sentence with everything they need. Full access to the yard, the chapel, the program.
- TERMINOLOGY: "The Sentence", "Intake Processing" (NOT "Welcome Home"), "Chow Hall", "The Chapel", "The Yard", "Roll Call", "Time Served", "Work Release", "Ask the Warden"
- IMPORTANT: The orientation tile is called "INTAKE PROCESSING" for Gen Pop - NOT "Welcome Home". Use that exact name.
- TONE: Emphasize the STRUCTURE of the 12-week program. Foundation → Building → Peak. Community support.
- CRITICAL: Highlight the 3-phase program structure and community aspect`
      : `=== FREE WORLD IDENTITY ===
This person is FREE - the VIP coaching tier. They're OUT of the system, on probation.
- They have VIP ACCESS: Coaching Portal (1:1 calls with Dom), Direct Line (personal messaging), Custom Program, Empire Building
- They get EVERYTHING from Gen Pop PLUS personal attention from Coach Dom
- NARRATIVE: They made it out. Now they're building their empire with personal guidance.
- TERMINOLOGY: "Your P.O." (not Warden), "Welcome Home" (ONLY Free World uses this - it's their orientation tile), "Daily Structure", "Meal Planning", "Coaching Portal", "Direct Line", "Empire Building", "The Network"
- IMPORTANT: The orientation tile is called "WELCOME HOME" for Free World - ONLY this tier uses that name. Others use "Intake Processing".
- TONE: Professional mentorship. They paid for VIP - emphasize the PERSONAL access to Dom.
- CRITICAL: The Coaching Portal and Direct Line are the crown jewels. Book that first call.`;

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

${tierIdentity}`;

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
3. SMART PAUSES FOR SCREEN RECORDING SYNC - THIS IS CRITICAL:
   The audio will be overlaid on a screen recording. You MUST include pauses to give time for demonstrating actions on screen.
   
   PAUSE SYNTAX:
   - SHORT pause "..." (1-2 sec): After pointing to something, natural breath, quick visual reference
   - MEDIUM pause "... ..." (3-4 sec): After saying "click here", "tap this", "look at this" - gives time to show the click
   - LONG pause "... ... ..." (6-8 sec): When navigating to a NEW PAGE or demonstrating a multi-step action
   
   WHEN TO PAUSE (required for screen recording sync):
   - AFTER saying "click", "tap", "open", "go to" - pause to show the action happening
   - AFTER pointing to a UI element - pause to let viewer see it highlighted
   - BEFORE transitioning to a new screen/page - pause for navigation animation
   - AFTER demonstrating a completed action - pause to show the result
   - When moving between major sections - longer pause for page transition
   
   EXAMPLES FOR SCREEN RECORDING:
   - "Click on that Yard Time tile right there. ... ... See how it opens up? ... These are your four workout templates."
   - "Tap that Discipline tile. ... ... ... Now you're on your daily routine page. ... Look at those morning habits."
   - "Go ahead and open the Progress section. ... ... ... This where you upload your photos."
   - "See that gold shield button? ... That's your Warden. Tap it whenever you need help. ... ..."
   
   BAD (no pauses for demo):
   - "Click Yard Time and you'll see your workouts and then click one to see exercises" (no time to show actions)
   
   GOOD (pauses for each action):
   - "Click Yard Time. ... ... Now you see your four workouts. ... Pick one - let's say Push Day. ... ... See all those exercises? That's your workout right there."

4. STRUCTURE: 
   - Hood intro / what's up (15-20 sec)
   - Dashboard quick overview with pauses to point things out (30-45 sec)  
   - Feature-by-feature breakdown with GENEROUS pauses for demonstrations (2-3 min)
   - How to get around / navigation with action pauses (30-45 sec)
   - What to do next (20-30 sec)
   - Strong closing / call-to-action (15 sec)
5. LANGUAGE: Keep it real. Street talk but clear. Natural sentence length - not choppy.
6. PERSONALIZATION: Use "you" and "your" - make it personal, like you talking to your boy
7. FLOW: Sound like a real person explaining. Pauses should feel natural, not forced.
8. ASSUME SCREEN RECORDING: Write as if you're narrating a video where someone is clicking through the app.
   Say things like "See that right there?", "Click on this one", "Watch what happens when you tap this"
9. NO SECTION ANNOUNCEMENTS - CRITICAL:
   - DO NOT say things like "Now let's talk about X" or "Next is your Y" or "Let's look at Z" or "Moving on to..."
   - BAD: "Now, let's look at your nutrition section. Your nutrition is..."
   - GOOD: "Your nutrition, man, don't sleep on this. ... This is where..."
   - BAD: "Next up, we have the Discipline page. On this page..."
   - GOOD: "Every morning, you gotta get up and handle your business. ... ... That's what Discipline is about..."
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

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        system: "You are an expert script writer for fitness coaching onboarding videos. Output only valid JSON with comprehensive, detailed content.",
        messages: [
          { role: "user", content: prompt },
        ],
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Script generation error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate script", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response structure:", JSON.stringify(data).substring(0, 500));
    
    const content = data.content?.[0]?.text;

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

    // Calculate duration from script if AI didn't provide it or returned invalid value
    let estimatedDuration = scriptData.estimated_duration_seconds;
    
    if (!estimatedDuration || estimatedDuration < 60) {
      // Estimate duration: ~2.5 words per second (150 words per minute)
      // Also count pauses: "..." = 1.5 sec, "... ..." = 3.5 sec, "... ... ..." = 7 sec
      const scriptText = scriptData.script_text || "";
      const wordCount = scriptText.split(/\s+/).filter((w: string) => w.length > 0 && !w.match(/^\.+$/)).length;
      const shortPauses = (scriptText.match(/\.\.\.(?!\s*\.)/g) || []).length; // Single "..."
      const mediumPauses = (scriptText.match(/\.\.\.\s+\.\.\./g) || []).length; // "... ..."
      const longPauses = (scriptText.match(/\.\.\.\s+\.\.\.\s+\.\.\./g) || []).length; // "... ... ..."
      
      const speechDuration = wordCount / 2.5; // ~2.5 words per second
      const pauseDuration = (shortPauses * 1.5) + (mediumPauses * 3.5) + (longPauses * 7);
      
      estimatedDuration = Math.round(speechDuration + pauseDuration);
      console.log(`Calculated duration: ${wordCount} words + pauses = ${estimatedDuration} seconds`);
    }

    // Ensure minimum reasonable duration
    if (estimatedDuration < 120) {
      console.warn("Script duration too short, got:", estimatedDuration, "seconds - setting to minimum 180");
      estimatedDuration = 180;
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
          duration_seconds: estimatedDuration,
          status: "generating_audio",
        })
        .eq("id", video_id);
    }

    // Return the corrected duration in the response
    scriptData.estimated_duration_seconds = estimatedDuration;
    console.log("Detailed script generated successfully, duration:", estimatedDuration, "seconds");

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
