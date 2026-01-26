import { cn } from '@/lib/utils';
import { parseLinks } from '@/lib/linkParser';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex w-full mb-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-gold text-charcoal-dark rounded-br-md'
            : 'bg-charcoal-light text-foreground rounded-bl-md'
        )}
      >
        {parseLinks(content)}
      </div>
    </div>
  );
}
