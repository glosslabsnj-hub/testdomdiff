import { useState } from "react";
import { 
  DollarSign, 
  Clock, 
  TrendingUp,
  Wrench,
  Truck,
  Laptop,
  Camera,
  Scissors,
  Hammer,
  ShoppingBag,
  Utensils,
  Car,
  ExternalLink,
  Star,
  AlertTriangle,
  CheckCircle2,
  Target,
  ArrowRight,
  Lightbulb,
  BookOpen,
  Users,
  CalendarDays,
  FileText,
  Rocket,
  Scale
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StartupCostItem {
  item: string;
  min: number;
  max: number;
}

interface Phase {
  title: string;
  duration: string;
  tasks: { task: string; details: string; resources?: string[] }[];
  milestone: string;
}

interface Script {
  name: string;
  content: string;
}

interface Mistake {
  mistake: string;
  solution: string;
}

interface ScalingStage {
  stage: string;
  revenue: string;
  actions: string[];
}

interface HustleIdea {
  id: string;
  title: string;
  icon: any;
  category: string;
  startupCostItems: StartupCostItem[];
  totalStartupRange: string;
  earningPotential: { level: string; monthly: string; description: string }[];
  timeToFirstDollar: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  idealFor: string[];
  prerequisites: string[];
  phases: Phase[];
  scripts: Script[];
  mistakes: Mistake[];
  scalingPath: ScalingStage[];
  caseStudy: { name: string; background: string; timeline: string; outcome: string };
  resources: { name: string; url: string; type: string }[];
}

const hustleIdeas: HustleIdea[] = [
  {
    id: "pressure-washing",
    title: "Pressure Washing Business",
    icon: Wrench,
    category: "Service",
    startupCostItems: [
      { item: "Pressure washer (2,000-3,000 PSI)", min: 200, max: 400 },
      { item: "Surface cleaner attachment", min: 80, max: 150 },
      { item: "100ft pressure hose", min: 60, max: 100 },
      { item: "Spray tips and wand set", min: 30, max: 50 },
      { item: "Safety gear (goggles, boots, gloves)", min: 50, max: 80 },
      { item: "Business cards (500 count)", min: 20, max: 30 },
      { item: "General liability insurance (first month)", min: 30, max: 60 },
      { item: "Gas/transportation (first month)", min: 100, max: 200 }
    ],
    totalStartupRange: "$570-$1,070",
    earningPotential: [
      { level: "Part-time", monthly: "$1,000-$2,500", description: "5-10 jobs/month, weekends only" },
      { level: "Full-time Solo", monthly: "$4,000-$8,000", description: "15-25 jobs/month" },
      { level: "With Helper", monthly: "$8,000-$15,000", description: "30-50 jobs/month" },
      { level: "2+ Crews", monthly: "$15,000-$30,000+", description: "Business owner, not operator" }
    ],
    timeToFirstDollar: "3-7 days (if you hustle)",
    difficulty: "beginner",
    description: "Clean driveways, decks, houses, fences, and commercial properties. One of the highest profit-margin service businesses with low barrier to entry and consistent demand.",
    idealFor: [
      "Physical workers who don't mind being outdoors",
      "People who want visible, satisfying results",
      "Anyone with reliable transportation",
      "Those who can work weekends to start"
    ],
    prerequisites: [
      "Valid driver's license",
      "Reliable transportation (truck preferred, car works for starting)",
      "Physical fitness (8+ hour days standing, moving equipment)",
      "$500-1,500 startup capital",
      "Basic mechanical aptitude",
      "Smartphone for booking/photos"
    ],
    phases: [
      {
        title: "Phase 1: Equipment & Learning",
        duration: "Days 1-7",
        tasks: [
          { 
            task: "Purchase or rent equipment", 
            details: "Start with a 2,500+ PSI gas pressure washer. Electric works but limits you. Harbor Freight has budget options; Home Depot rentals let you try before buying.",
            resources: ["Harbor Freight", "Home Depot Rental", "Facebook Marketplace"]
          },
          { 
            task: "Learn proper technique", 
            details: "Watch 5-10 hours of YouTube tutorials. Key topics: PSI settings for different surfaces, avoiding damage, streak-free technique, pre-treatment with detergent, post-treatment sealing upsell."
          },
          { 
            task: "Practice on your property", 
            details: "Clean your own driveway, deck, fence, house siding. Take before/after photos. Notice how long each takes—this sets your pricing."
          },
          { 
            task: "Get general liability insurance", 
            details: "Required for any legitimate jobs. Costs $30-60/month. Protects you if you damage property. Next Insurance, Simply Business, or local agents work."
          }
        ],
        milestone: "Completed your own property + have all equipment"
      },
      {
        title: "Phase 2: Get Testimonials (Free Jobs)",
        duration: "Days 8-14",
        tasks: [
          { 
            task: "Offer 3-5 FREE jobs", 
            details: "Ask friends, family, neighbors. Tell them: 'I'm starting a pressure washing business and need before/after photos for marketing. Free job for you, photos for me.' NEVER skip this step."
          },
          { 
            task: "Document everything", 
            details: "Same angle, same lighting for before/after. Video the process. Get video testimonials: 'Hey, what did you think of the work?' These are GOLD for marketing."
          },
          { 
            task: "Refine your process", 
            details: "Time how long each surface takes. Identify what's harder than expected. Develop your checklist. Note what questions people ask—these become FAQs."
          }
        ],
        milestone: "3-5 testimonials with before/after photos"
      },
      {
        title: "Phase 3: Launch Marketing",
        duration: "Days 14-21",
        tasks: [
          { 
            task: "Create Facebook business page", 
            details: "Name: '[Your Name] Pressure Washing' or '[City] Pressure Washing'. Post all before/after photos. Include: services, service area, contact info, hours."
          },
          { 
            task: "List on Facebook Marketplace", 
            details: "Post as a service with before/after photos. Title: 'Professional Pressure Washing - Driveways $99+'. Repost every 3-5 days."
          },
          { 
            task: "Join local Facebook groups", 
            details: "Neighborhood groups, local buy/sell, community pages. Engage genuinely. When someone asks for recommendations, you're there with photos."
          },
          { 
            task: "Door-to-door in target neighborhoods", 
            details: "Walk through neighborhoods with dirty driveways. Leave door hangers or knock. Saturdays 9am-3pm are prime time."
          },
          { 
            task: "Create Google Business Profile", 
            details: "Free to set up. Shows in Google Maps searches. Critical for long-term visibility. Get customers to leave reviews."
          }
        ],
        milestone: "Marketing live across 3+ channels"
      },
      {
        title: "Phase 4: First Paying Customers",
        duration: "Days 21-30",
        tasks: [
          { 
            task: "Quote aggressively to book jobs", 
            details: "Price 10-15% below established competitors to start. You need experience and reviews more than maximum profit right now."
          },
          { 
            task: "Over-deliver on every job", 
            details: "Show up early. Do the edges extra clean. Point out something extra you did for free. Leave a door hanger with review QR code."
          },
          { 
            task: "Collect reviews immediately", 
            details: "Text the customer within 2 hours: 'Thanks so much! If you were happy with the work, a Google review would mean the world.' Direct link to your review page."
          },
          { 
            task: "Ask for referrals", 
            details: "After every job: 'Know anyone else who needs their driveway cleaned? I'll give you $20 off your next service for any referral.'"
          }
        ],
        milestone: "5+ paying customers, 3+ Google reviews"
      },
      {
        title: "Phase 5: Optimize & Grow",
        duration: "Month 2-3",
        tasks: [
          { 
            task: "Raise prices", 
            details: "Once you have 10+ reviews and steady bookings, increase prices 15-20%. Track if you lose customers. You probably won't."
          },
          { 
            task: "Add upsell services", 
            details: "Deck sealing ($150-300 add-on), gutter cleaning ($75-150), concrete sealing ($0.50-1.50/sqft). These have huge margins."
          },
          { 
            task: "Create service packages", 
            details: "Example: 'Complete Home Exterior Package' = driveway + sidewalks + patio + house wash. Bundle discount encourages bigger jobs."
          },
          { 
            task: "Develop recurring customers", 
            details: "Offer 15% discount for annual contracts. 'Same time next year?' Many customers will say yes. This becomes passive booking."
          }
        ],
        milestone: "Fully booked, profitable, with recurring revenue"
      }
    ],
    scripts: [
      {
        name: "Door-Knock Pitch",
        content: `"Hi there! I'm [Name] from [City] Pressure Washing. I was in the neighborhood today and noticed your driveway could use a refresh. 

I'm offering a special this week—$99 for a standard driveway, done in under an hour. I've got photos of work I did just down the street if you'd like to see.

Any interest? I could squeeze you in [tomorrow/this weekend]."`
      },
      {
        name: "Facebook Marketplace Post",
        content: `🧹 PROFESSIONAL PRESSURE WASHING 🧹

✓ Driveways - from $99
✓ Patios/Decks - from $75  
✓ House Wash - from $199
✓ Fences - from $1/linear ft

📍 Serving [Your City] and surrounding areas
⭐ 5-star rated (see our reviews!)
📸 Before/after photos available

Same-week availability. Text for free quote!

[Your Phone Number]`
      },
      {
        name: "Follow-Up Text Template",
        content: `"Hey [Name]! This is [Your Name] from the pressure washing quote. Just wanted to follow up—any questions I can answer? I've got availability this [day] if you're interested. Here's a before/after from a similar job last week: [photo]"`
      },
      {
        name: "Review Request Text",
        content: `"Hey [Name]! Thanks again for choosing us today. If you're happy with how everything turned out, would you mind leaving a quick Google review? It really helps small businesses like mine. Here's the direct link: [link] Thanks so much!"`
      },
      {
        name: "Referral Request",
        content: `"Hey [Name]! Hope you're still loving that clean driveway! Quick question—do you know anyone else in the neighborhood who might need pressure washing? I'll give you $25 off your next service for any referral that books. Just have them mention your name. Thanks!"`
      }
    ],
    mistakes: [
      { 
        mistake: "Starting too cheap and staying cheap", 
        solution: "Price low to get reviews (first 10 jobs), then raise prices 20%. Test the market. You're probably undercharging." 
      },
      { 
        mistake: "Skipping insurance", 
        solution: "One damaged window or flooded basement lawsuit ends your business. $30-60/month insurance is non-negotiable." 
      },
      { 
        mistake: "Poor before/after photos", 
        solution: "Same angle, same lighting. Clean the border area first so the 'after' shows contrast. Overcast days photograph best." 
      },
      { 
        mistake: "No follow-up system", 
        solution: "80% of jobs are lost to lack of follow-up. Text quotes same day, follow up in 48 hours, follow up again in 7 days." 
      },
      { 
        mistake: "Trying to serve too large an area", 
        solution: "Start with 15-20 mile radius. Drive time eats profit. Dominate locally before expanding." 
      },
      { 
        mistake: "Not building a review engine", 
        solution: "Ask EVERY customer for a review. Make it easy with direct links. 50 reviews = visible in Google Maps = free leads forever." 
      }
    ],
    scalingPath: [
      {
        stage: "Solo Operator",
        revenue: "$3,000-$6,000/month",
        actions: [
          "Max out your personal capacity (20-25 jobs/month)",
          "Build systems and checklists",
          "Document your process with video SOPs",
          "Build recurring customer base"
        ]
      },
      {
        stage: "First Helper",
        revenue: "$6,000-$12,000/month",
        actions: [
          "Hire part-time help ($15-20/hr)",
          "Run two jobs simultaneously (you train, they execute)",
          "Invest in second equipment set ($1,500)",
          "Focus on booking while helper executes"
        ]
      },
      {
        stage: "Full Crew",
        revenue: "$12,000-$20,000/month",
        actions: [
          "Hire crew lead to replace yourself on jobs",
          "You focus 100% on sales and marketing",
          "Add commercial contracts (HOAs, restaurants)",
          "Consider wrapped vehicle for visibility"
        ]
      },
      {
        stage: "Multiple Crews",
        revenue: "$20,000-$50,000+/month",
        actions: [
          "2-3 crews running daily",
          "Office admin for scheduling/billing",
          "Fleet of vehicles and equipment",
          "Owner works ON business, not IN it"
        ]
      }
    ],
    caseStudy: {
      name: "Marcus T.",
      background: "Released after 6 years. Zero work history on the outside. Had $500 from a construction job he got through a reentry program.",
      timeline: "Started pressure washing 3 months after release. First $1,000 month within 6 weeks. Hit $5,000/month by month 4. Hired first helper at month 8.",
      outcome: "Now runs a 3-crew operation doing $25,000/month. Paid off all fines. Bought a house. Employs 2 other guys with records who couldn't get hired elsewhere."
    },
    resources: [
      { name: "Pressure Washing Resource Association", url: "https://pwra.org", type: "Industry" },
      { name: "Pressure Washing YouTube Tutorials", url: "https://www.youtube.com/results?search_query=pressure+washing+business+startup", type: "Video" },
      { name: "Next Insurance (Quick Quote)", url: "https://www.nextinsurance.com", type: "Tool" },
      { name: "Google Business Profile Setup", url: "https://business.google.com", type: "Tool" }
    ]
  },
  {
    id: "lawn-care",
    title: "Lawn Care & Landscaping",
    icon: Scissors,
    category: "Service",
    startupCostItems: [
      { item: "Push mower (used is fine to start)", min: 100, max: 300 },
      { item: "String trimmer/weed eater", min: 50, max: 150 },
      { item: "Leaf blower", min: 40, max: 100 },
      { item: "Basic hand tools (rake, shovel, edger)", min: 50, max: 100 },
      { item: "Gas cans and fuel (first month)", min: 30, max: 50 },
      { item: "Trailer or truck (if not owned)", min: 0, max: 500 },
      { item: "Business cards/door hangers", min: 20, max: 50 }
    ],
    totalStartupRange: "$290-$1,250",
    earningPotential: [
      { level: "Part-time (10 lawns/week)", monthly: "$800-$1,500", description: "Weekends only, residential" },
      { level: "Full-time Solo", monthly: "$3,000-$6,000", description: "25-40 lawns/week" },
      { level: "With Crew", monthly: "$8,000-$15,000", description: "60-100 lawns/week" },
      { level: "Multi-Crew Operation", monthly: "$20,000-$50,000+", description: "Multiple territories" }
    ],
    timeToFirstDollar: "1-3 days",
    difficulty: "beginner",
    description: "Mowing, trimming, edging, and basic landscaping for residential and commercial clients. Extremely consistent demand with low barrier to entry and obvious scaling path.",
    idealFor: [
      "Early risers who enjoy physical work",
      "People who want steady, predictable income",
      "Those with access to a truck or trailer",
      "Anyone who can work in all weather conditions"
    ],
    prerequisites: [
      "Valid driver's license",
      "Reliable transportation capable of hauling equipment",
      "Physical stamina for 8+ hour days",
      "Basic knowledge of lawn care (or willingness to learn)",
      "$300-1,500 startup capital"
    ],
    phases: [
      {
        title: "Phase 1: Equipment Setup",
        duration: "Days 1-5",
        tasks: [
          { 
            task: "Acquire core equipment", 
            details: "Start with a reliable push mower (Honda, Toro), string trimmer, and blower. Facebook Marketplace and Craigslist have deals. Avoid cheap electric—go gas for professional work."
          },
          { 
            task: "Set up transportation", 
            details: "If no truck, a small utility trailer ($500-800 used) behind a car works initially. Ramp access for mower is essential."
          },
          { 
            task: "Create pricing structure", 
            details: "Measure your property, time how long it takes. Base rate: $30-40 for small lots (under 5,000 sqft), $50-75 for medium, $100+ for large. Add $5-10 for trimming, $5 for edging."
          }
        ],
        milestone: "All equipment operational, pricing set"
      },
      {
        title: "Phase 2: Land First Clients",
        duration: "Days 5-14",
        tasks: [
          { 
            task: "Start with your network", 
            details: "Text everyone you know: 'Starting a lawn care business. Know anyone who needs their lawn done? Special rate for my first customers.'"
          },
          { 
            task: "Canvas target neighborhoods", 
            details: "Walk through neighborhoods with overgrown lawns. Leave door hangers or knock. 'I noticed your lawn could use some TLC—I'm in the area and can do it today for $X.'"
          },
          { 
            task: "Post on all platforms", 
            details: "Facebook Marketplace, Nextdoor, Craigslist, local Facebook groups. Include photos of your work (use your own lawn initially)."
          },
          { 
            task: "Offer first-mow discount", 
            details: "First mow 50% off or free with commitment to monthly service. Gets you in the door."
          }
        ],
        milestone: "5-10 paying customers secured"
      },
      {
        title: "Phase 3: Build Weekly Route",
        duration: "Weeks 3-6",
        tasks: [
          { 
            task: "Convert one-time to recurring", 
            details: "After first service: 'Would you like me to come every week/bi-weekly? I can lock in this rate and you never have to think about it.'"
          },
          { 
            task: "Cluster your route", 
            details: "Target customers in the same neighborhoods. 4 lawns on one street = 4X revenue, minimal drive time. Offer neighbor discounts."
          },
          { 
            task: "Collect reviews", 
            details: "Google reviews are gold. Text after every job: 'Thanks! Quick review would help a ton: [link]'"
          },
          { 
            task: "Establish billing system", 
            details: "Monthly billing is easier than per-job. Offer 10% discount for monthly auto-pay. Use Square, Venmo Business, or invoicing app."
          }
        ],
        milestone: "15-20 recurring weekly/bi-weekly customers"
      },
      {
        title: "Phase 4: Expand Services",
        duration: "Months 2-4",
        tasks: [
          { 
            task: "Add seasonal services", 
            details: "Fall: leaf cleanup, aeration, overseeding. Spring: mulching, bed cleanup, fertilization. Winter: snow removal if applicable."
          },
          { 
            task: "Introduce upsells", 
            details: "Hedge trimming, bush shaping, flower bed maintenance, gutter cleaning. Each adds $50-200 per visit."
          },
          { 
            task: "Create service packages", 
            details: "'Full Property Care' = mow + edge + trim + blow + beds. Premium pricing, less quoting."
          },
          { 
            task: "Pursue commercial accounts", 
            details: "Churches, small offices, rental properties, HOA common areas. Larger contracts, consistent payment."
          }
        ],
        milestone: "Average revenue per customer increased 40%+"
      },
      {
        title: "Phase 5: Scale Operations",
        duration: "Months 4-12",
        tasks: [
          { 
            task: "Hire first helper", 
            details: "Pay $13-18/hr depending on market. They do the labor, you do the business development. Train on your process exactly."
          },
          { 
            task: "Upgrade to commercial equipment", 
            details: "Zero-turn mower ($4,000-8,000 used) cuts time in half. Pays for itself in 2-3 months of increased capacity."
          },
          { 
            task: "Wrap your vehicle", 
            details: "Truck wrap = constant advertising. Include name, phone, services. $500-1,500 investment, years of impressions."
          },
          { 
            task: "Build management systems", 
            details: "Scheduling software (Jobber, Yardbook), route optimization, customer CRM. Prepare to step out of daily operations."
          }
        ],
        milestone: "Running a crew, not a mower"
      }
    ],
    scripts: [
      {
        name: "Door-Knock Intro",
        content: `"Hey there! I'm [Name], I run a lawn service in the neighborhood. I noticed your yard and thought I'd offer to take care of it. I've got an opening this week—$[price] includes mow, edge, trim, and cleanup. I'm just a few houses down right now if you want to see my work. Any interest?"`
      },
      {
        name: "Recurring Conversion",
        content: `"Lawn looks great, right? So here's what I can offer: I come every [week/2 weeks], same day, same time—you never have to think about it. I'll lock in this rate for the season. Most of my customers love not having to call every time. Want me to add you to the schedule?"`
      },
      {
        name: "Neighbor Referral",
        content: `"Hey [Name], I just finished up at your place and I'm going door-to-door in the neighborhood. If you know any neighbors who could use lawn service, I'll knock $10 off your next bill for each one that signs up. Anyone come to mind?"`
      },
      {
        name: "Review Request",
        content: `"Hey [Name]! Thanks for letting me take care of your lawn. If you've got 30 seconds, a Google review would really help me out—here's the link: [link]. I appreciate you!"`
      }
    ],
    mistakes: [
      { 
        mistake: "Underpricing to 'get clients'", 
        solution: "Cheap prices attract cheap customers. Price at market rate minimum. Compete on reliability and quality, not price." 
      },
      { 
        mistake: "Not building a recurring base", 
        solution: "One-time jobs are a treadmill. Convert every client to weekly/bi-weekly. Predictable revenue = sustainable business." 
      },
      { 
        mistake: "Spread-out route", 
        solution: "Driving between jobs kills profit. Focus on neighborhoods, offer discounts to cluster customers." 
      },
      { 
        mistake: "Using cheap equipment", 
        solution: "Equipment breaks mid-job = lost money. Buy quality commercial-grade used before cheap new." 
      },
      { 
        mistake: "No rain-day plan", 
        solution: "Have a makeup day built into your schedule. Communicate proactively when weather hits." 
      }
    ],
    scalingPath: [
      {
        stage: "Solo Part-Time",
        revenue: "$1,000-$2,000/month",
        actions: [
          "Service 10-15 lawns weekly",
          "Work weekends and evenings",
          "Reinvest in better equipment",
          "Build review base"
        ]
      },
      {
        stage: "Solo Full-Time",
        revenue: "$3,000-$6,000/month",
        actions: [
          "30-40 weekly accounts",
          "Optimized routes by neighborhood",
          "Commercial equipment purchased",
          "Seasonal services added"
        ]
      },
      {
        stage: "First Employee",
        revenue: "$6,000-$12,000/month",
        actions: [
          "50-70 weekly accounts",
          "Train helper on your exact process",
          "You focus on sales and quality control",
          "Second equipment set"
        ]
      },
      {
        stage: "Crew Operation",
        revenue: "$15,000-$30,000+/month",
        actions: [
          "100+ accounts across crews",
          "Crew leaders run daily ops",
          "Owner manages business",
          "Consider franchise or territory model"
        ]
      }
    ],
    caseStudy: {
      name: "David R.",
      background: "Former landscaping labor experience before incarceration. Released with $200 and a borrowed push mower.",
      timeline: "Mowed 3 lawns first week for neighbors. Hit 15 recurring accounts by week 6. Bought commercial mower at month 3 from profits.",
      outcome: "18 months later: 2 trucks, 4 employees, 180+ weekly accounts. Grossing $22,000/month. Hired his brother after his release."
    },
    resources: [
      { name: "Lawn Care Millionaire Podcast", url: "https://www.youtube.com/results?search_query=lawn+care+business+startup", type: "Video" },
      { name: "Jobber (Scheduling Software)", url: "https://getjobber.com", type: "Tool" },
      { name: "Yardbook (Free CRM)", url: "https://www.yardbook.com", type: "Tool" },
      { name: "NALP (National Association)", url: "https://www.landscapeprofessionals.org", type: "Industry" }
    ]
  },
  {
    id: "moving-hauling",
    title: "Moving & Hauling Services",
    icon: Truck,
    category: "Service",
    startupCostItems: [
      { item: "Moving blankets (12-pack)", min: 60, max: 100 },
      { item: "Ratchet straps/tie-downs", min: 30, max: 60 },
      { item: "Furniture dolly", min: 40, max: 80 },
      { item: "Hand truck", min: 50, max: 100 },
      { item: "Moving straps/harness", min: 25, max: 50 },
      { item: "Gloves (multiple pairs)", min: 20, max: 40 },
      { item: "Truck rental (if needed, per job)", min: 50, max: 100 }
    ],
    totalStartupRange: "$275-$530",
    earningPotential: [
      { level: "Part-time", monthly: "$800-$2,000", description: "Weekends only, 4-6 jobs" },
      { level: "Full-time Solo", monthly: "$3,000-$6,000", description: "10-15 jobs/month" },
      { level: "With Helper", monthly: "$5,000-$10,000", description: "20-30 jobs/month" },
      { level: "Crew + Truck", monthly: "$10,000-$25,000+", description: "Multiple crews/trucks" }
    ],
    timeToFirstDollar: "24-48 hours",
    difficulty: "beginner",
    description: "Help people move furniture, haul junk, deliver large items, and clear out spaces. If you have a truck and strong back, you can start earning immediately.",
    idealFor: [
      "Strong individuals who can lift 50-100 lbs regularly",
      "Truck or van owners looking to monetize their vehicle",
      "People comfortable with variable schedules",
      "Those who like meeting different people daily"
    ],
    prerequisites: [
      "Valid driver's license with clean record",
      "Access to truck, van, or ability to rent",
      "Physical strength and stamina",
      "Basic navigation skills (GPS competency)",
      "Smartphone for apps and communication"
    ],
    phases: [
      {
        title: "Phase 1: Get Listed & Ready",
        duration: "Days 1-3",
        tasks: [
          { 
            task: "Sign up for gig platforms", 
            details: "TaskRabbit, Dolly, GoShare, Lugg, BellHops. Each has different requirements. Apply to ALL—more platforms = more jobs.",
            resources: ["TaskRabbit.com", "Dolly.com", "GoShare.com", "Lugg.com"]
          },
          { 
            task: "List on Craigslist & Facebook", 
            details: "Post in 'services' section. 'Local Moving Help - $XX/hr - Truck Available.' Include your truck photo. Repost weekly."
          },
          { 
            task: "Gather equipment", 
            details: "Moving blankets, straps, dollies are essential. Protect furniture = protect reviews = more bookings."
          },
          { 
            task: "Set competitive rates", 
            details: "Research local movers. Start 15-20% below. $40-80/hr for truck + 1 person. $60-100/hr for truck + 2 people."
          }
        ],
        milestone: "Active on 3+ platforms, equipped and ready"
      },
      {
        title: "Phase 2: Complete First Jobs",
        duration: "Days 3-14",
        tasks: [
          { 
            task: "Accept every reasonable job", 
            details: "Early on, volume matters more than rate. Small jobs build reviews. Reviews unlock better jobs."
          },
          { 
            task: "Over-deliver on protection", 
            details: "Blanket everything. Communicate constantly. 'I'm going to wrap this carefully.' Customers remember care."
          },
          { 
            task: "Be 15 minutes early", 
            details: "Moving day is stressful for customers. Arriving early = instant trust. Text when you leave, when you're 10 min out."
          },
          { 
            task: "Collect reviews immediately", 
            details: "Before you leave: 'Would you mind leaving a quick review? It really helps me get more work.'"
          }
        ],
        milestone: "10+ completed jobs with reviews"
      },
      {
        title: "Phase 3: Build Direct Business",
        duration: "Weeks 3-8",
        tasks: [
          { 
            task: "Create business cards", 
            details: "Hand to every customer. 'For next time, or if you know anyone moving.' $20 for 500 cards. Include all contact methods."
          },
          { 
            task: "Partner with realtors", 
            details: "Contact local real estate agents. Offer referral fee ($25-50). They ALWAYS have clients who need movers."
          },
          { 
            task: "Target apartment complexes", 
            details: "Leave cards with property managers. Many complexes have bulletin boards. First/last of month = moving rush."
          },
          { 
            task: "Add junk removal service", 
            details: "Often more profitable than moving. Estate cleanouts, garage cleanouts, construction debris. Dump fees + labor + profit margin."
          }
        ],
        milestone: "30% of jobs from direct bookings"
      },
      {
        title: "Phase 4: Increase Job Value",
        duration: "Months 2-4",
        tasks: [
          { 
            task: "Raise platform rates", 
            details: "With good reviews, you can command premium. Increase by $10/hr. Track booking rate. Adjust until optimal."
          },
          { 
            task: "Offer packing services", 
            details: "Many customers will pay extra for packing. $50-100/hr premium. Buy packing supplies wholesale."
          },
          { 
            task: "Create service packages", 
            details: "'Full-Service Move' includes packing, moving, unpacking, setup. Doubles revenue per job."
          },
          { 
            task: "Target commercial/office moves", 
            details: "Offices move = bigger jobs. Network with property managers, office building supers. Weekend moves pay premium."
          }
        ],
        milestone: "Average job revenue increased 50%"
      },
      {
        title: "Phase 5: Scale Operation",
        duration: "Months 4-12",
        tasks: [
          { 
            task: "Hire reliable helper", 
            details: "Pay $15-25/hr. Two-person team handles bigger jobs. You drive and manage, they lift."
          },
          { 
            task: "Consider box truck", 
            details: "Larger truck = larger jobs = higher revenue. Used box trucks $8,000-15,000. Pays for itself in months."
          },
          { 
            task: "Get moving company license", 
            details: "Required in most states for formal operation. Insurance requirements increase but so does legitimacy."
          },
          { 
            task: "Build management systems", 
            details: "Booking software, dispatch, invoicing. Prepare to run the business, not just do the work."
          }
        ],
        milestone: "Running moving company, not just helping moves"
      }
    ],
    scripts: [
      {
        name: "Pre-Job Call",
        content: `"Hi [Name], this is [Your Name] confirming your move for [date/time]. Just wanted to go over a few things: I'll arrive with [blankets/straps/dolly]. What floor are you on? Any stairs at the destination? Any extra-heavy items I should know about? Great—I'll text you when I'm on my way. See you then!"`
      },
      {
        name: "Realtor Partnership Pitch",
        content: `"Hi [Realtor Name], I'm [Name], I run a local moving service. I know your clients often need help moving in or out quickly—I'd love to be your go-to recommendation. I offer $25 referral fee for any job that books, and I make sure your clients have a great experience. Can I drop off some cards at your office?"`
      },
      {
        name: "Upsell at Job Start",
        content: `"Before we start, I wanted to mention—I can also help with packing if you're not quite done. It's $X extra per hour, and it's one less thing you have to worry about. Want me to take care of that?"`
      },
      {
        name: "Review Request (End of Job)",
        content: `"Thanks so much for using my service! If you've got a minute, a quick review on [platform] really helps me get more work. And here's my card—if you know anyone moving, I'd appreciate the referral. $25 off your next job for any referral that books."`
      }
    ],
    mistakes: [
      { 
        mistake: "Damaging furniture and handling poorly", 
        solution: "Blanket EVERYTHING. Go slower than you think. One damage claim erases profit from 10 jobs." 
      },
      { 
        mistake: "Underestimating time on quotes", 
        solution: "Always add 20% buffer. Stairs, elevators, parking, disassembly—all add time. Under-quoting loses money." 
      },
      { 
        mistake: "Not getting deposits for large jobs", 
        solution: "Require 25-50% deposit for jobs over $300. No-shows cost you opportunities." 
      },
      { 
        mistake: "No vehicle insurance coverage", 
        solution: "Standard auto insurance may not cover commercial use. Check with insurer. Cargo insurance protects you too." 
      },
      { 
        mistake: "Ignoring injury risk", 
        solution: "Learn proper lifting. Use equipment. One back injury ends your business. Knee braces, back braces, proper form." 
      }
    ],
    scalingPath: [
      {
        stage: "Gig Platform Solo",
        revenue: "$1,500-$3,000/month",
        actions: [
          "Active on TaskRabbit, Dolly, GoShare",
          "Available weekends + evenings",
          "Build platform reviews (4.8+ rating)",
          "Learn what jobs pay best"
        ]
      },
      {
        stage: "Platform + Direct",
        revenue: "$3,000-$6,000/month",
        actions: [
          "50% direct bookings",
          "Realtor partnerships active",
          "Higher hourly rates",
          "Added junk removal service"
        ]
      },
      {
        stage: "Team Operation",
        revenue: "$6,000-$15,000/month",
        actions: [
          "1-2 employees",
          "Larger truck capacity",
          "Commercial job contracts",
          "Full-service packages"
        ]
      },
      {
        stage: "Moving Company",
        revenue: "$15,000-$40,000+/month",
        actions: [
          "Multiple trucks",
          "Full crew with crew leads",
          "Proper business licensing",
          "Year-round consistent bookings"
        ]
      }
    ],
    caseStudy: {
      name: "Tony M.",
      background: "Had a pickup truck and needed income fast after release. No capital, just the truck and willingness to work.",
      timeline: "Signed up for TaskRabbit and Dolly day 2 out. First job day 4 ($75 for 2 hours). Averaged $1,200/week by month 2.",
      outcome: "10 months in: owns a box truck, employs 2 part-timers, does $12,000/month. Partners with 5 local realtors who send steady referrals."
    },
    resources: [
      { name: "TaskRabbit", url: "https://www.taskrabbit.com", type: "Platform" },
      { name: "Dolly", url: "https://www.dolly.com", type: "Platform" },
      { name: "GoShare", url: "https://www.goshare.co", type: "Platform" },
      { name: "Moving Company Startup Guide", url: "https://www.youtube.com/results?search_query=start+moving+company", type: "Video" }
    ]
  },
  {
    id: "reselling-flipping",
    title: "Retail Arbitrage & Reselling",
    icon: ShoppingBag,
    category: "E-commerce",
    startupCostItems: [
      { item: "Initial inventory budget", min: 100, max: 500 },
      { item: "Shipping supplies (boxes, tape, poly mailers)", min: 30, max: 75 },
      { item: "Scale for weighing packages", min: 20, max: 40 },
      { item: "Smartphone with scanner app", min: 0, max: 0 },
      { item: "Storage bins/shelving", min: 30, max: 100 },
      { item: "Printer for labels (optional)", min: 50, max: 100 }
    ],
    totalStartupRange: "$230-$815",
    earningPotential: [
      { level: "Side Hustle", monthly: "$500-$1,500", description: "10-15 hours/week" },
      { level: "Part-time Focus", monthly: "$1,500-$4,000", description: "25-30 hours/week" },
      { level: "Full-time", monthly: "$4,000-$10,000", description: "40+ hours/week, multiple channels" },
      { level: "Scaled Operation", monthly: "$10,000-$30,000+", description: "Team, warehouse, wholesale accounts" }
    ],
    timeToFirstDollar: "3-10 days (list to sale)",
    difficulty: "intermediate",
    description: "Buy products at low prices (thrift stores, clearance, liquidation) and resell for profit on eBay, Amazon, Poshmark, Mercari. Low startup cost, unlimited potential.",
    idealFor: [
      "Bargain hunters who enjoy the thrill of finding deals",
      "Detail-oriented people who can spot value",
      "Patient individuals—sales take time",
      "Those who enjoy learning markets and trends"
    ],
    prerequisites: [
      "Smartphone with data plan",
      "Basic computer/internet access",
      "Transportation to source inventory",
      "$100-500 initial inventory investment",
      "PayPal/bank account for payments",
      "Storage space for inventory"
    ],
    phases: [
      {
        title: "Phase 1: Platform Setup & Education",
        duration: "Days 1-7",
        tasks: [
          { 
            task: "Create seller accounts", 
            details: "eBay (free, 250 free listings/month), Mercari (free), Poshmark (free), Facebook Marketplace (free). Start with eBay and Mercari—easiest for beginners.",
            resources: ["eBay.com/sell", "Mercari.com", "Poshmark.com"]
          },
          { 
            task: "Download scanning apps", 
            details: "eBay app has built-in barcode scanner. Also get: Scoutify/ScanPower for Amazon, Sold History for eBay. These show what items sell for."
          },
          { 
            task: "Study sold listings", 
            details: "On eBay, filter by 'SOLD' listings. This shows what ACTUALLY sells, not wishful pricing. Study 20-30 items in categories you're interested in."
          },
          { 
            task: "Pick 2-3 starting categories", 
            details: "Start focused: electronics, shoes, vintage clothing, video games, toys, books. Learn one category deeply before expanding."
          }
        ],
        milestone: "All accounts created, understand pricing research"
      },
      {
        title: "Phase 2: Source First Inventory",
        duration: "Days 7-14",
        tasks: [
          { 
            task: "Start with what you own", 
            details: "Walk through your house. Old electronics, clothes that don't fit, books, games. List everything with value. This costs nothing and teaches the process."
          },
          { 
            task: "Hit thrift stores strategically", 
            details: "Goodwill, Salvation Army, local thrifts. Scan EVERYTHING that could have value. Electronics, brand-name clothing, vintage items, sealed products."
          },
          { 
            task: "Check clearance sections", 
            details: "Target, Walmart, CVS clearance racks. Use store apps for price checking. Look for 70%+ off—potential to resell at profit."
          },
          { 
            task: "Browse Facebook Marketplace", 
            details: "Search for underpriced items. Estate sales, moving sales, people who want things gone fast. Negotiate. Buy and relist."
          }
        ],
        milestone: "10-20 items sourced and ready to list"
      },
      {
        title: "Phase 3: List & Optimize",
        duration: "Weeks 2-4",
        tasks: [
          { 
            task: "Create quality listings", 
            details: "Multiple photos (8-12), good lighting, white/neutral background. Title with keywords buyers search. Detailed description with measurements, flaws, condition."
          },
          { 
            task: "Price based on sold comps", 
            details: "Check what identical items SOLD for (not listed for). Price at or slightly below average. Test higher on unique items."
          },
          { 
            task: "Cross-list on multiple platforms", 
            details: "Same item on eBay + Mercari + Poshmark = 3X visibility. When it sells, remove from others immediately."
          },
          { 
            task: "Ship fast with tracking", 
            details: "Same-day or next-day shipping. Good packaging. Tracking on everything. Fast shipping = good reviews = more sales."
          }
        ],
        milestone: "50+ active listings, first sales completed"
      },
      {
        title: "Phase 4: Scale Sourcing",
        duration: "Months 2-3",
        tasks: [
          { 
            task: "Develop sourcing routes", 
            details: "Regular schedule: Goodwill Mondays (new stock), Salvation Army Wednesdays, estate sales weekends. Consistency beats randomness."
          },
          { 
            task: "Learn auction buying", 
            details: "Estate auctions, storage unit auctions, auction.com. Bigger buys, bigger potential. Requires more capital and experience."
          },
          { 
            task: "Explore liquidation pallets", 
            details: "Amazon returns, Target/Walmart liquidation. 20-30 cents on retail dollar. High risk, high volume. Learn before buying."
          },
          { 
            task: "Build thrift store relationships", 
            details: "Be friendly with staff. They'll tell you when good stuff comes in. Some hold items for regulars."
          }
        ],
        milestone: "$2,000+/month revenue, consistent sourcing"
      },
      {
        title: "Phase 5: Professionalize & Scale",
        duration: "Months 3-12",
        tasks: [
          { 
            task: "Track every transaction", 
            details: "Spreadsheet or app for: cost of goods, fees, shipping, profit. You MUST know your real margins. Many resellers think they're profitable but aren't."
          },
          { 
            task: "Specialize in high-margin categories", 
            details: "Over time, you'll find categories where you dominate. Double down. Become the expert. Build reputation."
          },
          { 
            task: "Consider Amazon FBA", 
            details: "Send inventory to Amazon, they store/ship/handle returns. Higher fees but hands-off. Good for new-in-package items."
          },
          { 
            task: "Build reinvestment system", 
            details: "Never withdraw all profit. Reinvest 50%+ into inventory. More inventory = more listings = more sales = compound growth."
          }
        ],
        milestone: "$5,000+/month, well-organized inventory system"
      }
    ],
    scripts: [
      {
        name: "Thrift Store Pricing Negotiation",
        content: `"Hi, I'm interested in this [item]. I noticed [flaw/issue]. I'm a regular here—any chance you could do $[lower price] on it?"

(For multiple items): "I've got about 10 items here. Any chance for a bulk discount? I'm here every week."

(For higher-priced items): "This has been here a while—would you take $X for it?"`
      },
      {
        name: "Facebook Marketplace Message",
        content: `"Hi! Is this still available? I can pick up today/tomorrow. Would you take $[5-20% lower]? Cash in hand, no hassle."

(If yes): "Great! What's the best time for you? I'm flexible."`
      },
      {
        name: "eBay Listing Template",
        content: `[ITEM NAME] - [BRAND] - [SIZE/SPECS] - [CONDITION]

DESCRIPTION:
[2-3 sentences about the item, what it is, key features]

CONDITION: [New/Like New/Good/Fair]
[List any flaws, be honest—builds trust]

MEASUREMENTS: [If clothing/shoes]

SHIPPING: Fast shipping! Usually within 1 business day.

RETURNS: [Your policy]

Check my other listings - I combine shipping!`
      },
      {
        name: "Buyer Follow-Up Message",
        content: `"Thanks for your purchase! Your item shipped today—tracking number is [number]. Should arrive by [date]. Let me know when it arrives! If you're happy, I'd really appreciate a positive review. Thanks!""`
      }
    ],
    mistakes: [
      { 
        mistake: "Not checking sold prices before buying", 
        solution: "ALWAYS check what items SOLD for, not what they're listed for. People list things at crazy prices—doesn't mean they sell." 
      },
      { 
        mistake: "Buying too much of one item", 
        solution: "Start with 1-2 of anything. Test the market. Unsold inventory = dead money. Prove it sells before stocking up." 
      },
      { 
        mistake: "Poor photos and descriptions", 
        solution: "Invest 5 minutes in good photos. Clean background, good lighting, multiple angles. Good photos = faster sales." 
      },
      { 
        mistake: "Ignoring fees", 
        solution: "eBay takes ~13%, Mercari 10%, Poshmark 20%. PayPal adds more. Factor fees BEFORE buying. What looks profitable may not be." 
      },
      { 
        mistake: "Not tracking true profit", 
        solution: "Cost of item + shipping supplies + gas + platform fees + PayPal fees = true cost. Many resellers fool themselves on profit." 
      },
      { 
        mistake: "Emotional buying", 
        solution: "It doesn't matter if YOU like it. It matters if it SELLS at a PROFIT. Data over feelings. Check sold comps religiously." 
      }
    ],
    scalingPath: [
      {
        stage: "Beginner (Learning)",
        revenue: "$200-$500/month",
        actions: [
          "List items you already own",
          "Learn to use scanning apps",
          "Thrift 2-3 times per week",
          "Build feedback/reviews"
        ]
      },
      {
        stage: "Part-Time Reseller",
        revenue: "$500-$2,000/month",
        actions: [
          "100+ active listings",
          "Consistent sourcing schedule",
          "2-3 specialized categories",
          "Cross-listing on multiple platforms"
        ]
      },
      {
        stage: "Full-Time Reseller",
        revenue: "$3,000-$8,000/month",
        actions: [
          "500+ active listings",
          "Wholesale or liquidation sourcing",
          "Consider storage/warehouse space",
          "Possibly Amazon FBA"
        ]
      },
      {
        stage: "Reselling Business",
        revenue: "$10,000-$30,000+/month",
        actions: [
          "Team for sourcing/listing/shipping",
          "Multiple selling channels",
          "Direct supplier relationships",
          "Systemized operations"
        ]
      }
    ],
    caseStudy: {
      name: "Angela F.",
      background: "Started reselling from prison by studying eBay listings sent by family. Upon release, had $150 and knowledge of vintage clothing market.",
      timeline: "First month: sold items from family's closets ($400 profit). Month 3: regular thrift runs, $1,800 revenue. Month 6: specialized in vintage denim, hitting $4,000+/month.",
      outcome: "Year 2: runs online vintage shop, $8,000/month average. Works from home with flexible schedule. Speaks at reentry programs about e-commerce."
    },
    resources: [
      { name: "eBay for Sellers", url: "https://www.ebay.com/sell", type: "Platform" },
      { name: "Reseller YouTube (Reseller Weekly)", url: "https://www.youtube.com/results?search_query=reselling+for+beginners", type: "Video" },
      { name: "Vendoo (Cross-listing Tool)", url: "https://www.vendoo.co", type: "Tool" },
      { name: "BQool/Jungle Scout (Amazon)", url: "https://www.junglescout.com", type: "Tool" }
    ]
  },
  {
    id: "personal-training",
    title: "Personal Training & Coaching",
    icon: TrendingUp,
    category: "Health",
    startupCostItems: [
      { item: "Personal trainer certification", min: 300, max: 700 },
      { item: "CPR/AED certification", min: 30, max: 75 },
      { item: "Basic equipment (bands, mat, weights)", min: 100, max: 300 },
      { item: "Business cards/marketing materials", min: 25, max: 50 },
      { item: "Liability insurance", min: 150, max: 300 },
      { item: "Website/booking system (optional start)", min: 0, max: 200 }
    ],
    totalStartupRange: "$605-$1,625",
    earningPotential: [
      { level: "Part-time (10 clients)", monthly: "$1,500-$3,000", description: "Training 15-20 sessions/week" },
      { level: "Full-time Solo", monthly: "$4,000-$8,000", description: "25-35 sessions/week" },
      { level: "Premium In-Person", monthly: "$8,000-$15,000", description: "High-ticket clients + packages" },
      { level: "Online + In-Person", monthly: "$15,000-$50,000+", description: "Hybrid model, passive income" }
    ],
    timeToFirstDollar: "2-6 weeks (including certification)",
    difficulty: "intermediate",
    description: "Transform lives through fitness. Train clients in-person at gyms, parks, homes, or online. Combines passion for fitness with high earning potential and flexible schedule.",
    idealFor: [
      "Fitness enthusiasts who inspire others",
      "People with natural coaching/motivating abilities",
      "Those who want to impact lives directly",
      "Anyone seeking flexible work hours"
    ],
    prerequisites: [
      "Genuine passion for fitness and helping others",
      "Personal fitness experience (doesn't mean perfect physique)",
      "Good communication and interpersonal skills",
      "$500-1,500 for certification and startup",
      "Patience and ability to adapt to different personalities"
    ],
    phases: [
      {
        title: "Phase 1: Get Certified",
        duration: "Weeks 1-4",
        tasks: [
          { 
            task: "Choose and complete certification", 
            details: "Top options: NASM (most recognized), ACE (versatile), ISSA (affordable online), NCSF (budget-friendly). Budget $300-700. Most can be completed in 4-8 weeks with dedicated study.",
            resources: ["NASM.org", "ACEfitness.org", "ISSAonline.edu"]
          },
          { 
            task: "Get CPR/AED certified", 
            details: "Required by most gyms and for insurance. Red Cross or American Heart Association. Usually a 4-hour class, ~$50. Valid for 2 years."
          },
          { 
            task: "Study beyond the basics", 
            details: "Certification is the minimum. Study nutrition basics, corrective exercise, program design. The best trainers never stop learning."
          },
          { 
            task: "Define your specialty", 
            details: "Weight loss? Strength? Athletes? Seniors? Specialization = higher rates. You can always expand later."
          }
        ],
        milestone: "Certified, insured, and ready to train"
      },
      {
        title: "Phase 2: Get First Clients",
        duration: "Weeks 4-8",
        tasks: [
          { 
            task: "Train friends and family first", 
            details: "Offer free or discounted sessions. You need practice, testimonials, and confidence. 5-10 people minimum. Document their results."
          },
          { 
            task: "Approach local gyms", 
            details: "Options: Work as employee (steady pay, less flexibility), rent floor space ($200-500/month), or independent contractor (bring own clients). Each has trade-offs."
          },
          { 
            task: "Launch on social media", 
            details: "Instagram is king for fitness. Post: workout tips, client transformations (with permission), your own training. Consistency > perfection."
          },
          { 
            task: "Set pricing structure", 
            details: "Research local rates. Start at market rate, not below. Example: $60-100/session, $300-500 for 5-session package, $500-900 for 10-session package."
          }
        ],
        milestone: "5+ paying clients, steady schedule forming"
      },
      {
        title: "Phase 3: Build Packages & Systems",
        duration: "Months 2-4",
        tasks: [
          { 
            task: "Create training packages", 
            details: "Don't sell sessions—sell transformations. '12-Week Body Transformation' > '12 sessions.' Include nutrition guidance, check-ins, support."
          },
          { 
            task: "Develop client management system", 
            details: "Use Trainerize, TrueCoach, or even Google Sheets. Track workouts, progress, appointments. Professionalism builds retention."
          },
          { 
            task: "Build referral system", 
            details: "'Free session for every client you refer.' Your happy clients are your best marketing. Ask explicitly."
          },
          { 
            task: "Collect transformations", 
            details: "Before/after photos (with consent). Video testimonials. Written reviews. This is your marketing engine."
          }
        ],
        milestone: "15+ clients, packages sold, systems in place"
      },
      {
        title: "Phase 4: Optimize & Premium Pricing",
        duration: "Months 4-8",
        tasks: [
          { 
            task: "Increase rates", 
            details: "As demand grows, raise prices 10-20%. If everyone says yes, you're too cheap. Some price resistance is healthy."
          },
          { 
            task: "Develop signature program", 
            details: "Your unique method. '6-Week Shred Protocol' or '90-Day Total Transformation.' Naming creates value."
          },
          { 
            task: "Add semi-private training", 
            details: "2-4 clients at once, each pays 60-70% of one-on-one rate. Your hourly income doubles/triples."
          },
          { 
            task: "Launch nutrition coaching", 
            details: "Adds $100-300/month per client. Nutrition = 80% of results. Macro coaching, meal planning, accountability."
          }
        ],
        milestone: "Fully booked at premium rates"
      },
      {
        title: "Phase 5: Scale Beyond Trading Time",
        duration: "Months 6-18",
        tasks: [
          { 
            task: "Launch online coaching", 
            details: "Custom programs delivered via app. Monthly subscription model. Train people anywhere. Scales without your time."
          },
          { 
            task: "Create digital products", 
            details: "Workout guides ($27-97), nutrition ebooks ($17-47), challenge programs ($97-297). Sell while you sleep."
          },
          { 
            task: "Build group programs", 
            details: "8-week transformation groups. 10-20 people, online delivery, weekly calls. $300-500 per person. Major revenue per hour of work."
          },
          { 
            task: "Consider training other trainers", 
            details: "Mentorship, certification prep, business coaching. Your experience becomes a product."
          }
        ],
        milestone: "Multiple income streams, time freedom"
      }
    ],
    scripts: [
      {
        name: "Consultation Call Script",
        content: `"Thanks for reaching out! I'd love to learn more about you. Tell me:

1. What's your main fitness goal right now?
2. What have you tried before that hasn't worked?
3. What does success look like for you in 90 days?

[Listen, take notes]

Based on what you've told me, here's what I recommend... [explain program fit]. My [X-week program] includes [list what's included]. The investment is $[price].

What questions do you have?

[Answer questions]

If you're ready to get started, I have availability [time]. Should I book you in?"`
      },
      {
        name: "Follow-Up to Inquiry",
        content: `"Hey [Name]! Thanks for your interest in training. I'd love to hear about your fitness goals and see if I can help.

Here's what I specialize in: [your specialty, e.g., body recomposition, strength for beginners, etc.]

Would you be available for a quick 15-minute call this week to chat about what you're looking for? 

Let me know a couple times that work and I'll send a calendar invite."`
      },
      {
        name: "Referral Request",
        content: `"[Name], I love working with you and I'm so proud of your progress! I'm actually looking for a few more clients like you.

Do you know anyone else who's been talking about getting in shape? I'll give you a free session for anyone you refer who signs up.

No pressure at all—just wanted to ask since my best clients come from people like you!"`
      },
      {
        name: "Testimonial Request",
        content: `"Hey [Name], I'm updating my testimonials and I'd be honored if you'd share a few words about your experience training with me.

Can you answer these quick questions?
- What was your situation before we started?
- What results have you achieved?
- What would you tell someone considering training with me?

And if you're comfortable, can we take a quick video of you sharing this? Only takes 30 seconds and would mean the world to me."`
      }
    ],
    mistakes: [
      { 
        mistake: "Underpricing to 'build clientele'", 
        solution: "Cheap clients are the worst clients. Price at market rate. Deliver premium experience. Compete on value, not price." 
      },
      { 
        mistake: "Not specializing", 
        solution: "Jack of all trades = master of none. Pick a niche. 'Weight loss for busy professionals' > 'general fitness trainer.'" 
      },
      { 
        mistake: "No testimonials or before/afters", 
        solution: "From day 1, document results. Before/afters and testimonials sell more than any marketing." 
      },
      { 
        mistake: "Only trading time for money", 
        solution: "In-person training is capped at ~40 sessions/week max. Add online coaching, digital products, groups to scale income." 
      },
      { 
        mistake: "Ignoring the business side", 
        solution: "You're running a business, not just training people. Marketing, sales, operations, finances—learn them or stay small." 
      }
    ],
    scalingPath: [
      {
        stage: "Part-Time Trainer",
        revenue: "$1,500-$3,000/month",
        actions: [
          "Get certified and insured",
          "Train 10-15 clients",
          "Build social media presence",
          "Collect testimonials"
        ]
      },
      {
        stage: "Full-Time Trainer",
        revenue: "$4,000-$8,000/month",
        actions: [
          "20-30 clients",
          "Training packages vs. single sessions",
          "Semi-private training added",
          "Referral system active"
        ]
      },
      {
        stage: "Premium Trainer",
        revenue: "$8,000-$15,000/month",
        actions: [
          "Premium pricing established",
          "Signature program created",
          "Nutrition coaching added",
          "Waiting list of clients"
        ]
      },
      {
        stage: "Fitness Business Owner",
        revenue: "$15,000-$50,000+/month",
        actions: [
          "Online coaching launched",
          "Digital products selling",
          "Group programs running",
          "Multiple revenue streams"
        ]
      }
    ],
    caseStudy: {
      name: "Mike R.",
      background: "Got serious about fitness while incarcerated. Spent 4 years training other inmates informally. Released with passion but no certification.",
      timeline: "Month 1: Completed NASM certification (studied while on work release). Month 2-3: Trained 8 friends/family for testimonials. Month 4: First paying clients at $50/session. Month 8: Raised to $85/session, fully booked.",
      outcome: "Year 2: $7,500/month in-person + launched online coaching. Year 3: $14,000/month, trains 5 hours/day, runs group programs. Speaks at jails about fitness transformation."
    },
    resources: [
      { name: "NASM Certification", url: "https://www.nasm.org", type: "Certification" },
      { name: "ACE Fitness", url: "https://www.acefitness.org", type: "Certification" },
      { name: "Trainerize (Client Management)", url: "https://www.trainerize.com", type: "Tool" },
      { name: "Fitness Business YouTube", url: "https://www.youtube.com/results?search_query=personal+training+business", type: "Video" }
    ]
  },
  {
    id: "handyman",
    title: "Handyman Services",
    icon: Hammer,
    category: "Service",
    startupCostItems: [
      { item: "Core tool kit (drill, saw, levels, tape)", min: 200, max: 500 },
      { item: "Hand tools (screwdrivers, pliers, wrenches)", min: 75, max: 150 },
      { item: "Ladder (6-8 ft)", min: 60, max: 120 },
      { item: "Tool bag/box", min: 30, max: 80 },
      { item: "General liability insurance", min: 100, max: 200 },
      { item: "Marketing materials", min: 25, max: 50 }
    ],
    totalStartupRange: "$490-$1,100",
    earningPotential: [
      { level: "Part-time", monthly: "$1,000-$2,500", description: "Weekends + evenings" },
      { level: "Full-time Solo", monthly: "$4,000-$8,000", description: "20-30 jobs/month" },
      { level: "Premium Handyman", monthly: "$8,000-$15,000", description: "Higher rates, reliable reputation" },
      { level: "Team Operation", monthly: "$15,000-$40,000+", description: "Multiple handymen, you manage" }
    ],
    timeToFirstDollar: "1-5 days",
    difficulty: "intermediate",
    description: "Fix, repair, and install things for homeowners and businesses. Plumbing, electrical, drywall, painting, furniture assembly, and everything in between. High demand, good rates, flexible schedule.",
    idealFor: [
      "People who are naturally handy and enjoy fixing things",
      "Problem-solvers who like variety",
      "Those who can work independently",
      "Anyone who takes pride in quality work"
    ],
    prerequisites: [
      "Basic to intermediate repair skills",
      "Reliable tools and transportation",
      "Good customer service attitude",
      "Ability to accurately estimate job time",
      "Willingness to learn new skills"
    ],
    phases: [
      {
        title: "Phase 1: Define Services & Setup",
        duration: "Days 1-7",
        tasks: [
          { 
            task: "List your skills honestly", 
            details: "What can you do WELL? Plumbing, electrical, drywall, painting, mounting, assembly, carpentry? Start with what you know. Expand later."
          },
          { 
            task: "Assemble your tool kit", 
            details: "Must-haves: drill/driver, level, tape measure, utility knife, pliers, screwdriver set, adjustable wrenches, stud finder, hammer, pry bar."
          },
          { 
            task: "Get liability insurance", 
            details: "Covers property damage claims. Required by most platforms and smart clients. $100-200/year for basic coverage. Non-negotiable."
          },
          { 
            task: "Create service list with pricing", 
            details: "Flat rate for common jobs (TV mount: $75, faucet install: $125) + hourly rate for general work ($50-100/hr depending on market)."
          }
        ],
        milestone: "Insured, tooled up, pricing set"
      },
      {
        title: "Phase 2: Get on Platforms & Start",
        duration: "Days 7-21",
        tasks: [
          { 
            task: "Join Thumbtack, TaskRabbit, Angi", 
            details: "Thumbtack = pay per lead. TaskRabbit = direct booking. Angi (HomeAdvisor) = leads. Be on multiple to maximize opportunities.",
            resources: ["Thumbtack.com", "TaskRabbit.com", "Angi.com"]
          },
          { 
            task: "List on Facebook Marketplace/Groups", 
            details: "Local community groups are goldmine. Introduce yourself: 'Local handyman available for small jobs. Licensed, insured. Here's what I can do:'"
          },
          { 
            task: "Create Nextdoor profile", 
            details: "Neighbors trust Nextdoor recommendations. Create business profile. Engage in neighborhood. Ask happy customers to recommend you there."
          },
          { 
            task: "Complete first jobs at competitive rates", 
            details: "Goal is reviews and experience. Price 10-15% below market to ensure you're booked. Quality and reviews will allow premium pricing later."
          }
        ],
        milestone: "Active on 3+ platforms, first 5 jobs completed"
      },
      {
        title: "Phase 3: Build Reputation",
        duration: "Weeks 3-8",
        tasks: [
          { 
            task: "Over-deliver on every job", 
            details: "Early, professional, clean up after yourself. Fix the little things you notice. 'I noticed your cabinet door was loose—I tightened it while I was here.'"
          },
          { 
            task: "Request reviews immediately", 
            details: "Before you leave: 'If you're happy with the work, I'd really appreciate a quick review on [platform]. It's how I get more customers.'"
          },
          { 
            task: "Build a photo portfolio", 
            details: "Before/after of repairs. Especially satisfying fixes. These go on your profiles and social media. Visual proof sells."
          },
          { 
            task: "Ask for referrals explicitly", 
            details: "'Know anyone else who needs things fixed? I'll give you $20 off your next job for any referral.' Leave extra business cards."
          }
        ],
        milestone: "15+ reviews, referrals starting to come in"
      },
      {
        title: "Phase 4: Optimize & Raise Prices",
        duration: "Months 2-6",
        tasks: [
          { 
            task: "Increase rates 15-25%", 
            details: "With reviews and demand, premium pricing is justified. Track if you lose business. You probably won't."
          },
          { 
            task: "Develop quick-win services", 
            details: "Identify jobs you do fast. If you can mount a TV in 30 minutes, $75 flat rate = $150/hr effective. Speed = profit."
          },
          { 
            task: "Add service area specialization", 
            details: "Become 'the TV mount guy' or 'the furniture assembly pro.' Specialization = less quoting, faster jobs, repeat customers."
          },
          { 
            task: "Build recurring relationships", 
            details: "Property managers, realtors, landlords = steady work. Offer slight discount for volume. One property manager = dozens of jobs/year."
          }
        ],
        milestone: "Fully booked, premium rates, recurring clients"
      },
      {
        title: "Phase 5: Scale the Business",
        duration: "Months 6-18",
        tasks: [
          { 
            task: "Hire helper/apprentice", 
            details: "Pay $15-25/hr. They do the labor on easy jobs. You handle estimates, customer relations, complex work. Doubles your capacity."
          },
          { 
            task: "Create service packages", 
            details: "'Quarterly Home Maintenance' subscription. List of services for monthly fee. Predictable revenue."
          },
          { 
            task: "Pursue commercial contracts", 
            details: "Property management companies, HOAs, small businesses. More consistent, larger jobs."
          },
          { 
            task: "Build systems for scaling", 
            details: "CRM, scheduling, invoicing automation. Prepare to run the business, not just do the work."
          }
        ],
        milestone: "Multiple workers, business runs without you daily"
      }
    ],
    scripts: [
      {
        name: "Estimate Request Response",
        content: `"Hi [Name]! Thanks for reaching out. I'd be happy to help with that [job description].

To give you an accurate quote, I have a couple quick questions:
1. [Relevant question about scope]
2. [Relevant question about access/timing]

Most [type of job] I do runs $[range], depending on [variables]. 

I've got availability [day/time]. Would that work to take a look and give you an exact price?"`
      },
      {
        name: "Property Manager Pitch",
        content: `"Hi [Name], I'm [Your Name], a local handyman serving [area]. I specialize in quick turnarounds for rental properties—tenant repairs, turnover work, maintenance.

I'm licensed, insured, and I understand landlords need reliable and fast. I work with several property managers and they love that I communicate well, show up when I say, and do it right the first time.

Could I leave you my information for your next job? I'm happy to do a discounted first job so you can see the quality of my work."`
      },
      {
        name: "Review Request",
        content: `"Thanks so much [Name]! If you're happy with how everything turned out, I'd really appreciate a quick review on [platform]. It only takes a minute and it's how small businesses like mine get found.

Here's the direct link: [link]

And if anything ever comes up—loose handle, stuck door—give me a call. Happy to help."`
      },
      {
        name: "Upsell During Job",
        content: `"While I'm here, I noticed [something that needs attention—loose hinge, cracked outlet cover, etc.]. I can take care of that right now for an extra $[amount] if you'd like. Only take me about [X] minutes.

[If they decline]: No worries! Just wanted to mention it while I was here."`
      }
    ],
    mistakes: [
      { 
        mistake: "Saying yes to jobs you can't do well", 
        solution: "Be honest about your skills. It's better to refer out than to do a bad job. Bad work = bad reviews = business killer." 
      },
      { 
        mistake: "Underestimating job time", 
        solution: "Pad estimates by 20-30%. Unexpected issues happen. Better to finish early than run over. Use flat rates for common jobs." 
      },
      { 
        mistake: "Not having proper insurance", 
        solution: "One injury or damage claim without insurance = financial ruin. It's cheap. Get it." 
      },
      { 
        mistake: "Poor communication", 
        solution: "Confirm appointments, text when running late, explain what you're doing. Communication builds trust and referrals." 
      },
      { 
        mistake: "No follow-up or referral ask", 
        solution: "Every happy customer is a potential 5-star review and referral source. Ask explicitly. Make it easy." 
      }
    ],
    scalingPath: [
      {
        stage: "Side Hustle Handyman",
        revenue: "$1,000-$2,500/month",
        actions: [
          "Platform profiles active",
          "Weekend/evening availability",
          "Building review count",
          "Learning what jobs pay best"
        ]
      },
      {
        stage: "Full-Time Handyman",
        revenue: "$4,000-$8,000/month",
        actions: [
          "Full-time availability",
          "Direct bookings > platform jobs",
          "Premium rates established",
          "Referral system working"
        ]
      },
      {
        stage: "Premium Handyman",
        revenue: "$8,000-$15,000/month",
        actions: [
          "High rates, selective about jobs",
          "Commercial/recurring contracts",
          "Helper for volume work",
          "Efficient systems"
        ]
      },
      {
        stage: "Handyman Business",
        revenue: "$15,000-$40,000+/month",
        actions: [
          "Multiple handymen employed",
          "You manage and grow",
          "Office/admin support",
          "Owner not daily operator"
        ]
      }
    ],
    caseStudy: {
      name: "Carlos D.",
      background: "Learned carpentry and general maintenance from his grandfather, then years of institutional maintenance work while incarcerated. Released with skills but no formal credentials.",
      timeline: "Week 1: Created profiles on Thumbtack, TaskRabbit, posted in Facebook groups. Week 2: First 3 jobs ($350 total). Month 2: Regular referrals, raised rates. Month 6: $5,500/month solo.",
      outcome: "Year 2: Hired nephew as helper. $11,000/month. Works 5 days/week, takes his kids to school every morning. Gets most business from repeat customers and property managers."
    },
    resources: [
      { name: "Thumbtack", url: "https://www.thumbtack.com", type: "Platform" },
      { name: "TaskRabbit", url: "https://www.taskrabbit.com", type: "Platform" },
      { name: "Nextdoor Business", url: "https://business.nextdoor.com", type: "Platform" },
      { name: "Handyman Business YouTube", url: "https://www.youtube.com/results?search_query=start+handyman+business", type: "Video" }
    ]
  },
  {
    id: "freelance-digital",
    title: "Freelance Digital Services",
    icon: Laptop,
    category: "Digital",
    startupCostItems: [
      { item: "Computer/laptop", min: 0, max: 0 },
      { item: "Internet access", min: 50, max: 80 },
      { item: "Canva Pro (design)", min: 0, max: 13 },
      { item: "Portfolio website (optional)", min: 0, max: 100 },
      { item: "Skill course (optional)", min: 0, max: 200 }
    ],
    totalStartupRange: "$50-$393",
    earningPotential: [
      { level: "Entry Level", monthly: "$500-$1,500", description: "Lower rates, building skills" },
      { level: "Intermediate", monthly: "$2,000-$5,000", description: "Consistent client base" },
      { level: "Established", monthly: "$5,000-$10,000", description: "Premium rates, niched down" },
      { level: "Agency/Scaled", monthly: "$15,000-$50,000+", description: "Team or productized services" }
    ],
    timeToFirstDollar: "1-3 weeks",
    difficulty: "intermediate",
    description: "Offer writing, graphic design, social media management, virtual assistance, or other digital skills remotely. Work from anywhere, choose your clients, build a real business.",
    idealFor: [
      "Self-motivated people comfortable working alone",
      "Strong writers or visual creators",
      "Organized people who meet deadlines",
      "Those seeking location-independent income"
    ],
    prerequisites: [
      "Computer/laptop with reliable internet",
      "Skill in at least one service area (or willingness to learn)",
      "Self-discipline to meet deadlines",
      "Basic business communication skills",
      "PayPal, Stripe, or bank account for payments"
    ],
    phases: [
      {
        title: "Phase 1: Pick Your Service & Skill Up",
        duration: "Weeks 1-2",
        tasks: [
          { 
            task: "Choose your service offering", 
            details: "Options: Copywriting, graphic design, social media management, virtual assistance, video editing, web design, bookkeeping. Pick ONE to start. Master before expanding."
          },
          { 
            task: "Take free/cheap courses", 
            details: "YouTube, Skillshare, Coursera, HubSpot Academy. 10-20 hours of learning can differentiate you. Focus on practical, not theoretical.",
            resources: ["YouTube tutorials", "HubSpot Academy (free)", "Skillshare (free trial)"]
          },
          { 
            task: "Create portfolio samples", 
            details: "No clients yet? Create samples anyway. Write sample blog posts, design mock logos, manage a friend's social media for free. You need something to show."
          },
          { 
            task: "Research market rates", 
            details: "Check Fiverr, Upwork to see what others charge. Entry rates are fine to start. Know what you're worth as you improve."
          }
        ],
        milestone: "Service defined, skills developing, samples ready"
      },
      {
        title: "Phase 2: Set Up & Get First Clients",
        duration: "Weeks 2-4",
        tasks: [
          { 
            task: "Create freelance platform profiles", 
            details: "Upwork, Fiverr, Freelancer.com. Complete profiles fully. Photo, detailed description, portfolio samples. Incomplete profiles = no trust.",
            resources: ["Upwork.com", "Fiverr.com", "Freelancer.com"]
          },
          { 
            task: "Apply to jobs aggressively", 
            details: "On Upwork: personalize every proposal. Address their specific need. Show relevant samples. Apply to 10-20 jobs/day initially. It's a numbers game."
          },
          { 
            task: "Offer discounted first project", 
            details: "To break in: 'I'm building my portfolio and will do this at 50% my normal rate in exchange for a review if you're happy.' Get in the door."
          },
          { 
            task: "Deliver excellent work", 
            details: "First clients = first reviews. Over-deliver. Fast turnaround. More than asked. These reviews build your future income."
          }
        ],
        milestone: "3-5 clients served, first reviews collected"
      },
      {
        title: "Phase 3: Build Client Base",
        duration: "Months 1-3",
        tasks: [
          { 
            task: "Focus on repeat business", 
            details: "One happy client who returns monthly is worth more than 10 one-time gigs. Offer package deals. Ask about ongoing needs."
          },
          { 
            task: "Develop direct outreach", 
            details: "Find businesses who need your skill. Email/DM with specific value proposition. 'I noticed you're posting inconsistently. I can help with that.'"
          },
          { 
            task: "Create content around your expertise", 
            details: "LinkedIn posts, Twitter threads about your skill. Show knowledge. Attract clients who find you. Inbound > outbound."
          },
          { 
            task: "Gradually raise rates", 
            details: "As demand increases, raise rates 10-20% for new clients. Keep good existing clients at old rates (for now)."
          }
        ],
        milestone: "$2,000+/month, 5+ regular clients"
      },
      {
        title: "Phase 4: Specialize & Premium Position",
        duration: "Months 3-8",
        tasks: [
          { 
            task: "Niche down", 
            details: "'Copywriter' is generic. 'Email copywriter for e-commerce brands' is specific. Specificity = higher rates + easier marketing."
          },
          { 
            task: "Create signature packages", 
            details: "Instead of hourly/project: 'Complete Email Funnel Package - $1,500' or 'Monthly Social Media Management - $997.' Productize your service."
          },
          { 
            task: "Build testimonial/case study library", 
            details: "Results sell. 'Increased open rates by 40%' or 'Generated 5,000 followers in 6 months.' Quantify impact."
          },
          { 
            task: "Move off platforms to direct billing", 
            details: "Platforms take 20%. Once you have direct client relationships, invoice directly. Keep platform for new client discovery."
          }
        ],
        milestone: "$5,000+/month, premium positioning, direct clients"
      },
      {
        title: "Phase 5: Scale Beyond Yourself",
        duration: "Months 6-18",
        tasks: [
          { 
            task: "Hire subcontractors", 
            details: "Find freelancers to do the work. You manage clients, they execute. You keep margin. Now you have an agency."
          },
          { 
            task: "Create courses/digital products", 
            details: "Teach what you know. 'How to Write Emails That Convert' for $97-297. Sells while you sleep."
          },
          { 
            task: "Build recurring revenue model", 
            details: "Retainer clients paying monthly = predictable income. Target 60%+ of revenue from retainers."
          },
          { 
            task: "Consider productized service", 
            details: "Fixed scope, fixed price, recurring. 'Done-for-you blog posts: 4 per month, $800.' Scales without custom quoting."
          }
        ],
        milestone: "$10,000+/month, business not dependent on your hours"
      }
    ],
    scripts: [
      {
        name: "Upwork Proposal Template",
        content: `"Hi [Client Name],

I read through your project and I understand you need [specific deliverable] for [their goal].

I've done exactly this before. [1-2 sentences about relevant experience]. Here's an example of similar work: [link to portfolio piece].

For this project, I would [brief description of approach]. Timeline: [X days/weeks].

I'm available to start immediately and can jump on a quick call to discuss details if that's helpful.

Looking forward to helping!

[Your Name]"`
      },
      {
        name: "Direct Outreach Email",
        content: `Subject: Quick idea for [their company name]

Hi [Name],

I came across [their company] and noticed [specific observation about their content/design/marketing].

I specialize in [your service] and I have an idea that could [specific benefit—more engagement, leads, sales].

Would you be open to a 10-minute chat this week? I'll share the idea and if it makes sense, we can discuss working together.

Best,
[Your Name]
[Link to portfolio or website]`
      },
      {
        name: "Retainer Pitch (After Project)",
        content: `"Hey [Client Name], 

I really enjoyed working on [project]. Based on what I saw, there's ongoing opportunity to [improve X, maintain Y, grow Z].

I'm offering a monthly retainer that includes [specific deliverables]. It's $[price]/month, and you get priority turnaround plus [additional benefits].

This way you don't have to think about [your service area]—it's handled consistently.

Want me to put together a quick proposal?"`
      },
      {
        name: "Testimonial Request",
        content: `"Hey [Client Name],

I'm so glad you're happy with the work! If you have a moment, would you mind writing a short testimonial I could use on my website/profile?

Something simple like:
- What was the situation before we worked together?
- What did I help you accomplish?
- Would you recommend working with me?

No pressure at all, but it really helps me get more clients like you!"`
      }
    ],
    mistakes: [
      { 
        mistake: "Bidding on everything without focus", 
        solution: "Apply to jobs you can actually win. Quality proposals > quantity. Personalize every one." 
      },
      { 
        mistake: "Racing to the bottom on price", 
        solution: "There's always someone cheaper. Compete on quality, reliability, speed. Cheap clients are the worst clients." 
      },
      { 
        mistake: "Not getting paid upfront", 
        solution: "New clients: 50-100% upfront for first project. Retainers: bill monthly in advance. Chasing payments is draining." 
      },
      { 
        mistake: "Scope creep", 
        solution: "Define deliverables clearly. 'That will be outside the current scope—I can add it for $X.' Boundaries protect your time." 
      },
      { 
        mistake: "Inconsistent availability", 
        solution: "Freelancing requires discipline. Set work hours. Respond promptly. Reliability = repeat business." 
      }
    ],
    scalingPath: [
      {
        stage: "Beginner Freelancer",
        revenue: "$500-$1,500/month",
        actions: [
          "Active on Upwork/Fiverr",
          "10-20 applications/week",
          "Building portfolio and reviews",
          "Learning from each project"
        ]
      },
      {
        stage: "Intermediate Freelancer",
        revenue: "$2,000-$5,000/month",
        actions: [
          "Steady client base",
          "Repeat business from satisfied clients",
          "Starting direct outreach",
          "Raising rates on new clients"
        ]
      },
      {
        stage: "Established Freelancer",
        revenue: "$5,000-$10,000/month",
        actions: [
          "Specialized niche",
          "Premium rates",
          "Most revenue from retainers",
          "Referrals incoming"
        ]
      },
      {
        stage: "Agency/Scaled",
        revenue: "$15,000-$50,000+/month",
        actions: [
          "Team of subcontractors",
          "Productized services",
          "Passive income from courses",
          "Business runs with minimal involvement"
        ]
      }
    ],
    caseStudy: {
      name: "Lisa H.",
      background: "Taught herself graphic design using library computers while incarcerated. Studied design blogs and practiced constantly. Released with a portfolio of concept work but no professional experience.",
      timeline: "Month 1: Created Fiverr profile with logo design gig. Priced at $15 to start. Got first 5 reviews. Month 3: Raised to $50/logo. Month 6: Moved to Upwork for bigger clients. Year 1: $4,500/month.",
      outcome: "Year 3: Runs small design agency with 2 subcontractors. $12,000/month revenue. Works from home. Teaches design fundamentals at local reentry center."
    },
    resources: [
      { name: "Upwork", url: "https://www.upwork.com", type: "Platform" },
      { name: "Fiverr", url: "https://www.fiverr.com", type: "Platform" },
      { name: "Canva", url: "https://www.canva.com", type: "Tool" },
      { name: "HubSpot Academy (Free)", url: "https://academy.hubspot.com", type: "Learning" },
      { name: "Freelancing YouTube", url: "https://www.youtube.com/results?search_query=freelancing+for+beginners", type: "Video" }
    ]
  }
];

const difficultyColors = {
  beginner: "bg-green-500/20 text-green-400 border-green-500/30",
  intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  advanced: "bg-red-500/20 text-red-400 border-red-500/30"
};

const HustleIdeas = () => {
  const [filter, setFilter] = useState<string>("all");
  const [selectedHustle, setSelectedHustle] = useState<HustleIdea | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  const categories = ["all", ...new Set(hustleIdeas.map(h => h.category))];
  const filteredIdeas = filter === "all" 
    ? hustleIdeas 
    : hustleIdeas.filter(h => h.category === filter);

  if (selectedHustle) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => { setSelectedHustle(null); setActiveTab("overview"); }}
          className="gap-2"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to All Hustles
        </Button>

        {/* Hustle Header */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
              <selectedHustle.icon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <Badge className={difficultyColors[selectedHustle.difficulty]}>
                {selectedHustle.difficulty}
              </Badge>
              <h1 className="text-2xl font-display mt-1">{selectedHustle.title}</h1>
            </div>
          </div>
          <p className="text-muted-foreground">{selectedHustle.description}</p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-charcoal p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Startup Cost</p>
              <p className="font-semibold text-primary">{selectedHustle.totalStartupRange}</p>
            </div>
            <div className="bg-charcoal p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">First Dollar</p>
              <p className="font-semibold">{selectedHustle.timeToFirstDollar}</p>
            </div>
            <div className="bg-charcoal p-3 rounded-lg col-span-2 md:col-span-1">
              <p className="text-xs text-muted-foreground mb-1">Top Earning Potential</p>
              <p className="font-semibold text-green-400">{selectedHustle.earningPotential[selectedHustle.earningPotential.length - 1].monthly}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1.5 p-2 bg-charcoal/80 border border-border rounded-xl sticky top-0 z-10 backdrop-blur-sm">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-amber-500/10
                data-[state=active]:border data-[state=active]:border-primary/40 data-[state=active]:text-primary 
                data-[state=active]:shadow-[0_0_15px_-5px_hsl(43_74%_49%_/_0.4)]
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-charcoal"
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="phases" 
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-blue-500/5
                data-[state=active]:border data-[state=active]:border-blue-500/40 data-[state=active]:text-blue-400 
                data-[state=active]:shadow-[0_0_15px_-5px_hsl(210_100%_50%_/_0.3)]
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-charcoal"
            >
              <Rocket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Launch Plan</span>
            </TabsTrigger>
            <TabsTrigger 
              value="scripts" 
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-green-500/5
                data-[state=active]:border data-[state=active]:border-green-500/40 data-[state=active]:text-green-400 
                data-[state=active]:shadow-[0_0_15px_-5px_hsl(142_71%_45%_/_0.3)]
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-charcoal"
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Scripts</span>
            </TabsTrigger>
            <TabsTrigger 
              value="mistakes" 
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500/20 data-[state=active]:to-red-500/5
                data-[state=active]:border data-[state=active]:border-red-500/40 data-[state=active]:text-red-400 
                data-[state=active]:shadow-[0_0_15px_-5px_hsl(0_84%_60%_/_0.3)]
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-charcoal"
            >
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Mistakes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="scaling" 
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-amber-500/5
                data-[state=active]:border data-[state=active]:border-amber-500/40 data-[state=active]:text-amber-400 
                data-[state=active]:shadow-[0_0_15px_-5px_hsl(43_96%_56%_/_0.3)]
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-charcoal"
            >
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Scaling</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Earning Potential Breakdown */}
            <div className="bg-card p-5 rounded-lg border border-border">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-green-400" /> Earning Potential
              </h3>
              <div className="space-y-3">
                {selectedHustle.earningPotential.map((level, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-charcoal rounded-lg">
                    <div>
                      <p className="font-medium">{level.level}</p>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                    </div>
                    <p className="text-lg font-semibold text-green-400 mt-2 sm:mt-0">{level.monthly}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Startup Costs */}
            <div className="bg-card p-5 rounded-lg border border-border">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Scale className="w-5 h-5 text-primary" /> Startup Cost Breakdown
              </h3>
              <div className="space-y-2">
                {selectedHustle.startupCostItems.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.item}</span>
                    <span className="text-muted-foreground">${item.min}-${item.max}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-3 flex justify-between font-semibold">
                  <span>Total Range</span>
                  <span className="text-primary">{selectedHustle.totalStartupRange}</span>
                </div>
              </div>
            </div>

            {/* Ideal For & Prerequisites */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-primary" /> Ideal For
                </h3>
                <ul className="space-y-2 text-sm">
                  {selectedHustle.idealFor.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-primary" /> Prerequisites
                </h3>
                <ul className="space-y-2 text-sm">
                  {selectedHustle.prerequisites.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Case Study */}
            <div className="bg-gradient-to-br from-primary/10 to-amber-500/10 p-5 rounded-lg border border-primary/30">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-primary" /> Real Success Story: {selectedHustle.caseStudy.name}
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Background:</strong> {selectedHustle.caseStudy.background}</p>
                <p><strong>Timeline:</strong> {selectedHustle.caseStudy.timeline}</p>
                <p><strong>Outcome:</strong> <span className="text-green-400">{selectedHustle.caseStudy.outcome}</span></p>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-card p-5 rounded-lg border border-border">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary" /> Resources
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedHustle.resources.map((resource, i) => (
                  <a
                    key={i}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-2 bg-charcoal rounded-lg text-sm hover:bg-primary/20 transition-colors"
                  >
                    {resource.name}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Launch Plan Tab */}
          <TabsContent value="phases" className="space-y-4">
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/30 mb-6">
              <p className="text-sm">
                <strong className="text-primary">Your Complete Launch Plan</strong> — Follow these phases step-by-step. 
                Each phase builds on the previous one. Don't skip ahead.
              </p>
            </div>
            
            {selectedHustle.phases.map((phase, phaseIndex) => (
              <Accordion key={phaseIndex} type="single" collapsible defaultValue={phaseIndex === 0 ? `phase-${phaseIndex}` : undefined}>
                <AccordionItem value={`phase-${phaseIndex}`} className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-4 text-left w-full pr-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">
                        {phaseIndex + 1}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold">{phase.title}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {phase.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" /> {phase.milestone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="pt-2 pb-6 space-y-4">
                    {phase.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="p-4 bg-charcoal rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {taskIndex + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">{task.task}</h4>
                            <p className="text-sm text-muted-foreground mb-3">{task.details}</p>
                            {task.resources && (
                              <div className="flex flex-wrap gap-2">
                                {task.resources.map((r, ri) => (
                                  <Badge key={ri} variant="outline" className="text-xs">
                                    {r}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                      <p className="text-sm">
                        <strong className="text-primary">Phase {phaseIndex + 1} Milestone:</strong>{" "}
                        {phase.milestone}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </TabsContent>

          {/* Scripts Tab */}
          <TabsContent value="scripts" className="space-y-4">
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/30 mb-6">
              <p className="text-sm">
                <strong className="text-primary">Copy-Paste Templates</strong> — Use these scripts exactly or customize them. 
                The key is to actually USE them, not just read them.
              </p>
            </div>
            
            {selectedHustle.scripts.map((script, i) => (
              <div key={i} className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-primary" /> {script.name}
                </h3>
                <div className="bg-charcoal p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-sans">{script.content}</pre>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Mistakes Tab */}
          <TabsContent value="mistakes" className="space-y-4">
            <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/30 mb-6">
              <p className="text-sm">
                <AlertTriangle className="inline w-4 h-4 mr-2" />
                <strong>Avoid These Costly Mistakes</strong> — Most people fail because of these predictable errors. 
                Learn from others' failures.
              </p>
            </div>
            
            {selectedHustle.mistakes.map((mistake, i) => (
              <div key={i} className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-destructive/20 text-destructive flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-destructive">Mistake: {mistake.mistake}</h4>
                  </div>
                </div>
                <div className="flex items-start gap-3 ml-11">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <p className="text-sm text-muted-foreground"><strong className="text-green-400">Solution:</strong> {mistake.solution}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Scaling Tab */}
          <TabsContent value="scaling" className="space-y-4">
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/30 mb-6">
              <p className="text-sm">
                <Rocket className="inline w-4 h-4 mr-2" />
                <strong className="text-primary">Your Growth Path</strong> — From first dollar to empire. 
                Each stage has specific actions to reach the next level.
              </p>
            </div>
            
            <div className="grid gap-4">
              {selectedHustle.scalingPath.map((stage, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border relative">
                  {i < selectedHustle.scalingPath.length - 1 && (
                    <div className="hidden md:block absolute left-1/2 -bottom-4 w-0 h-4 border-l-2 border-dashed border-primary/30 z-10" />
                  )}
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{stage.stage}</h4>
                        <p className="text-green-400 font-semibold">{stage.revenue}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {stage.actions.map((action, ai) => (
                      <div key={ai} className="flex items-start gap-2 text-sm bg-charcoal p-2 rounded">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="headline-card">Side Hustle Playbooks</h2>
            <p className="text-sm text-muted-foreground">Complete launch guides—not just ideas</p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={filter === cat ? "gold" : "goldOutline"}
              size="sm"
              onClick={() => setFilter(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-br from-primary/10 to-amber-500/10 p-4 rounded-lg border border-primary/30">
        <p className="text-sm text-center">
          <strong className="text-primary">These aren't just ideas</strong> — each includes startup costs, 
          week-by-week launch plans, scripts, common mistakes, and scaling paths.
        </p>
      </div>

      {/* Hustle Grid */}
      <div className="grid gap-4">
        {filteredIdeas.map((hustle) => (
          <div
            key={hustle.id}
            className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => setSelectedHustle(hustle)}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/30 transition-colors">
                <hustle.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-lg">{hustle.title}</h3>
                  <Badge className={difficultyColors[hustle.difficulty]}>
                    {hustle.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{hustle.description}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="w-4 h-4 text-primary" /> 
                    <span className="text-foreground font-medium">{hustle.totalStartupRange}</span> startup
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <TrendingUp className="w-4 h-4 text-green-400" /> 
                    <span className="text-green-400 font-medium">{hustle.earningPotential[2]?.monthly || hustle.earningPotential[1]?.monthly}</span> potential
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" /> {hustle.timeToFirstDollar}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Motivation */}
      <div className="bg-gradient-to-br from-primary/20 to-amber-500/10 p-6 rounded-lg border border-primary/30 text-center">
        <p className="text-lg font-semibold mb-2">
          "The best time to plant a tree was 20 years ago. The second best time is now."
        </p>
        <p className="text-sm text-muted-foreground">
          Pick one hustle. Follow the plan. Start today.
        </p>
      </div>
    </div>
  );
};

export default HustleIdeas;