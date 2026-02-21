import { Link } from "react-router-dom";

function isSafeUrl(url: string): boolean {
  if (url.startsWith('/')) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Parses markdown links [text](url) and HTML links <a href="url">text</a>
 * into proper React Router Links for internal URLs or anchor tags for external.
 */
export function parseLinks(text: string): (string | JSX.Element)[] {
  // First, convert HTML links to markdown format for unified handling
  let normalizedText = text.replace(
    /<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi,
    '[$2]($1)'
  );

  // Parse markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(normalizedText)) !== null) {
    if (match.index > lastIndex) {
      parts.push(normalizedText.slice(lastIndex, match.index));
    }

    const [, linkText, href] = match;

    if (!isSafeUrl(href)) {
      parts.push(linkText);
    } else if (href.startsWith('/')) {
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

  if (lastIndex < normalizedText.length) {
    parts.push(normalizedText.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/**
 * Variant for chat bubbles with button-style internal links
 */
export function parseLinksWithButtons(
  text: string,
  onLinkClick?: () => void
): (string | JSX.Element)[] {
  // First, convert HTML links to markdown format for unified handling
  let normalizedText = text.replace(
    /<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi,
    '[$2]($1)'
  );

  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(normalizedText)) !== null) {
    if (match.index > lastIndex) {
      parts.push(normalizedText.slice(lastIndex, match.index));
    }

    const [, label, href] = match;

    if (!isSafeUrl(href)) {
      parts.push(label);
    } else if (href.startsWith("/")) {
      parts.push(
        <Link
          key={match.index}
          to={href}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold/20 text-gold hover:bg-gold/30 rounded font-medium transition-colors"
          onClick={onLinkClick}
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

  if (lastIndex < normalizedText.length) {
    parts.push(normalizedText.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
