import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user';

  // Parse markdown links and convert to React Router Links
  const renderContent = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      const [, linkText, href] = match;
      const isInternal = href.startsWith('/');

      if (isInternal) {
        parts.push(
          <Link
            key={match.index}
            to={href}
            className="text-gold hover:text-gold-light underline underline-offset-2 font-medium"
          >
            {linkText}
          </Link>
        );
      } else {
        parts.push(
          <a
            key={match.index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-gold-light underline underline-offset-2 font-medium"
          >
            {linkText}
          </a>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

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
        {renderContent(content)}
      </div>
    </div>
  );
}
