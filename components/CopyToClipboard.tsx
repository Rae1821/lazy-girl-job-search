'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CopyToClipboardProps {
  text: string;
  size?: 'sm' | 'default' | 'lg';
  variant?:
    | 'default'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'destructive'
    | 'secondary';
  className?: string;
  showText?: boolean;
}

const CopyToClipboard = ({
  text,
  size = 'sm',
  variant = 'ghost',
  className = '',
  showText = false,
}: CopyToClipboardProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleCopy}
            className={`transition-all duration-200 ${
              isCopied
                ? 'text-green-600 hover:text-green-700'
                : 'text-muted-foreground hover:text-foreground'
            } ${className}`}
          >
            {isCopied ? (
              <>
                <Check className="h-3 w-3" />
                {showText && <span className="ml-1">Copied!</span>}
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                {showText && <span className="ml-1">Copy</span>}
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isCopied ? 'Copied to clipboard!' : 'Copy to clipboard'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CopyToClipboard;
