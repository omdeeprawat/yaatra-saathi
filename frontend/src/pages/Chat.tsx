import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trash2, AlertCircle, WifiOff } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { chatApi } from '@/services/api';
import ChatMessageBubble from '@/components/chat/ChatMessage';
import StreamingBubble from '@/components/chat/StreamingBubble';
import SuggestedQuestions from '@/components/chat/SuggestedQuestions';
import ChatInput from '@/components/chat/ChatInput';
import ChatWelcome from '@/components/chat/ChatWelcome';
import Spinner from '@/components/ui/Spinner';
import AppShell from '@/components/layout/AppShell';

export default function Chat() {
  const { messages, isStreaming, streamingContent, error, sendMessage, clearMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;

  // Check if the RAG vector store is ready
  const { data: chatStatus, isLoading: isCheckingStatus } = useQuery({
    queryKey: ['chat-status'],
    queryFn: chatApi.getStatus,
    staleTime: 1000 * 60 * 5,  // check once per 5 minutes
    retry: 2,
  });

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = (message: string, imageUrl?: string) => {
    if (!chatStatus?.ready) return;
    sendMessage(message, imageUrl);
  };

  //status gate 
  if (isCheckingStatus) {
    return (
      <AppShell title="AI Guide" subtitle="RAG assistant · live">
        <div className="h-[calc(100vh-16rem)] flex items-center justify-center flex-col gap-3">
          <Spinner size="large" />
          <p className="font-sans text-stone-400 text-sm">Checking AI guide status...</p>
        </div>
      </AppShell>
    );
  }

  if (!chatStatus?.ready) {
    return (
      <AppShell title="AI Guide" subtitle="RAG assistant · live">
        <div className="h-[calc(100vh-16rem)] flex items-center justify-center px-4">
          <div className="card border-amber-500/20 bg-amber-500/5 max-w-md text-center">
            <WifiOff className="w-10 h-10 text-amber-400 mx-auto mb-4" />
            <h2 className="font-sans font-semibold text-stone-200 mb-2">
              AI Guide Not Ready
            </h2>
            <p className="font-body text-stone-400 text-sm leading-relaxed mb-4">
              The knowledge base has not been indexed yet. Run the ingestion pipeline first:
            </p>
            <code className="block bg-mountain-900 rounded-lg px-4 py-3 font-mono
                             text-xs text-saffron-300 text-left">
              cd backend<br />
              python -m rag.ingest
            </code>
            <p className="font-sans text-xs text-stone-500 mt-3">
              Then restart the server and refresh this page.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  
  return (
    <AppShell title="AI Guide" subtitle="RAG assistant · live">
      <div className="h-[calc(100vh-12.5rem)] flex flex-col max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3
                      border-b border-mountain-700/50 shrink-0">
        <div>
          <h1 className="font-sans font-semibold text-stone-100 text-sm">
            Yatra AI Guide
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-sans text-xs text-stone-500">
              {chatStatus.chunk_count} knowledge chunks indexed
            </span>
          </div>
        </div>

        {hasMessages && (
          <button
            onClick={clearMessages}
            disabled={isStreaming}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                       font-sans text-stone-500 hover:text-red-400
                       hover:bg-red-500/10 transition-colors disabled:opacity-40"
            title="Clear conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">

        
        {!hasMessages && !isStreaming && (
          <ChatWelcome />
        )}

        
        {messages.map(msg => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}

        {/* Live streaming bubble */}
        {isStreaming && (
          <StreamingBubble content={streamingContent} />
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-start gap-3 p-3 rounded-xl
                          bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="font-sans text-xs text-red-400">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      
      {!hasMessages && (
        <SuggestedQuestions
          onSelect={q => handleSend(q)}
          disabled={isStreaming}
        />
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} isStreaming={isStreaming} />
      </div>
    </AppShell>
  );
}