import { useState } from "react";
import { 
  Crown,
  DollarSign,
  TrendingUp,
  Building2,
  Users,
  Target,
  Lightbulb,
  BookOpen,
  ExternalLink,
  Play,
  CheckCircle2,
  Globe,
  Megaphone,
  Scale,
  Briefcase,
  Zap,
  Brain,
  Clock,
  ArrowRight,
  Calendar,
  Star,
  Home,
  Mic,
  Package,
  Layers,
  Sparkles
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

// ========== COMPREHENSIVE BUSINESS MASTERY MODULES ==========

interface ThirtyDayAction {
  week: number;
  days: string;
  focus: string;
  tasks: string[];
  milestone: string;
}

interface BusinessModule {
  id: string;
  title: string;
  icon: any;
  category: string;
  difficulty: "foundational" | "intermediate" | "advanced" | "elite";
  estimatedTime: string;
  description: string;
  keyTakeaways: string[];
  sections: {
    title: string;
    content: string;
    actionItems?: string[];
    proTips?: string[];
  }[];
  thirtyDayPlan?: ThirtyDayAction[];
  resources: { name: string; url: string; type: "video" | "article" | "tool" | "book" }[];
  caseStudy?: {
    title: string;
    scenario: string;
    outcome: string;
  };
}

const businessModules: BusinessModule[] = [
  {
    id: "mindset-wealth",
    title: "The Wealth Mindset",
    icon: Brain,
    category: "Foundation",
    difficulty: "foundational",
    estimatedTime: "45 min",
    description: "Transform your relationship with money. Understand the psychology that separates the wealthy from everyone else.",
    keyTakeaways: [
      "Poverty is a mindset before it's a bank balance",
      "Rich people buy assets, poor people buy liabilities",
      "Time is your most valuable asset—trade it for equity, not wages",
      "Your network determines your net worth"
    ],
    sections: [
      {
        title: "The Broke Mentality vs. Wealth Consciousness",
        content: `Most people think the difference between rich and poor is money. It's not. It's mindset.

The broke mentality says: "I can't afford that."
The wealth mindset asks: "How can I afford that?"

The broke mentality trades time for money.
The wealth mindset trades money for time.

The broke mentality fears risk.
The wealth mindset calculates risk and acts decisively.

The broke mentality sees competition.
The wealth mindset sees collaboration.

**The Core Shift:** Stop thinking like an employee. Start thinking like an owner. Employees get paid for their time. Owners get paid for their results. Every dollar you make should work harder than you do.`,
        actionItems: [
          "Write down 10 limiting beliefs you have about money",
          "For each belief, write the opposite empowering belief",
          "Read your new beliefs every morning for 30 days"
        ],
        proTips: [
          "Surround yourself with people who have what you want",
          "Read 'Rich Dad Poor Dad' if you haven't—it's the starting point",
          "Audit your consumption: news, social media, conversations. Are they making you richer or keeping you broke?"
        ]
      },
      {
        title: "Assets vs. Liabilities: The Only Financial Lesson You Need",
        content: `**Asset:** Something that puts money IN your pocket.
**Liability:** Something that takes money OUT of your pocket.

That's it. That's the game.

Your job? An asset to your employer, but potentially a liability to you if it's your only income.

Your car? Usually a liability (depreciates, insurance, gas, maintenance).

A rental property? An asset (generates cash flow).

A skill that people pay for? An asset.

A YouTube channel with 100K subscribers? An asset.

**The Wealth Formula:**
1. Minimize liabilities
2. Maximize assets
3. Reinvest asset income into more assets
4. Compound until wealthy`,
        actionItems: [
          "List everything you spend money on monthly",
          "Categorize each as ASSET (makes money) or LIABILITY (costs money)",
          "Identify 3 liabilities you can eliminate this month",
          "Identify 1 asset you can start building this week"
        ]
      },
      {
        title: "The Wealth Hierarchy: Levels of Income",
        content: `**Level 1: Active Income (Trading Time)**
You work, you get paid. You stop working, income stops.
Examples: Jobs, freelancing, consulting (when you're doing the work)

**Level 2: Leveraged Income (Trading Results)**
You do the work once, get paid repeatedly.
Examples: Digital products, books, courses, music royalties

**Level 3: Passive Income (Trading Assets)**
Your money/assets work for you.
Examples: Dividends, rental income, business ownership

**Level 4: Equity Income (Ownership Appreciation)**
Your stake in something grows in value.
Examples: Business equity, real estate appreciation, stock gains

**The Goal:** Move up the hierarchy. Build Level 2 income to fund Level 3 assets that generate Level 4 equity.`,
        proTips: [
          "Most people never get past Level 1 because they're comfortable",
          "Level 2 is where most self-made millionaires start",
          "You need Level 1 to fund Level 2. Don't skip steps.",
          "The wealthy have income at ALL levels simultaneously"
        ]
      }
    ],
    thirtyDayPlan: [
      {
        week: 1,
        days: "Days 1-7",
        focus: "Mindset Audit",
        tasks: [
          "Write down every money belief you have (good and bad)",
          "Track every dollar you spend this week",
          "Read chapters 1-3 of Rich Dad Poor Dad",
          "Identify 3 people in your life who have wealth mindset",
          "Unfollow 5 accounts that promote consumerism",
          "Follow 5 accounts that teach wealth building",
          "Write your 'Why' — what you're building toward"
        ],
        milestone: "Clear picture of current money mindset"
      },
      {
        week: 2,
        days: "Days 8-14",
        focus: "Asset Identification",
        tasks: [
          "Complete asset vs. liability inventory of everything you own",
          "Calculate your true net worth (assets - liabilities)",
          "Identify 3 skills you have that could generate income",
          "Research 2 asset types that interest you (real estate, stocks, business)",
          "Cancel 1 subscription you don't use",
          "Find 1 free resource to learn about investing",
          "Schedule 30 min daily for wealth education"
        ],
        milestone: "Know your current financial reality"
      },
      {
        week: 3,
        days: "Days 15-21",
        focus: "Income Strategy",
        tasks: [
          "Map out your current income sources",
          "Identify 1 way to increase current income by 10%",
          "Brainstorm 5 ways to earn money outside your job",
          "Research 1 side hustle that matches your skills",
          "Calculate how much you could invest if you cut 3 expenses",
          "Set up a separate savings account for investing",
          "Automate $25-100/week into that account"
        ],
        milestone: "First investment fund started"
      },
      {
        week: 4,
        days: "Days 22-30",
        focus: "Wealth Building Launch",
        tasks: [
          "Start 1 income-generating activity (even small)",
          "Make your first investment (even $25)",
          "Create 1-year financial goal with specific numbers",
          "Break that into quarterly milestones",
          "Share your goal with 1 accountability partner",
          "Schedule weekly money review (30 min)",
          "Plan next 90 days of wealth education"
        ],
        milestone: "Wealth building system in motion"
      }
    ],
    resources: [
      { name: "Rich Dad Poor Dad - Robert Kiyosaki", url: "https://www.amazon.com/Rich-Dad-Poor-Teach-Middle/dp/1612680194", type: "book" },
      { name: "The Psychology of Money - Morgan Housel", url: "https://www.amazon.com/Psychology-Money-Timeless-lessons-happiness/dp/0857197681", type: "book" },
      { name: "Naval Ravikant: How to Get Rich", url: "https://www.youtube.com/results?search_query=naval+ravikant+how+to+get+rich", type: "video" }
    ],
    caseStudy: {
      title: "From Inmate to 7-Figure Business Owner",
      scenario: "Marcus spent 8 years in prison. While inside, he read every business book he could get. He studied successful entrepreneurs. When released, he had zero savings but an asset most people don't: unshakeable mindset.",
      outcome: "Started pressure washing with $500 borrowed money. Reinvested every dollar. Hired first employee at month 6. Sold the business for $1.2M three years later. Now owns multiple businesses."
    }
  },
  {
    id: "offer-creation",
    title: "Irresistible Offer Creation",
    icon: Target,
    category: "Sales & Marketing",
    difficulty: "intermediate",
    estimatedTime: "60 min",
    description: "Learn to craft offers so compelling that people feel stupid saying no. The difference between a $100/month business and a $100K/month business is the offer.",
    keyTakeaways: [
      "People don't buy products—they buy outcomes",
      "Price is only an issue in the absence of value",
      "The 10X Value Rule: Offer 10X more value than you charge",
      "Stack bonuses until saying no feels painful"
    ],
    sections: [
      {
        title: "The Anatomy of an Irresistible Offer",
        content: `An irresistible offer has 5 components:

**1. Dream Outcome**
What's the #1 result your customer desperately wants?
Not features. Not benefits. The END STATE.
"Lose 30 pounds" not "Get a meal plan"
"Make $10K/month from home" not "Learn marketing"

**2. Perceived Likelihood of Achievement**
How confident are they that YOUR solution will work for THEM?
This is where testimonials, guarantees, and specificity matter.

**3. Time Delay**
How long until they get the result?
Faster = more valuable. "30 days" beats "6 months"

**4. Effort & Sacrifice**
What do they have to give up or do?
Less effort = more valuable. "Done-for-you" beats "DIY"

**5. The Value Equation**
Value = (Dream Outcome × Perceived Likelihood) ÷ (Time Delay × Effort)

Maximize the top. Minimize the bottom. That's the game.`,
        actionItems: [
          "Define your customer's dream outcome in their words",
          "List 10 objections they might have",
          "Create a response for each objection",
          "Calculate: How can you deliver faster with less effort?"
        ]
      },
      {
        title: "The Offer Stack: Multiplying Perceived Value",
        content: `Stop selling one thing. Start stacking value until the offer is undeniable.

**Core Offer:** Your main product/service
**Bonus 1:** Accelerates their result
**Bonus 2:** Reduces their effort
**Bonus 3:** Addresses a common objection
**Bonus 4:** Adds unexpected value
**Guarantee:** Removes all risk

**Example Stack (Fitness Coaching):**
- Core: 12-Week Transformation Program ($997 value)
- Bonus 1: Meal Plan Templates ($297 value)
- Bonus 2: Exercise Demo Library ($197 value)
- Bonus 3: Weekly Check-in Calls ($497 value)
- Bonus 4: Private Community Access ($197 value)
- Bonus 5: Goal Achievement Guarantee

Total Value: $2,185
Your Price: $749
Savings: 66%

**The Psychology:** When perceived value far exceeds price, the decision becomes easy. They're not buying—they're GETTING A DEAL.`,
        proTips: [
          "Each bonus should solve a specific problem or objection",
          "Create bonuses that cost you nothing but have high perceived value",
          "Digital products are infinite margin—create once, give forever",
          "Name your bonuses powerfully. 'Accountability Calls' beats 'Weekly check-ins'"
        ]
      },
      {
        title: "Pricing Psychology: Charging What You're Worth",
        content: `**The Hard Truth:** If you're not uncomfortable with your prices, you're charging too little.

**Premium Pricing Principles:**

1. **Anchor High:** Show the full value before the price
2. **Payment Plans:** Make it accessible without discounting
3. **Comparison:** What does NOT solving this problem cost them?
4. **Specificity:** $997 > $1,000 (specific = calculated = trusted)
5. **Scarcity:** Limited spots, limited time, limited bonuses

**Pricing Frameworks:**

**Cost-Plus:** Your costs + profit margin (amateur)
**Market-Rate:** What competitors charge (follower)
**Value-Based:** What's the result worth to them? (professional)
**Premium:** 2-10X market rate for premium experience (leader)

**The Price Objection:**
When someone says "too expensive," they're really saying:
"I don't understand the value yet" or
"I don't believe it will work for me" or
"I'm not your ideal customer"

Price is never the real objection.`,
        actionItems: [
          "Calculate the TRUE cost of your customer's problem (annually)",
          "If your solution works, what's that worth over 5 years?",
          "Raise your prices 20% on your next sale",
          "Track: Did you lose more or fewer customers?"
        ]
      }
    ],
    thirtyDayPlan: [
      {
        week: 1,
        days: "Days 1-7",
        focus: "Dream Outcome Research",
        tasks: [
          "Interview 5 potential/current customers about their goals",
          "Write down their exact words for their dream outcome",
          "List all the problems they face trying to achieve it",
          "Research 3 competitor offers in your space",
          "Note what's missing from competitor offers",
          "Define your unique mechanism (how you get results)",
          "Write your offer promise in one sentence"
        ],
        milestone: "Crystal clear on what your market actually wants"
      },
      {
        week: 2,
        days: "Days 8-14",
        focus: "Offer Stack Construction",
        tasks: [
          "Define your core offer deliverables",
          "Create Bonus 1: Something that speeds up results",
          "Create Bonus 2: Something that reduces their effort",
          "Create Bonus 3: Addresses top objection",
          "Create Bonus 4: Unexpected value-add",
          "Design your guarantee (risk reversal)",
          "Calculate total perceived value"
        ],
        milestone: "Complete offer stack documented"
      },
      {
        week: 3,
        days: "Days 15-21",
        focus: "Pricing & Positioning",
        tasks: [
          "Calculate customer's cost of NOT solving problem",
          "Set price at 1/10th of that annual cost",
          "Create 2-3 pricing tiers if applicable",
          "Write payment plan options",
          "Draft sales page/pitch outline",
          "Create FAQ addressing objections",
          "Practice pitch with 3 people for feedback"
        ],
        milestone: "Complete offer ready to sell"
      },
      {
        week: 4,
        days: "Days 22-30",
        focus: "Launch & Iterate",
        tasks: [
          "Soft launch to warm audience",
          "Get first 3-5 sales",
          "Collect feedback from buyers",
          "Refine offer based on feedback",
          "Document testimonials and results",
          "Identify what's working, what's not",
          "Plan iteration for Version 2.0"
        ],
        milestone: "Validated offer with real sales"
      }
    ],
    resources: [
      { name: "$100M Offers - Alex Hormozi", url: "https://www.amazon.com/100M-Offers-People-Stupid-Saying/dp/1737475715", type: "book" },
      { name: "The Offer Workshop", url: "https://www.youtube.com/results?search_query=alex+hormozi+offer+creation", type: "video" },
      { name: "Pricing Psychology Guide", url: "https://www.youtube.com/results?search_query=pricing+psychology+business", type: "video" }
    ],
    caseStudy: {
      title: "From $50/hour to $5,000 Packages",
      scenario: "Sarah was a freelance graphic designer charging $50/hour. She was working 60+ hours/week and barely surviving. The problem: she was selling TIME, not OUTCOMES.",
      outcome: "Restructured offer: 'Brand Identity in 14 Days' for $5,000. Same work, packaged differently. Client saw value, not hours. Now works 20 hours/week, makes 4X more."
    }
  },
  {
    id: "customer-acquisition",
    title: "Customer Acquisition Mastery",
    icon: Megaphone,
    category: "Sales & Marketing",
    difficulty: "advanced",
    estimatedTime: "90 min",
    description: "Master the art and science of getting customers. From cold outreach to paid ads to organic content—build a machine that generates leads on autopilot.",
    keyTakeaways: [
      "Attention is the new currency",
      "Content is leverage—create once, distribute forever",
      "The riches are in the niches",
      "Paid traffic is a skill, not a gamble"
    ],
    sections: [
      {
        title: "The Lead Generation Hierarchy",
        content: `Not all leads are created equal. Here's the hierarchy from least to most valuable:

**1. Cold Traffic (Strangers)**
- Paid ads, cold email, cold DM, cold calls
- Highest volume, lowest conversion
- Must work harder to build trust
- Cost: $$$

**2. Warm Traffic (Aware)**
- Content consumers, email list, social followers
- Medium volume, medium conversion
- Already trust you somewhat
- Cost: Time + Consistency

**3. Hot Traffic (Ready)**
- Referrals, repeat customers, engaged fans
- Lowest volume, highest conversion
- Already sold on you
- Cost: Deliver excellence

**The Goal:** Build systems for all three. Cold traffic funds warm traffic. Warm traffic becomes hot traffic. Hot traffic refers cold traffic.`,
        actionItems: [
          "Identify your current lead sources",
          "Calculate your cost per lead for each source",
          "Calculate your conversion rate for each source",
          "Find your most profitable channel and double down"
        ]
      },
      {
        title: "Content Marketing: Becoming the Obvious Choice",
        content: `**The Content Strategy That Works:**

1. **Pick Your Platform:** Go deep on ONE before expanding
   - Text: Twitter/X, LinkedIn
   - Video: YouTube, TikTok
   - Audio: Podcasts

2. **The 80/20 Content Split:**
   - 80% Value: Teach, inspire, entertain
   - 20% Promotion: Offers, testimonials, CTAs

3. **Content Pillars (3-5 Topics):**
   - What are you an expert in?
   - What does your audience need to learn?
   - What differentiates you?

4. **Consistency > Virality:**
   - 100 good posts beat 1 viral post
   - Show up daily for 90 days before evaluating
   - Algorithm favors consistency

**The Content Flywheel:**
Content → Attention → Trust → Email List → Sales → Testimonials → More Content

**Repurposing:**
- 1 Long video → 10 shorts
- 1 Podcast → 5 clips + article + newsletter
- 1 Tweet thread → Email + carousel + script`,
        proTips: [
          "Study what's already working—don't reinvent the wheel",
          "Hook in the first 3 seconds or you've lost them",
          "Controversy creates conversation (use wisely)",
          "Every piece of content should have ONE clear message"
        ]
      },
      {
        title: "Paid Advertising: Printing Money (When Done Right)",
        content: `**The Simple Math of Paid Ads:**

If you spend $1 and make $2 back, you can scale infinitely.
That's the game.

**Key Metrics:**
- CPA (Cost Per Acquisition): What it costs to get a customer
- LTV (Lifetime Value): What a customer is worth over time
- ROAS (Return on Ad Spend): Revenue ÷ Ad Spend

**Rule:** LTV must be 3X+ CPA to be profitable after expenses.

**Platform Breakdown:**

**Meta (Facebook/Instagram):**
- Best for: B2C, visual products, lead generation
- Targeting: Incredible demographic + behavior options
- Cost: $5-50 per lead (varies by niche)

**Google (Search + YouTube):**
- Best for: High-intent buyers, B2B, services
- Targeting: Search intent (they're looking for you)
- Cost: $10-100 per lead (varies by keyword)

**TikTok:**
- Best for: Young demos, viral potential, brand awareness
- Targeting: Interest + behavior based
- Cost: Cheapest impressions, variable conversions

**The Testing Framework:**
1. Start with $20-50/day
2. Test 3-5 different ads (creatives)
3. Test 3-5 different audiences
4. Kill losers fast (24-48 hours)
5. Scale winners gradually (20% budget increases)`,
        actionItems: [
          "Calculate your current CPA and LTV",
          "Set up pixel/tracking on your website",
          "Create 5 variations of your best-performing organic content",
          "Start with $20/day and track everything"
        ]
      },
      {
        title: "Outbound: Direct Outreach That Doesn't Feel Sleazy",
        content: `**The Truth About Cold Outreach:**
It works. It's uncomfortable. That's why most people don't do it.
That's your competitive advantage.

**The Framework: VPPC**

**V - Value First**
Lead with insight, not a pitch.
"I noticed [specific thing about their business] and thought of a way to [specific improvement]..."

**P - Personalize**
Generic = spam. Specific = attention.
Reference their content, their business, their situation.

**P - Problem/Proof**
State the problem you solve + proof you can solve it.
"We helped [similar company] achieve [specific result] in [timeframe]"

**C - Clear CTA**
One simple next step. Not "buy my thing."
"Would a 15-minute call this week make sense?"

**Volume Matters:**
- Send 20-50 personalized messages/day
- Expect 10-20% response rate
- Expect 2-5% conversion to call
- Expect 20-50% call to close

**The Math:**
50 messages → 10 responses → 2 calls → 1 client
Do this daily = 20+ clients/month`,
        proTips: [
          "Follow up 5-7 times. Most people give up after 1-2.",
          "The best time to reach out: Tuesday-Thursday, 8-10am their time",
          "LinkedIn for B2B, Instagram DM for B2C, Email for cold outreach",
          "Track EVERYTHING in a CRM (free options: HubSpot, Notion)"
        ]
      }
    ],
    thirtyDayPlan: [
      {
        week: 1,
        days: "Days 1-7",
        focus: "Foundation & Platform Selection",
        tasks: [
          "Audit current lead sources and their costs",
          "Choose 1 primary content platform to master",
          "Define 3-5 content pillars for your expertise",
          "Study top 10 creators in your niche",
          "Create content template/format to follow",
          "Set up basic tracking (pixel, UTMs, CRM)",
          "Create first 7 pieces of content"
        ],
        milestone: "Content machine set up and running"
      },
      {
        week: 2,
        days: "Days 8-14",
        focus: "Content Consistency",
        tasks: [
          "Post daily on chosen platform",
          "Engage with 20+ accounts daily (comments, DMs)",
          "Start building email list with lead magnet",
          "Create repurposing system",
          "Analyze what content performs best",
          "Double down on winning formats",
          "Draft first cold outreach script"
        ],
        milestone: "Consistent content with early traction"
      },
      {
        week: 3,
        days: "Days 15-21",
        focus: "Outbound Launch",
        tasks: [
          "Build list of 100 ideal prospects",
          "Send 10 personalized outreach messages daily",
          "Test 3 different message variations",
          "Track responses and refine approach",
          "Book first meetings from outreach",
          "Continue daily content posting",
          "Prepare paid ads creative (3-5 variations)"
        ],
        milestone: "Outbound producing responses"
      },
      {
        week: 4,
        days: "Days 22-30",
        focus: "Scale & Optimize",
        tasks: [
          "Launch first paid ad campaign ($20-50/day)",
          "Test 3 audiences, 3 creatives",
          "Scale outreach to 20-30 messages/day",
          "Optimize based on what's working",
          "Calculate CPA and ROI for each channel",
          "Double down on best-performing channel",
          "Create 30-day lead generation plan for next month"
        ],
        milestone: "Multi-channel lead gen producing results"
      }
    ],
    resources: [
      { name: "$100M Leads - Alex Hormozi", url: "https://www.amazon.com/100M-Leads-People-Actually-Want/dp/1737475766", type: "book" },
      { name: "Facebook Ads Course", url: "https://www.youtube.com/results?search_query=facebook+ads+complete+guide+2024", type: "video" },
      { name: "Cold Email Mastery", url: "https://www.youtube.com/results?search_query=cold+email+that+works", type: "video" }
    ]
  },
  {
    id: "sales-mastery",
    title: "High-Ticket Sales Mastery",
    icon: DollarSign,
    category: "Sales & Marketing",
    difficulty: "advanced",
    estimatedTime: "75 min",
    description: "Learn to close $3K-$50K+ deals with confidence. The art and science of selling transformational outcomes.",
    keyTakeaways: [
      "Sales is a transfer of belief",
      "Questions close more deals than statements",
      "The close starts before the call",
      "Objections are requests for more information"
    ],
    sections: [
      {
        title: "The Psychology of High-Ticket Sales",
        content: `**Why High-Ticket is EASIER:**
- Serious buyers only (no tire-kickers)
- Higher commitment = higher results
- Fewer clients = better service
- More profit = more investment in quality

**The Belief Bridge:**
Your prospect needs to believe 3 things:
1. Change is possible (not stuck forever)
2. This vehicle works (your method is proven)
3. They can do it (it works for people like them)

Your job isn't to convince—it's to help them convince themselves.

**The Emotional/Logical Balance:**
- People buy emotionally, justify logically
- Lead with emotion (pain, desire, vision)
- Support with logic (proof, process, practicality)
- Close with emotion (what life looks like after)`,
        actionItems: [
          "Write out the emotional pain your customer feels",
          "Write out the logical justification for buying",
          "Create a 'before and after' story for your ideal customer"
        ]
      },
      {
        title: "The CLOSER Framework",
        content: `**C - Clarify Why They're Here**
"What made you book this call today?"
"What's going on in your [area] right now?"
Let them sell themselves on the problem.

**L - Label the Problem**
Repeat back what they said. Show you understand.
"So if I'm hearing you right, the main issue is..."
Agreement builds trust.

**O - Overview Their Past Attempts**
"What have you tried before?"
"Why didn't that work?"
This reveals objections early and positions you differently.

**S - Sell the Vacation**
Paint the picture of life AFTER the problem is solved.
"Imagine 6 months from now..."
"What would it mean for you if..."
Make the destination irresistible.

**E - Explain Away Concerns**
Handle objections before they become blockers.
"A lot of people worry about [common objection]..."
Proactive = professional.

**R - Reinforce with a Decision**
Create urgency. Get commitment.
"Based on everything you've told me, this seems like a great fit. What's holding you back from getting started today?"`,
        proTips: [
          "Whoever asks the questions controls the conversation",
          "Silence is powerful—ask and wait",
          "Never chase. If they need to 'think about it,' they're not ready",
          "The best salespeople sound like advisors, not salespeople"
        ]
      },
      {
        title: "Handling Every Objection",
        content: `**The 4 Core Objections:**

**1. "I need to think about it"**
Translation: I'm not sold yet.
Response: "Totally understand. Usually when someone says that, it means there's something I haven't addressed. What's really holding you back?"

**2. "I can't afford it"**
Translation: I don't see the value exceeding the cost.
Response: "I hear you. Let me ask—if money wasn't a factor, is this something you'd want to do? (Yes) Great. So the real question is, how do we make this work within your budget?"

**3. "I need to talk to my spouse/partner"**
Translation: I don't want to be responsible for this decision alone.
Response: "That makes sense—this is a big decision. What do you think they'll say when you tell them about it? What concerns might they have that I can help address now?"

**4. "Now's not the right time"**
Translation: I'm scared to commit.
Response: "When would be the right time? (They answer) And what's different then? (Usually nothing) So if the only thing stopping you is timing, and there's never a perfect time, why not start now and figure it out?"

**The Ultimate Reframe:**
"What's the cost of NOT doing this? Where will you be in 6 months if nothing changes?"`,
        actionItems: [
          "Practice the CLOSER framework on 10 calls (recorded)",
          "Review recordings and identify weak points",
          "Write out your response to each of the 4 core objections",
          "Role-play objection handling with a friend/mentor"
        ]
      }
    ],
    thirtyDayPlan: [
      {
        week: 1,
        days: "Days 1-7",
        focus: "Framework Mastery",
        tasks: [
          "Memorize the CLOSER framework completely",
          "Write out your version of each step for your offer",
          "Create scripts for the 4 core objection responses",
          "Record yourself doing a mock sales call",
          "Review and identify areas for improvement",
          "Study 3 high-ticket sales call recordings online",
          "Practice with a friend or family member"
        ],
        milestone: "CLOSER framework internalized"
      },
      {
        week: 2,
        days: "Days 8-14",
        focus: "Live Practice",
        tasks: [
          "Do 3-5 real sales calls (even if not ready)",
          "Record every call (with permission)",
          "Review each call immediately after",
          "Note: What worked? What didn't? What was awkward?",
          "Refine scripts based on real conversations",
          "Focus on asking more questions, talking less",
          "Practice handling objections that came up"
        ],
        milestone: "Real-world feedback loop started"
      },
      {
        week: 3,
        days: "Days 15-21",
        focus: "Refinement",
        tasks: [
          "Do 5+ more sales calls",
          "Track close rate (should be improving)",
          "Identify your strongest part of the call",
          "Identify your weakest part and drill it",
          "Create pre-call routine for confidence",
          "Develop post-call follow-up sequence",
          "Build FAQ of common objections"
        ],
        milestone: "Closing first deals with confidence"
      },
      {
        week: 4,
        days: "Days 22-30",
        focus: "Scale & Systematize",
        tasks: [
          "Target 10+ calls this week",
          "Calculate your close rate and average deal size",
          "Create calendar system for consistent call flow",
          "Build testimonial collection process",
          "Refine offer based on what's working in calls",
          "Document your sales process SOPs",
          "Set revenue goals for next 90 days"
        ],
        milestone: "Repeatable sales system producing revenue"
      }
    ],
    resources: [
      { name: "SPIN Selling - Neil Rackham", url: "https://www.amazon.com/SPIN-Selling-Neil-Rackham/dp/0070511136", type: "book" },
      { name: "High-Ticket Closing Secrets", url: "https://www.youtube.com/results?search_query=high+ticket+sales+closing", type: "video" },
      { name: "Sales Call Frameworks", url: "https://www.youtube.com/results?search_query=sales+call+script+high+ticket", type: "video" }
    ],
    caseStudy: {
      title: "From Nervous to Natural",
      scenario: "James was terrified of sales calls. His voice would shake. He'd avoid following up. His close rate was under 5%.",
      outcome: "After studying the CLOSER framework and practicing 50 mock calls, his close rate went to 35%. Same service, same price—just better conversations. Monthly revenue went from $2K to $15K."
    }
  },
  {
    id: "scaling-empire",
    title: "Scaling to 7 Figures",
    icon: Building2,
    category: "Operations",
    difficulty: "elite",
    estimatedTime: "120 min",
    description: "Build systems, hire smart, and remove yourself from the day-to-day. The blueprint for going from solopreneur to business owner.",
    keyTakeaways: [
      "You're the bottleneck until you build systems",
      "A players hire A players. B players hire C players.",
      "Revenue is vanity. Profit is sanity. Cash flow is king.",
      "The goal: build something that runs without you"
    ],
    sections: [
      {
        title: "The 4 Stages of Business Growth",
        content: `**Stage 1: Survival ($0-$10K/month)**
- You do everything
- Focus: Get customers, make sales
- Key metric: Revenue
- Hire: No one yet

**Stage 2: Stability ($10K-$50K/month)**
- You're overwhelmed
- Focus: Hire help, build processes
- Key metric: Profit margin
- Hire: VA, contractor, first full-timer

**Stage 3: Scale ($50K-$250K/month)**
- Team is growing
- Focus: Systems, management, culture
- Key metric: Revenue per employee
- Hire: Managers, specialists

**Stage 4: Exit ($250K+/month)**
- Business runs without you
- Focus: Strategic leadership only
- Key metric: Company valuation
- Hire: Leadership team, advisory board

**The Trap:** Most entrepreneurs stay in Stage 1-2 forever because they're afraid to let go. The business becomes a high-paying job, not an asset.`,
        actionItems: [
          "Identify your current stage",
          "List the 3 biggest bottlenecks keeping you stuck",
          "For each bottleneck: Can it be automated, delegated, or eliminated?"
        ]
      },
      {
        title: "Building Systems: Work ON the Business, Not IN It",
        content: `**The System Creation Framework:**

1. **Document Everything**
   Every task you do more than once gets written down.
   Use Loom for video SOPs, Notion for written ones.

2. **Identify the 5 Core Functions:**
   - Marketing (getting attention)
   - Sales (converting attention to customers)
   - Fulfillment (delivering what you sold)
   - Operations (keeping the wheels turning)
   - Finance (tracking the money)

3. **Create Playbooks for Each Function:**
   - Step-by-step processes
   - Checklists for quality control
   - KPIs to measure success
   - Who's responsible

4. **Automate What You Can:**
   - Email sequences (ConvertKit, ActiveCampaign)
   - Scheduling (Calendly, Cal.com)
   - Payments (Stripe, recurring)
   - Onboarding (automated welcome sequences)

**The Goal:** A new hire should be able to learn their role from your documentation alone.`,
        proTips: [
          "Document processes AS you do them—don't wait",
          "Update documentation when processes change",
          "The best systems feel invisible when working",
          "Systemize the boring stuff so you can focus on the creative stuff"
        ]
      },
      {
        title: "Hiring & Team Building",
        content: `**The Hiring Framework:**

**1. Define the Role Precisely**
- Outcomes, not tasks
- Clear success metrics
- 3-5 must-have skills
- Cultural fit requirements

**2. Source Widely**
- Your network first (referrals are gold)
- LinkedIn, Indeed, industry job boards
- Twitter/X for creative roles
- Freelancer platforms for trials

**3. Screen Efficiently**
- Application filters (specific questions)
- Short video intro requirement
- Skills test before interview
- 2-3 interview rounds max

**4. Hire Slowly, Fire Fast**
- Probation period (30-90 days)
- Clear expectations from day 1
- Weekly check-ins first month
- If it's not working, move on quickly

**Compensation Philosophy:**
- Pay above market for A players
- Underpaying is the most expensive mistake
- Tie compensation to outcomes, not hours
- Equity/profit-sharing for key roles

**The First Hires:**
1. Virtual Assistant (admin, scheduling, inbox)
2. Customer Success (client communication)
3. Sales/Marketing (lead gen, follow-up)
4. Operations Manager (runs daily functions)`,
        actionItems: [
          "Create a job scorecard for your most needed role",
          "Write a job posting that attracts A players",
          "Create a skills test for candidates",
          "Define your 90-day onboarding plan"
        ]
      },
      {
        title: "Financial Mastery for Scaling",
        content: `**The Numbers You Must Know:**

1. **Revenue:** Total money coming in
2. **Gross Profit:** Revenue - Cost of Goods/Services
3. **Net Profit:** Gross Profit - Expenses
4. **Profit Margin:** Net Profit ÷ Revenue (aim for 20-40%)
5. **Cash Flow:** Money in vs. money out (timing matters)

**The Profit First System:**
Every time revenue comes in:
- 50% to Operating Expenses
- 15% to Owner's Profit
- 15% to Owner's Pay
- 15% to Taxes
- 5% to Emergency Fund

**Scaling Finances:**

**Reinvestment Ratio:**
Early stage: 80% reinvest, 20% profit
Growing: 60% reinvest, 40% profit
Established: 40% reinvest, 60% profit

**Revenue Buckets:**
- Existing customers (upsells, retention)
- New customers (acquisition cost)
- New products (expansion)

**Cash Flow Killers:**
- Long payment terms (net 30+)
- Seasonal business without reserves
- Over-hiring before revenue stabilizes
- Inventory/equipment over-investment`,
        proTips: [
          "Review numbers weekly, not monthly",
          "Separate business and personal accounts 100%",
          "Keep 3-6 months operating expenses in reserve",
          "Hire a bookkeeper long before you think you need one"
        ]
      }
    ],
    thirtyDayPlan: [
      {
        week: 1,
        days: "Days 1-7",
        focus: "Systems Audit",
        tasks: [
          "List every recurring task you do weekly",
          "Categorize by the 5 core functions",
          "Identify top 3 time-draining activities",
          "Start documenting your #1 process (Loom video)",
          "Set up Notion/docs folder for SOPs",
          "Calculate current profit margin",
          "Define your ideal org chart"
        ],
        milestone: "Full picture of current operations"
      },
      {
        week: 2,
        days: "Days 8-14",
        focus: "Documentation Sprint",
        tasks: [
          "Document 1 process per day (7 total)",
          "Create checklists for each process",
          "Identify what can be automated",
          "Set up 1 automation (email, scheduling, etc.)",
          "Define KPIs for each core function",
          "Create weekly metrics dashboard",
          "Draft first job description for needed hire"
        ],
        milestone: "Core processes documented"
      },
      {
        week: 3,
        days: "Days 15-21",
        focus: "First Hire Prep",
        tasks: [
          "Finalize job scorecard with clear outcomes",
          "Post job on 3 platforms",
          "Create skills test for applicants",
          "Design interview question bank",
          "Set up trial project for top candidates",
          "Prepare 30-day onboarding plan",
          "Calculate compensation budget"
        ],
        milestone: "Ready to bring on first team member"
      },
      {
        week: 4,
        days: "Days 22-30",
        focus: "Financial Systems",
        tasks: [
          "Set up Profit First accounts",
          "Create cash flow projection for next 90 days",
          "Hire bookkeeper or set up accounting software",
          "Review and categorize all expenses",
          "Identify 3 expenses to cut",
          "Set up monthly financial review calendar",
          "Create 90-day scaling plan with revenue targets"
        ],
        milestone: "Financial foundation for scaling"
      }
    ],
    resources: [
      { name: "The E-Myth Revisited - Michael Gerber", url: "https://www.amazon.com/E-Myth-Revisited-Small-Businesses-About/dp/0887307280", type: "book" },
      { name: "Profit First - Mike Michalowicz", url: "https://www.amazon.com/Profit-First-Transform-Cash-Eating-Money-Making/dp/073521414X", type: "book" },
      { name: "Built to Sell - John Warrillow", url: "https://www.amazon.com/Built-Sell-Creating-Business-Without/dp/1591845823", type: "book" },
      { name: "Scaling Systems Breakdown", url: "https://www.youtube.com/results?search_query=how+to+scale+business+systems", type: "video" }
    ],
    caseStudy: {
      title: "From $30K/month Solo to $200K/month with a Team",
      scenario: "Jake was doing everything: sales, fulfillment, customer service, marketing. He was making $30K/month but working 80 hours/week and burning out.",
      outcome: "Hired VA ($2K/month), then sales rep ($5K/month + commission), then fulfillment manager ($6K/month). Within 18 months: $200K/month revenue, 45% profit margin, working 25 hours/week."
    }
  },
  // NEW MODULE: Personal Branding & Authority Building
  {
    id: "personal-branding",
    title: "Personal Branding & Authority",
    icon: Mic,
    category: "Growth",
    difficulty: "intermediate",
    estimatedTime: "75 min",
    description: "Build a personal brand that attracts opportunities. Become the obvious expert in your niche so clients, partners, and media come to you.",
    keyTakeaways: [
      "Your reputation is an asset that compounds",
      "Visibility creates opportunity—obscurity kills it",
      "Consistency beats perfection in building trust",
      "Authority is earned by teaching, not claiming"
    ],
    sections: [
      {
        title: "Why Personal Brand is Your Ultimate Asset",
        content: `**The Hard Truth About Business:**
Companies can be copied. Products can be replicated. But YOUR brand is unique.

**Personal Brand = Trust at Scale**
When someone knows, likes, and trusts you before they meet you, sales become easy. That's what personal branding does.

**The Compounding Effect:**
- Year 1: Few followers, feels pointless
- Year 2: Growing audience, first opportunities
- Year 3: Inbound leads, speaking invites, partnerships
- Year 5: Industry authority, premium pricing, opportunities chase you

**What Personal Brand Actually Is:**
It's not about being famous. It's about being KNOWN by the right people for the right thing.

**The Formula:**
Expertise + Visibility + Consistency = Authority

**Most People Fail Because:**
- They're afraid to put themselves out there
- They try to appeal to everyone
- They quit before momentum kicks in
- They're inconsistent`,
        actionItems: [
          "Define: What do you want to be known for?",
          "Identify 3 people who have the authority you want",
          "Study what they do consistently",
          "Commit to 90 days of showing up before evaluating"
        ],
        proTips: [
          "Document your journey, don't just teach—people connect with stories",
          "Polarizing opinions build stronger audiences than safe ones",
          "Reply to every comment and DM for the first year",
          "Your face is your logo—show it often"
        ]
      },
      {
        title: "Choosing Your Platform & Niche",
        content: `**The Platform Question:**
Go where your audience is, not where you're comfortable.

**Platform Breakdown:**

**LinkedIn:**
- Best for: B2B, professional services, consulting
- Format: Text posts, carousels, video
- Audience: Decision makers, professionals

**Twitter/X:**
- Best for: Tech, finance, startups, opinions
- Format: Threads, hot takes, engagement
- Audience: Builders, intellectuals, investors

**Instagram:**
- Best for: Lifestyle, fitness, visual businesses
- Format: Reels, Stories, carousels
- Audience: Consumers, younger demographics

**YouTube:**
- Best for: Education, tutorials, long-form trust
- Format: 10-20 min videos, Shorts
- Audience: Learners, searchers

**TikTok:**
- Best for: Entertainment-education, Gen Z reach
- Format: 30-90 second videos
- Audience: Younger, trend-focused

**The Rule:** Master ONE platform before adding another. Depth beats breadth.

**Niche Selection:**
- What can you talk about for 1,000 posts?
- What do people pay money for in this space?
- What unique angle do you bring?
- Is the audience big enough but not too saturated?`,
        actionItems: [
          "Choose ONE platform as your primary focus",
          "Follow 50 top creators in your niche",
          "Study their best-performing content",
          "Define your unique angle in 1 sentence"
        ]
      },
      {
        title: "Content Strategy: Attract Without Chasing",
        content: `**The 3 Content Pillars:**

**1. Authority Content (30%)**
- Deep expertise posts
- Original frameworks
- Counterintuitive insights
- Data and case studies
Shows: You know your stuff

**2. Relatable Content (40%)**
- Personal stories
- Behind the scenes
- Lessons learned
- Vulnerable moments
Shows: You're human and trustworthy

**3. Promotional Content (30%)**
- Results and testimonials
- Offers and CTAs
- How you help people
- What you're building
Shows: You can solve their problem

**Content Formats That Work:**
- Story → Lesson → CTA
- Myth → Truth → How
- Before → After → How
- List of X things
- Controversial opinion + reasoning

**The Content Machine:**
1. Create long-form content weekly (blog, video, podcast)
2. Chop into 5-10 short-form pieces
3. Distribute across platforms
4. Engage with every comment
5. Repeat forever

**Engagement Strategy:**
Spend as much time engaging as creating. Comment on bigger accounts in your niche. Be helpful, not promotional.`,
        proTips: [
          "Hooks are everything—first line must stop the scroll",
          "Teach one thing per piece of content, not everything",
          "Repost your best content every 90 days",
          "Create a content calendar and batch create weekly"
        ]
      },
      {
        title: "Monetizing Your Authority",
        content: `**The Authority Monetization Ladder:**

**Level 1: Service Clients**
- Trade expertise for money directly
- Consulting, coaching, freelance work
- Easiest to start, hardest to scale

**Level 2: Premium Pricing**
- Charge 2-5X market rate because of brand
- "People pay more to work with YOU"
- Requires established reputation

**Level 3: Digital Products**
- Courses, templates, guides
- Create once, sell forever
- Leverages authority without your time

**Level 4: Speaking & Media**
- Podcasts, conferences, events
- Paid speaking ($5K-$100K/talk)
- Builds authority and generates leads

**Level 5: Equity & Investments**
- Advisor roles for equity
- Angel investing
- Joint ventures and partnerships

**The Key Insight:**
You don't monetize followers. You monetize trust. 1,000 true fans who trust you beats 100,000 passive followers.

**The Funnel:**
Content → Email List → Relationship → Offer → Sale → Testimonial → More Content

Build the email list. It's the only audience you own.`,
        actionItems: [
          "Set up email list with simple lead magnet",
          "Create your first digital product (even small)",
          "Define your service offering and pricing",
          "Reach out to 5 podcasts to be a guest"
        ]
      }
    ],
    thirtyDayPlan: [
      {
        week: 1,
        days: "Days 1-7",
        focus: "Foundation & Research",
        tasks: [
          "Define your niche in 1 clear sentence",
          "Choose your primary platform",
          "Create/optimize your profile (bio, photo, banner)",
          "Follow 50 top creators in your space",
          "Study their top 10 posts each",
          "Create your 3 content pillars",
          "Post your first 7 pieces of content"
        ],
        milestone: "Profile live, first week of content posted"
      },
      {
        week: 2,
        days: "Days 8-14",
        focus: "Consistency & Engagement",
        tasks: [
          "Post daily (at least 1 piece of content)",
          "Spend 30 minutes engaging on others' content daily",
          "Comment on 20+ posts from larger accounts",
          "Reply to every comment on your posts",
          "DM 5 potential connections",
          "Create lead magnet for email list",
          "Set up email capture page"
        ],
        milestone: "Engagement habits built, email list started"
      },
      {
        week: 3,
        days: "Days 15-21",
        focus: "Content Optimization",
        tasks: [
          "Analyze which posts performed best",
          "Create more of what worked",
          "Experiment with 2 new content formats",
          "Start repurposing: 1 long-form → 5 short-form",
          "Pitch 3 podcasts to be a guest",
          "Collaborate with 1 peer-level creator",
          "Build content calendar for next month"
        ],
        milestone: "Content system running, first collaborations"
      },
      {
        week: 4,
        days: "Days 22-30",
        focus: "Monetization Foundation",
        tasks: [
          "Create simple offer (service or product)",
          "Write sales page or pitch",
          "Make first promotional post",
          "DM 10 warm leads about your offer",
          "Get first sale or client",
          "Collect first testimonial",
          "Plan 90-day brand building strategy"
        ],
        milestone: "First revenue from personal brand"
      }
    ],
    resources: [
      { name: "Building a StoryBrand - Donald Miller", url: "https://www.amazon.com/Building-StoryBrand-Clarify-Message-Customers/dp/0718033329", type: "book" },
      { name: "Personal Branding Masterclass", url: "https://www.youtube.com/results?search_query=personal+branding+strategy", type: "video" },
      { name: "Content Creation Tools", url: "https://www.notion.so", type: "tool" },
      { name: "ConvertKit (Email)", url: "https://convertkit.com", type: "tool" }
    ],
    caseStudy: {
      title: "From Unknown to Industry Authority in 18 Months",
      scenario: "Maria was a marketing consultant charging $100/hour with inconsistent clients. She had no online presence and relied entirely on word of mouth. Income: $4K/month average.",
      outcome: "Committed to posting on LinkedIn daily for 18 months. Built to 25K followers. Now charges $5,000/month retainers, has a waiting list, and earns $15K/month from her course. Total income: $30K+/month."
    }
  },
  // NEW MODULE: Real Estate Fundamentals
  {
    id: "real-estate-fundamentals",
    title: "Real Estate Fundamentals",
    icon: Home,
    category: "Wealth Building",
    difficulty: "intermediate",
    estimatedTime: "90 min",
    description: "Learn the fundamentals of building wealth through real estate. From house hacking to rental properties—the strategies that create generational wealth.",
    keyTakeaways: [
      "Real estate is the most proven path to building wealth",
      "You don't need to be rich to start—you need knowledge",
      "Cash flow is king, appreciation is a bonus",
      "Every wealthy person has real estate in their portfolio"
    ],
    sections: [
      {
        title: "Why Real Estate Creates Wealth",
        content: `**The 5 Ways Real Estate Makes Money:**

**1. Cash Flow**
Rent collected - Expenses = Monthly profit
Even $200/month per property compounds to freedom

**2. Appreciation**
Properties tend to increase in value over time
$200K property → $300K in 10 years = $100K gain

**3. Loan Paydown**
Tenants pay your mortgage
You gain equity every month without spending a dime

**4. Tax Benefits**
Depreciation, deductions, 1031 exchanges
Real estate has the best tax treatment of any asset

**5. Leverage**
Buy a $200K asset with $40K (20% down)
If it appreciates 10%, you made 50% on YOUR money

**The Math That Changes Lives:**
Property: $200,000
Down payment: $40,000 (20%)
Loan: $160,000 at 7% = ~$1,065/month
Rent: $1,600/month
Expenses: $400/month (insurance, taxes, maintenance)
Cash flow: $135/month
Equity paydown: $250/month (first year)
Appreciation (3%/year): $500/month equivalent

**Total wealth building: ~$885/month from a $40K investment = 26.5% return**`,
        actionItems: [
          "Calculate how much you could save for a down payment in 12 months",
          "Research average rent prices in 3 neighborhoods you'd consider",
          "Find 5 rental property listings and analyze the numbers",
          "Talk to 1 person who owns rental property"
        ],
        proTips: [
          "The first property is the hardest—after that, it snowballs",
          "Buy in areas you'd want to live (you understand the tenant)",
          "Never buy for appreciation alone—cash flow must work",
          "House hacking is the cheat code for your first property"
        ]
      },
      {
        title: "House Hacking: Your First Step to Real Estate Wealth",
        content: `**What is House Hacking?**
Buy a property, live in part of it, rent out the rest. Your tenants pay your mortgage.

**House Hacking Strategies:**

**1. Duplex/Triplex/Fourplex**
- Buy a 2-4 unit property
- Live in one unit, rent the others
- Can use FHA loan (3.5% down)
- Best: 4-plex (maximum units, residential financing)

**2. Rent by the Room**
- Buy a single-family house
- Rent out bedrooms individually
- Higher cash flow than single tenant
- Good for college towns, cities

**3. Basement/ADU Rental**
- Buy house with basement apartment or guest house
- Live upstairs, rent basement
- Single tenant, more privacy

**4. Short-Term Rental**
- Rent spare room on Airbnb
- Higher income but more work
- Check local regulations

**The Math (4-plex Example):**
Purchase: $400,000
FHA Down (3.5%): $14,000
Monthly mortgage: $2,800
3 units rent at $1,200 each: $3,600
Your unit: $0 (you live there)
Cash flow: +$800/month
You live for FREE and MAKE money

**FHA Loan Advantage:**
- Only 3.5% down for owner-occupied
- Up to 4 units qualifies as residential
- After 1 year, you can move out and rent all units`,
        actionItems: [
          "Search for 2-4 unit properties in your area",
          "Calculate what you'd need for 3.5% FHA down payment",
          "Talk to a lender about FHA pre-approval",
          "Tour 3 properties this month"
        ]
      },
      {
        title: "Analyzing Rental Property Deals",
        content: `**The 1% Rule (Quick Filter):**
Monthly rent should be at least 1% of purchase price.
$200,000 property → Should rent for $2,000+/month
If it passes, analyze further. If not, move on.

**Full Analysis Framework:**

**Monthly Income:**
- Gross rent
- Other income (laundry, parking, storage)

**Monthly Expenses:**
- Mortgage payment (principal + interest)
- Property taxes (1-2% of value/year ÷ 12)
- Insurance (0.5-1% of value/year ÷ 12)
- Vacancy (8-10% of rent—always budget for empty months)
- Repairs/Maintenance (5-10% of rent)
- Property management (8-10% if not self-managing)
- CapEx reserve (5-10% for major repairs: roof, HVAC, etc.)

**Cash Flow = Income - Expenses**
Target: $100-300/unit minimum

**Key Metrics:**

**Cash-on-Cash Return:**
Annual cash flow ÷ Total cash invested
Target: 8-12%+ minimum

**Cap Rate:**
Net Operating Income ÷ Property Price
Tells you property value compared to income

**Debt Service Coverage Ratio (DSCR):**
Net Operating Income ÷ Debt Payments
Lenders want 1.2+ (income is 20% higher than debt)

**Red Flags:**
- Seller won't show financials
- Below-market rents (could mean problem tenants or lies)
- Deferred maintenance (hidden costs)
- Declining neighborhood
- Too good to be true`,
        proTips: [
          "Analyze 100 deals before buying 1—learn the market",
          "Use the BiggerPockets calculator for quick analysis",
          "Always get an inspection—$400 saves $40,000",
          "Look for value-add opportunities (units that can be improved)"
        ]
      },
      {
        title: "Financing Your First Property",
        content: `**Financing Options:**

**1. Conventional Loan (Best rates)**
- 20% down (avoid PMI)
- 15-20% possible with PMI
- Credit score 620+ (740+ for best rates)
- Best for: Those with savings and good credit

**2. FHA Loan (Low down payment)**
- 3.5% down
- Owner-occupied only
- Up to 4 units
- Best for: First-time house hackers

**3. VA Loan (Veterans only)**
- 0% down
- No PMI
- Owner-occupied
- Best for: Qualified veterans

**4. DSCR Loan (Investors)**
- Based on property income, not personal income
- Higher rates, more flexible qualification
- Best for: Self-employed or multiple properties

**5. Hard Money (Short-term)**
- 60-70% LTV, 12-15% interest
- Short term (6-12 months)
- Best for: Flips or bridge financing

**6. Seller Financing**
- Negotiate directly with seller
- Often better terms
- Best for: Creative deals

**Getting Pre-Approved:**
1. Check your credit score
2. Gather documents: 2 years taxes, pay stubs, bank statements
3. Shop 3 lenders (rates vary)
4. Get pre-approval letter
5. Know your max purchase price

**Saving for Down Payment:**
- Automate savings ($500/month for 2 years = $12K)
- Side hustle earnings → Real estate fund
- IRA can be used for first home (up to $10K penalty-free)
- Gift from family (must be documented)`,
        actionItems: [
          "Check your credit score today",
          "Calculate how long to save for down payment",
          "Research 3 lenders in your area",
          "Get pre-approved (even if not buying yet—know your power)"
        ]
      }
    ],
    thirtyDayPlan: [
      {
        week: 1,
        days: "Days 1-7",
        focus: "Education Foundation",
        tasks: [
          "Read or listen to 'Rich Dad Poor Dad' (real estate chapters)",
          "Watch 5 BiggerPockets YouTube videos on house hacking",
          "Join BiggerPockets free forums",
          "Define your investment criteria (area, price range, type)",
          "Calculate your current financial position",
          "Check your credit score and identify improvements",
          "Set up a dedicated real estate savings account"
        ],
        milestone: "Clear understanding of real estate investing basics"
      },
      {
        week: 2,
        days: "Days 8-14",
        focus: "Market Research",
        tasks: [
          "Identify 3 target neighborhoods",
          "Research average rents in those areas",
          "Set up Zillow/Redfin alerts for your criteria",
          "Analyze 10 properties using the 1% rule",
          "Deep analyze 3 properties that pass",
          "Drive through target neighborhoods",
          "Talk to 1 local investor or property manager"
        ],
        milestone: "Know your target market inside and out"
      },
      {
        week: 3,
        days: "Days 15-21",
        focus: "Financing Prep",
        tasks: [
          "Contact 3 lenders for rate quotes",
          "Gather all documents needed for pre-approval",
          "Get pre-approval letter",
          "Understand your true buying power",
          "Calculate down payment + closing costs + reserves",
          "Create down payment savings plan",
          "Research down payment assistance programs in your area"
        ],
        milestone: "Pre-approved and know your numbers"
      },
      {
        week: 4,
        days: "Days 22-30",
        focus: "Active Deal Hunting",
        tasks: [
          "Tour 5+ properties in person",
          "Practice running full analysis on each",
          "Connect with a real estate agent who knows investors",
          "Make an offer (even if you're not sure—practice negotiating)",
          "Learn from feedback on offer",
          "Create 90-day action plan for purchase",
          "Set specific purchase target date"
        ],
        milestone: "Ready to pull trigger on right deal"
      }
    ],
    resources: [
      { name: "BiggerPockets Real Estate Podcast", url: "https://www.biggerpockets.com/podcast", type: "video" },
      { name: "The Book on Rental Property Investing - Brandon Turner", url: "https://www.amazon.com/Book-Rental-Property-Investing-Intelligent/dp/099071179X", type: "book" },
      { name: "BiggerPockets Calculator", url: "https://www.biggerpockets.com/rental-property-calculator", type: "tool" },
      { name: "Zillow/Redfin", url: "https://www.zillow.com", type: "tool" }
    ],
    caseStudy: {
      title: "From Renting to 6 Units in 3 Years",
      scenario: "DeShawn was paying $1,400/month rent after release. Saved aggressively while working full-time. Knew real estate was the path but had never owned property.",
      outcome: "Year 1: Bought a duplex with FHA (3.5% down), lived in one unit, rented the other for $1,200. Lived essentially free. Year 3: Moved out, bought a 4-plex. Now owns 6 units, cash flows $2,400/month, quit his job, and manages properties full-time."
    }
  },
  // NEW MODULE: Digital Products & Passive Income
  {
    id: "digital-products",
    title: "Digital Products & Passive Income",
    icon: Package,
    category: "Wealth Building",
    difficulty: "intermediate",
    estimatedTime: "80 min",
    description: "Create products once, sell forever. Learn to package your knowledge into digital products that generate income while you sleep.",
    keyTakeaways: [
      "Digital products have 90%+ profit margins",
      "You don't need to be the world's top expert—just help people one step behind you",
      "Start ugly, improve based on feedback",
      "One good product can replace your entire income"
    ],
    sections: [
      {
        title: "The Digital Product Revolution",
        content: `**Why Digital Products Change Everything:**

**Traditional Business:**
- Make a sale, do the work
- Trade time for money
- Income stops when you stop

**Digital Product Business:**
- Create once, sell infinitely
- 90%+ profit margins
- Income while you sleep
- Scales without your time

**Types of Digital Products:**

**1. Courses (Video/Text)**
- Price range: $97-$2,000+
- Most common, highest potential
- Teach a transformation or skill

**2. Templates & Tools**
- Price range: $17-$197
- Notion templates, spreadsheets, Canva designs
- Quick to create, easy to sell

**3. Ebooks & Guides**
- Price range: $9-$47
- Written deep-dives
- Good for low-ticket offers

**4. Membership/Community**
- Price range: $29-$297/month
- Recurring revenue
- Requires ongoing engagement

**5. Software/Apps**
- Price range: $29-$999+
- Highest barrier, highest potential
- Requires development skills

**The Truth:**
You don't need:
- To be the world's best expert
- A massive audience
- Expensive equipment
- Years of experience

You DO need:
- To know something others want to learn
- The ability to teach it clearly
- Consistency to market it`,
        actionItems: [
          "List 5 things you know that others have asked you about",
          "Research existing products in each area",
          "Identify gaps or ways you could do it better",
          "Pick 1 product idea to pursue"
        ],
        proTips: [
          "Sell before you build—validate demand first",
          "Your first product will be your worst—ship it anyway",
          "Bundle knowledge + templates + community for higher prices",
          "Focus on transformation, not information"
        ]
      },
      {
        title: "Finding Your Profitable Product Idea",
        content: `**The Product Idea Framework:**

**What you know** ∩ **What people pay for** ∩ **What you enjoy teaching** = Your product

**Validation Questions:**

1. Are people already paying to learn this?
   - Search Udemy, Skillshare, Gumroad for existing products
   - If competition exists, market exists

2. Can you help someone get a specific result?
   - "Learn to play guitar" → Too vague
   - "Play 10 popular songs in 30 days" → Specific, sellable

3. Is this a hair-on-fire problem?
   - Strong pain = strong sales
   - Nice-to-know vs. need-to-know

4. Can you reach these people?
   - Where do they hang out online?
   - How will you get in front of them?

**Profitable Niches:**
- Health: Weight loss, fitness, nutrition, mental health
- Wealth: Making money, investing, career, business
- Relationships: Dating, marriage, parenting, networking
- Skills: Creative skills, tech skills, professional skills

**Red Flags:**
- Can't find anyone selling similar products (no market)
- Target audience has no money
- You're not passionate enough to talk about it for years
- Too broad or too niche`,
        actionItems: [
          "Research 5 competitors' products in your potential niche",
          "Survey 10 people in your target audience about their struggles",
          "Define your specific transformation in 1 sentence",
          "Validate: Would at least 3 people pay for this solution?"
        ]
      },
      {
        title: "Creating Your First Digital Product",
        content: `**The Minimum Viable Product (MVP) Approach:**

**Week 1: Outline**
- Define the transformation (before → after)
- List 5-8 main modules/chapters
- Outline key lessons in each module
- Define deliverables (worksheets, templates, bonuses)

**Week 2-3: Create**
- Create core content (videos, text, or both)
- Don't over-produce—clarity > quality
- Build in teachable moments, not just info-dumps
- Add actionable exercises after each section

**Week 4: Package**
- Choose your platform (Gumroad, Teachable, Podia, Kajabi)
- Design simple branding
- Write sales copy
- Set up payment processing

**Content Creation Tips:**

**For Videos:**
- Phone camera is fine to start
- Good audio matters more than video quality
- Screen share tutorials are easiest
- Keep videos 5-15 minutes each

**For Written:**
- Use Google Docs → Export as PDF
- Add visuals, examples, screenshots
- Format for easy reading (short paragraphs, bullets)

**For Templates:**
- Notion, Google Sheets, Canva
- Solve a specific problem
- Include instructions

**Pricing Your Product:**
- Ebooks/Templates: $17-$47
- Mini-courses: $47-$197
- Full courses: $197-$997
- Premium/coaching: $997-$5,000+

**The Pricing Mindset:**
What's the result worth? Not how many hours you spent.`,
        proTips: [
          "Pre-sell before creating—make sales page, see if people buy",
          "Sell beta version at 50% off for testimonials",
          "Focus on completion—a shipped product beats a perfect draft",
          "Improve based on student feedback after launch"
        ]
      },
      {
        title: "Marketing & Selling Your Digital Product",
        content: `**The Launch Funnel:**

**1. Build Audience (Ongoing)**
- Content marketing (social, blog, YouTube)
- Email list building
- Community engagement
- Podcast guesting

**2. Create Lead Magnet (Free Value)**
- Free mini-course or guide
- Template or checklist
- First module of your paid product
- Purpose: Demonstrate expertise, build list

**3. Nurture with Email**
- Welcome sequence (5-7 emails)
- Regular valuable content
- Build relationship before selling

**4. Launch Your Product**
- Build anticipation (coming soon)
- Open cart with deadline
- Share testimonials and results
- Create urgency (limited time, bonuses)

**5. Evergreen Sales**
- Automated email sequences
- Paid ads to lead magnet
- Continuous content → funnel

**Sales Page Elements:**
1. Hook/headline that speaks to pain
2. Problem agitation (make them feel it)
3. Solution introduction (your product)
4. What they'll learn/get
5. About you (why you're qualified)
6. Testimonials and results
7. FAQ (handle objections)
8. Clear CTA with price
9. Guarantee (reduce risk)
10. Urgency (deadline or scarcity)

**Traffic Sources:**
- Organic social media
- SEO (blog, YouTube)
- Paid ads (once you have conversions)
- Affiliates and partnerships
- Podcast guesting
- Email list`,
        actionItems: [
          "Create a lead magnet related to your product topic",
          "Set up email list with welcome sequence",
          "Write your sales page (even in draft)",
          "Plan your first launch with timeline"
        ]
      }
    ],
    thirtyDayPlan: [
      {
        week: 1,
        days: "Days 1-7",
        focus: "Idea Validation",
        tasks: [
          "List 10 things you could teach others",
          "Research existing products in each area",
          "Pick your best opportunity based on demand + capability",
          "Define the specific transformation you deliver",
          "Survey 10 potential customers about their struggles",
          "Check if at least 3 would pay for your solution",
          "Finalize your product concept and format"
        ],
        milestone: "Validated product idea with clear transformation"
      },
      {
        week: 2,
        days: "Days 8-14",
        focus: "Product Outline & Pre-Sale",
        tasks: [
          "Create complete module outline",
          "Define all deliverables and bonuses",
          "Choose your platform (Gumroad, Teachable, etc.)",
          "Write sales page copy",
          "Set up pre-sale (sell before building)",
          "Share pre-sale with your audience",
          "Goal: Get 5-10 pre-sales to validate"
        ],
        milestone: "First pre-sales made before product is built"
      },
      {
        week: 3,
        days: "Days 15-21",
        focus: "Content Creation Sprint",
        tasks: [
          "Create module 1-3 content (videos/text)",
          "Build worksheets and templates",
          "Keep quality good enough, not perfect",
          "Create module 4-6 content",
          "Finalize bonus materials",
          "Upload to platform",
          "Test student experience"
        ],
        milestone: "Complete product ready to deliver"
      },
      {
        week: 4,
        days: "Days 22-30",
        focus: "Launch & Collect Feedback",
        tasks: [
          "Deliver to pre-sale customers",
          "Get feedback and testimonials",
          "Make quick improvements based on feedback",
          "Announce public launch",
          "Create lead magnet from product preview",
          "Set up email funnel for ongoing sales",
          "Plan content marketing for next 90 days"
        ],
        milestone: "Live product with testimonials and sales"
      }
    ],
    resources: [
      { name: "Gumroad (Sell Digital Products)", url: "https://gumroad.com", type: "tool" },
      { name: "Teachable (Course Platform)", url: "https://teachable.com", type: "tool" },
      { name: "ConvertKit (Email Marketing)", url: "https://convertkit.com", type: "tool" },
      { name: "Digital Product Creation", url: "https://www.youtube.com/results?search_query=create+digital+product+course", type: "video" }
    ],
    caseStudy: {
      title: "From Free Advice to $50K Product Business",
      scenario: "Rachel was constantly helping friends with their resumes. She spent hours giving free advice. She realized this knowledge had value but didn't know how to package it.",
      outcome: "Created a $47 resume template bundle with video walkthrough. First month: $1,400 in sales. Added a $197 course on job hunting. Year 1 revenue: $52,000. Now works 10 hours/week on the business, rest is automated."
    }
  }
];

const difficultyConfig = {
  foundational: { label: "Foundation", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  intermediate: { label: "Intermediate", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  advanced: { label: "Advanced", color: "bg-primary/20 text-primary border-primary/30" },
  elite: { label: "Elite", color: "bg-gradient-to-r from-primary/20 to-amber-500/20 text-amber-400 border-amber-500/30" }
};

const EmpireBuilding = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("content");
  
  const categories = ["all", ...new Set(businessModules.map(m => m.category))];
  const filteredModules = activeCategory === "all" 
    ? businessModules 
    : businessModules.filter(m => m.category === activeCategory);

  const selectedModule = businessModules.find(m => m.id === activeModule);

  if (selectedModule) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => { setActiveModule(null); setActiveTab("content"); }}
          className="mb-4"
        >
          ← Back to Modules
        </Button>

        {/* Module Header */}
        <div className="steel-plate p-6 border border-primary/30">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <selectedModule.icon className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={difficultyConfig[selectedModule.difficulty].color}>
                  {difficultyConfig[selectedModule.difficulty].label}
                </Badge>
                <Badge variant="outline" className="text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  {selectedModule.estimatedTime}
                </Badge>
              </div>
              <h2 className="headline-section text-2xl md:text-3xl mb-2">{selectedModule.title}</h2>
              <p className="text-muted-foreground">{selectedModule.description}</p>
            </div>
          </div>
          
          {/* Key Takeaways */}
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Key Takeaways
            </h4>
            <ul className="grid md:grid-cols-2 gap-2">
              {selectedModule.keyTakeaways.map((takeaway, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tabs for Content vs 30-Day Plan */}
        {selectedModule.thirtyDayPlan && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-charcoal">
              <TabsTrigger value="content" className="gap-2">
                <BookOpen className="w-4 h-4" /> Learn
              </TabsTrigger>
              <TabsTrigger value="action-plan" className="gap-2">
                <Calendar className="w-4 h-4" /> 30-Day Action Plan
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              {/* Module Sections */}
              <div className="space-y-4">
                <Accordion type="multiple" className="space-y-3">
                  {selectedModule.sections.map((section, idx) => (
                    <AccordionItem 
                      key={idx} 
                      value={`section-${idx}`}
                      className="steel-plate border border-steel-light/20 px-4"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3 text-left">
                          <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                            {idx + 1}
                          </span>
                          <span className="font-semibold">{section.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-6 space-y-4">
                        {/* Main Content */}
                        <div className="prose prose-invert prose-sm max-w-none">
                          {section.content.split('\n\n').map((paragraph, pIdx) => (
                            <div key={pIdx} className="mb-4">
                              {paragraph.split('\n').map((line, lIdx) => {
                                if (line.startsWith('**') && line.endsWith('**')) {
                                  return <h4 key={lIdx} className="text-primary font-semibold mt-4 mb-2">{line.replace(/\*\*/g, '')}</h4>;
                                }
                                if (line.startsWith('**')) {
                                  return <p key={lIdx} className="font-semibold text-foreground">{line.replace(/\*\*/g, '')}</p>;
                                }
                                if (line.startsWith('- ')) {
                                  return <li key={lIdx} className="text-muted-foreground ml-4">{line.substring(2)}</li>;
                                }
                                return <p key={lIdx} className="text-muted-foreground">{line}</p>;
                              })}
                            </div>
                          ))}
                        </div>

                        {/* Action Items */}
                        {section.actionItems && section.actionItems.length > 0 && (
                          <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                            <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                              <Target className="w-4 h-4" /> Action Items
                            </h4>
                            <ol className="space-y-2">
                              {section.actionItems.map((item, aIdx) => (
                                <li key={aIdx} className="flex items-start gap-2 text-sm">
                                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {aIdx + 1}
                                  </span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {/* Pro Tips */}
                        {section.proTips && section.proTips.length > 0 && (
                          <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                            <h4 className="font-semibold text-amber-400 mb-2 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" /> Pro Tips
                            </h4>
                            <ul className="space-y-1 text-sm">
                              {section.proTips.map((tip, tIdx) => (
                                <li key={tIdx} className="text-muted-foreground">• {tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Case Study */}
              {selectedModule.caseStudy && (
                <div className="steel-plate p-6 border border-green-500/30">
                  <h4 className="font-semibold text-green-400 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> Case Study: {selectedModule.caseStudy.title}
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">The Situation</p>
                      <p className="text-sm">{selectedModule.caseStudy.scenario}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-400 uppercase tracking-wider mb-1">The Outcome</p>
                      <p className="text-sm text-green-400/90">{selectedModule.caseStudy.outcome}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Resources */}
              <div className="steel-plate p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" /> Go Deeper
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {selectedModule.resources.map((resource, rIdx) => (
                    <a
                      key={rIdx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-charcoal hover:bg-primary/10 border border-border hover:border-primary/30 transition-colors"
                    >
                      {resource.type === "video" && <Play className="w-5 h-5 text-red-400" />}
                      {resource.type === "book" && <BookOpen className="w-5 h-5 text-blue-400" />}
                      {resource.type === "article" && <Globe className="w-5 h-5 text-green-400" />}
                      {resource.type === "tool" && <Zap className="w-5 h-5 text-amber-400" />}
                      <span className="text-sm font-medium">{resource.name}</span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
                    </a>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="action-plan" className="space-y-4">
              {/* 30-Day Action Plan */}
              <div className="bg-gradient-to-br from-primary/10 to-amber-500/5 p-6 rounded-lg border border-primary/30 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-semibold">30-Day Action Plan</h3>
                </div>
                <p className="text-muted-foreground">
                  Don't just learn—APPLY. This 30-day plan breaks down exactly what to do each week. 
                  Follow it step by step and you'll have real results by day 30.
                </p>
              </div>

              {selectedModule.thirtyDayPlan?.map((week, weekIdx) => (
                <div key={weekIdx} className="steel-plate p-5 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                      W{week.week}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{week.days}</p>
                      <h4 className="font-semibold text-lg">{week.focus}</h4>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {week.tasks.map((task, taskIdx) => (
                      <div key={taskIdx} className="flex items-start gap-3 p-2 rounded bg-charcoal">
                        <div className="w-5 h-5 rounded border border-primary/50 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs text-primary">{taskIdx + 1}</span>
                        </div>
                        <p className="text-sm">{task}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      <p className="text-sm">
                        <span className="font-semibold text-primary">Week {week.week} Milestone:</span>{" "}
                        {week.milestone}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        )}

        {/* If no 30-day plan, show content directly */}
        {!selectedModule.thirtyDayPlan && (
          <>
            {/* Module Sections */}
            <div className="space-y-4">
              <Accordion type="multiple" className="space-y-3">
                {selectedModule.sections.map((section, idx) => (
                  <AccordionItem 
                    key={idx} 
                    value={`section-${idx}`}
                    className="steel-plate border border-steel-light/20 px-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3 text-left">
                        <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {idx + 1}
                        </span>
                        <span className="font-semibold">{section.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 space-y-4">
                      <div className="prose prose-invert prose-sm max-w-none">
                        {section.content.split('\n\n').map((paragraph, pIdx) => (
                          <div key={pIdx} className="mb-4">
                            {paragraph.split('\n').map((line, lIdx) => {
                              if (line.startsWith('**') && line.endsWith('**')) {
                                return <h4 key={lIdx} className="text-primary font-semibold mt-4 mb-2">{line.replace(/\*\*/g, '')}</h4>;
                              }
                              if (line.startsWith('**')) {
                                return <p key={lIdx} className="font-semibold text-foreground">{line.replace(/\*\*/g, '')}</p>;
                              }
                              if (line.startsWith('- ')) {
                                return <li key={lIdx} className="text-muted-foreground ml-4">{line.substring(2)}</li>;
                              }
                              return <p key={lIdx} className="text-muted-foreground">{line}</p>;
                            })}
                          </div>
                        ))}
                      </div>

                      {section.actionItems && section.actionItems.length > 0 && (
                        <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                          <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4" /> Action Items
                          </h4>
                          <ol className="space-y-2">
                            {section.actionItems.map((item, aIdx) => (
                              <li key={aIdx} className="flex items-start gap-2 text-sm">
                                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {aIdx + 1}
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {section.proTips && section.proTips.length > 0 && (
                        <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                          <h4 className="font-semibold text-amber-400 mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" /> Pro Tips
                          </h4>
                          <ul className="space-y-1 text-sm">
                            {section.proTips.map((tip, tIdx) => (
                              <li key={tIdx} className="text-muted-foreground">• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {selectedModule.caseStudy && (
              <div className="steel-plate p-6 border border-green-500/30">
                <h4 className="font-semibold text-green-400 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> Case Study: {selectedModule.caseStudy.title}
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">The Situation</p>
                    <p className="text-sm">{selectedModule.caseStudy.scenario}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-400 uppercase tracking-wider mb-1">The Outcome</p>
                    <p className="text-sm text-green-400/90">{selectedModule.caseStudy.outcome}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="steel-plate p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Go Deeper
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {selectedModule.resources.map((resource, rIdx) => (
                  <a
                    key={rIdx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-charcoal hover:bg-primary/10 border border-border hover:border-primary/30 transition-colors"
                  >
                    {resource.type === "video" && <Play className="w-5 h-5 text-red-400" />}
                    {resource.type === "book" && <BookOpen className="w-5 h-5 text-blue-400" />}
                    {resource.type === "article" && <Globe className="w-5 h-5 text-green-400" />}
                    {resource.type === "tool" && <Zap className="w-5 h-5 text-amber-400" />}
                    <span className="text-sm font-medium">{resource.name}</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="steel-plate p-6 border border-primary/30">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center">
            <Crown className="w-7 h-7 text-black" />
          </div>
          <div>
            <h2 className="headline-card">Empire Building Academy</h2>
            <p className="text-muted-foreground text-sm">
              World-class business education. Build something that lasts.
            </p>
          </div>
        </div>
        
        <p className="text-muted-foreground mb-4">
          This isn't just business advice—it's a complete operating system for building wealth. 
          Each module contains deep knowledge, actionable frameworks, and real-world case studies. 
          Study, apply, iterate, dominate.
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "gold" : "goldOutline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat === "all" ? "All Modules" : cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredModules.map((module) => (
          <button
            key={module.id}
            onClick={() => setActiveModule(module.id)}
            className="steel-plate p-5 text-left border border-steel-light/20 hover:border-primary/40 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                <module.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge className={difficultyConfig[module.difficulty].color} variant="outline">
                    {difficultyConfig[module.difficulty].label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{module.estimatedTime}</span>
                  {module.thirtyDayPlan && (
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                      <Calendar className="w-3 h-3 mr-1" /> 30-Day Plan
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                  {module.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {module.description}
                </p>
                <div className="flex items-center gap-1 mt-3 text-xs text-primary">
                  Start Learning <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Motivation */}
      <div className="bg-gradient-to-br from-primary/20 to-crimson/10 p-6 rounded-lg border border-primary/30 text-center">
        <p className="text-lg font-semibold mb-2">
          "The man who moves a mountain begins by carrying away small stones."
        </p>
        <p className="text-sm text-muted-foreground">
          — Confucius. Start today. Build your empire one module at a time.
        </p>
      </div>
    </div>
  );
};

export default EmpireBuilding;