import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useSalesChat } from '@/hooks/useSalesChat';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// Inner component that uses all the hooks
function ChatWidgetInner() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, error, sendMessage, clearMessages } = useSalesChat();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Send initial greeting when chat is first opened
  useEffect(() => {
    if (isOpen && messages.length === 0 && !hasInteracted) {
      setHasInteracted(true);
      // Small delay for better UX
      const timer = setTimeout(() => {
        sendMessage("Hi, I'm interested in learning more about your programs.");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages.length, hasInteracted, sendMessage]);

  const handleClear = () => {
    clearMessages();
    setHasInteracted(false);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gold text-charcoal-dark',
          'shadow-lg hover:bg-gold-light transition-all duration-300 hover:scale-105',
          'flex items-center justify-center',
          isOpen && 'scale-0 opacity-0'
        )}
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-gold animate-ping opacity-25" />
      </button>

      {/* Chat Panel */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)]',
          'bg-charcoal border border-border rounded-2xl shadow-2xl',
          'flex flex-col overflow-hidden transition-all duration-300',
          'max-h-[600px] h-[600px]',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-charcoal-dark">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gold flex items-center justify-center">
              <span className="text-charcoal-dark font-display text-lg">D</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Dom Different</h3>
              <p className="text-xs text-muted-foreground">Here to help you level up</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-gold" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Ready to transform?</h4>
              <p className="text-sm text-muted-foreground">
                Tell me about your goals and I'll help you find the right program.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <ChatMessage key={index} role={message.role} content={message.content} />
          ))}

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
              <div className="bg-charcoal-light rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-2">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length > 0 && messages.length < 4 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            <button
              onClick={() => sendMessage("What programs do you offer?")}
              disabled={isLoading}
              className="text-xs bg-charcoal-light hover:bg-charcoal-dark text-foreground 
                         px-3 py-1.5 rounded-full border border-border transition-colors
                         disabled:opacity-50"
            >
              View Programs
            </button>
            <button
              onClick={() => sendMessage("I want to book a free call")}
              disabled={isLoading}
              className="text-xs bg-charcoal-light hover:bg-charcoal-dark text-foreground 
                         px-3 py-1.5 rounded-full border border-border transition-colors
                         disabled:opacity-50"
            >
              Book a Call
            </button>
          </div>
        )}

        {/* Input */}
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </>
  );
}

// Wrapper component that handles auth check BEFORE rendering any hooks
export function ChatWidget() {
  const { user } = useAuth();
  
  // Don't render for logged-in users (they use WardenChat instead)
  if (user) return null;
  
  return <ChatWidgetInner />;
}
