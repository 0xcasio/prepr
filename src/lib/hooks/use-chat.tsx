'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  toolsUsed?: string[];
}

interface ChatContextValue {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  /** Queue a command to be auto-sent when the chat page mounts */
  queueCommand: (command: string) => void;
  /** Consume the queued command (called by ChatPanel on mount) */
  consumeQueuedCommand: () => string | null;
}

const STORAGE_KEY = 'prepr-chat-history';

function loadMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveMessages(messages: ChatMessage[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Storage full or unavailable
  }
}

const ChatContext = createContext<ChatContextValue | null>(null);

/**
 * Provider that holds chat state at the layout level.
 * This ensures streaming continues even when navigating away from /chat.
 */
export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const queuedCommandRef = useRef<string | null>(null);
  // Use a ref to always have the latest messages without re-creating sendMessage
  const messagesRef = useRef<ChatMessage[]>(messages);
  messagesRef.current = messages;

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    setError(null);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messagesRef.current, userMessage];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);

    // Build API messages (just role + content for Anthropic format)
    const apiMessages = updatedMessages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    setIsStreaming(true);
    abortRef.current = new AbortController();

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      toolsUsed: [],
    };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = JSON.parse(line.slice(6));

          switch (data.type) {
            case 'text':
              assistantMessage.content += data.text;
              // Update state — this works even if /chat page is unmounted
              // because the provider lives in the layout
              setMessages((prev) => {
                const next = [...prev];
                const existingIdx = next.findIndex(
                  (m) => m.id === assistantMessage.id
                );
                if (existingIdx >= 0) {
                  next[existingIdx] = { ...assistantMessage };
                } else {
                  next.push({ ...assistantMessage });
                }
                return next;
              });
              break;

            case 'tool_use':
              assistantMessage.toolsUsed?.push(data.name);
              break;

            case 'error':
              throw new Error(data.error);

            case 'done':
              break;
          }
        }
      }

      // Final save to localStorage
      setMessages((prev) => {
        const final = [...prev];
        const existingIdx = final.findIndex(
          (m) => m.id === assistantMessage.id
        );
        if (existingIdx >= 0) {
          final[existingIdx] = { ...assistantMessage };
        } else {
          final.push({ ...assistantMessage });
        }
        saveMessages(final);
        return final;
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, []);

  const clearMessages = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setMessages([]);
    saveMessages([]);
    setError(null);
    setIsStreaming(false);
  }, []);

  const queueCommand = useCallback((command: string) => {
    queuedCommandRef.current = command;
  }, []);

  const consumeQueuedCommand = useCallback((): string | null => {
    const cmd = queuedCommandRef.current;
    queuedCommandRef.current = null;
    return cmd;
  }, []);

  return (
    <ChatContext.Provider
      value={{ messages, isStreaming, error, sendMessage, clearMessages, queueCommand, consumeQueuedCommand }}
    >
      {children}
    </ChatContext.Provider>
  );
}

/**
 * Hook to access chat state. Must be used within a ChatProvider.
 */
export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return ctx;
}
