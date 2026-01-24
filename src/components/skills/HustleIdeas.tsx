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
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface HustleIdea {
  id: string;
  title: string;
  icon: any;
  category: string;
  startupCost: string;
  earningPotential: string;
  timeToStart: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  steps: string[];
  resources: { name: string; url: string }[];
  tips: string[];
}

const hustleIdeas: HustleIdea[] = [
  {
    id: "1",
    title: "Lawn Care & Landscaping",
    icon: Scissors,
    category: "Service",
    startupCost: "$100-500",
    earningPotential: "$500-2000/month",
    timeToStart: "1-2 weeks",
    difficulty: "easy",
    description: "Start a lawn care business serving residential and commercial clients. Low barrier to entry with high demand.",
    steps: [
      "Get basic equipment: mower, trimmer, blower",
      "Create flyers and business cards",
      "Start with neighbors and friends",
      "Build reputation through quality work",
      "Expand to commercial properties"
    ],
    resources: [
      { name: "Lawn Care Guide", url: "https://www.youtube.com/results?search_query=start+lawn+care+business" }
    ],
    tips: [
      "Start in spring for maximum demand",
      "Offer package deals for regular service",
      "Always show up on time and be professional"
    ]
  },
  {
    id: "2",
    title: "Pressure Washing",
    icon: Wrench,
    category: "Service",
    startupCost: "$500-1500",
    earningPotential: "$1000-4000/month",
    timeToStart: "1-2 weeks",
    difficulty: "easy",
    description: "Clean driveways, decks, houses, and commercial properties. High profit margins and recurring customers.",
    steps: [
      "Purchase or rent pressure washing equipment",
      "Learn proper techniques (avoid damage)",
      "Get liability insurance",
      "Market to homeowners and businesses",
      "Offer seasonal specials"
    ],
    resources: [
      { name: "Pressure Washing Business", url: "https://www.youtube.com/results?search_query=pressure+washing+business+startup" }
    ],
    tips: [
      "Before/after photos are powerful marketing",
      "Upsell deck sealing and gutter cleaning",
      "Commercial contracts = steady income"
    ]
  },
  {
    id: "3",
    title: "Moving & Hauling",
    icon: Truck,
    category: "Service",
    startupCost: "$0-500 (if you have a truck)",
    earningPotential: "$800-3000/month",
    timeToStart: "Immediately",
    difficulty: "easy",
    description: "Help people move furniture, haul junk, or deliver large items. Perfect if you have a truck or van.",
    steps: [
      "List on TaskRabbit, Dolly, or Craigslist",
      "Set competitive hourly rates",
      "Get moving blankets and straps",
      "Provide excellent customer service",
      "Ask for reviews and referrals"
    ],
    resources: [
      { name: "TaskRabbit", url: "https://www.taskrabbit.com" },
      { name: "Dolly", url: "https://www.dolly.com" }
    ],
    tips: [
      "Weekend moves pay the most",
      "Junk removal can be very profitable",
      "Build a regular clientele for repeat business"
    ]
  },
  {
    id: "4",
    title: "Rideshare / Delivery Driver",
    icon: Car,
    category: "Gig Economy",
    startupCost: "$0 (if you have a car)",
    earningPotential: "$500-2000/month",
    timeToStart: "1-2 days",
    difficulty: "easy",
    description: "Drive for Uber, Lyft, DoorDash, or Amazon Flex. Flexible hours and quick money.",
    steps: [
      "Sign up for multiple platforms",
      "Complete background check",
      "Learn your city and peak hours",
      "Maintain a clean vehicle",
      "Track expenses for taxes"
    ],
    resources: [
      { name: "Uber", url: "https://www.uber.com/drive" },
      { name: "DoorDash", url: "https://www.doordash.com/dasher" },
      { name: "Amazon Flex", url: "https://flex.amazon.com" }
    ],
    tips: [
      "Multi-app to maximize earnings",
      "Drive during surge/peak pay times",
      "Keep receipts for gas and maintenance"
    ]
  },
  {
    id: "5",
    title: "Personal Training / Fitness",
    icon: TrendingUp,
    category: "Health",
    startupCost: "$200-500 (certification)",
    earningPotential: "$1000-5000/month",
    timeToStart: "1-3 months",
    difficulty: "medium",
    description: "Train clients in person or online. If you love fitness, turn your passion into profit.",
    steps: [
      "Get certified (NASM, ACE, or ISSA)",
      "Start with friends and family",
      "Create a social media presence",
      "Offer online coaching packages",
      "Partner with local gyms"
    ],
    resources: [
      { name: "NASM Certification", url: "https://www.nasm.org" },
      { name: "ACE Certification", url: "https://www.acefitness.org" }
    ],
    tips: [
      "Specialize in a niche (weight loss, strength, etc.)",
      "Client transformations are your best marketing",
      "Online coaching scales better than in-person"
    ]
  },
  {
    id: "6",
    title: "Handyman Services",
    icon: Hammer,
    category: "Service",
    startupCost: "$200-500",
    earningPotential: "$1500-4000/month",
    timeToStart: "1 week",
    difficulty: "medium",
    description: "Fix things for homeowners: plumbing, electrical, drywall, furniture assembly, and more.",
    steps: [
      "List your skills and services",
      "Get basic tools and supplies",
      "Register on Thumbtack and TaskRabbit",
      "Get liability insurance",
      "Build reviews through quality work"
    ],
    resources: [
      { name: "Thumbtack", url: "https://www.thumbtack.com" },
      { name: "Nextdoor", url: "https://nextdoor.com" }
    ],
    tips: [
      "Start with what you know well",
      "Always give honest estimates",
      "Upsell related services while on-site"
    ]
  },
  {
    id: "7",
    title: "Reselling / Flipping",
    icon: ShoppingBag,
    category: "E-commerce",
    startupCost: "$50-300",
    earningPotential: "$500-3000/month",
    timeToStart: "1 week",
    difficulty: "medium",
    description: "Buy low, sell high. Find deals at thrift stores, garage sales, and clearance sections.",
    steps: [
      "Learn what sells (electronics, shoes, vintage)",
      "Source inventory from thrift stores, FB Marketplace",
      "List on eBay, Poshmark, or Mercari",
      "Take quality photos",
      "Ship quickly with tracking"
    ],
    resources: [
      { name: "eBay", url: "https://www.ebay.com" },
      { name: "Poshmark", url: "https://www.poshmark.com" },
      { name: "Mercari", url: "https://www.mercari.com" }
    ],
    tips: [
      "Start with categories you know",
      "Check sold listings to verify prices",
      "Reinvest profits to grow inventory"
    ]
  },
  {
    id: "8",
    title: "Freelance Writing / Content",
    icon: Laptop,
    category: "Digital",
    startupCost: "$0",
    earningPotential: "$500-3000/month",
    timeToStart: "1-2 weeks",
    difficulty: "medium",
    description: "Write articles, blog posts, product descriptions, or social media content for businesses.",
    steps: [
      "Create writing samples",
      "Set up profiles on Upwork and Fiverr",
      "Apply to content mills to start",
      "Build a portfolio website",
      "Reach out to businesses directly"
    ],
    resources: [
      { name: "Upwork", url: "https://www.upwork.com" },
      { name: "Fiverr", url: "https://www.fiverr.com" }
    ],
    tips: [
      "Specialize in a niche to charge more",
      "Meet deadlines without exception",
      "Build long-term client relationships"
    ]
  },
  {
    id: "9",
    title: "Food Prep / Meal Service",
    icon: Utensils,
    category: "Food",
    startupCost: "$100-500",
    earningPotential: "$500-2000/month",
    timeToStart: "2-4 weeks",
    difficulty: "medium",
    description: "Prepare meals for busy professionals, fitness enthusiasts, or families. Start from your home kitchen.",
    steps: [
      "Check local food handling requirements",
      "Get food handler's certification",
      "Create a menu with pricing",
      "Start with friends and word-of-mouth",
      "Use social media to showcase meals"
    ],
    resources: [
      { name: "ServSafe Certification", url: "https://www.servsafe.com" }
    ],
    tips: [
      "Focus on a specialty (keto, meal prep, etc.)",
      "Batch cooking is more efficient",
      "Delivery or pickup both work"
    ]
  }
];

const difficultyColors = {
  easy: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  hard: "bg-red-500/20 text-red-400 border-red-500/30"
};

const HustleIdeas = () => {
  const [filter, setFilter] = useState<string>("all");
  
  const categories = ["all", ...new Set(hustleIdeas.map(h => h.category))];
  const filteredIdeas = filter === "all" 
    ? hustleIdeas 
    : hustleIdeas.filter(h => h.category === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="headline-card">Side Hustle Ideas</h2>
            <p className="text-sm text-muted-foreground">Start making money while you build your career</p>
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

      {/* Hustle Ideas */}
      <div className="space-y-4">
        {filteredIdeas.map((hustle) => (
          <Accordion key={hustle.id} type="single" collapsible>
            <AccordionItem value={hustle.id} className="bg-card border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-4 text-left w-full pr-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <hustle.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{hustle.title}</h3>
                      <Badge className={difficultyColors[hustle.difficulty]}>
                        {hustle.difficulty}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> {hustle.startupCost}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {hustle.earningPotential}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {hustle.timeToStart}
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="pt-2 pb-6 space-y-4">
                <p className="text-muted-foreground">{hustle.description}</p>
                
                {/* Steps */}
                <div className="p-4 bg-charcoal rounded-lg">
                  <h4 className="font-semibold mb-3 text-primary">How to Start:</h4>
                  <ol className="space-y-2">
                    {hustle.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                
                {/* Tips */}
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" /> Pro Tips
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {hustle.tips.map((tip, i) => (
                      <li key={i}>• {tip}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Resources */}
                {hustle.resources.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Resources:</h4>
                    <div className="flex flex-wrap gap-2">
                      {hustle.resources.map((resource, i) => (
                        <a
                          key={i}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 bg-charcoal rounded-full text-sm hover:bg-primary/20 transition-colors"
                        >
                          {resource.name}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>

      {/* Motivation */}
      <div className="bg-gradient-to-br from-primary/20 to-amber-500/10 p-6 rounded-lg border border-primary/30 text-center">
        <p className="text-lg font-semibold mb-2">
          "The best time to plant a tree was 20 years ago. The second best time is now."
        </p>
        <p className="text-sm text-muted-foreground">
          Start small, stay consistent, and watch your hustle grow.
        </p>
      </div>
    </div>
  );
};

export default HustleIdeas;