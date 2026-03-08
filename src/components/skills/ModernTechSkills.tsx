import { useState } from "react";
import {
  Monitor,
  ArrowLeft,
  ChevronRight,
  CheckCircle,
  ExternalLink,
  Lightbulb,
  Target,
  BookOpen,
  Cpu,
  Code,
  Smartphone,
  Shield,
  Briefcase,
  Rocket,
  Bot,
  Blocks,
  Globe,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TechSection {
  title: string;
  content: string;
  actionItems: string[];
  proTip?: string;
}

interface TechResource {
  name: string;
  url: string;
  type: "free" | "freemium" | "paid";
  description: string;
}

interface ThirtyDayPlan {
  week1: string[];
  week2: string[];
  week3: string[];
  week4: string[];
}

interface CaseStudy {
  title: string;
  story: string;
  result: string;
}

interface TechModule {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  difficulty: "foundational" | "intermediate" | "advanced" | "elite";
  sections: TechSection[];
  resources: TechResource[];
  thirtyDayPlan: ThirtyDayPlan;
  caseStudy: CaseStudy;
}

const difficultyColors = {
  foundational: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  intermediate: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  advanced: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  elite: "bg-rose-500/20 text-rose-300 border-rose-500/30",
};

const modules: TechModule[] = [
  {
    id: "digital-literacy",
    title: "Digital Literacy & Computer Fundamentals",
    subtitle: "Master the basics that 90% of people still get wrong",
    icon: <Monitor className="w-6 h-6" />,
    difficulty: "foundational",
    sections: [
      {
        title: "Operating System Mastery",
        content:
          "Your computer is a tool. Most people use 5% of it. Learn keyboard shortcuts that save hours per week. Windows: Win+E (File Explorer), Win+D (Desktop), Alt+Tab (switch apps), Ctrl+Shift+T (reopen closed tab), Win+V (clipboard history). Mac: Cmd+Space (Spotlight), Cmd+Tab, Cmd+Shift+4 (screenshot area). Learn to use Task Manager (Ctrl+Shift+Esc) to kill frozen apps and monitor resource usage. Understand file systems: organize by project, not by file type. Use cloud sync (OneDrive, Google Drive, iCloud) so you never lose work. Set up automatic backups. Learn to use the terminal/command line for basic operations: navigating directories, creating files, running programs. The command line is not scary. It's faster than clicking through menus.",
        actionItems: [
          "Memorize 10 keyboard shortcuts for your OS and practice daily until muscle memory",
          "Organize all your files into a clear folder structure (Projects > ProjectName > Assets/Docs/Code)",
          "Set up cloud backup for all important files",
          "Open Terminal (Mac) or PowerShell (Windows) and practice: cd, ls/dir, mkdir, touch/echo",
          "Enable clipboard history (Win+V on Windows) and start using it",
        ],
        proTip:
          "The people who look like tech wizards aren't smarter. They just memorized shortcuts and practiced until it was automatic. Spend 1 week forcing yourself to use shortcuts instead of the mouse. It'll feel slow at first, then you'll never go back.",
      },
      {
        title: "Internet & Browser Power Usage",
        content:
          "Most people browse the web like tourists. Become a local. Browser profiles: separate work/personal/side-hustle into different Chrome profiles (each has its own bookmarks, extensions, saved passwords). Essential extensions: uBlock Origin (ad blocking), Bitwarden (password manager), Dark Reader (eye health), Grammarly (writing), Vimium (keyboard browsing). Master search operators: use quotes for exact phrases, site:reddit.com to search within a site, filetype:pdf to find documents, minus sign to exclude words. Example: 'Python tutorial -beginner site:youtube.com' finds intermediate+ Python tutorials on YouTube. Understand URLs: protocol (https), domain, path, query parameters. This knowledge prevents phishing. If the URL says 'bankofamerica.evil.com', that's evil.com, not Bank of America.",
        actionItems: [
          "Install Bitwarden and migrate all passwords from browser storage",
          "Create separate browser profiles for work and personal",
          "Practice 5 Google search operators until they're second nature",
          "Install uBlock Origin and Dark Reader",
          "Check your browser's saved passwords and delete any duplicates or weak ones",
        ],
      },
      {
        title: "Cloud Services & Productivity",
        content:
          "Everything runs in the cloud now. Google Workspace: Docs (collaborative writing), Sheets (data/budgets), Slides (presentations), Drive (storage), Calendar (scheduling), Meet (video calls). Microsoft 365: Word, Excel, PowerPoint, OneDrive, Teams, Outlook. Learn both, most employers use one or the other. Key skills: real-time collaboration (sharing docs with edit/comment/view permissions), version history (never lose work again), templates (don't start from scratch). Notion: the power tool for organizing everything. Use it for notes, project management, databases, wikis. Learn keyboard shortcuts in every tool. Google Sheets formulas to know: SUM, AVERAGE, VLOOKUP, IF, COUNTIF, CONCATENATE. These alone make you more capable than most office workers.",
        actionItems: [
          "Set up Google Workspace or Microsoft 365 (free personal versions work)",
          "Create a Notion account and build a personal dashboard",
          "Learn VLOOKUP and IF formulas in Google Sheets/Excel",
          "Share a document with someone and practice real-time collaboration",
          "Build a monthly budget template in Sheets with formulas",
        ],
      },
    ],
    resources: [
      { name: "Google Digital Garage", url: "https://learndigital.withgoogle.com/digitalgarage", type: "free", description: "Free courses on digital fundamentals from Google" },
      { name: "GCFGlobal Tech Tutorials", url: "https://edu.gcfglobal.org/en/subjects/tech/", type: "free", description: "Beginner-friendly computer and internet tutorials" },
      { name: "Notion Academy", url: "https://www.notion.so/help/guides", type: "free", description: "Learn Notion from beginner to advanced" },
      { name: "Typing.com", url: "https://www.typing.com", type: "free", description: "Free typing practice. Aim for 60+ WPM" },
    ],
    thirtyDayPlan: {
      week1: [
        "Day 1-2: Audit your current digital setup. What tools do you use? What's disorganized?",
        "Day 3-4: Set up password manager (Bitwarden). Migrate ALL passwords.",
        "Day 5-7: Learn 5 keyboard shortcuts per day. Practice until automatic.",
      ],
      week2: [
        "Day 8-9: Organize entire file system into clear folder structure",
        "Day 10-11: Set up cloud backup. Test that it works by deleting and recovering a test file.",
        "Day 12-14: Master Google search operators. Do 20 practice searches with different operators.",
      ],
      week3: [
        "Day 15-17: Learn Google Sheets/Excel. Build a budget with SUM, IF, VLOOKUP.",
        "Day 18-19: Set up Notion. Create a personal dashboard with tasks, notes, goals.",
        "Day 20-21: Practice typing. Get baseline WPM. Aim to improve 10 WPM by month end.",
      ],
      week4: [
        "Day 22-24: Open Terminal/PowerShell. Navigate directories, create files, run basic commands.",
        "Day 25-27: Set up browser profiles. Install essential extensions. Clean up bookmarks.",
        "Day 28-30: Final test: can you navigate your computer, find any file, use shortcuts, search effectively, and use the terminal? If yes, you've graduated.",
      ],
    },
    caseStudy: {
      title: "Marcus: From Hunt-and-Peck to Tech Lead",
      story:
        "Marcus, 34, typed 25 WPM with two fingers and kept files on his desktop in random folders. After 30 days of deliberate practice, he reached 55 WPM, organized his entire digital life, and started using keyboard shortcuts that saved him 45 minutes per day. His manager noticed the productivity boost and promoted him to team lead within 6 months.",
      result: "25 WPM to 55 WPM. Promotion to team lead. 45 minutes saved daily.",
    },
  },
  {
    id: "ai-tools",
    title: "AI Tools Mastery",
    subtitle: "ChatGPT, Claude, Claude Code, and the AI tools reshaping every industry",
    icon: <Bot className="w-6 h-6" />,
    difficulty: "intermediate",
    sections: [
      {
        title: "Understanding AI: What It Actually Is",
        content:
          "AI is not magic. It's pattern recognition at scale. Large Language Models (LLMs) like ChatGPT and Claude are trained on massive amounts of text and learn to predict what comes next. They're incredibly useful but have real limitations: they can hallucinate (make up facts), they don't truly 'understand' things the way you do, and they have knowledge cutoffs. Knowing this makes you a BETTER AI user because you know when to trust it and when to verify. The key insight: AI is a force multiplier. It makes capable people more capable. It doesn't replace thinking. It accelerates it. The people who thrive with AI are the ones who already know what good output looks like and use AI to get there faster.",
        actionItems: [
          "Create accounts on ChatGPT (chat.openai.com) and Claude (claude.ai)",
          "Ask both the same question and compare the outputs. Notice the differences.",
          "Try to make the AI give a wrong answer on purpose. Understanding failure modes makes you a power user.",
          "Read the model cards/docs for at least one AI tool to understand its capabilities",
        ],
        proTip:
          "The #1 AI skill is prompt engineering, which is really just 'knowing how to communicate clearly.' Be specific. Give context. Show examples of what you want. The better your input, the better the output. AI rewards clear thinking.",
      },
      {
        title: "Prompt Engineering: The Most Valuable Skill of 2025+",
        content:
          "Prompt engineering is how you talk to AI to get exactly what you need. Level 1 (basic): 'Write me an email.' Level 2 (better): 'Write a professional email to a potential client who runs an HVAC company, introducing our AI receptionist service. Keep it under 100 words, friendly but professional.' Level 3 (expert): 'You are a B2B sales expert specializing in home services. Write a cold outreach email to [Name], owner of [Company], a mid-size HVAC company in New Jersey. Reference their Google reviews mentioning missed calls. Offer our AI receptionist that answers 24/7. Tone: confident, not pushy. Under 100 words. End with a specific CTA to try a demo call at (855) 329-7357.' The difference between Level 1 and Level 3 is the difference between a generic response and something you can actually use. Key techniques: Role assignment ('You are a...'), context loading ('Here's the background...'), format specification ('Output as a table with...'), few-shot examples ('Here's an example of what I want...'), chain-of-thought ('Think step by step...'), constraints ('Keep it under X words, don't use Y').",
        actionItems: [
          "Write 10 prompts at Level 1, then rewrite each at Level 3. Compare the outputs.",
          "Practice role assignment: try 'You are a financial advisor', 'You are a hiring manager', 'You are a fitness coach'",
          "Use chain-of-thought: add 'Think step by step' to complex questions and see how output improves",
          "Create a personal prompt library: save your best prompts for reuse",
          "Try the same prompt in ChatGPT and Claude. Learn which tool is better for which task.",
        ],
        proTip:
          "Claude tends to be better at nuanced writing, analysis, and following complex instructions. ChatGPT has more integrations and plugins. Use both. The best AI users are tool-agnostic.",
      },
      {
        title: "Claude Code: The AI-Powered Development Environment",
        content:
          "Claude Code is Anthropic's CLI tool that turns Claude into your coding partner. It lives in your terminal and can read your codebase, write code, run commands, debug errors, and manage entire projects. This is not just autocomplete. It understands your entire project structure. Getting started: Install Node.js (nodejs.org, LTS version). Open your terminal. Run 'npm install -g @anthropic-ai/claude-code'. Then navigate to any project folder and type 'claude'. That's it. You're now pair programming with AI. Key capabilities: (1) Read and understand entire codebases. Ask 'what does this project do?' and get a real answer. (2) Write new features: 'Add a dark mode toggle to the settings page.' (3) Fix bugs: paste an error and say 'fix this.' (4) Refactor: 'Convert this class component to a functional component with hooks.' (5) Run tests: 'Run the test suite and fix any failures.' (6) Git operations: 'Commit these changes with a descriptive message.' Power user tips: Use /compact to manage context in long sessions. Create a CLAUDE.md file in your project root with instructions that persist across sessions. Use headless mode (claude -p 'task') for automation. The CLAUDE.md file is like giving your AI partner a briefing document, it reads it every session so it knows your preferences, project structure, and rules.",
        actionItems: [
          "Install Node.js from nodejs.org (LTS version)",
          "Run 'npm install -g @anthropic-ai/claude-code' in your terminal",
          "Navigate to any project folder and type 'claude' to start a session",
          "Ask Claude Code to explain a codebase you're unfamiliar with",
          "Create a CLAUDE.md file in a project with your coding preferences",
          "Try building a simple project entirely through Claude Code: 'Create a todo app with React'",
        ],
        proTip:
          "Claude Code is the fastest way to go from zero coding knowledge to building real applications. You don't need to memorize syntax. You need to understand what you want to build and communicate it clearly. The AI handles the syntax. You handle the thinking.",
      },
      {
        title: "AI Tools for Every Domain",
        content:
          "Beyond chatbots, AI tools exist for nearly everything. Writing: Claude, ChatGPT, Jasper, Copy.ai for drafting content, emails, and marketing copy. Grammarly for editing. Images: Midjourney, DALL-E 3, Stable Diffusion for generating images. Canva's AI features for quick design. Video: Runway ML for video generation and editing, Descript for podcast/video editing with text-based editing. HeyGen for AI avatars. Coding: Claude Code, GitHub Copilot (autocomplete in VS Code), Cursor (AI-first code editor), Replit (browser-based coding with AI). Research: Perplexity AI (AI-powered search with sources), NotebookLM (Google's research tool), Elicit (academic research). Productivity: Otter.ai (meeting transcription), Gamma (AI presentations), Beautiful.ai (slide design). Business: Jasper (marketing content at scale), Synthesia (AI video presentations), Tome (AI-powered storytelling). Audio: ElevenLabs (text-to-speech, voice cloning), Suno/Udio (AI music generation). The key is not to learn every tool. It's to understand the categories and know where to look when you need a solution.",
        actionItems: [
          "Pick one AI tool from each category and spend 30 minutes exploring it",
          "Use Perplexity AI for your next research task instead of Google",
          "Try Canva's AI features to create a social media post",
          "Use Descript or Otter.ai to transcribe a meeting or podcast",
          "Create an AI tools inventory: which tools do you use for which tasks?",
        ],
      },
      {
        title: "AI Ethics, Safety, and Critical Thinking",
        content:
          "AI is powerful but not infallible. Critical rules: (1) NEVER share sensitive personal information (SSN, passwords, financial details) with AI tools, especially free ones. (2) Always verify AI outputs for factual accuracy, especially for medical, legal, or financial advice. (3) AI can reflect and amplify biases in its training data. Be aware of this. (4) Understand copyright: AI-generated content exists in a gray area. Don't claim AI art as your original work in contexts where it matters. (5) Disclosure: in professional settings, be transparent about AI assistance. Most employers appreciate the efficiency, but hiding it erodes trust. (6) Don't over-rely: AI should augment your skills, not replace your ability to think. If you can't evaluate whether the AI's output is good, you're not ready to use it for that task. Learn the skill first, then use AI to accelerate.",
        actionItems: [
          "Review the privacy policies of AI tools you use. Know what data they keep.",
          "Practice fact-checking: ask AI a question you know the answer to, verify its accuracy",
          "Develop a personal AI usage policy: what do you use it for, what do you verify, what do you never share?",
          "Read one article about AI bias and think about how it applies to tools you use",
        ],
      },
    ],
    resources: [
      { name: "Claude.ai", url: "https://claude.ai", type: "freemium", description: "Anthropic's AI assistant. Best for writing, analysis, and complex tasks" },
      { name: "Claude Code", url: "https://docs.anthropic.com/en/docs/claude-code", type: "freemium", description: "AI-powered CLI for coding. Turn ideas into code with natural language" },
      { name: "ChatGPT", url: "https://chat.openai.com", type: "freemium", description: "OpenAI's chatbot. Great ecosystem of plugins and integrations" },
      { name: "Perplexity AI", url: "https://perplexity.ai", type: "freemium", description: "AI-powered search engine that cites sources" },
      { name: "Learn Prompting", url: "https://learnprompting.org", type: "free", description: "Comprehensive free course on prompt engineering" },
      { name: "Cursor", url: "https://cursor.com", type: "freemium", description: "AI-first code editor built on VS Code" },
    ],
    thirtyDayPlan: {
      week1: [
        "Day 1: Create accounts on Claude and ChatGPT. Explore the interfaces.",
        "Day 2-3: Practice basic prompting. Ask 20 different questions. Notice what works and what doesn't.",
        "Day 4-5: Learn prompt engineering techniques: role assignment, few-shot, chain-of-thought.",
        "Day 6-7: Compare Claude vs ChatGPT on 10 identical tasks. Document which is better for what.",
      ],
      week2: [
        "Day 8-9: Install Claude Code. Use it to explore an existing project or create a simple one.",
        "Day 10-11: Explore AI image tools (Midjourney/DALL-E). Create 10 images with different prompts.",
        "Day 12-13: Try Perplexity AI for research. Compare results to traditional Google searches.",
        "Day 14: Build your personal AI tools inventory. Map tools to your specific needs.",
      ],
      week3: [
        "Day 15-17: Deep dive into Claude Code. Build a small project entirely through AI assistance.",
        "Day 18-19: Learn to use AI for writing: emails, proposals, social media posts. Build a prompt library.",
        "Day 20-21: Explore productivity AI: try Otter.ai for transcription, Gamma for presentations.",
      ],
      week4: [
        "Day 22-24: Advanced prompt engineering. Practice complex multi-step prompts with constraints.",
        "Day 25-27: Build a real project using AI tools: a personal website, a business plan, or a content calendar.",
        "Day 28-30: Review everything. What tools stuck? What's your AI workflow? Document your personal AI stack.",
      ],
    },
    caseStudy: {
      title: "David: From Zero Tech Skills to AI-Powered Freelancer",
      story:
        "David, 28, had no technical background. He started by learning prompt engineering and used Claude to write client proposals, ChatGPT to draft social media content, and Claude Code to build simple websites for local businesses. Within 3 months, he was earning $3,000/month as a freelance 'AI-powered' marketing consultant. His secret: he didn't try to learn everything. He mastered the tools that directly made him money.",
      result: "$0 to $3,000/month in 3 months. Zero prior tech experience.",
    },
  },
  {
    id: "no-code",
    title: "No-Code & Low-Code Building",
    subtitle: "Build apps, automate workflows, and launch products without writing code",
    icon: <Blocks className="w-6 h-6" />,
    difficulty: "intermediate",
    sections: [
      {
        title: "The No-Code Revolution",
        content:
          "No-code tools let you build real software without writing traditional code. This isn't a compromise. Companies valued at billions run on no-code. Websites: Webflow (professional sites with CMS), Framer (modern design-first sites), Carrd (simple one-page sites), WordPress (blogs and content sites). Apps: Bubble (full web applications with databases, user auth, logic), Glide (turn spreadsheets into apps), Adalo (native mobile apps). Automation: Make.com (connect any apps with visual workflows), Zapier (simple app-to-app connections), n8n (self-hosted open-source automation). Databases: Airtable (spreadsheet-database hybrid), Supabase (open-source backend with real PostgreSQL). Forms: Typeform (beautiful conversational forms), Tally (free form builder). Each tool has its sweet spot. Webflow for marketing sites. Bubble for complex web apps. Make.com for connecting everything together.",
        actionItems: [
          "Build a personal portfolio site on Carrd (free tier) in under 1 hour",
          "Create a Make.com account and build your first automation (e.g., save email attachments to Google Drive)",
          "Build a simple CRM in Airtable with contacts, deals, and follow-up dates",
          "Try Bubble's tutorial: build a basic to-do app to understand the paradigm",
          "Identify 3 manual processes in your life that could be automated with Zapier/Make",
        ],
        proTip:
          "No-code is a $13.8 billion industry growing 28% year over year. Businesses pay $5,000-$50,000 for no-code solutions that take days to build, not months. This is one of the fastest paths to freelance income.",
      },
      {
        title: "Automation Mastery with Make.com and Zapier",
        content:
          "Automation is where no-code becomes a superpower. Concept: trigger (something happens) -> action (something else happens automatically). Example: New form submission (trigger) -> Add to Google Sheet + Send welcome email + Create Trello card + Notify Slack (actions). Make.com is more powerful (visual workflows, branching logic, error handling). Zapier is simpler (great for quick connections). Start with Zapier to understand the concept, graduate to Make.com for complex workflows. Real automations that make money: (1) Lead capture: form submission -> CRM entry -> automated follow-up email sequence. (2) Social media: blog post published -> auto-share to Twitter, LinkedIn, Facebook. (3) Client onboarding: payment received -> send welcome email + create project folder + schedule kickoff call. (4) Invoice reminders: invoice overdue -> send reminder email + Slack notification to you. The key insight: every hour spent building automation saves 10+ hours of manual work over its lifetime.",
        actionItems: [
          "Map out 5 repetitive tasks you do weekly. These are automation candidates.",
          "Build a Zapier automation: Gmail attachment -> Google Drive (takes 5 minutes)",
          "Build a Make.com scenario with 3+ steps and conditional logic",
          "Create a lead capture form (Typeform) connected to a Google Sheet via Zapier",
          "Build an automated email follow-up sequence using Make.com + Gmail",
        ],
      },
      {
        title: "Building Full Applications with Bubble",
        content:
          "Bubble is the most powerful no-code app builder. You can build full web applications with user authentication, databases, APIs, payments, and complex logic. It has a learning curve, but it's worth it. Core concepts: (1) Database: define your data types (Users, Products, Orders) and their fields. Think of it like a spreadsheet where each tab is a data type. (2) Design: drag-and-drop UI builder. Responsive by default. (3) Workflows: 'When button is clicked -> create a new thing in the database, send an email, navigate to another page.' (4) API Connector: connect to any external API (Stripe for payments, SendGrid for email, any SaaS). (5) Privacy rules: control who can see/edit what data. Critical for any real app. Real apps built on Bubble that make money: SaaS dashboards, marketplace platforms, booking systems, membership sites, CRM tools. The business model: build a Bubble app, charge $100-500/month as SaaS or $5,000-$20,000 as a custom build.",
        actionItems: [
          "Complete Bubble's official interactive lessons (bubble.io/lessons)",
          "Build a simple CRUD app: a task manager with create, read, update, delete",
          "Add user authentication to your app (sign up, log in, log out)",
          "Connect Stripe to accept payments in your Bubble app",
          "Build an MVP of a real app idea and show it to 5 potential users for feedback",
        ],
        proTip:
          "The best Bubble developers charge $100-200/hour. Start by building free projects for local businesses to get portfolio pieces, then raise your rates as you get testimonials.",
      },
    ],
    resources: [
      { name: "Bubble", url: "https://bubble.io", type: "freemium", description: "Build full web applications without code" },
      { name: "Make.com", url: "https://make.com", type: "freemium", description: "Visual automation platform (1,000 free operations/month)" },
      { name: "Webflow", url: "https://webflow.com", type: "freemium", description: "Professional website builder with CMS" },
      { name: "Zapier", url: "https://zapier.com", type: "freemium", description: "Simple app-to-app automation" },
      { name: "Airtable", url: "https://airtable.com", type: "freemium", description: "Spreadsheet-database hybrid for organizing anything" },
      { name: "No Code MBA", url: "https://www.nocode.mba", type: "paid", description: "Project-based no-code courses" },
    ],
    thirtyDayPlan: {
      week1: [
        "Day 1-2: Research the no-code landscape. Sign up for Bubble, Make.com, and Airtable (all free tiers).",
        "Day 3-4: Build a personal site on Carrd or Webflow. Get it live with a custom domain.",
        "Day 5-7: Complete Bubble's interactive lessons. Build your first simple app.",
      ],
      week2: [
        "Day 8-10: Deep dive into Make.com. Build 3 automations that solve real problems in your life.",
        "Day 11-12: Learn Airtable. Build a personal CRM or project tracker.",
        "Day 13-14: Connect tools together: Typeform -> Airtable -> Gmail (automated lead pipeline).",
      ],
      week3: [
        "Day 15-18: Build a real Bubble app: a booking system, directory, or simple marketplace.",
        "Day 19-20: Add user authentication and basic permissions to your Bubble app.",
        "Day 21: Add Stripe payments. Even if it's just a test, understand the payment flow.",
      ],
      week4: [
        "Day 22-24: Polish your best project. Make it look professional. This is a portfolio piece.",
        "Day 25-27: Build one automation for a friend or local business for free. Get a testimonial.",
        "Day 28-30: Create your no-code services offer: what you build, who you build it for, what you charge.",
      ],
    },
    caseStudy: {
      title: "Sarah: $8K/Month Building Bubble Apps",
      story:
        "Sarah, 31, was a waitress with no tech background. She spent 60 days learning Bubble through their free tutorials and YouTube. Her first paid project was a $2,000 booking system for a local salon. Within 6 months, she had 4 recurring clients paying $500-1,500/month for maintenance and new features. She never wrote a single line of code.",
      result: "$0 to $8,000/month in 6 months. Zero coding required.",
    },
  },
  {
    id: "coding",
    title: "Coding Fundamentals",
    subtitle: "Learn to code from absolute zero. The skill that changes everything.",
    icon: <Code className="w-6 h-6" />,
    difficulty: "intermediate",
    sections: [
      {
        title: "Why Learn to Code (Even If AI Writes Code)",
        content:
          "AI can write code, but understanding code makes you 10x more effective with AI. You need to know: what's possible, whether the AI's output is good, how to debug when things break, and how to communicate what you want. Think of it like cooking. AI is a sous chef who can follow recipes. But YOU need to know what a good dish tastes like, how to adjust seasoning, and what ingredients work together. Coding literacy is the new literacy. You don't need to become a senior engineer. You need to understand the building blocks so you can direct AI, evaluate code quality, and fix issues. The ROI: coding skills command $75-200K salaries. Even basic scripting skills (automating spreadsheet tasks, building simple tools) make you 2-3x more valuable in any role.",
        actionItems: [
          "Decide on your path: Web Development (most versatile), Data/Python (most in-demand), or Mobile (highest ceiling)",
          "Set up your development environment: VS Code (free) + relevant extensions",
          "Write your first 'Hello World' program in Python or JavaScript",
          "Understand the core concepts: variables, functions, loops, conditionals, data types",
          "Build something small that solves a real problem, even a simple calculator",
        ],
        proTip:
          "Don't try to learn everything. Pick ONE language and go deep for 90 days. JavaScript if you want to build websites and apps. Python if you want to do data, AI, or automation. You can always learn a second language later.",
      },
      {
        title: "Python: The Swiss Army Knife",
        content:
          "Python is the most beginner-friendly language and the most versatile. It reads almost like English. Used for: web development (Django, Flask, FastAPI), data science (pandas, NumPy), AI/ML (TensorFlow, PyTorch), automation (scripting, web scraping), finance (algorithmic trading, analysis). Getting started: Install Python from python.org. Open terminal. Type 'python' (or 'python3' on Mac). You're in. Key concepts in order: (1) Variables: name = 'Dom' age = 25. (2) Data types: strings, integers, floats, booleans, lists, dictionaries. (3) Conditionals: if/elif/else. (4) Loops: for and while. (5) Functions: def my_function(). (6) Imports: using other people's code. (7) File I/O: reading/writing files. (8) APIs: fetching data from the internet. Don't memorize syntax. Understand concepts. Use Claude Code or documentation to look up specific syntax when you need it. Understanding WHY a loop works matters more than memorizing the exact format.",
        actionItems: [
          "Install Python 3 and VS Code with the Python extension",
          "Complete Python basics: variables, types, if/else, loops, functions (freeCodeCamp or Codecademy)",
          "Build a CLI tool: a task manager that saves/loads from a text file",
          "Learn to use pip (Python package manager) to install libraries",
          "Build a web scraper with BeautifulSoup that collects data you actually want",
          "Use Claude Code to help: 'Build a Python script that tracks my expenses in a CSV file'",
        ],
      },
      {
        title: "JavaScript & Web Development",
        content:
          "JavaScript is the language of the web. Every website you've ever used runs JavaScript. Learning it lets you build websites, web apps, mobile apps (React Native), desktop apps (Electron), and server-side applications (Node.js). The web development stack: HTML (structure, the skeleton), CSS (styling, the skin), JavaScript (behavior, the brain). Learn in that order. HTML: tags (<h1>, <p>, <div>, <a>, <img>), structure, semantic meaning. CSS: selectors, properties (color, font-size, margin, padding), flexbox for layout, responsive design with media queries. JavaScript: same concepts as Python (variables, functions, loops) plus DOM manipulation (changing what's on the page). Modern path: Learn basics -> React (the most popular UI framework) -> Next.js (full-stack framework). This stack powers the majority of modern web apps. Alternative: learn TypeScript instead of vanilla JavaScript. It adds type safety and is now the industry standard.",
        actionItems: [
          "Build a simple HTML page: your personal bio with headings, paragraphs, links, and an image",
          "Style it with CSS: colors, fonts, layout with flexbox, responsive design",
          "Add JavaScript: a button that toggles dark mode, a form that validates input",
          "Complete freeCodeCamp's Responsive Web Design certification (free)",
          "Build a React app: follow the official React tutorial (react.dev)",
          "Deploy your site for free on Vercel or Netlify",
        ],
        proTip:
          "Use Claude Code for web development. Say 'Create a React app with a landing page, about section, and contact form using Tailwind CSS.' Then study the code it writes. This is faster than tutorials for learning real patterns.",
      },
      {
        title: "Git & Version Control",
        content:
          "Git is how every developer tracks changes to code. It's like Google Docs version history but for code. GitHub is where you store your code online and collaborate with others. It's also your portfolio. Non-negotiable skills: (1) git init: start tracking a project. (2) git add: stage changes. (3) git commit: save a snapshot with a message. (4) git push: upload to GitHub. (5) git pull: download latest changes. (6) git branch: work on features without affecting main code. (7) git merge: combine branches. Workflow: make changes -> git add . -> git commit -m 'what you changed' -> git push. That's 90% of daily git usage. GitHub profile tip: your GitHub IS your resume for tech jobs. Pin your best projects. Write clear README files. Contribute to open source. Employers check GitHub before interviews.",
        actionItems: [
          "Create a GitHub account (github.com)",
          "Install Git (git-scm.com) and configure your name/email",
          "Create a repository, make commits, push to GitHub. Do this 10 times until it's muscle memory.",
          "Learn branching: create a feature branch, make changes, merge back to main",
          "Start a '100 Days of Code' challenge and commit something every day",
        ],
      },
    ],
    resources: [
      { name: "freeCodeCamp", url: "https://freecodecamp.org", type: "free", description: "Free, comprehensive coding education. 10,000+ hours of curriculum" },
      { name: "The Odin Project", url: "https://theodinproject.com", type: "free", description: "Full-stack web development curriculum. Project-based." },
      { name: "Codecademy", url: "https://codecademy.com", type: "freemium", description: "Interactive coding lessons in the browser" },
      { name: "CS50 (Harvard)", url: "https://cs50.harvard.edu/x/", type: "free", description: "Harvard's intro to CS. The gold standard." },
      { name: "Scrimba", url: "https://scrimba.com", type: "freemium", description: "Interactive screencasts where you can edit the instructor's code" },
      { name: "JavaScript.info", url: "https://javascript.info", type: "free", description: "The most comprehensive JavaScript tutorial online" },
    ],
    thirtyDayPlan: {
      week1: [
        "Day 1: Install VS Code, Python, Node.js. Set up your development environment.",
        "Day 2-3: Python basics: variables, types, if/else, loops. Write 10 small programs.",
        "Day 4-5: Python functions and lists. Build a simple CLI quiz game.",
        "Day 6-7: HTML + CSS basics. Build a personal bio page. Make it look good.",
      ],
      week2: [
        "Day 8-9: JavaScript basics: variables, functions, DOM manipulation.",
        "Day 10-11: Build an interactive web page: a counter, a to-do list, or a calculator.",
        "Day 12-13: Learn Git. Create a GitHub account. Push your projects.",
        "Day 14: Review week. Rebuild one project from scratch without looking at the original.",
      ],
      week3: [
        "Day 15-17: Choose your path: React (web) or Python deep dive (data/automation).",
        "Day 18-19: Build a real project with Claude Code assisting. Learn by building.",
        "Day 20-21: APIs: learn to fetch data from external APIs. Build a weather app or news aggregator.",
      ],
      week4: [
        "Day 22-24: Build your portfolio project: the one thing you'll show employers or clients.",
        "Day 25-27: Deploy it live. Get a custom domain. Make it professional.",
        "Day 28-30: Write a clear README. Pin it on GitHub. Share it with 5 people for feedback.",
      ],
    },
    caseStudy: {
      title: "James: Self-Taught to $85K in 8 Months",
      story:
        "James, 26, learned Python through freeCodeCamp while working at a warehouse. He spent 2 hours every night after work. He used Claude Code to accelerate his learning, building projects 3x faster than traditional tutorials. At month 4, he started applying to junior developer roles. At month 8, he landed a $85K remote Python developer position. His GitHub profile with 15 projects was the deciding factor.",
      result: "Warehouse worker to $85K developer in 8 months. 2 hours/night.",
    },
  },
  {
    id: "social-media",
    title: "Social Media & Content Creation",
    subtitle: "Build an audience, create content, and monetize your personal brand",
    icon: <Globe className="w-6 h-6" />,
    difficulty: "intermediate",
    sections: [
      {
        title: "Platform Strategy: Where to Build",
        content:
          "Every platform rewards different content. Instagram: visual content, Reels (short video), Stories (behind-the-scenes), carousels (educational swipe-through posts). Best for: lifestyle, fitness, food, fashion, visual businesses. TikTok: short-form video, trends, personality-driven. Best for: entertainment, education, virality. Fastest organic growth. YouTube: long-form video, tutorials, vlogs. Best for: deep expertise, passive income (ad revenue), evergreen content. LinkedIn: professional content, B2B, career growth. Best for: business services, job hunting, thought leadership. X/Twitter: text-based, real-time, networking. Best for: tech, opinions, building a personal brand in niche communities. Don't be everywhere. Pick 1-2 platforms where your audience lives and go ALL IN. Cross-post strategically but optimize for your primary platform.",
        actionItems: [
          "Identify where your target audience spends time. That's your primary platform.",
          "Set up a professional profile: clear photo, compelling bio, link to your offer/site",
          "Study 10 successful creators in your niche. What do they post? When? What format?",
          "Create your first 5 pieces of content. Don't overthink. Publish and learn.",
          "Engage with 20 posts per day in your niche. Comments > posts for early growth.",
        ],
        proTip:
          "The #1 mistake: creating content for yourself instead of your audience. Every post should answer: 'Why would someone stop scrolling to read/watch this?' If you can't answer that, don't post it.",
      },
      {
        title: "Content Creation Tools & Workflows",
        content:
          "You don't need expensive equipment. Start with your phone. Upgrade when you're making money. Video: iPhone/Android camera + natural lighting + Capcut (free editing). That's it. Level up later with a ring light ($20) and a lapel mic ($15). Images: Canva (free, templates for everything), Unsplash/Pexels (free stock photos), Remove.bg (background removal). Writing: Claude for drafts and brainstorming, Hemingway Editor for readability, Grammarly for polish. Scheduling: Buffer (free for 3 channels), Later (Instagram-focused), Hootsuite (enterprise). Analytics: each platform has built-in analytics. Check them weekly, not daily. Workflow: (1) Batch create: set aside 2-4 hours weekly to create all your content. (2) Use AI to brainstorm ideas and draft copy. (3) Record/design. (4) Edit. (5) Schedule. (6) Engage. Batching prevents the daily 'what should I post?' paralysis.",
        actionItems: [
          "Set up Canva (free) and create 3 social media posts using templates",
          "Record a 30-second video on your phone. Edit in Capcut. Post it.",
          "Create a content calendar: plan 2 weeks of posts in advance",
          "Set up Buffer and schedule 1 week of posts across your platforms",
          "Use Claude to brainstorm 20 content ideas for your niche",
        ],
      },
      {
        title: "Monetization: Turning Followers into Income",
        content:
          "Followers are vanity. Revenue is sanity. Monetization paths by follower count: 0-1,000: Freelance services (use content as portfolio). 1,000-10,000: Sponsored posts ($100-500 each), affiliate marketing, digital products. 10,000-100,000: Brand deals ($500-5,000), courses, coaching, merchandise. 100,000+: Major brand partnerships, speaking, licensing. You can make money with ANY audience size if you have the right offer. A coach with 500 engaged followers can make $10K/month from 1-on-1 coaching. A meme page with 100K followers might make $500/month. Engagement > follower count. The real money model: Content attracts attention -> attention builds trust -> trust enables selling. Sell your own products/services first (highest margin). Sponsorships and ads second (less control).",
        actionItems: [
          "Define your monetization strategy BEFORE you grow. What will you sell?",
          "Create one digital product (ebook, template, course outline) you could sell for $20-50",
          "Sign up for affiliate programs in your niche (Amazon Associates, Impact, ShareASale)",
          "Set up a simple landing page for your offer (Carrd, Linktree, or Notion)",
          "Track one metric that matters: not followers, but leads/sales/email signups",
        ],
      },
    ],
    resources: [
      { name: "Canva", url: "https://canva.com", type: "freemium", description: "Design anything. Templates for every platform." },
      { name: "CapCut", url: "https://capcut.com", type: "free", description: "Free video editing for social content" },
      { name: "Buffer", url: "https://buffer.com", type: "freemium", description: "Schedule and manage social media (free for 3 channels)" },
      { name: "Creator Economy Course", url: "https://www.hubspot.com/resources/courses/content-marketing", type: "free", description: "HubSpot's free content marketing course" },
    ],
    thirtyDayPlan: {
      week1: [
        "Day 1: Audit your social media presence. What does your profile say about you?",
        "Day 2-3: Study 10 successful creators in your niche. Document their patterns.",
        "Day 4-5: Set up professional profiles on your 1-2 primary platforms.",
        "Day 6-7: Create and publish your first 3 pieces of content. Start messy. Ship fast.",
      ],
      week2: [
        "Day 8-10: Learn Canva. Create 10 posts. Experiment with formats (carousels, quotes, tips).",
        "Day 11-12: Record and edit your first video. Use CapCut. Post it.",
        "Day 13-14: Engage: comment on 20 posts per day in your niche. Build relationships.",
      ],
      week3: [
        "Day 15-17: Create a content calendar. Plan 2 weeks ahead. Batch create.",
        "Day 18-19: Set up scheduling with Buffer. Automate your posting.",
        "Day 20-21: Analyze your first 2 weeks. What got the most engagement? Do more of that.",
      ],
      week4: [
        "Day 22-24: Create your first monetizable asset: a digital product, guide, or template.",
        "Day 25-27: Set up a landing page and link it in your bio. Start driving traffic.",
        "Day 28-30: Review and plan. What's your 90-day content strategy? Document it.",
      ],
    },
    caseStudy: {
      title: "Mike: From 0 to 15K Followers and $4K/Month",
      story:
        "Mike, 30, started a LinkedIn page about construction project management. He posted daily tips and lessons learned from job sites. He used Claude to draft posts and Canva for visuals. At 2,000 followers, he started offering consulting calls at $150/hour. At 15,000 followers, he launched a $297 course on project management for new foremen. He now makes $4,000/month from content while working his full-time job.",
      result: "0 to 15K followers in 8 months. $4K/month side income. Still working full-time.",
    },
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity & Digital Safety",
    subtitle: "Protect yourself online and build skills for the highest-demand tech field",
    icon: <Shield className="w-6 h-6" />,
    difficulty: "advanced",
    sections: [
      {
        title: "Personal Security: Protecting Yourself Online",
        content:
          "Before you can secure systems for others, secure yourself. The 5 pillars of personal security: (1) Passwords: Use a password manager (Bitwarden, 1Password). Every account gets a unique, random password (16+ characters). Enable 2FA (two-factor authentication) on everything important. SMS 2FA is better than nothing, but authenticator apps (Authy, Google Authenticator) are better. Hardware keys (YubiKey) are best. (2) Email security: Don't click links in unexpected emails. Hover over links to see the real URL. When in doubt, go directly to the website instead of clicking. Use email aliases for signups (SimpleLogin, Apple Hide My Email). (3) Device security: Keep OS and apps updated. Updates patch security holes. Use full-disk encryption (BitLocker on Windows, FileVault on Mac). Lock your screen when away. (4) Network security: Use a VPN on public Wi-Fi (ProtonVPN free tier). Don't do banking on public Wi-Fi. Check for HTTPS (padlock icon) before entering sensitive data. (5) Social engineering awareness: The biggest security threat isn't technical. It's someone tricking you. Be skeptical of urgent requests, too-good-to-be-true offers, and anyone asking for passwords or access.",
        actionItems: [
          "Set up a password manager and migrate ALL your passwords today",
          "Enable 2FA on your email, bank, and social media accounts",
          "Update your OS and all apps to the latest versions",
          "Install a VPN (ProtonVPN free tier) and use it on public Wi-Fi",
          "Check haveibeenpwned.com to see if your email has been in data breaches",
        ],
        proTip:
          "The average cost of identity theft is $1,551 out of pocket and 200+ hours to resolve. Spending 2 hours setting up proper security is the best ROI you'll ever get.",
      },
      {
        title: "Cybersecurity Fundamentals for Career Entry",
        content:
          "Cybersecurity has 3.5 million unfilled jobs globally. Average salary: $100K+. No degree required for many roles. Key domains: (1) Network Security: firewalls, IDS/IPS, VPNs, network monitoring. (2) Application Security: secure coding, vulnerability scanning, penetration testing. (3) Cloud Security: AWS/Azure/GCP security, IAM, encryption. (4) Incident Response: detecting, analyzing, and responding to security breaches. (5) Compliance: GDPR, HIPAA, SOC 2, PCI-DSS. Boring but well-paid. Entry path: CompTIA Security+ certification (the industry standard entry cert). Study for 2-3 months. Pass the exam ($404, but worth every penny). This single cert opens doors to $60-80K entry-level positions. Supplement with: TryHackMe (gamified learning), HackTheBox (practical challenges), CyberDefenders (blue team practice). The field rewards curiosity and continuous learning. If you enjoy solving puzzles and thinking like an attacker to build better defenses, this is your field.",
        actionItems: [
          "Create a free TryHackMe account and complete the 'Pre Security' path",
          "Learn networking basics: TCP/IP, DNS, HTTP, ports, subnets (Professor Messer on YouTube, free)",
          "Set up a home lab: install VirtualBox + Kali Linux (free) to practice safely",
          "Start studying for CompTIA Security+: use Professor Messer's free videos + Dion Training practice tests",
          "Join cybersecurity communities: r/cybersecurity, r/netsec, Discord servers",
        ],
      },
      {
        title: "Ethical Hacking & Bug Bounties",
        content:
          "Ethical hacking (penetration testing) is finding vulnerabilities in systems WITH PERMISSION. Companies pay for this because it's cheaper to find bugs before criminals do. Bug bounty platforms (HackerOne, Bugcrowd, Intigriti) connect ethical hackers with companies. Payouts range from $100 to $100,000+ per bug depending on severity. Getting started: Learn the OWASP Top 10 (the 10 most common web vulnerabilities). Practice on intentionally vulnerable applications: DVWA, WebGoat, PortSwigger Web Security Academy (free). Learn tools: Burp Suite (web testing), nmap (network scanning), Wireshark (packet analysis). Important: ONLY test systems you have explicit permission to test. Unauthorized access is a federal crime. Stick to bug bounty programs and practice labs. The career path: practice on labs -> earn bug bounties -> build a portfolio -> land a pentesting job ($90-150K) or go independent ($150-300/hour).",
        actionItems: [
          "Complete PortSwigger Web Security Academy's free labs (portswigger.net/web-security)",
          "Learn the OWASP Top 10 vulnerabilities and understand each one",
          "Set up Burp Suite Community Edition (free) and practice intercepting web traffic",
          "Create a HackerOne account and read disclosed bug reports to learn from others",
          "Complete 5 TryHackMe rooms in the 'Complete Beginner' path",
        ],
        proTip:
          "The most successful bug bounty hunters specialize. Pick one vulnerability class (XSS, IDOR, SSRF) and become an expert. Depth beats breadth in this field.",
      },
    ],
    resources: [
      { name: "TryHackMe", url: "https://tryhackme.com", type: "freemium", description: "Gamified cybersecurity learning. Best for beginners." },
      { name: "PortSwigger Academy", url: "https://portswigger.net/web-security", type: "free", description: "Free web security training from the makers of Burp Suite" },
      { name: "Professor Messer", url: "https://professormesser.com", type: "free", description: "Free CompTIA certification training videos" },
      { name: "HackerOne", url: "https://hackerone.com", type: "free", description: "Bug bounty platform. Get paid to find vulnerabilities." },
      { name: "Hack The Box", url: "https://hackthebox.com", type: "freemium", description: "Advanced cybersecurity challenges and labs" },
    ],
    thirtyDayPlan: {
      week1: [
        "Day 1-2: Lock down personal security: password manager, 2FA, VPN. Non-negotiable.",
        "Day 3-4: Learn networking fundamentals: TCP/IP, DNS, ports (Professor Messer, free).",
        "Day 5-7: Create TryHackMe account. Complete 'Pre Security' learning path.",
      ],
      week2: [
        "Day 8-10: Set up a home lab: VirtualBox + Kali Linux. Learn to navigate Linux.",
        "Day 11-13: Study OWASP Top 10. Understand each vulnerability conceptually.",
        "Day 14: Start PortSwigger Web Security Academy. Complete first 3 labs.",
      ],
      week3: [
        "Day 15-18: Deep dive into TryHackMe rooms. Complete 'Complete Beginner' path.",
        "Day 19-20: Install and learn Burp Suite. Practice intercepting web requests.",
        "Day 21: Create HackerOne account. Read 10 disclosed bug reports.",
      ],
      week4: [
        "Day 22-24: Begin CompTIA Security+ study plan. Professor Messer videos + notes.",
        "Day 25-27: Complete 5 more PortSwigger labs. Focus on SQL injection and XSS.",
        "Day 28-30: Map your cybersecurity career path. Set a 90-day certification goal.",
      ],
    },
    caseStudy: {
      title: "Carlos: From Retail to $95K Security Analyst",
      story:
        "Carlos, 29, worked retail and had no IT background. He spent 3 months on TryHackMe (1-2 hours daily), then 2 months studying for CompTIA Security+. He passed on his first attempt. With just the Security+ cert and a TryHackMe profile showing 100+ completed rooms, he landed a $72K SOC analyst position. Within 18 months, he moved to a security engineer role at $95K. Total investment: $404 for the cert exam and 5 months of daily practice.",
      result: "Retail worker to $95K security engineer in under 2 years.",
    },
  },
  {
    id: "freelance",
    title: "Freelance Tech Services",
    subtitle: "Turn tech skills into income. Start earning while you're still learning.",
    icon: <Briefcase className="w-6 h-6" />,
    difficulty: "advanced",
    sections: [
      {
        title: "Finding Your Freelance Niche",
        content:
          "The mistake: 'I do everything.' The fix: 'I build Webflow sites for real estate agents.' Specificity wins because it makes you the obvious choice for a specific buyer. Top freelance tech niches by income potential: (1) AI Automation Consulting ($100-300/hr): Help businesses implement AI tools and workflows. (2) Web Development ($50-150/hr): Build websites, web apps, e-commerce. (3) No-Code Development ($75-200/hr): Build apps on Bubble, automate with Make.com. (4) Social Media Management ($1,000-5,000/month retainer): Strategy, content, growth for businesses. (5) Cybersecurity Consulting ($100-250/hr): Security audits, compliance, penetration testing. (6) Data Analytics ($60-120/hr): Dashboards, reporting, insights for businesses. (7) Video Production ($50-200/hr): Editing, motion graphics, content creation. Pick based on: what you're good at, what you enjoy, and what pays well. The intersection of all three is your niche.",
        actionItems: [
          "List your top 5 tech skills. Rate each 1-10 on: skill level, enjoyment, market demand.",
          "Research 3 potential niches on Upwork. How many jobs are posted? What do they pay?",
          "Define your ideal client: industry, size, budget, pain points.",
          "Create your niche statement: 'I help [specific audience] achieve [specific result] using [specific skill].'",
          "Find 5 competitors in your niche. Study their pricing, positioning, and portfolios.",
        ],
        proTip:
          "You don't need to be an expert to start freelancing. You need to be better than your client at one thing. If you can build a Webflow site and they can't, you're the expert to them.",
      },
      {
        title: "Building Your Freelance Business",
        content:
          "Platform strategy: Start on Upwork and Fiverr to get your first clients and reviews. Graduate to direct clients for higher margins. Upwork tips: (1) Complete your profile 100%. Photo, title, overview, skills, portfolio. (2) Take the relevant skill tests (they're free and boost visibility). (3) Write custom proposals for every job. Reference specific details from the job post. (4) Start with lower rates to get reviews, then raise prices every 5 reviews. (5) Deliver fast, communicate clearly, and over-deliver on the first project. Fiverr tips: Create gig packages at 3 price tiers (basic, standard, premium). Use clear titles with keywords. Gallery images/videos that show your work. Fast response time affects ranking. Direct client acquisition: Build a portfolio website. Share your work on LinkedIn. Ask every client for a referral. Attend local business networking events. Cold email businesses who need what you offer. Pricing: never charge hourly if you can charge per project. A website that takes you 5 hours but saves the client $10,000/year is worth $3,000, not $500.",
        actionItems: [
          "Create optimized profiles on Upwork AND Fiverr today",
          "Build a portfolio with 3-5 projects (build free ones if you have no paid work yet)",
          "Write 5 Upwork proposals using the custom proposal framework",
          "Create 3 Fiverr gigs at different price points",
          "Build a simple portfolio website (use Carrd, Webflow, or build with code)",
          "Ask 3 people in your network if they know anyone who needs your services",
        ],
      },
      {
        title: "Scaling from Freelancer to Agency",
        content:
          "Once you're consistently earning $5K+/month freelancing, you have a decision: stay solo (cap around $10-20K/month) or build a team (uncapped). Solo scaling: raise rates, productize services (fixed packages instead of custom quotes), create templates/processes that speed up delivery. The 'agency of one' model: you do sales and strategy, subcontract execution to vetted specialists. Your margin: 30-50% on subcontracted work. Building a team: Start with one contractor for your most time-consuming task. Pay them per project, not hourly. Create SOPs (Standard Operating Procedures) for every repeatable process. Tools: project management (ClickUp, Notion), communication (Slack), invoicing (Stripe, Wave), contracts (Bonsai, HelloSign). The key shift: stop selling your time, start selling outcomes. 'I'll build you a website' (time-based) vs 'I'll build you a lead-generating website that books 10 appointments per month' (outcome-based). Outcome-based pricing justifies 3-10x higher rates.",
        actionItems: [
          "Document your current workflow as an SOP (Standard Operating Procedure)",
          "Identify your most time-consuming repeatable task. This is what you subcontract first.",
          "Create fixed-price packages for your top 3 services",
          "Set up professional invoicing (Stripe, Wave, or Bonsai)",
          "Find and vet one potential subcontractor on Upwork for your weakest skill area",
        ],
      },
    ],
    resources: [
      { name: "Upwork", url: "https://upwork.com", type: "free", description: "Largest freelance marketplace. Start here for first clients." },
      { name: "Fiverr", url: "https://fiverr.com", type: "free", description: "Gig-based freelance platform. Good for productized services." },
      { name: "Bonsai", url: "https://hellobonsai.com", type: "freemium", description: "Contracts, proposals, invoicing for freelancers" },
      { name: "The Freelancer's Bible (book)", url: "https://www.amazon.com/Freelancers-Bible-Everything-Freelancing-Inspired/dp/076117448X", type: "paid", description: "Comprehensive guide to building a freelance business" },
    ],
    thirtyDayPlan: {
      week1: [
        "Day 1-2: Define your niche. Research market demand. Set your initial pricing.",
        "Day 3-4: Build your portfolio (3-5 projects). Create samples if needed.",
        "Day 5-7: Set up Upwork and Fiverr profiles. Complete them 100%.",
      ],
      week2: [
        "Day 8-10: Apply to 5 Upwork jobs per day with custom proposals.",
        "Day 11-12: Create 3 Fiverr gigs. Optimize titles, descriptions, and images.",
        "Day 13-14: Build a portfolio website. Connect all platforms.",
      ],
      week3: [
        "Day 15-17: Continue applying. Follow up on proposals. Adjust based on response rates.",
        "Day 18-19: Network: post on LinkedIn about your services. DM 10 potential clients.",
        "Day 20-21: Land your first client (even if discounted). Over-deliver and get a testimonial.",
      ],
      week4: [
        "Day 22-24: Deliver your first project. Ask for a review and referral.",
        "Day 25-27: Raise your rates by 20%. Apply to higher-paying jobs.",
        "Day 28-30: Review: what worked? What didn't? Adjust your strategy. Set a 90-day income goal.",
      ],
    },
    caseStudy: {
      title: "Andre: $0 to $7K/Month Freelancing in 4 Months",
      story:
        "Andre, 32, learned Webflow and Make.com in his first month. Month 2, he created an Upwork profile and applied to 10 jobs per day with personalized proposals. He landed his first $500 website project in week 3. By month 4, he had 8 five-star reviews and was charging $3,000 per website. He also built 3 automation packages on Fiverr at $500 each. His niche: Webflow sites + automation for service businesses.",
      result: "$0 to $7,000/month in 4 months. Works 30 hours/week remotely.",
    },
  },
  {
    id: "mobile",
    title: "Mobile & App Development",
    subtitle: "Build apps for the device everyone carries 24/7",
    icon: <Smartphone className="w-6 h-6" />,
    difficulty: "advanced",
    sections: [
      {
        title: "The Mobile Landscape",
        content:
          "Mobile apps generate $935 billion in revenue annually. Two ecosystems: iOS (Apple App Store, Swift/SwiftUI) and Android (Google Play, Kotlin/Jetpack Compose). Building for both traditionally meant learning two languages and maintaining two codebases. Cross-platform frameworks changed this: React Native (JavaScript, used by Meta, Instagram, Shopify), Flutter (Dart, used by Google, BMW, eBay), Expo (built on React Native, fastest development experience). For most people, start with React Native + Expo. Why: (1) You learn JavaScript, which works everywhere (web, mobile, server). (2) Expo handles the complexity of native builds. (3) Huge community and job market. (4) One codebase, both platforms. The alternative path: PWAs (Progressive Web Apps). These are websites that behave like apps: installable, offline-capable, push notifications. For many use cases, a PWA is simpler and cheaper than a native app. If your app is content-focused (no camera, GPS, or complex animations), consider a PWA first.",
        actionItems: [
          "Install Expo Go on your phone (free on App Store and Google Play)",
          "Run 'npx create-expo-app my-app' and see it running on your phone in 2 minutes",
          "Build a simple app: a counter, a to-do list, or a notes app",
          "Understand the difference between native, cross-platform, and PWA. Know when to use each.",
          "Explore the Expo documentation and build something with navigation (multiple screens)",
        ],
      },
      {
        title: "Building Your First Mobile App",
        content:
          "The fastest path to a real app: Expo + React Native. Setup: Node.js installed, then 'npx create-expo-app my-app', then 'npx expo start', scan QR code with Expo Go on your phone. You're running an app. Key concepts: (1) Components: building blocks (View, Text, Image, ScrollView, TouchableOpacity). Think of them as LEGO pieces. (2) State: data that changes (user input, toggle switches, loaded content). Use useState hook. (3) Navigation: moving between screens. Use React Navigation library. (4) Styling: StyleSheet.create() for CSS-like styling. Flexbox for layout. (5) APIs: fetching data from the internet using fetch() or axios. (6) Storage: AsyncStorage for simple data, SQLite for structured data, or connect to a backend (Supabase, Firebase). Project idea progression: (1) Calculator app (learn components + state). (2) Weather app (learn APIs + displaying data). (3) Todo app with persistence (learn storage). (4) Social app clone (learn navigation + auth + real-time data).",
        actionItems: [
          "Set up Expo development environment. Run the starter app on your phone.",
          "Build a calculator app with buttons, display, and basic operations",
          "Add navigation: create a multi-screen app with a bottom tab navigator",
          "Connect to a free API (weather, news, jokes) and display the data",
          "Implement data persistence with AsyncStorage (save and load user data)",
        ],
        proTip:
          "Use Claude Code to build your React Native app. Say 'Build a React Native app with Expo that has a home screen, a profile screen, and tab navigation.' Then study and modify the code. Building with AI and learning from the output is the fastest path.",
      },
      {
        title: "Publishing & Monetizing Apps",
        content:
          "Getting your app to the store: Apple App Store requires a $99/year developer account and a review process (can take 1-7 days). Google Play requires a one-time $25 fee and a faster review. Expo EAS Build handles the complex native build process for you. Monetization models: (1) Freemium: free app with premium features. Best conversion rates. Examples: Spotify, Notion. (2) Subscription: recurring revenue. Apple/Google take 15-30%. Best for ongoing value. (3) One-time purchase: simple but limits long-term revenue. (4) In-app purchases: consumables (coins, credits) or unlockables. (5) Ads: AdMob for simple integration. Works best with high user counts and frequent usage. (6) Paid app: hardest sell but no ongoing obligations. Best for niche professional tools. Revenue expectations: most apps make nothing. The successful ones solve a real problem for a specific audience. The best approach: build an app that solves YOUR problem, then find others with the same problem. If you build an app that saves HVAC companies time, and there are 100,000 HVAC companies, you have a market.",
        actionItems: [
          "Research your app idea: Does it solve a real problem? Who exactly is the customer?",
          "Build an MVP (Minimum Viable Product) with only the core feature",
          "Set up an Apple Developer account ($99/yr) and/or Google Play Console ($25 one-time)",
          "Use Expo EAS Build to create your first production build",
          "Submit to at least one app store. Go through the full process once to understand it.",
        ],
      },
    ],
    resources: [
      { name: "Expo Documentation", url: "https://docs.expo.dev", type: "free", description: "Official Expo/React Native docs. Best starting point." },
      { name: "React Native Express", url: "https://www.reactnative.express", type: "free", description: "Interactive React Native tutorial" },
      { name: "Notjust.dev (YouTube)", url: "https://youtube.com/@notjustdev", type: "free", description: "Project-based React Native tutorials" },
      { name: "Flutter Codelabs", url: "https://docs.flutter.dev/codelabs", type: "free", description: "Official Flutter hands-on tutorials" },
    ],
    thirtyDayPlan: {
      week1: [
        "Day 1-2: Install Node.js, create Expo app, run it on your phone. Marvel at how easy this is.",
        "Day 3-4: Learn core components: View, Text, Image, TouchableOpacity, ScrollView.",
        "Day 5-7: Build a calculator app. Practice state management and component composition.",
      ],
      week2: [
        "Day 8-10: Learn React Navigation. Build a 3-screen app with tab navigation.",
        "Day 11-12: Connect to a REST API. Display fetched data in a list.",
        "Day 13-14: Add AsyncStorage. Make your app remember data between sessions.",
      ],
      week3: [
        "Day 15-17: Build a real project: a habit tracker, expense logger, or recipe book.",
        "Day 18-19: Add authentication (Supabase Auth or Firebase Auth).",
        "Day 20-21: Polish the UI. Add animations. Make it feel professional.",
      ],
      week4: [
        "Day 22-24: Set up Expo EAS Build. Create a production build.",
        "Day 25-27: Submit to Google Play ($25) or TestFlight (free for iOS testing).",
        "Day 28-30: Get 5 people to use your app. Collect feedback. Plan your next iteration.",
      ],
    },
    caseStudy: {
      title: "Tyler: Side Project App to $2,500/Month",
      story:
        "Tyler, 24, built a simple gym workout tracker in React Native because existing apps were too complicated. He used Expo to get it on both app stores in a weekend. He posted it on Reddit's r/fitness. 500 downloads in the first week. He added a $4.99/month premium tier with advanced analytics. Within 6 months, 500 paying subscribers at $4.99/month.",
      result: "Weekend project to $2,500/month recurring revenue. 500 paying subscribers.",
    },
  },
  {
    id: "future-proof",
    title: "Future-Proof Career Skills",
    subtitle: "The meta-skills that keep you valuable no matter what technology changes",
    icon: <Rocket className="w-6 h-6" />,
    difficulty: "elite",
    sections: [
      {
        title: "Learning How to Learn",
        content:
          "Technology changes every 2-3 years. The skill that never becomes obsolete: learning itself. The Feynman Technique: (1) Study a concept. (2) Explain it to a 12-year-old. (3) Identify gaps in your explanation. (4) Go back and study those gaps. Repeat. If you can't explain it simply, you don't understand it. Active recall > passive review. Don't re-read notes. Quiz yourself. Flashcards (Anki) for technical concepts. Teach what you learn (blog, YouTube, tutoring). Teaching forces understanding. Spaced repetition: review at increasing intervals (1 day, 3 days, 7 days, 14 days, 30 days). This is how you move information from short-term to long-term memory. The 80/20 rule: 20% of any skill gives you 80% of the practical value. Identify the 20% first. Master it. Then decide if you need the remaining 80%. Build projects, not tutorials. Tutorial hell is real. After learning basics, build something real. Get stuck. Google the answer. Get stuck again. This struggle IS the learning.",
        actionItems: [
          "Pick one concept you think you know. Explain it in writing as if to a 12-year-old. Find the gaps.",
          "Install Anki and create flashcards for 10 technical concepts you're learning",
          "Start a learning journal: what did you learn today? What confused you? What do you need to review?",
          "Identify the '20%' of your current learning goal. What skills give the most practical value?",
          "Commit to building one project per month. Not tutorials. Real projects that solve real problems.",
        ],
        proTip:
          "The people who stay relevant for decades aren't the ones who learn the most technologies. They're the ones who learned HOW to learn, so every new technology takes them days to pick up instead of months.",
      },
      {
        title: "Remote Work & Digital Collaboration",
        content:
          "Remote work is permanent. The companies that went remote aren't going back. Remote work skills: (1) Written communication: in remote work, your writing IS your work presence. Be clear, concise, and proactive. Over-communicate status updates. (2) Async collaboration: not everyone is online at the same time. Document decisions. Use Loom for video explanations. Write thorough pull request descriptions. (3) Time management: no boss watching = you must manage yourself. Use time blocking (calendar every task). The Pomodoro technique (25 min work, 5 min break). Track your productive hours, most people only get 4-6 truly productive hours per day. (4) Tools mastery: Slack/Teams (communication), Notion/Confluence (documentation), GitHub/GitLab (code), Figma (design), Linear/Jira (project management), Loom (async video), Zoom/Meet (sync meetings). (5) Building trust remotely: deliver consistently, be responsive during work hours, proactively share progress, and be the person who makes things easier for the team.",
        actionItems: [
          "Set up a dedicated workspace. Even a corner of a room with a desk counts.",
          "Practice writing clear status updates: what you did, what you're doing, any blockers.",
          "Learn Loom: record a 2-minute video explaining something technical.",
          "Time block your calendar for a full week. Track actual productivity vs planned.",
          "Master one project management tool (Notion, Linear, or Trello) end-to-end.",
        ],
      },
      {
        title: "Building in Public & Personal Brand",
        content:
          "Your personal brand is your career insurance. If you get laid off with 10,000 followers who respect your expertise, you'll have offers within days. Building in public means sharing your journey: what you're learning, building, and struggling with. It attracts opportunities you can't predict. Where to build: LinkedIn (professional network, B2B opportunities), Twitter/X (tech community, startup ecosystem), YouTube (long-form expertise, passive income), GitHub (code portfolio, open source contributions). What to share: lessons learned (not just wins), project walkthroughs, industry insights, contrarian opinions backed by evidence, useful resources and tools. Consistency beats quality at first. Post 3-5 times per week. Your first 50 posts will be mediocre. Your next 50 will be good. Your next 50 will attract opportunities. The key: provide value. Every post should either teach, inspire, or entertain. If it does none of these, don't post it. Your personal brand compounds. Every post, every connection, every project adds to a snowball that gets bigger over time. Start now. The best time to plant a tree was 20 years ago. The second best time is today.",
        actionItems: [
          "Choose your primary platform for building in public",
          "Document your current learning journey for 7 days straight",
          "Write a 'here's what I learned this week' post every Friday",
          "Share one project walkthrough: what you built, how, and what you learned",
          "Connect with 10 people in your field every week. Comment on their posts. Add value.",
        ],
      },
      {
        title: "The AI-Augmented Career Path",
        content:
          "Every job will be AI-augmented within 5 years. The question isn't whether AI will affect your career, it's whether you'll be the one using AI or the one replaced by someone using AI. Three career postures: (1) AI-resistant: jobs requiring physical presence, human judgment, trust, creativity, and emotional intelligence. Trades, healthcare, leadership, creative direction. These won't be replaced but WILL be enhanced by AI. (2) AI-augmented: jobs where AI makes you 2-10x more productive. Software development, marketing, writing, design, data analysis, consulting. Learn AI tools or be outperformed by someone who does. (3) AI-vulnerable: repetitive, rules-based work that AI can fully automate. Data entry, basic customer service, simple content generation, routine analysis. If your job is in category 3, start upskilling NOW. The winning strategy regardless of category: become the person who understands BOTH the domain AND the AI tools. A marketer who can use AI is more valuable than a marketer OR an AI specialist alone. A developer who uses Claude Code ships 3x faster than one who doesn't. The combination is the competitive advantage.",
        actionItems: [
          "Honestly assess: is your current role AI-resistant, AI-augmented, or AI-vulnerable?",
          "Identify 3 AI tools that could make you 2x more productive in your current work",
          "Learn to use AI for your specific domain. Not generic usage, domain-specific workflows.",
          "Build a portfolio that demonstrates both domain expertise AND AI proficiency",
          "Set a 12-month career goal. Include specific AI skills as part of the plan.",
        ],
        proTip:
          "The highest-paid people in the AI era won't be AI specialists. They'll be domain experts who leverage AI. A plumber who uses AI for scheduling, quoting, and marketing will outcompete one who doesn't. The same applies to every field.",
      },
    ],
    resources: [
      { name: "Anki", url: "https://apps.ankiweb.net", type: "free", description: "Spaced repetition flashcards. The best memorization tool." },
      { name: "Loom", url: "https://loom.com", type: "freemium", description: "Quick video recording for async communication" },
      { name: "Notion", url: "https://notion.so", type: "freemium", description: "All-in-one workspace for notes, projects, and collaboration" },
      { name: "Ultralearning (book)", url: "https://www.scotthyoung.com/blog/ultralearning/", type: "paid", description: "Scott Young's guide to rapid skill acquisition" },
      { name: "Building a Second Brain (book)", url: "https://www.buildingasecondbrain.com", type: "paid", description: "Tiago Forte's system for organizing knowledge" },
    ],
    thirtyDayPlan: {
      week1: [
        "Day 1-2: Audit your current skills. What's AI-resistant? What's AI-vulnerable? Be honest.",
        "Day 3-4: Learn the Feynman Technique. Apply it to one concept you're studying.",
        "Day 5-7: Set up your personal knowledge system: Notion for notes, Anki for review.",
      ],
      week2: [
        "Day 8-10: Start building in public. Post 3 times about what you're learning.",
        "Day 11-12: Master one remote work tool deeply (Notion, Linear, or Loom).",
        "Day 13-14: Time block your entire week. Track productivity. Identify your peak hours.",
      ],
      week3: [
        "Day 15-17: Identify 3 AI tools for your specific domain. Learn to use them well.",
        "Day 18-19: Write a comprehensive 'what I know' document. Identify gaps.",
        "Day 20-21: Connect with 20 people in your target field on LinkedIn. Comment on their content.",
      ],
      week4: [
        "Day 22-24: Build a project that demonstrates your skills + AI proficiency.",
        "Day 25-27: Create a 12-month career plan. Include specific skills, certifications, and milestones.",
        "Day 28-30: Review, adjust, and commit. Share your plan publicly. Accountability accelerates growth.",
      ],
    },
    caseStudy: {
      title: "The Compound Effect: How Small Daily Investments Transform Careers",
      story:
        "A study of 500 professionals who spent 30 minutes daily on deliberate skill development showed that after 12 months, they were promoted at 2.3x the rate of their peers. The key wasn't talent or intelligence. It was consistency and intentionality. They learned how to learn, built in public, and positioned themselves at the intersection of domain expertise and emerging technology. The specific skill didn't matter as much as the habit of continuous improvement.",
      result: "2.3x promotion rate. 30 minutes daily. Consistency > intensity.",
    },
  },
];

const ModernTechSkills = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const currentModule = modules.find((m) => m.id === selectedModule);

  if (currentModule) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedModule(null)}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Modules
        </button>

        <div className="steel-plate p-6 border border-cyan-500/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
              {currentModule.icon}
            </div>
            <div>
              <Badge className={difficultyColors[currentModule.difficulty]}>
                {currentModule.difficulty}
              </Badge>
            </div>
          </div>
          <h2 className="text-2xl font-bold mt-3 mb-1">{currentModule.title}</h2>
          <p className="text-muted-foreground">{currentModule.subtitle}</p>
        </div>

        {/* Sections */}
        <Accordion type="single" collapsible className="space-y-3">
          {currentModule.sections.map((section, i) => (
            <AccordionItem
              key={i}
              value={`section-${i}`}
              className="steel-plate border border-border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-charcoal/50">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="font-semibold">{section.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed mb-4">
                  {section.content}
                </p>

                <div className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <p className="text-sm font-semibold text-cyan-400">Action Items</p>
                  </div>
                  <ul className="space-y-2">
                    {section.actionItems.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-cyan-500/60 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {section.proTip && (
                  <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <p className="text-sm font-semibold text-amber-400">Pro Tip</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{section.proTip}</p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* 30-Day Plan */}
        <div className="steel-plate p-6 border border-cyan-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold">30-Day Mastery Plan</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {(["week1", "week2", "week3", "week4"] as const).map((week, wi) => (
              <div key={week} className="p-4 rounded-lg bg-charcoal border border-border">
                <p className="text-sm font-semibold text-cyan-400 mb-2">Week {wi + 1}</p>
                <ul className="space-y-2">
                  {currentModule.thirtyDayPlan[week].map((item, j) => (
                    <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 mt-1 text-cyan-500/60 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="steel-plate p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold">Resources & Links</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {currentModule.resources.map((resource, i) => (
              <a
                key={i}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-charcoal border border-border hover:border-cyan-500/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium group-hover:text-cyan-400 transition-colors">
                    {resource.name}
                  </p>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant="outline"
                      className={
                        resource.type === "free"
                          ? "text-emerald-400 border-emerald-500/30 text-xs"
                          : resource.type === "freemium"
                          ? "text-blue-400 border-blue-500/30 text-xs"
                          : "text-amber-400 border-amber-500/30 text-xs"
                      }
                    >
                      {resource.type}
                    </Badge>
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{resource.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Case Study */}
        <div className="steel-plate p-6 border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <Rocket className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold">Real Story</h3>
          </div>
          <h4 className="font-semibold mb-2">{currentModule.caseStudy.title}</h4>
          <p className="text-sm text-muted-foreground mb-3">{currentModule.caseStudy.story}</p>
          <div className="p-3 rounded bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-sm font-medium text-cyan-400">{currentModule.caseStudy.result}</p>
          </div>
        </div>
      </div>
    );
  }

  // Module grid view
  return (
    <div className="space-y-6">
      <div className="steel-plate p-6 border border-cyan-500/30">
        <div className="flex items-center gap-3 mb-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <p className="text-sm text-cyan-400 uppercase tracking-wider">Digital Yard</p>
        </div>
        <h2 className="text-xl font-bold mb-2">Modern Tech Skills</h2>
        <p className="text-muted-foreground text-sm">
          The world runs on technology. These 8 modules take you from zero to dangerous.
          AI tools, coding, cybersecurity, freelancing, and the skills that'll keep you
          relevant for the next decade. Each module has deep lessons, action items, a 30-day
          plan, curated resources, and real case studies. No fluff. All action.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => setSelectedModule(mod.id)}
            className="p-5 rounded-lg steel-plate border border-border hover:border-cyan-500/40 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-cyan-400 mb-3 group-hover:from-cyan-500/30 group-hover:to-blue-600/30 transition-all">
              {mod.icon}
            </div>
            <Badge className={`${difficultyColors[mod.difficulty]} mb-2`}>
              {mod.difficulty}
            </Badge>
            <h3 className="font-semibold text-sm mb-1 group-hover:text-cyan-400 transition-colors">
              {mod.title}
            </h3>
            <p className="text-xs text-muted-foreground">{mod.subtitle}</p>
            <div className="mt-3 text-xs text-muted-foreground">
              {mod.sections.length} lessons &middot; 30-day plan
            </div>
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/5 p-6 rounded-lg border border-cyan-500/20 text-center">
        <p className="text-lg font-semibold mb-2">
          "The illiterate of the 21st century will not be those who cannot read and write, but those who cannot learn, unlearn, and relearn."
        </p>
        <p className="text-sm text-muted-foreground">
          — Alvin Toffler. Start with one module. Master it. Then move to the next.
        </p>
      </div>
    </div>
  );
};

export default ModernTechSkills;