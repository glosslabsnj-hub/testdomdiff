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
  ChevronRight,
  ExternalLink,
  Play,
  CheckCircle2,
  Rocket,
  Globe,
  Megaphone,
  PiggyBank,
  Scale,
  Briefcase,
  BarChart3,
  Zap,
  Brain,
  Shield,
  Clock,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

// ========== COMPREHENSIVE BUSINESS MASTERY MODULES ==========

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
          onClick={() => setActiveModule(null)}
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
          <div className="steel-plate p-6 border border-success/30">
            <h4 className="font-semibold text-success mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Case Study: {selectedModule.caseStudy.title}
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">The Situation</p>
                <p className="text-sm">{selectedModule.caseStudy.scenario}</p>
              </div>
              <div>
                <p className="text-xs text-success uppercase tracking-wider mb-1">The Outcome</p>
                <p className="text-sm text-success/90">{selectedModule.caseStudy.outcome}</p>
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
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={difficultyConfig[module.difficulty].color} variant="outline">
                    {difficultyConfig[module.difficulty].label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{module.estimatedTime}</span>
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