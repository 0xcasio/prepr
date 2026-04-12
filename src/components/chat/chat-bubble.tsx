'use client';

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { User, Bot, Loader2 } from 'lucide-react';
import type { ChatMessage } from '@/lib/hooks/use-chat';

interface ChatBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export const ChatBubble = memo(function ChatBubble({
  message,
  isStreaming,
}: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn('flex gap-3', isUser && 'flex-row-reverse')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5',
          isUser
            ? 'bg-[var(--color-accent)] text-white'
            : 'bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          'flex-1 min-w-0 rounded-[var(--radius-lg)] px-4 py-3',
          isUser
            ? 'bg-[var(--color-accent)] text-white ml-12'
            : 'bg-[var(--color-surface-alt)] text-[var(--color-text-primary)] mr-12'
        )}
      >
        {isUser ? (
          <p className="text-sm font-[family-name:var(--font-body)] whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          <div className="prose-chat text-sm font-[family-name:var(--font-body)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-flex ml-1">
                <Loader2 className="h-3 w-3 animate-spin text-[var(--color-text-muted)]" />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
