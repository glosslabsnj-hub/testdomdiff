import { useState } from "react";
import {
  DollarSign, TrendingUp, Target, Lightbulb, BookOpen, ExternalLink,
  CheckCircle2, Scale, Zap, Brain, Clock, ArrowRight, Calendar, Star,
  Shield, Layers, Sparkles, CreditCard, Landmark, Receipt,
  Wallet, LineChart, AlertTriangle, Home, PiggyBank, BadgeDollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

interface FinanceModule {
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
  thirtyDayPlan: {
    week: number;
    days: string;
    focus: string;
    tasks: string[];
    milestone: string;
  }[];
  resources: { name: string; url: string; type: "video" | "article" | "tool" | "book" }[];
  caseStudy?: { title: string; scenario: string; outcome: string };
}

const difficultyColors: Record<string, string> = {
  foundational: "bg-green-500/20 text-green-400 border-green-500/30",
  intermediate: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  advanced: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  elite: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const financeModules: FinanceModule[] = [
  {
    id: "banking-basics",
    title: "Banking & Money Basics",
    icon: Landmark,
    category: "Foundation",
    difficulty: "foundational",
    estimatedTime: "30 min",
    description: "Open your first bank account, understand how money moves, and stop paying fees you don't have to pay.",
    keyTakeaways: [
      "A checking account is for spending, savings is for building",
      "Direct deposit saves time and often eliminates fees",
      "Mobile banking apps give you control from your phone",
      "Most bank fees are avoidable if you know the rules"
    ],
    sections: [
      {
        title: "Opening Your First Bank Account",
        content: `If you've never had a bank account, or it's been a while, here's exactly what you need:

**What you need to bring:**
1. Government-issued photo ID (driver's license, state ID, or passport)
2. Social Security number
3. Proof of address (utility bill, lease, or mail with your name on it)
4. An initial deposit (some banks require $25-100, others $0)

**Which bank to choose:**
- Big banks (Chase, Bank of America, Wells Fargo): More ATMs and branches, but higher fees
- Online banks (Chime, SoFi, Ally, Discover): No monthly fees, higher savings rates, but no physical branches
- Credit unions: Lower fees than big banks, community-focused, often easier to qualify
- If you have a ChexSystems record (previous banking issues): Try Chime, Current, or a "second chance" account at a credit union

**Checking vs Savings:**
- Checking = your wallet. Money comes in (paycheck), money goes out (bills, purchases). Has a debit card.
- Savings = your safe. Money goes in and stays. Earns interest. Use for emergencies and goals.
- You need BOTH. Get a checking account first, add savings once you have income flowing.

**Online vs In-Person:**
- Online banks: Apply in 5-10 minutes from your phone. Funded instantly with a transfer. No monthly fees.
- In-person: Walk into a branch with your documents. Account open same day. Debit card mailed in 7-10 days.
- Recommendation for beginners: Start online with Chime or SoFi (no fees, no minimum balance, instant setup).`,
        actionItems: [
          "Choose a bank: Online (Chime, SoFi) for no fees or local credit union for in-person help",
          "Gather your documents: ID, SSN, proof of address",
          "Open a checking account today. Not tomorrow. Today.",
          "Set up mobile banking app immediately after opening"
        ],
        proTips: [
          "Never pay monthly maintenance fees. If your bank charges them, switch banks.",
          "Chime has no overdraft fees, no minimum balance, and gives you your paycheck 2 days early",
          "Keep your bank login credentials somewhere safe. Write them down if you need to.",
          "Set up account alerts for low balance, large transactions, and deposits"
        ]
      },
      {
        title: "Direct Deposit & Moving Money",
        content: `**Direct Deposit:**
Your employer deposits your paycheck directly into your bank account. No paper check, no check-cashing fees, no delays.

How to set up:
1. Get your bank's routing number and your account number (found in your banking app or on a check)
2. Give these to your employer's HR/payroll department
3. Fill out their direct deposit form
4. It takes 1-2 pay cycles to start

If you're self-employed: Use the same account. Deposit checks through mobile deposit (take a photo with your phone).

**Moving Money Between People:**
- Zelle: Built into most banking apps. Instant transfers. Free. Best for people you know.
- Venmo: Social payment app. Good for splitting bills. Can be linked to your bank.
- Cash App: Has its own debit card. Can also invest and buy Bitcoin.
- PayPal: Best for online purchases and freelance payments.

**Moving Money Between Your Own Accounts:**
- Internal transfer: Move money between your checking and savings in your banking app (usually instant)
- External transfer: Move money between different banks (takes 1-3 business days)
- Set up automatic transfers: Move a set amount from checking to savings every payday`,
        actionItems: [
          "Set up direct deposit with your employer this week",
          "Download Zelle or Venmo for person-to-person payments",
          "Set up an automatic transfer: $25-50 per paycheck to savings"
        ]
      },
      {
        title: "Avoiding Fees & Reading Statements",
        content: `**Fees that drain your money (and how to avoid them):**

1. **Overdraft fees ($35 each!):** When you spend more than you have. Fix: Turn off overdraft protection. Your card will simply decline instead of charging you $35.
2. **Monthly maintenance fees ($5-15/mo):** Some banks charge just to have an account. Fix: Use an online bank with no fees, or maintain the minimum balance.
3. **ATM fees ($2-5 per use):** Using another bank's ATM. Fix: Use your bank's ATMs, get cash back at stores, or use an online bank that reimburses ATM fees.
4. **Wire transfer fees ($15-30):** Fix: Use Zelle or ACH transfer instead (free).
5. **Paper statement fees ($2-5/mo):** Fix: Switch to electronic statements.

**Reading Your Bank Statement:**
Every month, review your statement. Look for:
- Charges you don't recognize (could be fraud)
- Subscriptions you forgot about
- How much you spent vs how much you earned
- Your average daily balance

This takes 10 minutes per month and can save you hundreds.`,
        actionItems: [
          "Turn off overdraft protection in your banking app NOW",
          "Switch to electronic statements",
          "Review last month's statement and find one charge you can eliminate",
          "Find your bank's nearest fee-free ATMs"
        ],
        proTips: [
          "If you get charged an overdraft fee, call the bank and politely ask them to reverse it. First-time requests are usually granted.",
          "Set a low-balance alert at $100 so you always know when money is getting tight",
          "Never use check-cashing stores. They charge 1-5% of your check. That's $10-50 on a $1000 check."
        ]
      }
    ],
    thirtyDayPlan: [
      { week: 1, days: "Days 1-7", focus: "Account Setup",
        tasks: ["Open a checking account (Chime, SoFi, or local credit union)", "Download the mobile banking app", "Set up account alerts (low balance, deposits, large transactions)", "Get direct deposit form from employer", "Familiarize yourself with the app: check balance, view transactions, find routing/account numbers"],
        milestone: "Bank account open and functional" },
      { week: 2, days: "Days 8-14", focus: "Money Flow",
        tasks: ["Submit direct deposit form to employer", "Download Zelle or Venmo", "Set up automatic savings transfer ($25+ per paycheck)", "Turn off overdraft protection", "Switch to electronic statements"],
        milestone: "Direct deposit pending, auto-savings active" },
      { week: 3, days: "Days 15-21", focus: "Fee Elimination",
        tasks: ["Review last month of spending on your statement", "Identify and cancel any unused subscriptions", "Locate fee-free ATMs near you", "If any fees charged, call bank to request reversal", "Set up a bill pay schedule in your banking app"],
        milestone: "Zero unnecessary fees" },
      { week: 4, days: "Days 22-30", focus: "Optimization",
        tasks: ["Open a savings account if you haven't (separate from checking)", "Set up a second auto-transfer to savings", "Check that direct deposit is active", "Create a simple spending tracker (notes app or spreadsheet)", "Review your first full month of banking"],
        milestone: "Complete banking system running smoothly" }
    ],
    resources: [
      { name: "Chime - No-Fee Banking", url: "https://www.chime.com", type: "tool" },
      { name: "SoFi Checking & Savings", url: "https://www.sofi.com/banking/", type: "tool" },
      { name: "FDIC: Bank Account Basics", url: "https://www.fdic.gov/resources/consumers/money-smart/", type: "article" },
      { name: "NerdWallet: Best Free Checking Accounts", url: "https://www.nerdwallet.com/best/banking/free-checking-accounts", type: "article" }
    ],
    caseStudy: {
      title: "From Check-Cashing to $3,000 Saved",
      scenario: "Darius was spending $40/month at check-cashing stores and $30/month in ATM fees. He had no savings and lived paycheck to paycheck.",
      outcome: "Opened a Chime account, set up direct deposit, and started auto-saving $50/paycheck. In 12 months: $0 in fees, $1,300 saved, and his paycheck arriving 2 days early."
    }
  },
  {
    id: "credit-building",
    title: "Credit Building from Zero",
    icon: CreditCard,
    category: "Foundation",
    difficulty: "foundational",
    estimatedTime: "45 min",
    description: "Build your credit score from nothing. Understand how credit works, get your first card, and build a path to 700+.",
    keyTakeaways: [
      "Your credit score affects apartments, jobs, insurance rates, and loan terms",
      "Payment history (35%) and utilization (30%) are the two biggest factors",
      "A secured credit card is the fastest way to start building credit",
      "You can go from no credit to 700+ in 12-18 months with discipline"
    ],
    sections: [
      {
        title: "What Credit Is and Why It Matters",
        content: `Your credit score is a number between 300-850 that tells lenders how reliable you are with money. It affects almost everything:

**Where your credit score matters:**
- Renting an apartment (landlords check credit)
- Getting a car loan (bad credit = 15-25% interest vs good credit = 4-6%)
- Insurance rates (yes, really: bad credit = higher premiums)
- Some jobs check credit (especially finance, government, security clearance)
- Getting a mortgage to buy a home
- Getting approved for business loans
- Cell phone plans without a big deposit
- Utility hookups without deposits

**Credit score ranges:**
- 300-579: Poor (high interest rates, many denials)
- 580-669: Fair (some options, but expensive)
- 670-739: Good (most approvals, decent rates)
- 740-799: Very Good (best rates, easy approvals)
- 800-850: Exceptional (VIP treatment)

**No credit vs bad credit:**
No credit means you have no history. Bad credit means you have negative history. Both are fixable, but the approach is different.

If you have NO credit: Start building with a secured card (next section).
If you have BAD credit: Check your report for errors, dispute what's wrong, then start rebuilding.`,
        actionItems: [
          "Check your credit score for free at Credit Karma (creditkarma.com) or through your bank's app",
          "Pull your full credit reports at annualcreditreport.com (free, once per year per bureau)",
          "Write down your current score and set a 6-month goal"
        ],
        proTips: [
          "Checking your OWN credit never hurts your score. Only applications (hard inquiries) can temporarily lower it.",
          "You have THREE credit reports (Equifax, Experian, TransUnion). Errors on one may not be on others.",
          "If you see accounts you don't recognize, you may be a victim of identity theft. Freeze your credit immediately at all three bureaus."
        ]
      },
      {
        title: "The 5 Factors of Your Credit Score",
        content: `Your FICO score is calculated from five factors. Knowing these is the cheat code:

**1. Payment History (35%) - THE MOST IMPORTANT**
Did you pay on time? Every time? This is the single biggest factor.
- One late payment (30+ days) can drop your score 50-100 points
- Set up autopay for at least the minimum payment on EVERYTHING
- This is non-negotiable. NEVER miss a payment.

**2. Credit Utilization (30%) - HOW MUCH YOU USE**
How much of your available credit are you using?
- If you have a $1,000 credit limit and owe $500, that's 50% utilization
- Keep it under 30%. Ideally under 10%.
- Best trick: If your limit is $500, never carry more than $50 balance when the statement closes
- You can pay multiple times per month to keep utilization low

**3. Length of Credit History (15%)**
How long have you had credit accounts?
- Average age of all accounts matters
- This is why you should NEVER close your oldest credit card
- Time is your friend here. Start now, be patient.

**4. Credit Mix (10%)**
Do you have different types of credit?
- Revolving (credit cards)
- Installment (car loan, personal loan, student loans)
- Don't take on debt just for mix. It'll come naturally.

**5. New Credit Inquiries (10%)**
How many times have you applied recently?
- Each application = a "hard inquiry" = small temporary dip
- Multiple inquiries for the same type (like car shopping) within 14-45 days count as one
- Don't apply for 5 cards at once. Space applications 3-6 months apart.`,
        actionItems: [
          "Set up autopay on every bill you have RIGHT NOW",
          "If you have a credit card, check your current utilization percentage",
          "Make a note to NEVER close your oldest credit account"
        ]
      },
      {
        title: "Building Credit from Scratch: Step-by-Step",
        content: `**Step 1: Get a Secured Credit Card (Week 1)**
A secured card requires a deposit ($200-500) which becomes your credit limit. You use it like a regular credit card, and the bank reports your payments to the credit bureaus.

Best secured cards:
- Discover it Secured: No annual fee, earns cash back, graduates to unsecured card after ~8 months of good use
- Capital One Platinum Secured: Low deposit ($49-200), no annual fee
- Chime Credit Builder: No credit check, no annual fee, works with Chime account

**Step 2: Use It Right (Ongoing)**
- Put ONE small recurring charge on it (Netflix, Spotify, gas)
- Set up autopay for the FULL balance every month
- NEVER carry a balance. Pay it off completely.
- Keep utilization under 10% of your limit

**Step 3: Become an Authorized User (If Possible)**
Ask a family member or trusted friend with excellent credit (700+) and a long account history to add you as an authorized user on their card.
- You don't need to use the card or even have it
- Their payment history on that account gets added to YOUR report
- This can add years of positive history to your file instantly

**Step 4: Get a Credit Builder Loan (Month 3-6)**
Apps like Self (formerly Self Lender) or MoneyLion offer credit builder loans:
- You pay $25-50/month into a savings account
- They report each payment as an installment loan payment
- After 12-24 months, you get your money back plus interest
- This adds installment credit to your mix (factor #4)

**Step 5: Wait and Stay Disciplined (Months 6-18)**
- Check your score monthly (Credit Karma)
- Apply for an unsecured card once you hit 650+ (after ~8-12 months)
- Keep old secured card open even after getting new cards
- Target: 700+ by month 12-18`,
        actionItems: [
          "Apply for a secured credit card TODAY (Discover it Secured recommended)",
          "Put one small subscription on it ($10-15/month)",
          "Set up autopay for full balance",
          "Ask a trusted family member about authorized user status",
          "Sign up for Self credit builder if you want to accelerate"
        ],
        proTips: [
          "The secured card deposit is NOT a fee. You get it back when you close the card or it graduates to unsecured.",
          "NEVER use more than 30% of your limit. If your limit is $300, keep charges under $90.",
          "Pay your credit card bill BEFORE the statement closes to show $0 utilization. This maximizes your score.",
          "Don't apply for store cards (Best Buy, Target). They have low limits and high interest. Stick to major bank cards."
        ]
      },
      {
        title: "Disputing Errors and Fixing Bad Credit",
        content: `**Common credit report errors:**
- Accounts that aren't yours (identity theft or mixed files)
- Late payments that were actually on time
- Accounts showing as open when they're closed
- Wrong balances or credit limits
- Duplicate accounts

**How to dispute:**
1. Get your free reports from annualcreditreport.com
2. Review every account and every payment date
3. For each error, file a dispute online:
   - Equifax: equifax.com/personal/disputes
   - Experian: experian.com/disputes
   - TransUnion: transunion.com/disputes
4. Include any evidence (bank statements, payment receipts)
5. The bureau has 30 days to investigate
6. Errors must be removed if they can't verify the information

**For collections:**
- Ask the collector for a "pay-for-delete" agreement in writing BEFORE paying
- If the debt is past the statute of limitations (varies by state, typically 3-6 years), you may not owe it
- NEVER acknowledge the debt verbally or in writing before understanding your rights
- A paid collection still hurts your score unless it's deleted

**Rebuilding after bad credit:**
The same steps as building from scratch, but you need to wait for negative items to fall off (7 years for most, 10 for bankruptcy) while actively building positive history.`,
        actionItems: [
          "Pull all three credit reports today",
          "Highlight any errors or accounts you don't recognize",
          "File disputes for every error found",
          "For collections: research statute of limitations in your state"
        ]
      }
    ],
    thirtyDayPlan: [
      { week: 1, days: "Days 1-7", focus: "Know Your Starting Point",
        tasks: ["Sign up for Credit Karma (free credit score + report)", "Pull full reports from annualcreditreport.com", "Write down your current score", "Review every account on all 3 reports", "Flag any errors or accounts you don't recognize", "Research secured credit cards", "Set a 6-month credit score goal"],
        milestone: "Know your exact credit situation" },
      { week: 2, days: "Days 8-14", focus: "Start Building",
        tasks: ["Apply for a secured credit card", "File disputes for any errors found", "Ask a trusted person about authorized user", "Put one small subscription on secured card", "Set up autopay for full balance", "Research Self credit builder app"],
        milestone: "Secured card approved, building starts" },
      { week: 3, days: "Days 15-21", focus: "Automate & Protect",
        tasks: ["Confirm autopay is set up correctly", "Set up Credit Karma alerts for score changes", "Freeze credit at all 3 bureaus (prevent identity theft)", "Create a password for each bureau's freeze", "Review credit card statement for accuracy"],
        milestone: "Automated building, protected identity" },
      { week: 4, days: "Days 22-30", focus: "Optimize & Plan Ahead",
        tasks: ["Check utilization ratio and adjust spending if needed", "Sign up for Self credit builder ($25/mo)", "Research when secured card graduates to unsecured", "Set calendar reminder to check score monthly", "Write down your 6-month and 12-month credit goals"],
        milestone: "Multiple credit-building strategies active" }
    ],
    resources: [
      { name: "Credit Karma - Free Credit Score", url: "https://www.creditkarma.com", type: "tool" },
      { name: "Annual Credit Report (official)", url: "https://www.annualcreditreport.com", type: "tool" },
      { name: "Discover it Secured Card", url: "https://www.discover.com/credit-cards/secured/", type: "tool" },
      { name: "Self Credit Builder", url: "https://www.self.inc", type: "tool" },
      { name: "CFPB: How to Dispute Credit Report Errors", url: "https://www.consumerfinance.gov/ask-cfpb/how-do-i-dispute-an-error-on-my-credit-report-en-314/", type: "article" }
    ],
    caseStudy: {
      title: "From 0 to 720 in 14 Months",
      scenario: "Terrance had no credit history after years without any accounts. He couldn't rent an apartment without a cosigner.",
      outcome: "Got a Discover Secured card ($200 deposit), became an authorized user on his sister's card, and signed up for Self. Autopaid everything. Score went from unscored to 720 in 14 months. Got approved for his own apartment lease and a car loan at 5.9% APR."
    }
  },
  {
    id: "budgeting",
    title: "Budgeting & Cash Flow Mastery",
    icon: Receipt,
    category: "Foundation",
    difficulty: "foundational",
    estimatedTime: "40 min",
    description: "Take complete control of your money. Track every dollar, eliminate waste, and build the habit that separates broke from building wealth.",
    keyTakeaways: [
      "A budget isn't restriction. It's permission to spend with purpose.",
      "The 50/30/20 rule: 50% needs, 30% wants, 20% savings",
      "Track every dollar for 30 days to find your money leaks",
      "Emergency fund ($1,000 first) is your #1 financial priority"
    ],
    sections: [
      {
        title: "The 50/30/20 Rule: Your First Budget",
        content: `The simplest budget that works. Take your after-tax income and split it:

**50% - Needs (non-negotiable bills):**
- Rent/mortgage
- Utilities (electric, water, gas, internet)
- Groceries (not eating out)
- Transportation (car payment, insurance, gas, bus pass)
- Minimum debt payments
- Health insurance
- Phone bill

**30% - Wants (things you enjoy but could live without):**
- Eating out / delivery
- Entertainment (streaming, movies, games)
- Shopping (clothes, gadgets, non-essentials)
- Gym membership
- Subscriptions

**20% - Savings & Debt Payoff:**
- Emergency fund (until you hit $1,000, then 3-6 months expenses)
- Extra debt payments (above minimums)
- Investing (after emergency fund)
- Future goals (car, house, vacation)

**Example on $3,000/month take-home:**
- $1,500 needs
- $900 wants
- $600 savings/debt

If your needs are more than 50%, that's okay. Adjust the percentages, but ALWAYS pay yourself (savings) something. Even $50/month builds the habit.`,
        actionItems: [
          "Calculate your monthly after-tax income",
          "List every monthly bill (needs)",
          "Calculate your 50/30/20 split",
          "If needs exceed 50%, identify what can be reduced"
        ],
        proTips: [
          "If you can't do 50/30/20, try 70/20/10 to start. Something is better than nothing.",
          "Your phone bill is negotiable. Call your carrier and ask for a better rate. Or switch to Mint Mobile ($15/mo).",
          "Groceries for one person should be $200-300/month. If you're spending more, meal prep."
        ]
      },
      {
        title: "Tracking Every Dollar (The 30-Day Challenge)",
        content: `For the next 30 days, write down EVERY dollar you spend. Every coffee, every snack, every app purchase. This is the single most eye-opening exercise you can do.

**How to track:**
- Notes app on your phone (simplest)
- Free app: Mint, EveryDollar, or YNAB (free trial)
- Spreadsheet (Google Sheets is free)

**What to track:**
- Date
- What you bought
- How much
- Category (food, transport, entertainment, bills, etc.)
- Cash or card

**What you'll discover:**
Most people are shocked. $5/day on coffee = $150/month = $1,800/year. $12/day eating out = $360/month = $4,320/year.

This isn't about cutting all joy from your life. It's about SEEING where your money goes so you can make intentional choices.

**The envelope method (physical or digital):**
1. Decide your budget for each category
2. Put that amount of cash in labeled envelopes
3. When the envelope is empty, you're done spending in that category
4. Digital version: Use separate savings accounts for each goal (many banks let you create "buckets")`,
        actionItems: [
          "Download a tracking app or open a note on your phone",
          "Track EVERY purchase for the next 30 days starting NOW",
          "At the end of week 1, review and categorize your spending",
          "Identify your top 3 money leaks"
        ]
      },
      {
        title: "Building Your Emergency Fund",
        content: `An emergency fund is the difference between a bad month and a financial crisis.

**Phase 1: $1,000 (Starter Emergency Fund)**
This covers most unexpected expenses: car repair, medical bill, broken phone, emergency travel.
How to build it fast:
- Sell stuff you don't use (Facebook Marketplace, OfferUp)
- Pick up extra shifts or side work
- Cut 2-3 subscriptions temporarily
- Put every unexpected dollar here (tax refund, birthday money, rebates)
Timeline: 1-3 months if you're aggressive

**Phase 2: 3-6 Months of Expenses (Full Emergency Fund)**
This protects you if you lose your job or can't work.
Calculate: Monthly needs x 3 (minimum) or x 6 (ideal)
Example: $2,000/month needs x 3 = $6,000 target

**Where to keep it:**
- High-yield savings account (Ally, Marcus, SoFi: 4-5% APY vs 0.01% at big banks)
- NOT in your checking account (too easy to spend)
- NOT invested in stocks (you need instant access, no risk)

**Rules:**
- Only use for REAL emergencies (job loss, medical, car breakdown)
- NOT for "I want new shoes" or "I forgot about this bill"
- If you use it, rebuilding it becomes your #1 priority`,
        actionItems: [
          "Open a high-yield savings account (Ally, SoFi, or Marcus)",
          "Set a $1,000 emergency fund goal",
          "Set up automatic transfer of $50+ per paycheck to this account",
          "List 3 things you can sell to jumpstart the fund"
        ],
        proTips: [
          "Keep your emergency fund at a DIFFERENT bank than your checking. Out of sight, harder to spend.",
          "A high-yield savings account earns 4-5% vs 0.01% at most big banks. On $5,000, that's $200+/year vs $0.50.",
          "Name your savings account something motivating: 'Freedom Fund' or 'Never Broke Again'"
        ]
      }
    ],
    thirtyDayPlan: [
      { week: 1, days: "Days 1-7", focus: "Awareness",
        tasks: ["Calculate exact monthly after-tax income", "List every recurring bill with due dates", "Start tracking every purchase (app or notes)", "Calculate your current 50/30/20 split", "Identify subscriptions you forgot about", "Open a high-yield savings account"],
        milestone: "Complete picture of money in and money out" },
      { week: 2, days: "Days 8-14", focus: "Cut & Redirect",
        tasks: ["Cancel 2-3 subscriptions you don't use enough", "Review and lower phone/internet bills (call providers)", "Set up automatic savings transfer", "Plan meals for the week to cut food spending", "List 5 items to sell for emergency fund seed money"],
        milestone: "Monthly expenses reduced, savings started" },
      { week: 3, days: "Days 15-21", focus: "Systematize",
        tasks: ["Create your monthly budget (50/30/20 or adjusted)", "Set up bill auto-pay for every recurring bill", "Sell 2-3 items from your list", "Review two weeks of spending data: where are the leaks?", "Adjust budget based on real data"],
        milestone: "Budget created from real spending data" },
      { week: 4, days: "Days 22-30", focus: "Lock It In",
        tasks: ["Complete 30-day spending tracking", "Final budget review and adjustment", "Check emergency fund progress", "Set 3-month and 6-month financial goals", "Schedule monthly 'money date' to review finances"],
        milestone: "Complete budget system running, emergency fund growing" }
    ],
    resources: [
      { name: "EveryDollar - Free Budget App", url: "https://www.everydollar.com", type: "tool" },
      { name: "YNAB (You Need A Budget)", url: "https://www.ynab.com", type: "tool" },
      { name: "Ally Bank High-Yield Savings", url: "https://www.ally.com/bank/savings/", type: "tool" },
      { name: "The Total Money Makeover - Dave Ramsey", url: "https://www.amazon.com/Total-Money-Makeover-Financial-Fitness/dp/1595555277", type: "book" }
    ],
    caseStudy: {
      title: "From $0 Saved to $5,000 Emergency Fund in 8 Months",
      scenario: "Kenya was spending $400/month eating out, $120 on subscriptions she barely used, and had zero savings. One car repair put her in debt.",
      outcome: "Tracked spending for 30 days, cut eating out to $100/month, canceled 6 subscriptions ($85 saved), started auto-saving $300/month. Built $5,000 emergency fund in 8 months and hasn't used a credit card for emergencies since."
    }
  },
  {
    id: "destroying-debt",
    title: "Destroying Debt",
    icon: Scale,
    category: "Intermediate",
    difficulty: "intermediate",
    estimatedTime: "45 min",
    description: "Develop a battle plan to eliminate debt. Learn which debts to attack first, how to negotiate with creditors, and how to protect yourself from predatory lending.",
    keyTakeaways: [
      "List every debt: who, how much, interest rate, minimum payment",
      "Avalanche method (highest interest first) saves the most money",
      "Snowball method (smallest balance first) gives the fastest wins",
      "You can negotiate with creditors. They'd rather get something than nothing."
    ],
    sections: [
      {
        title: "Good Debt vs Bad Debt",
        content: `Not all debt is created equal.

**Good debt (used to build wealth or increase earning power):**
- Mortgage (builds equity, usually appreciates)
- Student loans for in-demand degrees (increases earning potential)
- Business loans (generates revenue)
- Investment property financing

**Bad debt (loses value and charges you for the privilege):**
- Credit card debt (15-30% interest!)
- Payday loans (300-600% APR)
- Car loans on depreciating vehicles (especially if underwater)
- Personal loans for consumption
- Medical debt (negotiate before accepting the full bill)
- Buy-now-pay-later that you can't actually afford

**The priority for payoff:**
1. Payday loans and title loans (HIGHEST priority: predatory rates)
2. Credit card debt (15-30% interest)
3. Personal loans (10-25% interest)
4. Car loans (4-15% interest)
5. Student loans (3-8% interest)
6. Mortgage (3-7% interest, lowest priority)`,
        actionItems: [
          "List EVERY debt: creditor, balance, interest rate, minimum payment",
          "Categorize each as good or bad debt",
          "Star the highest interest rate debt",
          "Calculate total minimum payments per month"
        ]
      },
      {
        title: "The Debt Payoff Strategy",
        content: `**Debt Avalanche (saves the most money):**
1. Pay minimums on everything
2. Put ALL extra money toward the HIGHEST interest rate debt
3. When that's paid off, roll that payment to the next highest
4. Repeat until debt-free
Best for: People motivated by math and long-term savings

**Debt Snowball (fastest emotional wins):**
1. Pay minimums on everything
2. Put ALL extra money toward the SMALLEST balance debt
3. When that's paid off, roll that payment to the next smallest
4. Repeat until debt-free
Best for: People who need quick wins to stay motivated

**Which to choose?**
If your highest interest debt is also one of your smaller debts: either method works.
If you need motivation and have been struggling: snowball.
If you're disciplined and want to save the most: avalanche.

**Finding extra money for debt payoff:**
- Sell things you don't need
- Cut subscriptions and dining out
- Pick up overtime, side gig, or freelance work
- Use tax refunds and bonuses for debt
- The "debt avalanche" of energy: throw everything at it`,
        actionItems: [
          "Choose your strategy: avalanche or snowball",
          "Calculate how much extra per month you can put toward debt",
          "Make the first extra payment this week",
          "Set up a visual tracker (cross off each debt as it's paid)"
        ],
        proTips: [
          "Even $50/month extra toward debt makes a massive difference over time",
          "Every time you pay off a debt, the freed-up minimum payment rolls into the next debt. This creates momentum.",
          "Don't try to pay off debt AND invest at the same time (unless employer matches 401k). Focus on debt first."
        ]
      },
      {
        title: "Negotiating with Creditors & Collections",
        content: `**Negotiating lower interest rates (credit cards):**
Call your credit card company and say:
"Hi, I've been a customer for [X months/years] and I've been making my payments on time. I've received offers from other cards with lower rates. I'd like to request a lower interest rate on my account. Can you help me with that?"

Success rate: about 70% if you ask politely and have been paying on time.

**Negotiating with collections:**
If a debt has gone to collections:
1. Request "debt validation" in writing within 30 days of their first contact
2. They must prove you owe the debt and the amount is correct
3. If validated, offer a lump sum settlement (start at 25-40 cents on the dollar)
4. Get a "pay-for-delete" agreement IN WRITING before paying
5. Pay by money order or cashier's check (never give them access to your bank account)

**Medical debt negotiation:**
- Always ask for an itemized bill (errors are common)
- Ask about financial hardship programs
- Negotiate: hospitals typically accept 20-60% of the original bill
- Many hospitals have charity care programs if income is below a threshold

**What NOT to do:**
- Never ignore debt. It doesn't go away.
- Never pay a collector without written agreement on terms
- Never give your bank account info to a collector
- Never acknowledge a debt past the statute of limitations without legal advice`,
        actionItems: [
          "Call your highest-interest credit card and request a rate reduction",
          "For any debt in collections: send a debt validation letter",
          "For medical bills: request an itemized bill and ask about hardship programs",
          "Research your state's statute of limitations on debt"
        ]
      }
    ],
    thirtyDayPlan: [
      { week: 1, days: "Days 1-7", focus: "Debt Inventory",
        tasks: ["List every debt with balance, rate, and minimum payment", "Pull credit reports to find any forgotten debts", "Calculate total debt and total minimum payments", "Choose avalanche or snowball strategy", "Identify how much extra you can pay monthly"],
        milestone: "Complete debt picture and strategy chosen" },
      { week: 2, days: "Days 8-14", focus: "Negotiate & Reduce",
        tasks: ["Call credit card companies to request lower rates", "For medical debt: request itemized bills", "For collections: send debt validation letters", "Identify one expense to cut and redirect to debt", "Make first extra payment toward target debt"],
        milestone: "Rates lowered, validation requested, first extra payment made" },
      { week: 3, days: "Days 15-21", focus: "Accelerate",
        tasks: ["List 5 items to sell for lump debt payment", "Research side income opportunities", "Set up automatic extra payments to target debt", "Create visual debt payoff tracker", "Calculate projected payoff dates"],
        milestone: "Payoff system automated and accelerated" },
      { week: 4, days: "Days 22-30", focus: "Protect & Monitor",
        tasks: ["Review any responses from creditors/collectors", "Negotiate settlements for validated collections (if applicable)", "Track debt reduction progress", "Set monthly debt review reminder", "Celebrate progress: calculate total interest you'll save"],
        milestone: "Debt payoff on autopilot, protections in place" }
    ],
    resources: [
      { name: "undebt.it - Free Debt Payoff Planner", url: "https://undebt.it", type: "tool" },
      { name: "CFPB Debt Collection Rights", url: "https://www.consumerfinance.gov/consumer-tools/debt-collection/", type: "article" },
      { name: "Debt-Free Community (Reddit)", url: "https://www.reddit.com/r/debtfree/", type: "article" }
    ],
    caseStudy: {
      title: "From $23,000 in Debt to Debt-Free in 26 Months",
      scenario: "Marcus had $14K in credit cards, $6K in medical bills, and $3K in collections. Minimum payments were $450/month and nothing was going down.",
      outcome: "Negotiated medical bills to $2,400 (60% off). Got pay-for-delete on collections for $1,200 (40 cents on dollar). Used snowball method on credit cards while working weekend pressure washing gig ($1,500/month extra). Completely debt-free in 26 months."
    }
  },
  {
    id: "taxes-basics",
    title: "Taxes & Legal Money",
    icon: Receipt,
    category: "Intermediate",
    difficulty: "intermediate",
    estimatedTime: "35 min",
    description: "Understand taxes so the government doesn't take more than they should. Know the difference between W-2 and 1099, file for free, and keep more of what you earn.",
    keyTakeaways: [
      "W-2 = employer handles your taxes. 1099 = you handle your own.",
      "Self-employed? Set aside 25-30% for taxes. No exceptions.",
      "You can file federal taxes for FREE (IRS Free File)",
      "Common deductions can save you thousands"
    ],
    sections: [
      {
        title: "Understanding Your Income Types",
        content: `**W-2 Employee:**
Your employer withholds taxes from each paycheck. At year-end, you get a W-2 form showing what you earned and what was withheld. Filing is straightforward.

Your paycheck breakdown:
- Gross pay (total before deductions)
- Federal income tax (10-37% depending on income bracket)
- State income tax (0-13% depending on state; some states have 0%)
- Social Security (6.2%)
- Medicare (1.45%)
- Other deductions (health insurance, 401k, etc.)
- Net pay (what hits your bank account)

**1099 Independent Contractor / Self-Employed:**
No taxes are withheld. You get the full amount and are responsible for paying taxes yourself.

You owe:
- Federal income tax (same brackets as W-2)
- Self-employment tax (15.3%: covers Social Security + Medicare for both employer and employee portions)
- State income tax
- Quarterly estimated tax payments (April 15, June 15, Sept 15, Jan 15)

**The 25-30% Rule:**
If you're 1099/self-employed, immediately put 25-30% of every payment into a separate savings account. This is the government's money. Don't spend it.

Example: You earn $3,000 freelancing. Put $750-900 in your tax savings account. Spend only the rest.`,
        actionItems: [
          "Determine if you're W-2, 1099, or both",
          "If 1099: Open a separate savings account labeled 'TAXES'",
          "If 1099: Calculate 25-30% of your average monthly income",
          "Set up automatic transfers of tax money each time you get paid"
        ]
      },
      {
        title: "Filing Taxes for Free",
        content: `**IRS Free File (income under $79,000):**
Go to irs.gov/freefile. The IRS partners with tax software companies to let you file federal taxes completely free. Available late January through October.

**VITA (Volunteer Income Tax Assistance):**
Free in-person tax preparation for people earning under $64,000.
Find a location: irs.gov/vita

**Free software options:**
- IRS Free File (irs.gov/freefile): Federal free for income under $79K
- Cash App Taxes: 100% free federal AND state filing for all income levels
- FreeTaxUSA: Free federal, $15 state
- IRS Direct File: Available in more states each year

**When to hire a CPA:**
- You have a business with significant expenses
- You own rental property
- You have complex investments
- You had a major life change (marriage, divorce, large inheritance)
- You're behind on taxes and need to catch up

A good CPA costs $200-500 but can save you thousands in deductions you'd miss.`,
        actionItems: [
          "Bookmark irs.gov/freefile for tax season",
          "Search for VITA locations near you",
          "If self-employed: gather all 1099s, receipts, and expense records",
          "Set a calendar reminder for tax deadlines"
        ],
        proTips: [
          "File early (January/February). You get your refund faster and avoid last-minute stress.",
          "If you owe taxes and can't pay, FILE ANYWAY. The penalty for not filing is 10x worse than the penalty for not paying.",
          "Keep ALL receipts for business expenses. A shoebox of receipts is better than nothing."
        ]
      }
    ],
    thirtyDayPlan: [
      { week: 1, days: "Days 1-7", focus: "Tax Education",
        tasks: ["Determine your income type (W-2 vs 1099)", "Read your last pay stub line by line", "If self-employed: open a tax savings account", "Research your state's income tax rate", "Find last year's tax return (if you filed)"],
        milestone: "Understand your tax situation completely" },
      { week: 2, days: "Days 8-14", focus: "Organization",
        tasks: ["Create a folder (physical or digital) for tax documents", "Start saving receipts for deductible expenses", "If 1099: set up 25-30% auto-transfer for taxes", "Research common deductions for your situation", "Check if quarterly estimated payments are needed"],
        milestone: "Tax system organized" },
      { week: 3, days: "Days 15-21", focus: "Optimization",
        tasks: ["Review W-4 withholding (are you getting too big a refund? That's an interest-free loan to the government)", "Identify all deductions you qualify for", "If self-employed: track all business expenses", "Research retirement accounts for tax benefits (IRA, 401k)"],
        milestone: "Tax optimization strategy in place" },
      { week: 4, days: "Days 22-30", focus: "Systems",
        tasks: ["Set up a simple expense tracking system", "Create tax deadline calendar", "Research free filing options for next tax season", "Calculate estimated tax savings from deductions", "Set up quarterly reminders if self-employed"],
        milestone: "Tax management system running" }
    ],
    resources: [
      { name: "IRS Free File", url: "https://www.irs.gov/filing/free-file-do-your-federal-taxes-for-free", type: "tool" },
      { name: "VITA Locator", url: "https://irs.treasury.gov/freetaxprep/", type: "tool" },
      { name: "Cash App Taxes (100% Free)", url: "https://cash.app/taxes", type: "tool" }
    ],
    caseStudy: {
      title: "From Tax Panic to $2,800 Refund",
      scenario: "James was 1099 for a year and hadn't set aside any tax money. He owed $4,200 and was terrified. He'd never filed before.",
      outcome: "Found VITA for free preparation. The tax preparer found deductions he didn't know about (home office, mileage, phone, internet) reducing his bill to $1,400. Set up a payment plan with the IRS ($150/month). Now saves 30% of every check automatically."
    }
  },
  {
    id: "investing-beginners",
    title: "Investing for Beginners",
    icon: LineChart,
    category: "Advanced",
    difficulty: "advanced",
    estimatedTime: "50 min",
    description: "Make your money work for you. Understand compound interest, open your first investment account, and start building real wealth.",
    keyTakeaways: [
      "$200/month invested for 30 years at 10% average return = $452,000",
      "Index funds beat 90% of professional fund managers over time",
      "Start investing AFTER your emergency fund and high-interest debt are handled",
      "Time in the market beats timing the market. Start now, stay consistent."
    ],
    sections: [
      {
        title: "Why Investing Beats Saving",
        content: `**The problem with only saving:**
Inflation averages 3-4% per year. If your savings earns 4% and inflation is 3.5%, you're barely breaking even. Your money loses purchasing power over time.

**The power of compound interest:**
Albert Einstein called it "the 8th wonder of the world."

Example: You invest $200/month starting at age 25:
- At 10% average return (S&P 500 historical average)
- By age 35: $41,000
- By age 45: $153,000
- By age 55: $452,000
- By age 65: $1,300,000+

The same $200/month in a savings account at 4%: about $180,000 by age 65.

The difference: over $1 MILLION. That's compound interest.

**When to start investing:**
1. Emergency fund of $1,000+ (check)
2. High-interest debt (15%+) paid off (check)
3. Then: START INVESTING even if it's $25/month

Don't wait until you "have enough." The best time to start is NOW.`,
        actionItems: [
          "Calculate how much you can invest monthly ($25 minimum to start)",
          "Check if you have high-interest debt that should be paid first",
          "Open the Fidelity or Schwab app to explore"
        ]
      },
      {
        title: "Account Types & Index Funds",
        content: `**Account types:**
- **Roth IRA**: Contribute after-tax money, grows tax-free, withdraw tax-free in retirement. Best for most people. $7,000/year limit (2024-2025). No employer needed.
- **Traditional IRA**: Contribute pre-tax money (tax deduction now), pay taxes when you withdraw in retirement. Good if you're in a high tax bracket now.
- **401(k)**: Through your employer. If they match your contribution, that's FREE MONEY. Always contribute at least enough to get the full match.
- **Brokerage account**: No tax advantages but no restrictions either. Can withdraw anytime. Use after maxing retirement accounts.

**What to invest in (keep it simple):**
- **Index funds**: A single fund that holds hundreds/thousands of stocks. Low fees, beats most professional investors.
- **S&P 500 index fund**: Holds the 500 biggest US companies. ~10% average annual return over decades.
  - Fidelity: FXAIX (0.015% fee)
  - Vanguard: VFIAX (0.04% fee)
  - Schwab: SWPPX (0.02% fee)
- **Total Stock Market fund**: Even more diversified than S&P 500.
  - Fidelity: FSKAX
  - Vanguard: VTSAX

**The 3-Fund Portfolio (simple and powerful):**
1. US Total Stock Market (60-70%)
2. International Stock Market (20-30%)
3. US Bond Fund (0-10% when young, more as you age)

**Dollar Cost Averaging:**
Invest the same amount every month regardless of what the market is doing. Some months you buy high, some low. Over time, it averages out and you don't have to guess.`,
        actionItems: [
          "Open a Roth IRA at Fidelity or Schwab (free, no minimums)",
          "Set up automatic monthly investment of $50+ into an S&P 500 index fund",
          "If your employer offers 401(k) matching, increase your contribution to get the FULL match"
        ],
        proTips: [
          "Fidelity and Schwab have $0 minimums and $0 commissions. There's no barrier to starting.",
          "Never try to time the market. Nobody consistently does it, not even the professionals.",
          "If the market drops, DON'T sell. Buy more. Stocks are on sale.",
          "Check your investments once a month at most. Checking daily causes anxiety and bad decisions."
        ]
      }
    ],
    thirtyDayPlan: [
      { week: 1, days: "Days 1-7", focus: "Education",
        tasks: ["Watch 'How the Stock Market Works' on YouTube (Khan Academy)", "Learn the difference between Roth IRA and 401(k)", "Check if your employer offers 401(k) matching", "Research Fidelity, Schwab, or Vanguard", "Calculate how much you can invest monthly"],
        milestone: "Understand investing basics and account types" },
      { week: 2, days: "Days 8-14", focus: "Account Setup",
        tasks: ["Open a Roth IRA at Fidelity or Schwab", "If employer has 401(k) match: increase contribution to get full match", "Link your bank account to your investment account", "Research S&P 500 index funds (FXAIX, SWPPX, VFIAX)"],
        milestone: "Investment account open and funded" },
      { week: 3, days: "Days 15-21", focus: "First Investment",
        tasks: ["Buy your first shares of an S&P 500 index fund", "Set up automatic monthly investment", "Learn to read your account dashboard", "Watch one video on compound interest calculator", "Use a compound interest calculator with your numbers"],
        milestone: "First investment made, auto-invest active" },
      { week: 4, days: "Days 22-30", focus: "Long-Term Plan",
        tasks: ["Set a 1-year investing goal", "Research the 3-fund portfolio", "Read one article about why index funds beat active management", "Set calendar reminder: review investments quarterly (not more often)", "Tell one person about what you learned (teaching reinforces learning)"],
        milestone: "Investing system automated, long-term mindset set" }
    ],
    resources: [
      { name: "Fidelity - $0 Minimums", url: "https://www.fidelity.com", type: "tool" },
      { name: "Schwab - $0 Minimums", url: "https://www.schwab.com", type: "tool" },
      { name: "The Simple Path to Wealth - JL Collins", url: "https://www.amazon.com/Simple-Path-Wealth-financial-independence/dp/1533667926", type: "book" },
      { name: "Khan Academy: Stocks & Bonds", url: "https://www.khanacademy.org/economics-finance-domain/core-finance/stock-and-bonds", type: "video" },
      { name: "Compound Interest Calculator", url: "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator", type: "tool" }
    ],
    caseStudy: {
      title: "From Zero Investments to $47,000 Portfolio",
      scenario: "Alicia started investing at 28 with zero knowledge and $150/month into a Roth IRA (S&P 500 index fund). She was terrified of losing money.",
      outcome: "Never stopped her automatic investment through two market dips. After 7 years, her portfolio was worth $47,000 ($12,600 in pure investment gains). She increased to $300/month and is on track for $500K+ by retirement."
    }
  },
  {
    id: "insurance-protection",
    title: "Insurance & Protection",
    icon: Shield,
    category: "Advanced",
    difficulty: "advanced",
    estimatedTime: "30 min",
    description: "Protect everything you're building. Understand what insurance you actually need, what you don't, and how to get the best rates.",
    keyTakeaways: [
      "Health insurance isn't optional. One ER visit without it can bankrupt you.",
      "Renter's insurance is $10-20/month and covers $20,000+ in belongings",
      "Term life insurance is cheap and necessary if anyone depends on your income",
      "Higher deductibles = lower premiums. Balance based on your emergency fund."
    ],
    sections: [
      {
        title: "The Insurance You Actually Need",
        content: `**Health Insurance (CRITICAL):**
One hospital visit can cost $10,000-$100,000+. This is non-negotiable.

Options:
- Employer plan (usually the best deal: employer pays part of the premium)
- ACA Marketplace (healthcare.gov): Subsidies available based on income. Open enrollment Nov-Jan, or qualify for Special Enrollment.
- Medicaid: Free/low-cost if income is below threshold. Apply at your state's Medicaid office.
- Parent's plan: If under 26, you can stay on a parent's plan.

Key terms:
- Premium: What you pay monthly
- Deductible: What you pay before insurance kicks in
- Copay: Fixed amount per visit ($20-50)
- Coinsurance: Your percentage after deductible (usually 20%)
- Out-of-pocket maximum: Most you'll pay in a year. After this, insurance covers 100%.

**Auto Insurance (Required by law):**
- Liability minimum: Covers damage you cause to others. Required in most states.
- Comprehensive + collision: Covers your car too. Required if you have a car loan.
- Shop around every 6-12 months. Rates vary wildly between companies.

**Renter's Insurance ($10-20/month):**
- Covers your belongings if stolen, damaged, or destroyed
- Covers liability if someone is injured in your rental
- Many landlords require it
- Lemonade, State Farm, USAA all offer cheap policies

**Life Insurance (if anyone depends on your income):**
- Term life insurance: Pure coverage for a set period (20-30 years). Cheap.
- 30-year-old healthy male: $500K coverage for ~$25/month
- Whole life: Expensive, complex, usually unnecessary. Skip it.
- Rule of thumb: Coverage = 10-12x your annual income`,
        actionItems: [
          "If uninsured: check healthcare.gov or your state's Medicaid program",
          "If renting without renter's insurance: get a quote from Lemonade ($10/mo)",
          "Shop your auto insurance (try Progressive, Geico, State Farm)",
          "If you have dependents: get a term life insurance quote"
        ]
      }
    ],
    thirtyDayPlan: [
      { week: 1, days: "Days 1-7", focus: "Audit",
        tasks: ["List every insurance policy you have (or don't have)", "Check if you have health insurance coverage", "Verify auto insurance meets state minimums", "Check if your landlord requires renter's insurance"],
        milestone: "Know your current coverage gaps" },
      { week: 2, days: "Days 8-14", focus: "Fill Gaps",
        tasks: ["If uninsured: apply for marketplace or Medicaid", "If no renter's insurance: get a policy ($10-20/mo)", "Get 3 auto insurance quotes to compare", "Research term life if you have dependents"],
        milestone: "Critical gaps addressed" },
      { week: 3, days: "Days 15-21", focus: "Optimize",
        tasks: ["Review deductibles: can you raise them to lower premiums?", "Ask about bundling discounts (auto + renter's)", "Check for employer-offered benefits you're not using", "Set up auto-pay on all insurance premiums"],
        milestone: "Optimized coverage at best rates" },
      { week: 4, days: "Days 22-30", focus: "Document",
        tasks: ["Create a document with all policy numbers and contact info", "Take photos/video of belongings for renter's insurance claims", "Set annual reminder to shop insurance rates", "Confirm beneficiaries are correct on life insurance"],
        milestone: "Fully protected and documented" }
    ],
    resources: [
      { name: "Healthcare.gov", url: "https://www.healthcare.gov", type: "tool" },
      { name: "Lemonade Renter's Insurance", url: "https://www.lemonade.com/renters", type: "tool" },
      { name: "Policygenius - Compare Insurance", url: "https://www.policygenius.com", type: "tool" }
    ]
  },
  {
    id: "housing-purchases",
    title: "Housing & Major Purchases",
    icon: Home,
    category: "Elite",
    difficulty: "elite",
    estimatedTime: "45 min",
    description: "Make the biggest purchases of your life wisely. Understand renting vs buying, avoid dealer traps on cars, and build toward homeownership.",
    keyTakeaways: [
      "Rent should be under 30% of your gross income",
      "You need 620+ credit score, 3-5% down payment, and stable income to buy a home",
      "FHA loans require only 3.5% down with 580+ credit",
      "Never buy a new car. The moment you drive off the lot, it loses 20% of its value."
    ],
    sections: [
      {
        title: "Renting Smart",
        content: `**What landlords look for:**
- Credit score (usually 620+ preferred, some accept 580+)
- Income (typically want 3x the rent in monthly income)
- Rental history (references from previous landlords)
- Background check
- Employment verification

**Negotiating rent:**
- Research comparable rentals in the area (Zillow, Apartments.com)
- Offer to sign a longer lease (18-24 months) for a lower rate
- Move in during winter months (less demand = more negotiating power)
- Offer to pay several months upfront if you have the cash
- Ask about move-in specials

**Lease red flags:**
- No written lease (everything should be in writing)
- Excessive late fees (more than 5% of rent)
- Landlord won't do a walkthrough before move-in (document everything with photos)
- No clear maintenance responsibility
- Automatic renewal without notice requirement`,
        actionItems: [
          "Calculate 30% of your gross monthly income (this is your rent ceiling)",
          "If currently looking: get copies of your credit report, pay stubs, and references ready",
          "Do a photo walkthrough of your current place to document condition"
        ]
      },
      {
        title: "Path to Homeownership",
        content: `**When you're ready to buy:**
- Credit score: 580+ for FHA, 620+ for conventional, 740+ for best rates
- Down payment: 3.5% FHA, 5-20% conventional
- Debt-to-income ratio: Under 43%
- Stable employment (2+ years in same field)
- Emergency fund PLUS down payment PLUS closing costs (2-5% of purchase price)

**Loan types:**
- FHA: 3.5% down, 580+ credit. Best for first-time buyers with lower credit.
- Conventional: 5-20% down, 620+ credit. No mortgage insurance with 20% down.
- VA: 0% down, no mortgage insurance. Veterans and active military only.
- USDA: 0% down, rural areas only. Income limits apply.

**First-time buyer programs:**
- Down payment assistance programs (state-specific)
- FHA first-time buyer programs
- State housing finance agency programs
- Employer-assisted housing programs

**Hidden costs of homeownership:**
- Property taxes (1-3% of home value annually)
- Homeowner's insurance ($800-2,000/year)
- Maintenance (budget 1-2% of home value per year)
- HOA fees (if applicable: $200-500/month)
- Utilities (often higher than renting)
- PMI (mortgage insurance if less than 20% down)`,
        actionItems: [
          "Calculate your homebuying readiness score (credit, savings, income stability)",
          "Research first-time buyer programs in your state",
          "Start a dedicated 'House Fund' savings account",
          "Get pre-approved to see what you qualify for (doesn't commit you to anything)"
        ]
      },
      {
        title: "Buying a Car Without Getting Robbed",
        content: `**The rules:**
1. NEVER buy a brand new car. It loses 20-30% of value in year one.
2. Buy 2-3 years old with low mileage. Let someone else eat the depreciation.
3. Get pre-approved for financing from your bank/credit union BEFORE going to the dealer. Dealer financing is almost always worse.
4. Research the fair market value on KBB.com or Edmunds.com before negotiating.
5. NEVER tell the dealer your monthly payment budget. They'll stretch the loan term to hit your number while charging more overall.

**What to negotiate:**
- The OUT-THE-DOOR price (total including fees, taxes, everything)
- Not the monthly payment

**Dealer tactics to watch for:**
- "What monthly payment works for you?" (They'll extend the loan to hide the real cost)
- Extended warranty pressure (usually overpriced: decline at the dealer, research separately)
- Add-ons at signing (paint protection, fabric coating, nitrogen tires: all unnecessary)
- "This deal is only good today" (It's not. Walk away.)

**Financing rules:**
- Aim for 48 months or less on a car loan
- Interest rate depends on credit score: 700+ gets 4-6%, 600 gets 8-12%
- If the rate is above 10%, consider buying cheaper or improving credit first
- NEVER lease unless it's a business write-off`,
        actionItems: [
          "If car shopping: get pre-approved at your bank first",
          "Research fair market value for any car you're considering",
          "Set a total budget (not monthly payment) before visiting any dealer"
        ],
        proTips: [
          "Private party sales (Facebook Marketplace, Craigslist) are often 15-20% cheaper than dealers. Get a pre-purchase inspection ($100-150).",
          "The total cost of a car includes: purchase price + interest + insurance + gas + maintenance. Calculate ALL of these.",
          "A reliable $8,000 Honda Civic is a better financial decision than a $30,000 SUV you can barely afford."
        ]
      }
    ],
    thirtyDayPlan: [
      { week: 1, days: "Days 1-7", focus: "Assessment",
        tasks: ["Calculate your housing affordability (30% of gross income)", "Check your credit score and identify areas to improve", "Research average rent/home prices in your target area", "List your housing priorities (location, size, amenities)"],
        milestone: "Clear picture of housing affordability" },
      { week: 2, days: "Days 8-14", focus: "Research",
        tasks: ["Research first-time homebuyer programs in your state", "Compare FHA vs conventional loan requirements", "Calculate how much you need for down payment + closing costs + reserves", "If renting: review your lease terms and renewal options"],
        milestone: "Understand all options available" },
      { week: 3, days: "Days 15-21", focus: "Action",
        tasks: ["Open a dedicated housing savings account", "Set up automatic savings toward housing goal", "Get pre-qualified (not pre-approved) to see what you could afford", "If buying a car: get pre-approved at your bank/credit union"],
        milestone: "Savings plan active, pre-qualification complete" },
      { week: 4, days: "Days 22-30", focus: "Timeline",
        tasks: ["Create a realistic timeline for your housing goal", "Calculate months needed at current savings rate", "Identify ways to accelerate savings", "Connect with a local first-time buyer seminar (many are free)"],
        milestone: "Concrete plan with timeline" }
    ],
    resources: [
      { name: "HUD First-Time Homebuyer Programs", url: "https://www.hud.gov/topics/buying_a_home", type: "article" },
      { name: "Zillow Mortgage Calculator", url: "https://www.zillow.com/mortgage-calculator/", type: "tool" },
      { name: "KBB Used Car Values", url: "https://www.kbb.com", type: "tool" },
      { name: "I Will Teach You To Be Rich - Ramit Sethi", url: "https://www.amazon.com/Will-Teach-You-Rich-Second/dp/1523505745", type: "book" }
    ],
    caseStudy: {
      title: "From Renting to First Home in 2 Years",
      scenario: "Antonio was paying $1,400/month rent with a 610 credit score and $2,000 in savings. Homeownership felt impossible.",
      outcome: "Followed the credit building plan (score hit 680 in 10 months), saved $300/month in a housing fund, found an FHA program with 3.5% down and $5,000 in down payment assistance. Bought a $185,000 townhouse with a mortgage payment of $1,350/month (less than his rent). Building equity instead of paying someone else's mortgage."
    }
  }
];

const PersonalFinance = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"modules" | "plan">("modules");

  const selectedModule = financeModules.find(m => m.id === activeModule);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="steel-plate p-6 border border-emerald-500/30">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="w-6 h-6 text-emerald-400" />
          <p className="text-sm text-emerald-400 uppercase tracking-wider font-medium">Commissary to Commerce</p>
        </div>
        <h2 className="text-xl font-display mb-2">Personal Finance from Zero</h2>
        <p className="text-muted-foreground text-sm">
          No one teaches this in school. Every module takes you step-by-step from absolute zero to financially literate.
          Banking, credit, budgeting, debt, taxes, investing, insurance, housing. Nothing skipped. Nothing assumed.
        </p>
      </div>

      {/* Module Grid */}
      {!selectedModule ? (
        <div className="grid gap-4 md:grid-cols-2">
          {financeModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className="p-5 rounded-lg bg-charcoal border border-border hover:border-emerald-500/50 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge className={difficultyColors[mod.difficulty]}>
                        {mod.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {mod.estimatedTime}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-emerald-400 transition-colors">{mod.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{mod.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-emerald-400 flex-shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Module Detail View */
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setActiveModule(null); setActiveSection("modules"); }}
            className="text-muted-foreground hover:text-emerald-400"
          >
            <ArrowRight className="w-4 h-4 rotate-180 mr-1" /> Back to All Modules
          </Button>

          {/* Module Header */}
          <div className="p-6 rounded-lg bg-charcoal border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={difficultyColors[selectedModule.difficulty]}>
                {selectedModule.difficulty}
              </Badge>
              <Badge variant="outline" className="text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" /> {selectedModule.estimatedTime}
              </Badge>
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                {selectedModule.category}
              </Badge>
            </div>
            <h2 className="text-2xl font-display mb-2">{selectedModule.title}</h2>
            <p className="text-muted-foreground">{selectedModule.description}</p>

            {/* Key Takeaways */}
            <div className="mt-4 grid gap-2">
              {selectedModule.keyTakeaways.map((takeaway, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{takeaway}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section Toggle */}
          <div className="flex gap-2">
            <Button
              variant={activeSection === "modules" ? "gold" : "ghost"}
              size="sm"
              onClick={() => setActiveSection("modules")}
            >
              <BookOpen className="w-4 h-4 mr-1" /> Lessons
            </Button>
            <Button
              variant={activeSection === "plan" ? "gold" : "ghost"}
              size="sm"
              onClick={() => setActiveSection("plan")}
            >
              <Calendar className="w-4 h-4 mr-1" /> 30-Day Plan
            </Button>
          </div>

          {activeSection === "modules" ? (
            <>
              {/* Content Sections */}
              <Accordion type="multiple" className="space-y-3">
                {selectedModule.sections.map((section, idx) => (
                  <AccordionItem key={idx} value={`section-${idx}`} className="rounded-lg border border-border bg-card overflow-hidden">
                    <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-charcoal/50">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <span className="font-semibold">{section.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-5">
                      {/* Main Content */}
                      <div className="prose prose-invert prose-sm max-w-none mb-4">
                        {section.content.split('\n\n').map((paragraph, pIdx) => (
                          <div key={pIdx} className="mb-3">
                            {paragraph.split('\n').map((line, lIdx) => {
                              if (line.startsWith('**') && line.endsWith('**')) {
                                return <h5 key={lIdx} className="text-emerald-400 font-semibold mt-4 mb-2">{line.replace(/\*\*/g, '')}</h5>;
                              }
                              if (line.startsWith('**') && line.includes(':**')) {
                                return <h5 key={lIdx} className="text-emerald-400 font-semibold mt-4 mb-2">{line.replace(/\*\*/g, '')}</h5>;
                              }
                              if (line.startsWith('- ')) {
                                return <li key={lIdx} className="text-muted-foreground ml-4 mb-1">{line.substring(2)}</li>;
                              }
                              if (/^\d+\.\s/.test(line)) {
                                return <li key={lIdx} className="text-muted-foreground ml-4 mb-1 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
                              }
                              return line ? <p key={lIdx} className="text-muted-foreground mb-1">{line}</p> : null;
                            })}
                          </div>
                        ))}
                      </div>

                      {/* Action Items */}
                      {section.actionItems && section.actionItems.length > 0 && (
                        <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <h5 className="font-semibold text-emerald-400 text-sm">Action Items</h5>
                          </div>
                          <div className="space-y-2">
                            {section.actionItems.map((item, aIdx) => (
                              <div key={aIdx} className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                  {aIdx + 1}
                                </div>
                                <span className="text-sm text-foreground">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pro Tips */}
                      {section.proTips && section.proTips.length > 0 && (
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                          <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="w-4 h-4 text-primary" />
                            <h5 className="font-semibold text-primary text-sm">Pro Tips</h5>
                          </div>
                          <div className="space-y-2">
                            {section.proTips.map((tip, tIdx) => (
                              <div key={tIdx} className="flex items-start gap-2">
                                <Star className="w-3 h-3 text-primary flex-shrink-0 mt-1" />
                                <span className="text-sm text-muted-foreground">{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* Resources */}
              {selectedModule.resources.length > 0 && (
                <div className="p-5 rounded-lg bg-charcoal border border-border">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" /> Resources
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {selectedModule.resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded bg-card border border-border hover:border-emerald-500/50 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <div>
                          <span className="text-sm font-medium">{res.name}</span>
                          <Badge variant="outline" className="ml-2 text-[10px]">{res.type}</Badge>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Case Study */}
              {selectedModule.caseStudy && (
                <div className="p-5 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Real Story: {selectedModule.caseStudy.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2"><strong>Before:</strong> {selectedModule.caseStudy.scenario}</p>
                  <p className="text-sm text-emerald-400"><strong>After:</strong> {selectedModule.caseStudy.outcome}</p>
                </div>
              )}
            </>
          ) : (
            /* 30-Day Plan */
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-sm text-emerald-400 font-medium">
                  Follow this plan for 30 days. Each week builds on the last. By day 30, you'll have a working system.
                </p>
              </div>

              {selectedModule.thirtyDayPlan.map((week) => (
                <div key={week.week} className="p-5 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-display text-lg">
                      {week.week}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{week.days}</p>
                      <h4 className="font-semibold">{week.focus}</h4>
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    {week.tasks.map((task, tIdx) => (
                      <div key={tIdx} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded border border-emerald-500/30 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{task}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-border/50 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400 font-medium">Milestone: {week.milestone}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalFinance;
