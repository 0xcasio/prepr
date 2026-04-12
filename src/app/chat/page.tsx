'use client';

import { ChatPanel } from '@/components/chat/chat-panel';

export default function ChatPage() {
  return (
    <div className="flex-1 -m-6 lg:-m-8 flex flex-col h-[calc(100vh)]">
      <ChatPanel />
    </div>
  );
}
