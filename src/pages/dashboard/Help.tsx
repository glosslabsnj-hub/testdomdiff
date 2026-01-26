import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  HelpCircle, 
  Play, 
  Mail, 
  Calendar, 
  FileText, 
  ChevronRight,
  BookOpen,
  MessageCircle,
  Shield,
  ExternalLink,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import DashboardLayout from "@/components/DashboardLayout";
import { ReplayOrientationButton } from "@/components/ReplayOrientationButton";

// FAQ data organized by category
const faqCategories = [
  {
    title: "Getting Started",
    icon: Play,
    questions: [
      {
        q: "Where do I start?",
        a: "Head to 'Start Here' (Intake Processing) to watch your welcome video and complete your orientation checklist. This will walk you through everything you need to know."
      },
      {
        q: "How do I track my workouts?",
        a: "Go to your workout page and check off exercises as you complete them. Your progress is saved automatically and visible on your dashboard."
      },
      {
        q: "What are Lights On/Lights Out routines?",
        a: "These are your morning and evening discipline routines. 'Lights On' includes your morning habits (prayer, cold shower, movement), and 'Lights Out' is your evening wind-down routine. Complete these daily to build discipline."
      },
    ]
  },
  {
    title: "Program & Workouts",
    icon: BookOpen,
    questions: [
      {
        q: "How long is the program?",
        a: "The Sentence is a 12-week transformation program. Each week builds on the last, progressively increasing intensity and complexity."
      },
      {
        q: "What if I miss a workout?",
        a: "Don't stress. Do what you can. If you miss a day, either skip it or tack it on to your rest day. Never try to 'make up' multiple days at once - that leads to injury."
      },
      {
        q: "Can I customize my workouts?",
        a: "The base program is designed as a complete system. If you have specific injuries or limitations, note them in your weekly check-in and we'll adjust."
      },
    ]
  },
  {
    title: "Nutrition & Meals",
    icon: FileText,
    questions: [
      {
        q: "How do I follow the meal plan?",
        a: "Go to Chow Hall (Nutrition) and you'll see your daily targets and meal templates. Pick meals that fit your calorie and macro goals. Keep it simple."
      },
      {
        q: "Can I eat foods not on the plan?",
        a: "The meal plans are templates, not laws. As long as you hit your protein and stay within your calorie range, you have flexibility."
      },
      {
        q: "What if I don't like certain foods?",
        a: "Swap them out for similar options. Chicken can become turkey or fish. Rice can become potatoes. Use the principles, not just the specifics."
      },
    ]
  },
  {
    title: "Account & Billing",
    icon: Shield,
    questions: [
      {
        q: "How do I upgrade my plan?",
        a: "Visit the Programs page to see upgrade options. Upgrading unlocks additional features like the 12-week program, community access, and faith lessons."
      },
      {
        q: "How do I cancel my subscription?",
        a: "Contact support through this page. We'll process your request within 24-48 hours."
      },
      {
        q: "Is there a refund policy?",
        a: "Yes. See our refund policy page for details. Generally, we offer refunds within the first 14 days if you haven't accessed significant content."
      },
    ]
  },
];

export default function Help() {
  const { toast } = useToast();
  const { isCoaching, isMembership } = useEffectiveSubscription();
  const { profile, user } = useAuth();
  const { settings } = useSiteSettings();
  
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  
  const supportEmail = settings?.find(s => s.key === "support_email")?.value || "support@domdifferent.com";
  const calendlyUrl = settings?.find(s => s.key === "calendly_url")?.value;
  
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    
    setSubmitting(true);
    
    // Open mailto link with pre-filled content
    const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(contactForm.subject)}&body=${encodeURIComponent(`User: ${user?.email || "Unknown"}\nTier: ${isMembership ? "Solitary" : isCoaching ? "Free World" : "Gen Pop"}\n\n${contactForm.message}`)}`;
    window.open(mailtoLink, "_blank");
    
    toast({ 
      title: "Email client opened", 
      description: "Send your message through your email app" 
    });
    
    setContactForm({ subject: "", message: "" });
    setSubmitting(false);
  };
  
  return (
    <DashboardLayout>
      <div className="section-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="headline-section mb-2 flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-primary" />
            {isCoaching ? "Support Center" : "CO Desk"}
          </h1>
          <p className="text-muted-foreground">
            {isCoaching 
              ? "Get help, replay orientation, or contact your support team."
              : "Need help? You've come to the right place. The CO desk has answers."}
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="dashboard-tile hover-lift">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Replay Orientation</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Re-watch the full orientation walkthrough
                  </p>
                  <ReplayOrientationButton variant="outline" size="sm" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {calendlyUrl && calendlyUrl !== "https://calendly.com/your-link" && (
            <Card className="dashboard-tile hover-lift">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Book a Call</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Schedule a coaching call
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href={calendlyUrl} target="_blank" rel="noopener noreferrer">
                        Book Now
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card className="dashboard-tile hover-lift">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Contact Support</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Email us directly
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${supportEmail}`}>
                      {supportEmail}
                      <Mail className="w-4 h-4 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* FAQ Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqCategories.map((category, catIndex) => (
                <div key={catIndex}>
                  <div className="flex items-center gap-2 mb-3">
                    <category.icon className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                      {category.title}
                    </h4>
                  </div>
                  <Accordion type="single" collapsible className="border rounded-lg">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`${catIndex}-${faqIndex}`}>
                        <AccordionTrigger className="px-4 hover:no-underline text-left">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="px-4 text-muted-foreground">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Send Us a Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Subject</label>
                <Input
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="What do you need help with?"
                  className="bg-charcoal border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Message</label>
                <Textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe your question or issue..."
                  rows={4}
                  className="bg-charcoal border-border"
                />
              </div>
              <Button type="submit" variant="gold" disabled={submitting}>
                {submitting ? "Opening..." : "Send Message"}
                <Mail className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Legal Links */}
        <div className="mt-8 pt-8 border-t border-border">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Legal & Policies
          </h4>
          <div className="flex flex-wrap gap-4">
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/refund" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Refund Policy
            </Link>
            <Link to="/disclaimer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
