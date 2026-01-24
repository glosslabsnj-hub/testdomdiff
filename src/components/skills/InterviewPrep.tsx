import { useState } from "react";
import { 
  Users, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle,
  Lightbulb,
  MessageSquare,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  tips: string[];
  exampleAnswer: string;
}

const interviewQuestions: InterviewQuestion[] = [
  {
    id: "1",
    category: "General",
    question: "Tell me about yourself.",
    tips: [
      "Keep it professional and relevant to the job",
      "Structure: Present → Past → Future",
      "Focus on your strengths and achievements",
      "Keep it under 2 minutes"
    ],
    exampleAnswer: "I'm a dedicated professional with experience in [field]. Most recently, I've been focused on [recent accomplishment]. I'm excited about this opportunity because [connection to role]."
  },
  {
    id: "2",
    category: "General",
    question: "What is your greatest strength?",
    tips: [
      "Choose a strength relevant to the job",
      "Provide a specific example",
      "Show how it benefits the employer"
    ],
    exampleAnswer: "My greatest strength is my reliability. In my previous role, I was known as someone who could be counted on to meet deadlines and support my team when needed."
  },
  {
    id: "3",
    category: "General",
    question: "What is your greatest weakness?",
    tips: [
      "Be honest but strategic",
      "Show self-awareness",
      "Explain what you're doing to improve"
    ],
    exampleAnswer: "I sometimes take on too much because I want to help everyone. I've learned to set better boundaries and prioritize tasks to ensure quality work."
  },
  {
    id: "4",
    category: "Behavioral",
    question: "Tell me about a time you faced a challenge at work.",
    tips: [
      "Use the STAR method: Situation, Task, Action, Result",
      "Choose a real example",
      "Focus on what you learned"
    ],
    exampleAnswer: "In my previous role, we faced [situation]. My task was to [task]. I took action by [action], which resulted in [positive result]."
  },
  {
    id: "5",
    category: "Behavioral",
    question: "Describe a time you worked with a difficult person.",
    tips: [
      "Stay professional, don't badmouth anyone",
      "Focus on how you handled it",
      "Show conflict resolution skills"
    ],
    exampleAnswer: "I worked with a colleague who had different communication styles. I focused on understanding their perspective and finding common ground, which improved our working relationship."
  },
  {
    id: "6",
    category: "Background",
    question: "Why are you looking for a new job?",
    tips: [
      "Stay positive about past employers",
      "Focus on growth and opportunities",
      "Connect it to this role"
    ],
    exampleAnswer: "I'm looking for new challenges and opportunities to grow. This role aligns perfectly with my career goals and allows me to contribute my skills."
  },
  {
    id: "7",
    category: "Background",
    question: "Can you explain gaps in your employment?",
    tips: [
      "Be honest but brief",
      "Focus on what you learned or did productively",
      "Pivot to your readiness and enthusiasm"
    ],
    exampleAnswer: "During that time, I [truthful explanation]. I used that period to [productive activity]. I'm now fully focused and ready to contribute to a new role."
  },
  {
    id: "8",
    category: "Job-Specific",
    question: "Why do you want to work here?",
    tips: [
      "Research the company beforehand",
      "Connect your values to theirs",
      "Show genuine interest"
    ],
    exampleAnswer: "I've researched your company and admire [specific thing]. My skills in [area] align well with your team's goals, and I'm excited to contribute."
  },
  {
    id: "9",
    category: "Job-Specific",
    question: "Where do you see yourself in 5 years?",
    tips: [
      "Show ambition but be realistic",
      "Align with the company's growth",
      "Express commitment"
    ],
    exampleAnswer: "In five years, I see myself having grown with this company, taking on more responsibilities, and contributing to team success."
  },
  {
    id: "10",
    category: "Closing",
    question: "Do you have any questions for us?",
    tips: [
      "Always have questions prepared",
      "Ask about team culture, expectations, or growth",
      "Avoid asking about salary in first interview"
    ],
    exampleAnswer: "What does success look like in this role? What are the biggest challenges facing the team right now? How would you describe the team culture?"
  }
];

const InterviewPrep = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [completedQuestions, setCompletedQuestions] = useState<string[]>([]);
  const [showExample, setShowExample] = useState<string | null>(null);

  // Load saved data
  useState(() => {
    if (user?.id) {
      const savedAnswers = localStorage.getItem(`interview_answers_${user.id}`);
      const savedCompleted = localStorage.getItem(`interview_completed_${user.id}`);
      if (savedAnswers) setPracticeAnswers(JSON.parse(savedAnswers));
      if (savedCompleted) setCompletedQuestions(JSON.parse(savedCompleted));
    }
  });

  const saveAnswer = (questionId: string, answer: string) => {
    const updated = { ...practiceAnswers, [questionId]: answer };
    setPracticeAnswers(updated);
    if (user?.id) {
      localStorage.setItem(`interview_answers_${user.id}`, JSON.stringify(updated));
    }
  };

  const toggleCompleted = (questionId: string) => {
    const updated = completedQuestions.includes(questionId)
      ? completedQuestions.filter(q => q !== questionId)
      : [...completedQuestions, questionId];
    setCompletedQuestions(updated);
    if (user?.id) {
      localStorage.setItem(`interview_completed_${user.id}`, JSON.stringify(updated));
    }
    if (!completedQuestions.includes(questionId)) {
      toast({ title: "Question Practiced! ✓", description: "Keep going, you're doing great!" });
    }
  };

  const categories = [...new Set(interviewQuestions.map(q => q.category))];
  const progressPercent = (completedQuestions.length / interviewQuestions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="headline-card">Interview Prep</h2>
              <p className="text-sm text-muted-foreground">Practice common interview questions</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="font-bold text-primary">{completedQuestions.length}/{interviewQuestions.length} practiced</p>
            </div>
          </div>
        </div>
        <Progress value={progressPercent} className="h-2 mt-4" />
      </div>

      {/* STAR Method Guide */}
      <div className="bg-charcoal p-6 rounded-lg border border-primary/30">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-primary">The STAR Method</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Use this framework for behavioral questions:
        </p>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-3 bg-card rounded-lg">
            <p className="font-bold text-primary">S - Situation</p>
            <p className="text-xs text-muted-foreground">Set the scene and context</p>
          </div>
          <div className="p-3 bg-card rounded-lg">
            <p className="font-bold text-primary">T - Task</p>
            <p className="text-xs text-muted-foreground">Describe your responsibility</p>
          </div>
          <div className="p-3 bg-card rounded-lg">
            <p className="font-bold text-primary">A - Action</p>
            <p className="text-xs text-muted-foreground">Explain what you did</p>
          </div>
          <div className="p-3 bg-card rounded-lg">
            <p className="font-bold text-primary">R - Result</p>
            <p className="text-xs text-muted-foreground">Share the outcome</p>
          </div>
        </div>
      </div>

      {/* Questions by Category */}
      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            {category} Questions
          </h3>
          
          <Accordion type="single" collapsible className="space-y-2">
            {interviewQuestions
              .filter(q => q.category === category)
              .map((question) => {
                const isCompleted = completedQuestions.includes(question.id);
                return (
                  <AccordionItem 
                    key={question.id} 
                    value={question.id}
                    className={`bg-card border rounded-lg px-4 ${
                      isCompleted ? "border-primary/50 bg-primary/5" : "border-border"
                    }`}
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground shrink-0" />
                        )}
                        <span>{question.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                      {/* Tips */}
                      <div className="p-4 bg-charcoal rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-primary" />
                          <p className="text-sm font-medium text-primary">Tips</p>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {question.tips.map((tip, i) => (
                            <li key={i}>• {tip}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Example Answer Toggle */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowExample(showExample === question.id ? null : question.id)}
                        className="text-primary"
                      >
                        {showExample === question.id ? "Hide" : "Show"} Example Answer
                      </Button>
                      
                      {showExample === question.id && (
                        <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                          <p className="text-sm italic">"{question.exampleAnswer}"</p>
                        </div>
                      )}

                      {/* Practice Area */}
                      <div>
                        <p className="text-sm font-medium mb-2">Your Practice Answer:</p>
                        <Textarea
                          value={practiceAnswers[question.id] || ""}
                          onChange={(e) => saveAnswer(question.id, e.target.value)}
                          placeholder="Write your answer here..."
                          className="min-h-[100px]"
                        />
                      </div>

                      <Button
                        variant={isCompleted ? "goldOutline" : "gold"}
                        size="sm"
                        onClick={() => toggleCompleted(question.id)}
                      >
                        {isCompleted ? "Mark as Unpracticed" : "Mark as Practiced"}
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
          </Accordion>
        </div>
      ))}
    </div>
  );
};

export default InterviewPrep;