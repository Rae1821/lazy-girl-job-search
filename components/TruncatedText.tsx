'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import CopyToClipboard from '@/components/CopyToClipboard';

interface TruncatedTextProps {
  text: string;
  maxWords?: number;
  maxLines?: number;
  className?: string;
  showCopyButton?: boolean;
}

const TruncatedText = ({
  text,
  maxWords = 15,
  maxLines = 3,
  className = '',
  showCopyButton = false,
}: TruncatedTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text || text === 'N/A') {
    return <span className={`text-muted-foreground ${className}`}>N/A</span>;
  }

  const words = text.split(' ');
  const shouldTruncate = words.length > maxWords;
  const truncatedText = shouldTruncate
    ? words.slice(0, maxWords).join(' ') + '...'
    : text;

  const baseClasses = `text-sm leading-5 ${className}`;
  const expandedClasses = `${baseClasses} whitespace-pre-wrap break-words`;
  const truncatedClasses = `${baseClasses} break-words line-clamp-${maxLines}`;

  return (
    <div className="space-y-2 max-w-xs">
      <div className={isExpanded ? expandedClasses : truncatedClasses}>
        {isExpanded ? text : truncatedText}
      </div>
      <div className="flex items-center gap-2">
        {shouldTruncate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent underline font-normal"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </Button>
        )}
        {showCopyButton && text && text !== 'N/A' && (
          <CopyToClipboard text={text} size="sm" className="h-auto p-1" />
        )}
      </div>
    </div>
  );
};

export default TruncatedText;
