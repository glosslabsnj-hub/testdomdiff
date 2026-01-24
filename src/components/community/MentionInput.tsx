import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { Send, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMentionableUsers, type MentionableUser } from "@/hooks/useMentionableUsers";

interface MentionInputProps {
  onSend: (content: string, mentionedUserIds: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MentionInput({
  onSend,
  disabled = false,
  placeholder = "Type a message... Use @ to mention someone",
}: MentionInputProps) {
  const [content, setContent] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionedUsers, setMentionedUsers] = useState<Map<string, string>>(new Map());
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { searchUsers, loading } = useMentionableUsers();

  const suggestions = searchUsers(mentionQuery);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);

    const cursorPos = e.target.selectionStart || 0;
    const textBeforeCursor = text.slice(0, cursorPos);
    
    // Find the @ symbol that might trigger mentions
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Check if there's no space after @ (meaning we're still typing the mention)
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        setMentionQuery(textAfterAt);
        setMentionStartIndex(lastAtIndex);
        setShowSuggestions(true);
        setSelectedIndex(0);
        return;
      }
    }
    
    setShowSuggestions(false);
    setMentionQuery("");
    setMentionStartIndex(null);
  }, []);

  const insertMention = useCallback((user: MentionableUser) => {
    if (mentionStartIndex === null) return;

    const beforeMention = content.slice(0, mentionStartIndex);
    const afterMention = content.slice(mentionStartIndex + mentionQuery.length + 1);
    const mentionText = `@${user.display_name.replace(/\s/g, "_")}`;
    
    const newContent = beforeMention + mentionText + " " + afterMention;
    setContent(newContent);
    
    // Track mentioned user
    setMentionedUsers((prev) => new Map(prev).set(user.user_id, user.display_name));
    
    setShowSuggestions(false);
    setMentionQuery("");
    setMentionStartIndex(null);
    
    // Focus back on textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = beforeMention.length + mentionText.length + 1;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [content, mentionQuery, mentionStartIndex]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(suggestions[selectedIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowSuggestions(false);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey && !showSuggestions) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!content.trim() || disabled) return;
    
    // Extract mentioned user IDs from the content
    const mentionedIds = Array.from(mentionedUsers.keys());
    
    onSend(content.trim(), mentionedIds);
    setContent("");
    setMentionedUsers(new Map());
  };

  return (
    <div className="p-4 border-t border-border bg-charcoal relative">
      {/* Mention suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50 max-h-48 overflow-y-auto">
          {suggestions.map((user, index) => (
            <button
              key={user.user_id}
              className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                index === selectedIndex 
                  ? "bg-primary/20 text-primary" 
                  : "hover:bg-muted"
              }`}
              onClick={() => insertMention(user)}
            >
              <Avatar className="h-8 w-8">
                {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {user.display_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user.display_name}</p>
                {user.first_name && user.last_name && (
                  <p className="text-xs text-muted-foreground truncate">
                    {user.first_name} {user.last_name}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[44px] max-h-32 resize-none bg-background pr-10"
            rows={1}
          />
          <AtSign className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/50" />
        </div>
        <Button
          variant="gold"
          size="icon"
          onClick={handleSend}
          disabled={disabled || !content.trim()}
          className="flex-shrink-0 h-11 w-11"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Press Enter to send, Shift+Enter for new line. Use @ to mention someone.
      </p>
    </div>
  );
}
