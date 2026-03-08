import { useState, useCallback } from "react";
import {
  Dumbbell,
  Car,
  Home,
  TreePine,
  Briefcase,
  Church,
  Flame,
  Heart,
  GraduationCap,
  Shield,
  Smile,
  Timer,
  Clock,
  Coffee,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Video,
  Copy,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────

type Location = "gym" | "car" | "home" | "outside" | "client" | "church";
type Energy = "fired_up" | "grateful" | "teaching" | "raw" | "funny";
type TimeAvailable = "under_30s" | "1_2_min" | "got_time";

interface ContentRec {
  hook: string;
  format: "Reel" | "Story" | "Carousel";
  talkingPoints: string[];
  cta: string;
  filmingTip: string;
}

// ── Wizard Options ─────────────────────────────────────────────────────

const LOCATIONS: { value: Location; label: string; icon: any; color: string }[] = [
  { value: "gym", label: "At the gym", icon: Dumbbell, color: "text-red-400 border-red-500/40 bg-red-500/10" },
  { value: "car", label: "In the car", icon: Car, color: "text-blue-400 border-blue-500/40 bg-blue-500/10" },
  { value: "home", label: "At home / kitchen", icon: Home, color: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
  { value: "outside", label: "Outside walking", icon: TreePine, color: "text-green-400 border-green-500/40 bg-green-500/10" },
  { value: "client", label: "With a client", icon: Briefcase, color: "text-purple-400 border-purple-500/40 bg-purple-500/10" },
  { value: "church", label: "At church / praying", icon: Church, color: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10" },
];

const ENERGIES: { value: Energy; label: string; icon: any; color: string }[] = [
  { value: "fired_up", label: "Fired up / aggressive", icon: Flame, color: "text-orange-400 border-orange-500/40 bg-orange-500/10" },
  { value: "grateful", label: "Grateful / reflective", icon: Heart, color: "text-pink-400 border-pink-500/40 bg-pink-500/10" },
  { value: "teaching", label: "Teaching mode", icon: GraduationCap, color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10" },
  { value: "raw", label: "Raw / honest", icon: Shield, color: "text-red-400 border-red-500/40 bg-red-500/10" },
  { value: "funny", label: "Funny / playful", icon: Smile, color: "text-green-400 border-green-500/40 bg-green-500/10" },
];

const TIMES: { value: TimeAvailable; label: string; icon: any; color: string }[] = [
  { value: "under_30s", label: "Under 30 seconds", icon: Timer, color: "text-red-400 border-red-500/40 bg-red-500/10" },
  { value: "1_2_min", label: "1-2 minutes", icon: Clock, color: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
  { value: "got_time", label: "Got time (3+ min)", icon: Coffee, color: "text-green-400 border-green-500/40 bg-green-500/10" },
];

// ── Content Matrix ─────────────────────────────────────────────────────

const CONTENT_MAP: Record<string, ContentRec[]> = {
  // ===== GYM =====
  "gym|fired_up|under_30s": [
    {
      hook: "Everyone's sleeping and I'm in here earning my freedom.",
      format: "Reel",
      talkingPoints: ["Show the weights or the machine", "Show your face, sweat and all", "No caption needed, the visual speaks"],
      cta: "Tag someone who needs to wake up.",
      filmingTip: "Quick pan from weights to your face. Raw energy. No filter.",
    },
    {
      hook: "They gave me 7 years. I gave myself a lifetime of discipline.",
      format: "Reel",
      talkingPoints: ["Quick clip of you mid-set", "Hard breathing, real effort", "Let the intensity sell it"],
      cta: "Double tap if you earned your morning.",
      filmingTip: "Film during the hardest part of the set. The struggle is the content.",
    },
  ],
  "gym|fired_up|1_2_min": [
    {
      hook: "You wanna know what prison really taught me? How to suffer on purpose.",
      format: "Reel",
      talkingPoints: ["Talk between sets", "Explain how discomfort in the gym mirrors discomfort in a cell", "The difference is: now you CHOOSE it"],
      cta: "Save this for when you wanna quit.",
      filmingTip: "Prop phone on a bench. Talk directly into it like you're coaching someone.",
    },
  ],
  "gym|fired_up|got_time": [
    {
      hook: "Let me show you the workout that kept me sane behind bars.",
      format: "Reel",
      talkingPoints: ["Show 3-4 exercises you did in prison", "Explain the mental game behind each one", "Connect it to business discipline"],
      cta: "Follow for the full prison workout series. Link in bio for the app.",
      filmingTip: "Film each exercise as a separate clip. Voiceover ties them together.",
    },
  ],
  "gym|grateful|under_30s": [
    {
      hook: "A year ago I couldn't even walk into a gym without looking over my shoulder.",
      format: "Story",
      talkingPoints: ["Quick selfie or mirror shot", "One line of gratitude", "Keep it real, keep it short"],
      cta: "What are you grateful for today?",
      filmingTip: "Mirror selfie, post-set. Let the sweat tell the story.",
    },
  ],
  "gym|grateful|1_2_min": [
    {
      hook: "I used to do push-ups on a concrete floor. Now look where I am.",
      format: "Reel",
      talkingPoints: ["Show the gym around you", "Talk about the contrast between then and now", "Name one specific thing you're grateful for"],
      cta: "Drop what you're grateful for below. I read every one.",
      filmingTip: "Start on the floor (push-up position), then stand up and show the gym. Metaphor in motion.",
    },
  ],
  "gym|grateful|got_time": [
    {
      hook: "Let me tell you about the day I realized freedom isn't free.",
      format: "Reel",
      talkingPoints: ["Tell a specific story from your first gym session after release", "What it felt like to choose your own workout", "How that freedom extends to everything now"],
      cta: "If this hit you, share it with someone who needs to hear it.",
      filmingTip: "Sit on a bench, camera at eye level. Storytelling mode. Let it breathe.",
    },
  ],
  "gym|teaching|under_30s": [
    {
      hook: "One thing nobody tells you about getting in shape after prison.",
      format: "Reel",
      talkingPoints: ["Drop one surprising fitness insight", "Make it punchy and specific", "Leave them wanting more"],
      cta: "Follow for more. I drop these daily.",
      filmingTip: "Close-up on your face. Intense eye contact. 15 seconds max.",
    },
  ],
  "gym|teaching|1_2_min": [
    {
      hook: "Stop doing this exercise wrong. Here's what I learned the hard way.",
      format: "Reel",
      talkingPoints: ["Pick one common exercise", "Show the wrong way vs right way", "Connect it to a bigger lesson about shortcuts"],
      cta: "Save this. You'll need it. Full programs in the app, link in bio.",
      filmingTip: "Split screen or before/after format. Show, don't just tell.",
    },
  ],
  "gym|teaching|got_time": [
    {
      hook: "The complete guide to training your mind AND your body.",
      format: "Carousel",
      talkingPoints: ["5 slides: mindset tip + exercise pairing", "Each slide has one lesson from prison and one gym application", "End with the transformation"],
      cta: "Save this carousel. It's a whole program. App link in bio.",
      filmingTip: "Film yourself explaining each slide. Post as carousel with voiceover reel.",
    },
  ],
  "gym|raw|under_30s": [
    {
      hook: "I'm not gonna lie. Some days I don't wanna be here either.",
      format: "Reel",
      talkingPoints: ["Quick admission of struggle", "But show that you showed up anyway", "That's the whole point"],
      cta: "Show up anyway. That's the difference.",
      filmingTip: "Film walking into the gym. That first step is the content.",
    },
  ],
  "gym|raw|1_2_min": [
    {
      hook: "Let me tell you about the demons that follow you from a cell to the gym.",
      format: "Reel",
      talkingPoints: ["Talk about intrusive thoughts during workouts", "How lifting became therapy", "The raw truth about mental health after incarceration"],
      cta: "If you're fighting your own demons, you're not alone. Drop a fist emoji below.",
      filmingTip: "Sit somewhere quiet in the gym. Low voice. Real talk energy.",
    },
  ],
  "gym|raw|got_time": [
    {
      hook: "The full story of how I went from prison yard workouts to building a fitness empire.",
      format: "Reel",
      talkingPoints: ["Chronological story: before, during, after", "Specific moments that changed you", "What you're building now and why"],
      cta: "This is just the beginning. Follow the journey. App link in bio.",
      filmingTip: "Multiple locations in the gym. Walking and talking. Let them follow you.",
    },
  ],
  "gym|funny|under_30s": [
    {
      hook: "When someone asks me for gym advice and I gotta decide how much to share.",
      format: "Reel",
      talkingPoints: ["Quick reaction face", "The joke is: your whole life story is intense", "Keep it light but real"],
      cta: "Tag your gym buddy who asks too many questions.",
      filmingTip: "Trending audio + reaction face. Simple and shareable.",
    },
  ],
  "gym|funny|1_2_min": [
    {
      hook: "Things I learned in prison that accidentally made me a better gym bro.",
      format: "Reel",
      talkingPoints: ["List format, slightly comedic delivery", "Patience, reading people, never skipping leg day", "End with something unexpectedly deep"],
      cta: "Which one surprised you? Comment below.",
      filmingTip: "Count on your fingers as you list them. Natural, conversational.",
    },
  ],
  "gym|funny|got_time": [
    {
      hook: "Ranking every gym stereotype and whether they'd survive prison. Let's go.",
      format: "Reel",
      talkingPoints: ["Point at different gym types", "Give each a survival rating", "Keep it funny but give real analysis"],
      cta: "Which one are you? Drop it below. Follow for part 2.",
      filmingTip: "Walk through the gym pointing. Comedic voiceover. Series potential.",
    },
  ],

  // ===== CAR =====
  "car|fired_up|under_30s": [
    {
      hook: "Just left the gym and I got something to say.",
      format: "Reel",
      talkingPoints: ["Look right into the camera", "One hard truth about success", "End it abruptly for impact"],
      cta: "If this made you uncomfortable, good. Follow.",
      filmingTip: "Phone on dashboard mount. Sweating. Intense. No music needed.",
    },
  ],
  "car|fired_up|1_2_min": [
    {
      hook: "I'm sitting in MY car. Do you understand what that means for someone who had nothing?",
      format: "Reel",
      talkingPoints: ["Talk about what ownership means after having everything taken", "The car represents freedom, not flex", "Connect to whatever you're building"],
      cta: "What's your symbol of freedom? Drop it below.",
      filmingTip: "Hands on the steering wheel. Look at camera. Let the emotion come through.",
    },
  ],
  "car|fired_up|got_time": [
    {
      hook: "I'm about to tell you the 3 things that changed everything for me. Buckle up.",
      format: "Reel",
      talkingPoints: ["3 pivotal moments or decisions", "Tell each one like a mini-story", "Build momentum from one to the next"],
      cta: "Save this and come back when you need fire. App link in bio.",
      filmingTip: "Parked car. Close-up. No distractions. Just you and the truth.",
    },
  ],
  "car|grateful|under_30s": [
    {
      hook: "Sitting in my car after that workout and I'm just... grateful, man.",
      format: "Story",
      talkingPoints: ["Quick 15-second thought", "Name one specific thing", "Keep it simple"],
      cta: "What are you grateful for? Drop it.",
      filmingTip: "Selfie cam. Genuine smile or reflection. No performance.",
    },
  ],
  "car|grateful|1_2_min": [
    {
      hook: "I used to sit in a cell with nothing. Now I sit in my car after a workout and I'm grateful for every second.",
      format: "Reel",
      talkingPoints: ["Talk about what you're grateful for specifically", "The small things that used to be impossible", "How gratitude became a discipline, not just a feeling"],
      cta: "What are you grateful for? Drop it below.",
      filmingTip: "Sit back in the seat. Relaxed. Post-workout glow. Talk like you're talking to a friend.",
    },
  ],
  "car|grateful|got_time": [
    {
      hook: "Let me take you through my morning and show you why I'll never take a single day for granted.",
      format: "Reel",
      talkingPoints: ["Walk through your morning routine", "Each step is something you couldn't do before", "End with where you are now, in the car, free"],
      cta: "If this resonated, share it. Someone needs to hear this today.",
      filmingTip: "Vlog style. Start from morning, end in the car. Day-in-the-life feel.",
    },
  ],
  "car|teaching|under_30s": [
    {
      hook: "Quick lesson from the car. Ready?",
      format: "Story",
      talkingPoints: ["One tactical piece of advice", "Something Dom learned the hard way", "Short and punchy"],
      cta: "Tap to see more on my page.",
      filmingTip: "Quick selfie video. Story format is perfect for car tips.",
    },
  ],
  "car|teaching|1_2_min": [
    {
      hook: "I'm gonna give you the same advice I'd give myself 10 years ago. Listen up.",
      format: "Reel",
      talkingPoints: ["3 pieces of advice for your younger self", "Make them specific and actionable", "End with what it looks like when you follow through"],
      cta: "Which one hit hardest? Comment the number.",
      filmingTip: "Parked. Eye level camera. Count them off on your fingers.",
    },
  ],
  "car|teaching|got_time": [
    {
      hook: "Full breakdown: How I rebuilt my entire life from zero. No handouts.",
      format: "Reel",
      talkingPoints: ["Step by step: what you did first, second, third", "The mistakes along the way", "What you'd do differently and what you'd keep the same"],
      cta: "Save this blueprint. App link in bio for the full plan.",
      filmingTip: "Park somewhere with a good background. Take your time. This is a mini-documentary.",
    },
  ],
  "car|raw|under_30s": [
    {
      hook: "Not every day is a good day. Today is one of those days.",
      format: "Story",
      talkingPoints: ["Quick honest check-in", "Don't fake it", "Show that even bad days are part of the process"],
      cta: "If you're having a rough one too, you're not alone.",
      filmingTip: "Raw selfie. No filter. Let the mood speak.",
    },
  ],
  "car|raw|1_2_min": [
    {
      hook: "I gotta be honest with y'all about something.",
      format: "Reel",
      talkingPoints: ["Share something you've been holding back", "Why vulnerability is actually strength", "What you're doing about it"],
      cta: "Real ones understand. Share this with someone who needs it.",
      filmingTip: "Close-up. Low energy is fine. Authenticity over production value.",
    },
  ],
  "car|raw|got_time": [
    {
      hook: "I'm gonna tell you a story I've never told anyone online. This is the real me.",
      format: "Reel",
      talkingPoints: ["A specific story that shaped who you are", "The ugly parts, not just the triumph", "Why you're sharing it now"],
      cta: "If this changed how you see me, good. That's the point. Follow for more truth.",
      filmingTip: "Parked in a quiet spot. Take your time. This is your most important content.",
    },
  ],
  "car|funny|under_30s": [
    {
      hook: "The face I make when someone cuts me off and they don't know my background.",
      format: "Reel",
      talkingPoints: ["Reaction face with trending audio", "Self-deprecating humor about your past", "Keep it light"],
      cta: "Tag someone with road rage worse than mine.",
      filmingTip: "Selfie cam. Exaggerated face. Trending sound. Easy share.",
    },
  ],
  "car|funny|1_2_min": [
    {
      hook: "Things that hit different when you've been locked up. Car edition.",
      format: "Reel",
      talkingPoints: ["Drive-throughs, radio, choosing your own route", "Things people take for granted", "Make it funny but land the point"],
      cta: "What's something you'll never take for granted? Comment below.",
      filmingTip: "Film while parked but act like you're discovering things. Comedic timing is everything.",
    },
  ],
  "car|funny|got_time": [
    {
      hook: "I'm rating every fast food drive-through from the perspective of a formerly incarcerated person.",
      format: "Reel",
      talkingPoints: ["Visit or describe 3-4 places", "Rate them on freedom scale", "End with something unexpectedly meaningful"],
      cta: "Which one should I review next? Drop it below.",
      filmingTip: "Series format. Film at each location. This could run for weeks.",
    },
  ],

  // ===== HOME / KITCHEN =====
  "home|fired_up|under_30s": [
    {
      hook: "4 AM. Kitchen lit. Nobody else is up. That's the difference.",
      format: "Reel",
      talkingPoints: ["Show the kitchen, the discipline", "Quick shot of meal prep or routine", "The visual sells the lifestyle"],
      cta: "Early bird energy. Follow if you're up too.",
      filmingTip: "Dark house, kitchen light. Moody. Show don't tell.",
    },
  ],
  "home|fired_up|1_2_min": [
    {
      hook: "While you're scrolling, I'm building. Let me show you.",
      format: "Reel",
      talkingPoints: ["Show what you're doing at home", "The work nobody sees", "Why discipline at home matters more than the gym"],
      cta: "Stop scrolling and start building. Link in bio.",
      filmingTip: "Walk through the house showing your setup, your prep, your grind.",
    },
  ],
  "home|fired_up|got_time": [
    {
      hook: "Full day-in-the-life. No cuts. No fake productivity. This is real.",
      format: "Reel",
      talkingPoints: ["Morning routine step by step", "Show meal prep, work, everything", "End with what you accomplished"],
      cta: "If you want the blueprint, it's in the app. Link in bio.",
      filmingTip: "Vlog style. Multiple clips throughout the day. Authentic energy.",
    },
  ],
  "home|grateful|under_30s": [
    {
      hook: "Having my own kitchen still hits different.",
      format: "Story",
      talkingPoints: ["Quick shot of food or kitchen", "One line about what this means", "Simple and powerful"],
      cta: "Never take the small things for granted.",
      filmingTip: "Photo or quick video of your plate. Let the food speak.",
    },
  ],
  "home|grateful|1_2_min": [
    {
      hook: "Prison food vs what I'm eating now. Let me show you the glow up.",
      format: "Reel",
      talkingPoints: ["Describe prison food (be specific)", "Show what you're making now", "The real point: you CHOSE this transformation"],
      cta: "What's your glow up? Show me. Comment or DM.",
      filmingTip: "Split the video: describe the old, then pan to the new. Contrast sells.",
    },
  ],
  "home|grateful|got_time": [
    {
      hook: "I'm cooking a full meal and telling you the story of every ingredient I couldn't have for 7 years.",
      format: "Reel",
      talkingPoints: ["Cook while talking", "Each ingredient triggers a memory", "Build to something emotional"],
      cta: "Share this with someone who needs perspective. Full meal plans in the app.",
      filmingTip: "Cooking show format but personal. Phone propped on counter. Let it breathe.",
    },
  ],
  "home|teaching|under_30s": [
    {
      hook: "One meal prep hack that changed my life.",
      format: "Reel",
      talkingPoints: ["One specific tip", "Show it, don't just say it", "Make it actionable"],
      cta: "Save this. You'll need it Sunday night.",
      filmingTip: "Overhead shot of food. Quick cut. Satisfying to watch.",
    },
  ],
  "home|teaching|1_2_min": [
    {
      hook: "How I meal prep for the whole week in under an hour. Full breakdown.",
      format: "Reel",
      talkingPoints: ["Show your actual meal prep process", "Give specific amounts and recipes", "Tie it to discipline and routine"],
      cta: "Full meal plan in the app. Link in bio. Save this for Sunday.",
      filmingTip: "Overhead camera + face camera. Switch between showing food and talking.",
    },
  ],
  "home|teaching|got_time": [
    {
      hook: "Film yourself prepping food. Voice over about prison food vs now. Show the contrast.",
      format: "Carousel",
      talkingPoints: ["Full meal plan breakdown (5 slides)", "Before/after nutrition comparison", "Shopping list and budget"],
      cta: "This is what discipline looks like on a plate. Full meal plan in the app. Link in bio.",
      filmingTip: "Film the whole cook. Edit into a satisfying sequence with voiceover.",
    },
  ],
  "home|raw|under_30s": [
    {
      hook: "This kitchen used to be a cell. Some days it still feels like it.",
      format: "Story",
      talkingPoints: ["Quick, vulnerable moment", "Don't explain too much", "Let people sit with it"],
      cta: "Healing isn't linear. Remember that.",
      filmingTip: "Standing in kitchen, low light. Brief moment of truth.",
    },
  ],
  "home|raw|1_2_min": [
    {
      hook: "Being alone at home hits different when you spent years alone in a cell.",
      format: "Reel",
      talkingPoints: ["Talk about the loneliness of reentry", "How you've learned to be alone without being lonely", "The work you do on yourself at home"],
      cta: "If you're rebuilding, you're not alone. DM me.",
      filmingTip: "Sit at the kitchen table or couch. Close-up. Quiet house energy.",
    },
  ],
  "home|raw|got_time": [
    {
      hook: "I want to walk you through my house and tell you what every room means to me as someone who had nothing.",
      format: "Reel",
      talkingPoints: ["Room by room tour with meaning", "What each space represents compared to prison", "End in your favorite room and why"],
      cta: "Freedom looks different for everyone. This is mine. What's yours?",
      filmingTip: "Slow walk through the house. Thoughtful pace. Let each room have its moment.",
    },
  ],
  "home|funny|under_30s": [
    {
      hook: "When you learn to cook after prison and you think you're Gordon Ramsay.",
      format: "Reel",
      talkingPoints: ["Show a slightly chaotic kitchen moment", "Self-deprecating humor", "Quick laugh"],
      cta: "We've all been there. Tag someone who can't cook.",
      filmingTip: "Film something slightly going wrong. Comedy gold.",
    },
  ],
  "home|funny|1_2_min": [
    {
      hook: "Rating things in my kitchen I couldn't have in prison. This is gonna be emotional... and hilarious.",
      format: "Reel",
      talkingPoints: ["Pick up items one by one", "Rate each on a freedom scale", "Mix genuine emotion with humor"],
      cta: "What would YOU miss most? Comment below.",
      filmingTip: "Hold up each item to camera. React naturally. Series potential.",
    },
  ],
  "home|funny|got_time": [
    {
      hook: "I'm making a full Michelin-star meal with only things I had access to in prison. Challenge accepted.",
      format: "Reel",
      talkingPoints: ["Attempt to cook with limited items", "Commentary on creativity under constraint", "End with taste test and honest reaction"],
      cta: "Should I do a series? Comment what I should cook next.",
      filmingTip: "Full cooking video. Ham it up. This is entertainment meets storytelling.",
    },
  ],

  // ===== OUTSIDE =====
  "outside|fired_up|under_30s": [
    {
      hook: "Fresh air hits different when it was taken from you.",
      format: "Reel",
      talkingPoints: ["Quick shot of your surroundings", "One powerful line", "Walk with purpose"],
      cta: "Go outside. Move your body. That's the prescription.",
      filmingTip: "Film while walking. Motion adds energy. Quick and impactful.",
    },
  ],
  "outside|fired_up|1_2_min": [
    {
      hook: "I walk every single day. Here's why it's the most important thing I do.",
      format: "Reel",
      talkingPoints: ["Walking as meditation and discipline", "What you think about on these walks", "How it clears the noise and focuses the mission"],
      cta: "Try it tomorrow morning. Just 20 minutes. Then DM me what happened.",
      filmingTip: "Walk and talk. Camera in hand. Natural movement.",
    },
  ],
  "outside|fired_up|got_time": [
    {
      hook: "Come walk with me. I got a lot on my mind and I need to get it out.",
      format: "Reel",
      talkingPoints: ["Stream of consciousness about your goals", "What's driving you right now", "The fire behind the discipline"],
      cta: "If this energy is what you need, follow. More every day.",
      filmingTip: "Vlog walk. Multiple stops. Let the environment change as you talk.",
    },
  ],
  "outside|grateful|under_30s": [
    {
      hook: "Sunshine. Fresh air. Freedom. That's it. That's the post.",
      format: "Story",
      talkingPoints: ["Quick nature shot or selfie", "Let the visual do the work", "Minimal words needed"],
      cta: "Go outside today. You need it.",
      filmingTip: "Point camera at the sky, trees, or horizon. One quick shot.",
    },
  ],
  "outside|grateful|1_2_min": [
    {
      hook: "I used to dream about just... walking. No walls. No guards. Just walking.",
      format: "Reel",
      talkingPoints: ["Describe what walking freely means", "A specific prison moment when you dreamed of this", "Now you're living it"],
      cta: "Take a walk today. For real. It'll change your whole mood.",
      filmingTip: "Walking path ahead of you, then flip to face cam. Smooth transition.",
    },
  ],
  "outside|grateful|got_time": [
    {
      hook: "I'm gonna show you every beautiful thing I see on this walk and tell you why each one matters.",
      format: "Reel",
      talkingPoints: ["Point out things people ignore: trees, sounds, people", "Each one connects to freedom and appreciation", "Build to a powerful conclusion"],
      cta: "Open your eyes. Beauty is everywhere. You just forgot to look.",
      filmingTip: "Slow, intentional filming. Show each thing, then your reaction. Meditative pace.",
    },
  ],
  "outside|teaching|under_30s": [
    {
      hook: "Walking is the most underrated business tool. Here's why.",
      format: "Reel",
      talkingPoints: ["One benefit of walking for mental clarity", "Quick and authoritative", "End with a command"],
      cta: "Take a walk before your next big decision. Trust me.",
      filmingTip: "Walk and talk. Confident stride. Under 20 seconds.",
    },
  ],
  "outside|teaching|1_2_min": [
    {
      hook: "3 things I figured out on walks that made me money.",
      format: "Reel",
      talkingPoints: ["Three specific insights or decisions", "How walking helped you think clearly", "Actionable advice they can use"],
      cta: "Save this. Try walking before your next brainstorm. App link in bio.",
      filmingTip: "Stop at three different spots. One insight per location. Visual structure.",
    },
  ],
  "outside|teaching|got_time": [
    {
      hook: "I'm doing a walking masterclass. Come with me for 10 minutes and I'll teach you everything I know about building from nothing.",
      format: "Reel",
      talkingPoints: ["Extended teaching session while walking", "Cover mindset, discipline, money, relationships", "Give real actionable advice, not platitudes"],
      cta: "This is free game. The paid version is in the app. Link in bio.",
      filmingTip: "Long walk, multiple topics. Chapter-style editing. High value content.",
    },
  ],
  "outside|raw|under_30s": [
    {
      hook: "Some days I walk just to prove I can.",
      format: "Story",
      talkingPoints: ["One raw line about freedom", "The weight of incarceration doesn't disappear", "Show, don't tell"],
      cta: "Freedom is a daily choice.",
      filmingTip: "Walking away from camera. Back turned. Powerful visual.",
    },
  ],
  "outside|raw|1_2_min": [
    {
      hook: "I need to talk about something that's been weighing on me.",
      format: "Reel",
      talkingPoints: ["Something real you've been processing", "The difference between surviving and healing", "Where you are in that journey right now"],
      cta: "If you're going through it, keep walking. Literally and figuratively.",
      filmingTip: "Find a bench or quiet spot. Sit and talk. Outside but intimate.",
    },
  ],
  "outside|raw|got_time": [
    {
      hook: "I'm gonna walk to a place that means something to me and tell you the whole story.",
      format: "Reel",
      talkingPoints: ["Walk to a meaningful location", "Tell the story connected to it", "Raw, unfiltered narrative"],
      cta: "Everyone has a place like this. Go there. Face it. That's how you heal.",
      filmingTip: "Journey format. Start walking, arrive, tell the story. Mini-documentary.",
    },
  ],
  "outside|funny|under_30s": [
    {
      hook: "Me pretending to be a normal person on a walk when I spent 7 years behind bars.",
      format: "Reel",
      talkingPoints: ["Funny observations about normal life", "The absurdity of mundane things being special", "Keep it light"],
      cta: "Normal is overrated anyway. Follow for more.",
      filmingTip: "Exaggerated reactions to normal things. Trending audio. Quick laughs.",
    },
  ],
  "outside|funny|1_2_min": [
    {
      hook: "Rating every person I see on this walk based on whether they'd survive prison.",
      format: "Reel",
      talkingPoints: ["(Don't actually show people's faces)", "Describe types of people you see", "Funny ratings but land a real point about toughness"],
      cta: "Be honest, what's YOUR survival rating? Comment 1-10.",
      filmingTip: "Film your surroundings, not faces. Commentary voiceover. Keep it playful.",
    },
  ],
  "outside|funny|got_time": [
    {
      hook: "I'm doing a full nature documentary but it's about my neighborhood. David Attenborough voice and everything.",
      format: "Reel",
      talkingPoints: ["Narrate your walk like a nature doc", "Describe people and places with dramatic flair", "End with something unexpectedly meaningful about community"],
      cta: "Part 2? Drop a yes below. Follow for the series.",
      filmingTip: "Full commitment to the bit. Dramatic narration. This is comedy gold if you commit.",
    },
  ],

  // ===== WITH A CLIENT =====
  "client|fired_up|under_30s": [
    {
      hook: "Just wrapped with a client. THIS is why I do what I do.",
      format: "Story",
      talkingPoints: ["Quick energy check after a session", "No details needed, just the fire", "Show the result without the process"],
      cta: "Ready to change your life? Link in bio.",
      filmingTip: "Post-session selfie. Fired up energy. Quick and authentic.",
    },
  ],
  "client|fired_up|1_2_min": [
    {
      hook: "My client just had a breakthrough and I gotta share this with y'all.",
      format: "Reel",
      talkingPoints: ["Share the win (anonymized)", "What the client overcame", "Why this work matters to you personally"],
      cta: "This could be you. DM me 'ready' and let's talk.",
      filmingTip: "Step outside. Talk into camera with fresh energy from the session.",
    },
  ],
  "client|fired_up|got_time": [
    {
      hook: "Let me break down exactly how I help people transform their lives. No fluff.",
      format: "Reel",
      talkingPoints: ["Your coaching methodology", "Real results from real clients (anonymized)", "The difference between your approach and everyone else's"],
      cta: "Spots are limited. DM 'transform' or check the app. Link in bio.",
      filmingTip: "Professional setting. Structured breakdown. This is a selling video disguised as value.",
    },
  ],
  "client|grateful|under_30s": [
    {
      hook: "Man. I get to do this for a living. Grateful doesn't even cover it.",
      format: "Story",
      talkingPoints: ["Quick gratitude post about your work", "The contrast with where you came from", "Keep it genuine"],
      cta: "Do what you love and it'll never feel like work.",
      filmingTip: "Walking out of the session. Quick selfie. Genuine emotion.",
    },
  ],
  "client|grateful|1_2_min": [
    {
      hook: "From prisoner to someone people trust with their transformation. Let that sink in.",
      format: "Reel",
      talkingPoints: ["The journey from zero credibility to trusted coach", "A specific moment when a client's trust hit you", "Why you'll never take it for granted"],
      cta: "Trust is earned every single day. Follow the journey.",
      filmingTip: "Find a quiet moment after the session. Reflective energy.",
    },
  ],
  "client|grateful|got_time": [
    {
      hook: "I'm gonna tell you about my client's journey without saying their name. It'll change how you see what's possible.",
      format: "Reel",
      talkingPoints: ["Anonymized client transformation story", "Specific challenges they overcame", "Your role and what you learned from them"],
      cta: "Every transformation starts with a decision. Make yours. App link in bio.",
      filmingTip: "Storytelling format. Sit down, take your time. This is testimonial content.",
    },
  ],
  "client|teaching|under_30s": [
    {
      hook: "One thing I tell every single client on day one.",
      format: "Reel",
      talkingPoints: ["Your core philosophy in one line", "Make it memorable and quotable", "Leave them wanting more"],
      cta: "Follow for daily coaching drops.",
      filmingTip: "Direct to camera. Authoritative. Under 15 seconds. Punchy.",
    },
  ],
  "client|teaching|1_2_min": [
    {
      hook: "The 3 biggest mistakes I see clients make. And how to fix them.",
      format: "Reel",
      talkingPoints: ["Three specific, common mistakes", "Quick fix for each one", "Show that you know your stuff"],
      cta: "Save this. Share it with someone who needs it. Full programs in the app.",
      filmingTip: "Professional setting. Count them off. Confident delivery.",
    },
  ],
  "client|teaching|got_time": [
    {
      hook: "I'm giving away my entire coaching framework for free. Here's the 5-step system.",
      format: "Carousel",
      talkingPoints: ["5 steps of your methodology", "Each one gets a detailed explanation", "The difference between free content and paid coaching is implementation"],
      cta: "Free game. Paid results. App link in bio for the full program.",
      filmingTip: "Each step gets its own clip or slide. Structured, professional, high-value.",
    },
  ],
  "client|raw|under_30s": [
    {
      hook: "Some sessions break ME down too. That's the truth.",
      format: "Story",
      talkingPoints: ["Quick admission that coaching is emotional labor", "You feel what your clients feel", "That's what makes you different"],
      cta: "Real coaches carry the weight too.",
      filmingTip: "Post-session. Tired but real. Quick story post.",
    },
  ],
  "client|raw|1_2_min": [
    {
      hook: "Nobody talks about how hard it is to coach people through pain when you're still healing yourself.",
      format: "Reel",
      talkingPoints: ["The duality of being a coach and still being human", "How your own journey makes you better at this", "The moments that test you"],
      cta: "If you coach, mentor, or lead anyone, you feel this. Drop a heart.",
      filmingTip: "Quiet space. Genuine reflection. This is the content that builds deep loyalty.",
    },
  ],
  "client|raw|got_time": [
    {
      hook: "I want to tell you about the hardest session I ever had. No names, just truth.",
      format: "Reel",
      talkingPoints: ["A challenging coaching moment (anonymized)", "What it taught you about yourself", "Why you keep doing this despite the emotional toll"],
      cta: "This is the work. It's not glamorous. But it's the most important thing I do.",
      filmingTip: "Extended storytelling. Let the pauses breathe. This is premium content.",
    },
  ],
  "client|funny|under_30s": [
    {
      hook: "My client when I say 'one more set' for the 5th time.",
      format: "Reel",
      talkingPoints: ["Quick comedic moment about coaching", "Relatable for anyone who's been trained", "Light and shareable"],
      cta: "Tag your trainer who does this.",
      filmingTip: "Reaction face or reenactment. Quick hit. Trending audio helps.",
    },
  ],
  "client|funny|1_2_min": [
    {
      hook: "Types of clients I get. Which one are you?",
      format: "Reel",
      talkingPoints: ["Character impressions of different client types", "Keep it loving, not mocking", "End with 'I love all of them equally'"],
      cta: "Which one are you? Comment below. Be honest.",
      filmingTip: "Act out each type briefly. Quick cuts. Fun energy. Series material.",
    },
  ],
  "client|funny|got_time": [
    {
      hook: "A day in the life of being a coach who's also an ex-con. It's exactly as wild as it sounds.",
      format: "Reel",
      talkingPoints: ["The comedy of your unique position", "Funny interactions (anonymized)", "The juxtaposition of your past and present"],
      cta: "Follow for the daily chaos. It never gets boring.",
      filmingTip: "Vlog style with comedic narration. Show the real day. The humor is in the truth.",
    },
  ],

  // ===== CHURCH / PRAYING =====
  "church|fired_up|under_30s": [
    {
      hook: "God didn't bring me through 7 years to let me be average.",
      format: "Reel",
      talkingPoints: ["One powerful declaration", "Faith and ambition together", "Let the fire speak"],
      cta: "If you believe it, type AMEN.",
      filmingTip: "Outside the church or in the parking lot. Quick and powerful.",
    },
  ],
  "church|fired_up|1_2_min": [
    {
      hook: "My faith and my fire aren't separate. They're the same thing.",
      format: "Reel",
      talkingPoints: ["How faith fuels your ambition", "Specific ways spirituality drives your business", "The misunderstanding that faith means being passive"],
      cta: "Faith without works is dead. Get to work. Link in bio.",
      filmingTip: "Outside church. Dressed up. Commanding energy. Bridge the spiritual and the hustle.",
    },
  ],
  "church|fired_up|got_time": [
    {
      hook: "Let me tell you about the prayer I prayed in prison that changed everything.",
      format: "Reel",
      talkingPoints: ["A specific prayer or moment of faith behind bars", "What happened after that prayer", "How it led you to where you are now"],
      cta: "God's timing is perfect. Trust the process. Share this with someone who needs faith today.",
      filmingTip: "Find a peaceful spot. Tell the story with reverence. Let the emotion flow.",
    },
  ],
  "church|grateful|under_30s": [
    {
      hook: "Thank you, God. That's it. That's the post.",
      format: "Story",
      talkingPoints: ["Simple gratitude", "No explanation needed", "Power in simplicity"],
      cta: "What are you thanking God for today?",
      filmingTip: "Church background or sky. Minimal. Let the message breathe.",
    },
  ],
  "church|grateful|1_2_min": [
    {
      hook: "I prayed for everything I have right now. Let me tell you what that feels like.",
      format: "Reel",
      talkingPoints: ["Specific prayers that were answered", "The patience required", "How gratitude became your foundation"],
      cta: "Keep praying. Keep working. Both matter. Drop your prayer below.",
      filmingTip: "Post-service glow. Peaceful but purposeful. Camera at eye level.",
    },
  ],
  "church|grateful|got_time": [
    {
      hook: "My faith journey from a prison cell to this moment. The full testimony.",
      format: "Reel",
      talkingPoints: ["Complete faith story: before, during, and after prison", "Specific moments of divine intervention", "Where your faith is today and where it's taking you"],
      cta: "If this testimony moved you, share it. Someone in your circle needs to hear this today.",
      filmingTip: "Sit in a meaningful space. Extended testimony. Let this be a powerful piece of content.",
    },
  ],
  "church|teaching|under_30s": [
    {
      hook: "One Bible verse got me through 7 years. You need to hear it.",
      format: "Reel",
      talkingPoints: ["Share the verse", "One line about why it mattered", "Let it land"],
      cta: "Save this verse. You'll need it.",
      filmingTip: "Text overlay of the verse. Your voice reading it. Powerful simplicity.",
    },
  ],
  "church|teaching|1_2_min": [
    {
      hook: "3 spiritual disciplines that changed my life more than any business book.",
      format: "Reel",
      talkingPoints: ["Three specific practices (prayer, fasting, service, etc.)", "How each one impacts your daily life", "The business benefits of spiritual discipline"],
      cta: "Which one are you starting this week? Comment below.",
      filmingTip: "Clean background. Structured delivery. This is value content with a spiritual angle.",
    },
  ],
  "church|teaching|got_time": [
    {
      hook: "Everything I know about leadership I learned in church and prison. Let me break it down.",
      format: "Carousel",
      talkingPoints: ["Leadership lessons from both worlds", "How they overlap and reinforce each other", "Practical application for your audience"],
      cta: "Save this. Share this. Live this. Full framework in the app. Link in bio.",
      filmingTip: "Teaching format. Structured, authoritative, but warm. This is your authority content.",
    },
  ],
  "church|raw|under_30s": [
    {
      hook: "I still talk to God like I'm in that cell. Raw and unfiltered.",
      format: "Story",
      talkingPoints: ["Quick, vulnerable spiritual moment", "The rawness of your relationship with God", "No performance, just truth"],
      cta: "He hears you. Even when it doesn't feel like it.",
      filmingTip: "Close-up. Quiet. Maybe slightly emotional. This is real.",
    },
  ],
  "church|raw|1_2_min": [
    {
      hook: "I'm not gonna pretend my faith is perfect. Some days I'm angry at God. And I think that's OK.",
      format: "Reel",
      talkingPoints: ["Honest about faith struggles", "The days when prayer feels empty", "Why you keep showing up anyway"],
      cta: "Faith isn't about being perfect. It's about showing up broken. Drop a prayer hand if you feel this.",
      filmingTip: "Outside church, maybe sitting on steps. Honest, not performative.",
    },
  ],
  "church|raw|got_time": [
    {
      hook: "The darkest night of my incarceration and the prayer that saved my life. I've never told this story publicly.",
      format: "Reel",
      talkingPoints: ["A specific, powerful moment of crisis and faith", "Every detail you're comfortable sharing", "How it fundamentally changed you"],
      cta: "If you're in your darkest night, hold on. Morning is coming. Share this with someone who needs it.",
      filmingTip: "This is your most powerful content. Private space, extended format. Let the story carry itself.",
    },
  ],
  "church|funny|under_30s": [
    {
      hook: "The face I make when the sermon goes to overtime and my stomach is growling.",
      format: "Reel",
      talkingPoints: ["Relatable church humor", "Keep it respectful but funny", "Everyone relates to this"],
      cta: "Don't lie, you've been here. Tag someone who gets hangry at church.",
      filmingTip: "Reaction face. Trending audio. Quick and shareable.",
    },
  ],
  "church|funny|1_2_min": [
    {
      hook: "Things that happen at church that would NOT fly in prison.",
      format: "Reel",
      talkingPoints: ["Funny comparisons between church culture and prison culture", "Keep it light and loving", "Find the humor in the contrast"],
      cta: "Church people are a different breed. Drop your church stories below.",
      filmingTip: "Outside church. Comedic delivery. List format with finger counting.",
    },
  ],
  "church|funny|got_time": [
    {
      hook: "I'm ranking every church stereotype and I'm NOT holding back.",
      format: "Reel",
      talkingPoints: ["The late auntie, the over-enthusiastic greeter, the kid in the back", "Lovingly roast each one", "End with yourself and your own church persona"],
      cta: "Which one are you? Be honest. Comment below. Part 2 if this hits 1000 likes.",
      filmingTip: "Full commitment. Character work. This is comedy content with a faith audience. Series gold.",
    },
  ],
};

// ── Helper: Get recs for a combo ───────────────────────────────────────

function getRecommendations(
  location: Location,
  energy: Energy,
  time: TimeAvailable
): ContentRec[] {
  const key = `${location}|${energy}|${time}`;
  return CONTENT_MAP[key] || [];
}

// ── Main Component ─────────────────────────────────────────────────────

export default function WhatsNextWizard() {
  const [step, setStep] = useState<1 | 2 | 3 | "result">(1);
  const [location, setLocation] = useState<Location | null>(null);
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [time, setTime] = useState<TimeAvailable | null>(null);
  const [recIndex, setRecIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleLocationSelect = (loc: Location) => {
    setLocation(loc);
    setStep(2);
  };

  const handleEnergySelect = (e: Energy) => {
    setEnergy(e);
    setStep(3);
  };

  const handleTimeSelect = (t: TimeAvailable) => {
    setTime(t);
    setRecIndex(0);
    setStep("result");
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === "result") setStep(3);
  };

  const handleReset = () => {
    setStep(1);
    setLocation(null);
    setEnergy(null);
    setTime(null);
    setRecIndex(0);
  };

  const handleShuffle = () => {
    if (!location || !energy || !time) return;
    const recs = getRecommendations(location, energy, time);
    if (recs.length > 1) {
      setRecIndex((prev) => (prev + 1) % recs.length);
    } else {
      toast("That's the only recommendation for this combo. Try different answers!");
    }
  };

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const recs = location && energy && time ? getRecommendations(location, energy, time) : [];
  const currentRec = recs[recIndex] || null;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all",
              (step === "result" || s <= (typeof step === "number" ? step : 4))
                ? "bg-green-500"
                : "bg-border"
            )}
          />
        ))}
      </div>

      {/* Back Button */}
      {step !== 1 && (
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      )}

      {/* Step 1: Location */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold">Where are you right now?</h3>
            <p className="text-sm text-muted-foreground">Pick the closest one. This shapes what you film.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {LOCATIONS.map((loc) => {
              const Icon = loc.icon;
              return (
                <button
                  key={loc.value}
                  onClick={() => handleLocationSelect(loc.value)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    loc.color
                  )}
                >
                  <Icon className="h-6 w-6 shrink-0" />
                  <span className="text-sm font-semibold">{loc.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Energy */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold">What energy are you feeling?</h3>
            <p className="text-sm text-muted-foreground">Be honest. The best content matches your real energy.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ENERGIES.map((e) => {
              const Icon = e.icon;
              return (
                <button
                  key={e.value}
                  onClick={() => handleEnergySelect(e.value)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    e.color
                  )}
                >
                  <Icon className="h-6 w-6 shrink-0" />
                  <span className="text-sm font-semibold">{e.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Time */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold">How much time do you have?</h3>
            <p className="text-sm text-muted-foreground">Quick hit or full production. Both work.</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {TIMES.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  onClick={() => handleTimeSelect(t.value)}
                  className={cn(
                    "flex items-center gap-3 p-5 rounded-xl border-2 transition-all text-left",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    t.color
                  )}
                >
                  <Icon className="h-6 w-6 shrink-0" />
                  <span className="text-sm font-semibold">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Result */}
      {step === "result" && currentRec && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-400" />
                Here's your move
              </h3>
              <p className="text-xs text-muted-foreground">
                {recs.length > 1 && `Option ${recIndex + 1} of ${recs.length}`}
              </p>
            </div>
            <Badge variant="outline" className={cn(
              "text-xs",
              currentRec.format === "Reel" && "border-purple-500/40 text-purple-400",
              currentRec.format === "Story" && "border-blue-500/40 text-blue-400",
              currentRec.format === "Carousel" && "border-amber-500/40 text-amber-400",
            )}>
              {currentRec.format}
            </Badge>
          </div>

          {/* Hook */}
          <div className="rounded-xl bg-green-500/10 border-2 border-green-500/30 p-5">
            <p className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-2">Drop this hook first</p>
            <p className="text-lg font-bold leading-snug">"{currentRec.hook}"</p>
            <button
              onClick={() => handleCopy(currentRec.hook)}
              className="flex items-center gap-1.5 mt-3 text-xs text-green-400 hover:text-green-300 transition-colors"
            >
              {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy hook"}
            </button>
          </div>

          {/* Talking Points */}
          <div className="rounded-xl bg-charcoal border border-border p-4">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Then hit these points</p>
            <ul className="space-y-2">
              {currentRec.talkingPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-green-400 font-bold mt-0.5">{i + 1}.</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="rounded-xl bg-orange-500/10 border border-orange-500/30 p-4">
            <p className="text-xs text-orange-400 font-semibold uppercase tracking-wider mb-2">End with this</p>
            <p className="text-sm font-semibold">"{currentRec.cta}"</p>
          </div>

          {/* Filming Tip */}
          <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-4">
            <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-2">Filming tip</p>
            <p className="text-sm text-muted-foreground">{currentRec.filmingTip}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-base"
              onClick={() => toast.success("Hit record! You got this.")}
            >
              <Video className="h-5 w-5 mr-2" />
              Film it NOW
            </Button>
            {recs.length > 1 && (
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={handleShuffle}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Shuffle
              </Button>
            )}
          </div>

          {/* Start Over */}
          <button
            onClick={handleReset}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Start over with different answers
          </button>
        </div>
      )}

      {/* Fallback if no recs for combo */}
      {step === "result" && !currentRec && (
        <div className="text-center py-10 space-y-4">
          <p className="text-muted-foreground">No specific recommendation for this exact combo yet.</p>
          <Button variant="outline" onClick={handleReset}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Try different answers
          </Button>
        </div>
      )}
    </div>
  );
}
