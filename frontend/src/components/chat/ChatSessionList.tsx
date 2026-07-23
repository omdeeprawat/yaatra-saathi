import { MessageSquare, Trash2, Edit2, Check, X } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import type { ChatSession } from "@/types";
import {
  useUpdateChatSession,
  useDeleteChatSession,
} from "@/hooks/useChatSessions";

interface ChatSessionListItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: (sessionId: string) => void;
}

export default function ChatSessionListItem({
  session,
  isActive,
  onSelect,
}: ChatSessionListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title || "");

  const { mutate: updateSession, isPending: isUpdating } =
    useUpdateChatSession();
  const { mutate: deleteSession, isPending: isDeleting } =
    useDeleteChatSession();

  const handleSaveTitle = () => {
    if (!editTitle.trim()) {
      setEditTitle(session.title || "");
      setIsEditing(false);
      return;
    }

    updateSession(
      {
        sessionId: session.session_id,
        title: editTitle.trim(),
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleDelete = () => {
    if (confirm("Delete this chat session?")) {
      deleteSession(session.session_id);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(session.created_at), {
    addSuffix: true,
  });

  return (
    <div
      onClick={() => onSelect(session.session_id)}
      className={`p-3 rounded-lg cursor-pointer transition-all group ${
        isActive
          ? "bg-saffron-500/20 border border-saffron-500/50"
          : "bg-stone-800/40 hover:bg-stone-800/60 border border-stone-700/50"
      }`}
    >
      {/* Title */}
      {isEditing ? (
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            autoFocus
            disabled={isUpdating}
            className="flex-1 bg-stone-900 border border-stone-600 rounded px-2 py-1 text-xs
                       text-stone-100 focus:outline-none focus:border-saffron-500"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSaveTitle();
            }}
            disabled={isUpdating}
            className="p-1 hover:bg-green-500/20 text-green-400 rounded"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(false);
              setEditTitle(session.title || "");
            }}
            className="p-1 hover:bg-stone-700 text-stone-400 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <h4 className="font-sans text-sm font-medium text-stone-100 truncate">
              {session.title || "Untitled Chat"}
            </h4>
            {session.topic && (
              <p className="font-sans text-xs text-stone-500 truncate">
                {session.topic}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Meta */}
      {!isEditing && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-stone-500">
            <MessageSquare className="w-3 h-3" />
            <span className="font-sans text-xs">{session.total_messages}</span>
          </div>
          <span className="font-sans text-xs text-stone-600">{timeAgo}</span>
        </div>
      )}

      {/* Actions */}
      {!isEditing && (
        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            disabled={isUpdating || isDeleting}
            className="flex-1 flex items-center justify-center gap-1 text-xs py-1 px-2
                       hover:bg-stone-700/50 text-stone-400 hover:text-stone-300 rounded transition"
          >
            <Edit2 className="w-3 h-3" />
            Rename
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            disabled={isDeleting || isUpdating}
            className="flex items-center justify-center text-xs py-1 px-2
                       hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded transition"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
