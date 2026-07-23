import { Plus, Archive } from "lucide-react";
import { useState } from "react";
import { useChatSessions, useCreateChatSession } from "@/hooks/useChatSessions";
import ChatSessionListItem from "./ChatSessionList";

interface ChatSessionsSidebarProps {
  activeSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

export default function ChatSessionsSidebar({
  activeSessionId,
  onSessionSelect,
  onNewSession,
}: ChatSessionsSidebarProps) {
  const { data: sessions, isLoading, isError } = useChatSessions();
  const { mutate: createSession, isPending } = useCreateChatSession();
  const [showArchived, setShowArchived] = useState(false);

  const handleNewSession = () => {
    createSession(
      { title: "New Chat" },
      {
        onSuccess: (newSession) => {
          onSessionSelect(newSession.session_id);
          onNewSession();
        },
      },
    );
  };

  // Filter sessions
  const filteredSessions = (sessions || []).filter(
    (s) => s.archived === showArchived,
  );

  return (
    <div className="h-full flex flex-col bg-stone-950 border-r border-stone-800">
      {/* Header */}
      <div className="p-4 border-b border-stone-800">
        <button
          onClick={handleNewSession}
          disabled={isPending}
          className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-saffron-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {isError && (
          <div className="text-center text-red-400 text-xs py-8">
            Failed to load sessions
          </div>
        )}

        {!isLoading && filteredSessions.length === 0 ? (
          <div className="text-center text-stone-500 text-xs py-8">
            {showArchived ? "No archived chats" : "No active chats"}
          </div>
        ) : (
          filteredSessions.map((session) => (
            <ChatSessionListItem
              key={session.session_id}
              session={session}
              isActive={activeSessionId === session.session_id}
              onSelect={onSessionSelect}
            />
          ))
        )}
      </div>

      {/* Footer - Archive Toggle */}
      <div className="p-4 border-t border-stone-800 flex gap-2">
        <button
          onClick={() => setShowArchived(false)}
          className={`flex-1 flex items-center justify-center gap-1 text-xs py-2 rounded transition ${
            !showArchived
              ? "bg-stone-700 text-stone-100"
              : "text-stone-500 hover:text-stone-400"
          }`}
        >
          💬 Active
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`flex-1 flex items-center justify-center gap-1 text-xs py-2 rounded transition ${
            showArchived
              ? "bg-stone-700 text-stone-100"
              : "text-stone-500 hover:text-stone-400"
          }`}
        >
          <Archive className="w-3 h-3" />
          Archive
        </button>
      </div>
    </div>
  );
}
