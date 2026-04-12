'use client';

import { useRef, useEffect, useState } from 'react';
import { Send, RotateCcw, Loader2, Square, Zap, Clock } from 'lucide-react';
import { useChat, type ChatMessage, type StreamingStats } from '@/lib/hooks/use-chat';
import { ChatBubble } from './chat-bubble';
import { cn } from '@/lib/utils';

const SUGGESTIONS = [
  'kickoff',
  'help',
  'practice',
  'stories',
  'progress',
  'prep',
];

/** Format elapsed seconds as m:ss */
function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return min > 0 ? `${min}:${String(sec).padStart(2, '0')}` : `${sec}s`;
}

/** Format token count as compact number */
function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/**
 * Streaming status bar — shows elapsed time, tokens, and tool calls.
 */
function StreamingStatusBar({
  stats,
  isStreaming,
}: {
  stats: StreamingStats;
  isStreaming: boolean;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isStreaming) {
      // Show final elapsed time
      setElapsed(Date.now() - stats.startTime);
      return;
    }

    // Tick every second while streaming
    const interval = setInterval(() => {
      setElapsed(Date.now() - stats.startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming, stats.startTime]);

  const totalTokens = stats.inputTokens + stats.outputTokens;

  return (
    <div className="flex items-center gap-4 text-[10px] font-mono text-[var(--color-text-muted)] select-none">
      <span className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {formatElapsed(elapsed)}
      </span>
      {totalTokens > 0 && (
        <span className="flex items-center gap-1">
          <Zap className="h-3 w-3" />
          {formatTokens(totalTokens)} tokens
        </span>
      )}
      {stats.toolCalls > 0 && (
        <span className="text-[var(--color-accent)]">
          {stats.toolCalls} tool {stats.toolCalls === 1 ? 'call' : 'calls'}
        </span>
      )}
    </div>
  );
}

/**
 * Main chat panel — message list + input.
 */
export function ChatPanel() {
  const { messages, isStreaming, error, streamingStats, sendMessage, stopStreaming, clearMessages, consumeQueuedCommand } =
    useChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on mount + consume queued command
  useEffect(() => {
    inputRef.current?.focus();
    const queued = consumeQueuedCommand();
    if (queued) {
      sendMessage(queued);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 lg:px-8 py-6"
      >
        {isEmpty ? (
          <EmptyState onSuggestionClick={(s) => sendMessage(s)} />
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                isStreaming={
                  isStreaming &&
                  msg.role === 'assistant' &&
                  msg.id === messages[messages.length - 1]?.id
                }
              />
            ))}
            {isStreaming && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-[family-name:var(--font-body)]">
                  Thinking...
                </span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto mt-4 bg-[var(--color-danger-subtle)] border border-[var(--color-danger)] rounded-[var(--radius-md)] p-3">
            <p className="text-sm text-[var(--color-danger)] font-[family-name:var(--font-body)]">
              {error}
            </p>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 lg:px-8 py-4">
        <div className="max-w-3xl mx-auto">
          {/* Streaming stats bar */}
          {streamingStats && (
            <div className="mb-2">
              <StreamingStatusBar stats={streamingStats} isStreaming={isStreaming} />
            </div>
          )}

          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message or command (e.g., kickoff, practice, analyze)..."
                rows={1}
                disabled={isStreaming}
                className={cn(
                  'w-full resize-none rounded-[var(--radius-lg)] border border-[var(--color-border)]',
                  'bg-[var(--color-bg)] px-4 py-3 pr-12',
                  'text-sm font-[family-name:var(--font-body)] text-[var(--color-text-primary)]',
                  'placeholder:text-[var(--color-text-muted)]',
                  'focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]',
                  'disabled:opacity-50',
                  'max-h-32'
                )}
                style={{
                  height: 'auto',
                  minHeight: '44px',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height =
                    Math.min(target.scrollHeight, 128) + 'px';
                }}
              />
            </div>

            {/* Send or Stop button */}
            {isStreaming ? (
              <button
                onClick={stopStreaming}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)]',
                  'bg-[var(--color-danger)] text-white',
                  'hover:opacity-90 transition-opacity'
                )}
                aria-label="Stop generating"
                title="Stop generating"
              >
                <Square className="h-4 w-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)]',
                  'bg-[var(--color-text-primary)] text-white',
                  'hover:opacity-90 transition-opacity',
                  'disabled:opacity-30 disabled:cursor-not-allowed'
                )}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            )}

            {messages.length > 0 && !isStreaming && (
              <button
                onClick={clearMessages}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)]',
                  'border border-[var(--color-border)] text-[var(--color-text-muted)]',
                  'hover:bg-[var(--color-surface-alt)] transition-colors'
                )}
                aria-label="Clear chat"
                title="New session"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>

          <p className="text-[10px] text-[var(--color-text-muted)] mt-2 text-center font-[family-name:var(--font-body)]">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  onSuggestionClick,
}: {
  onSuggestionClick: (s: string) => void;
}) {
  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center h-full min-h-[60vh]">
      <div className="w-14 h-14 rounded-2xl bg-[var(--color-text-primary)] flex items-center justify-center text-white text-2xl font-bold font-[family-name:var(--font-sans)] mb-4">
        P
      </div>
      <h2 className="text-xl font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)] mb-2">
        Interview Coach
      </h2>
      <p className="text-sm text-[var(--color-text-secondary)] font-[family-name:var(--font-body)] mb-8 text-center max-w-md">
        Your AI-powered interview coach. Practice answers, analyze transcripts,
        build stories, and track your progress.
      </p>

      <div className="flex flex-wrap gap-2 justify-center">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestionClick(s)}
            className={cn(
              'px-4 py-2 rounded-[var(--radius-full)]',
              'border border-[var(--color-border)] bg-[var(--color-surface)]',
              'text-sm font-medium font-[family-name:var(--font-sans)]',
              'text-[var(--color-text-secondary)]',
              'hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
              'transition-colors'
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
