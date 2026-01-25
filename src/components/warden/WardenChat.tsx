import { useState, useRef, useEffect } from "react";
import { Shield, X, RotateCcw, Send, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWarden } from "@/hooks/useWarden";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface WardenChatProps {
  className?: string;
  compact?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export function WardenChat({ className }: WardenChatProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { chatMessages, chatLoading, chatError, sendMessage, clearChat } = useWarden();

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Listen for external open requests
  useEffect(() => {
    const handleOpenWarden = () => setIsOpen(true);
    window.addEventListener('open-warden-chat', handleOpenWarden);
    return () => window.removeEventListener('open-warden-chat', handleOpenWarden);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !chatLoading) {
      sendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleQuickAction = (message: string) => {
    if (!chatLoading) {
      sendMessage(message);
    }
  };

  // Only show for authenticated users
  if (!user) return null;

  // Parse links in messages
  const parseLinks = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      const [, label, href] = match;
      if (href.startsWith("/")) {
        parts.push(
          <Link
            key={match.index}
            to={href}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold/20 text-gold hover:bg-gold/30 rounded font-medium transition-colors"
            onClick={() => setIsOpen(false)}
          >
            {label} →
          </Link>
        );
      } else {
        parts.push(
          <a
            key={match.index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline font-medium"
          >
            {label}
          </a>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const chatContent = (
    <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.length === 0 && !chatLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-gold" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Need guidance?</h4>
            <p className="text-sm text-muted-foreground mb-6">
              Ask me anything about your program, workouts, discipline, or just vent. I'm here.
            </p>

            {/* Quick actions */}
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => handleQuickAction("What should I focus on today?")}
                className="text-xs bg-charcoal-light hover:bg-charcoal-dark text-foreground px-3 py-1.5 rounded-full border border-border transition-colors"
              >
                Today's focus
              </button>
              <button
                onClick={() => handleQuickAction("How am I doing this week?")}
                className="text-xs bg-charcoal-light hover:bg-charcoal-dark text-foreground px-3 py-1.5 rounded-full border border-border transition-colors"
              >
                My progress
              </button>
              <button
                onClick={() => handleQuickAction("I'm struggling with motivation")}
                className="text-xs bg-charcoal-light hover:bg-charcoal-dark text-foreground px-3 py-1.5 rounded-full border border-border transition-colors"
              >
                Need motivation
              </button>
              <button
                onClick={() => handleQuickAction("Where do I find my workouts?")}
                className="text-xs bg-charcoal-light hover:bg-charcoal-dark text-foreground px-3 py-1.5 rounded-full border border-border transition-colors"
              >
                Find workouts
              </button>
            </div>
          </div>
        )}

        {chatMessages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3",
                message.role === "user"
                  ? "bg-gold text-charcoal-dark rounded-br-md"
                  : "bg-charcoal-light text-foreground rounded-bl-md"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">
                {parseLinks(message.content)}
              </p>
            </div>
          </div>
        ))}

        {chatLoading && chatMessages[chatMessages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-charcoal-light rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {chatError && (
          <div className="text-center py-2">
            <p className="text-sm text-destructive">{chatError}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-border bg-charcoal-dark"
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask The Warden..."
            disabled={chatLoading}
            className={cn(
              "flex-1 bg-charcoal border border-border rounded-full px-4 py-2",
              "text-sm text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold",
              "disabled:opacity-50"
            )}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim() || chatLoading}
            className="h-10 w-10 rounded-full bg-gold hover:bg-gold-light text-charcoal-dark"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </>
  );

  // Mobile: Use full-screen drawer
  if (isMobile) {
    return (
      <>
        {/* Floating button - icon only on mobile */}
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full",
            "bg-gold text-charcoal-dark shadow-lg",
            "hover:bg-gold-light transition-all duration-300",
            "flex items-center justify-center",
            isOpen && "scale-0 opacity-0",
            className
          )}
          aria-label="Ask The Warden"
        >
          <Shield className="h-5 w-5" />
        </button>

        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent className="h-[90vh] max-h-[90vh] bg-charcoal flex flex-col">
            <DrawerHeader className="px-4 py-3 border-b border-gold/20 bg-charcoal-dark flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gold flex items-center justify-center">
                    <Shield className="h-5 w-5 text-charcoal-dark" />
                  </div>
                  <div>
                    <DrawerTitle className="font-semibold text-foreground text-sm text-left">The Warden</DrawerTitle>
                    <p className="text-xs text-muted-foreground text-left">Your guide through the grind</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearChat}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    aria-label="Clear chat"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    aria-label="Close chat"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </DrawerHeader>
            <div className="flex-1 flex flex-col overflow-hidden">
              {chatContent}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // Desktop: Use floating panel
  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-12 rounded-full",
          "bg-gold text-charcoal-dark shadow-lg",
          "hover:bg-gold-light transition-all duration-300 hover:scale-105",
          "flex items-center gap-2 px-4",
          isOpen && "scale-0 opacity-0",
          className
        )}
        aria-label="Ask The Warden"
      >
        <Shield className="h-5 w-5" />
        <span className="font-semibold text-sm whitespace-nowrap">Ask the Warden</span>
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)]",
          "bg-charcoal border border-gold/30 rounded-2xl shadow-2xl",
          "flex flex-col overflow-hidden transition-all duration-300",
          "max-h-[600px] h-[600px]",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gold/20 bg-charcoal-dark">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gold flex items-center justify-center">
              <Shield className="h-5 w-5 text-charcoal-dark" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">The Warden</h3>
              <p className="text-xs text-muted-foreground">Your guide through the grind</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Clear chat"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {chatContent}
      </div>
    </>
  );
}