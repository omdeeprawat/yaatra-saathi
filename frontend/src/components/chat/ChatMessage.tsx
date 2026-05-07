import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage as ChatMessageType } from "@/types";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { Mountain } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessageBubble({ message }: ChatMessageProps) {
  const { user } = useAuth();
  const isUser = message.role === "user";
  const timeAgo = formatDistanceToNow(new Date(message.timestamp), {
    addSuffix: true,
  });

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} items-start`}
    >
      {isUser ? (
        <Avatar
          name={user?.full_name ?? "You"}
          avatarUrl={user?.avatar_url}
          size="sm"
        />
      ) : (
        <div
          className="w-7 h-7 rounded-full bg-gradient-to-br from-saffron-600 to-mountain-600
                        flex items-center justify-center shrink-0 ring-1 ring-saffron-500/30"
        >
          <Mountain className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      <div
        className={`flex flex-col gap-1 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}
      >
        {/* Image attachment */}
        {message.image_url && (
          <div className="rounded-xl overflow-hidden border border-mountain-600/40 mb-1 max-w-xs">
            <img
              src={message.image_url}
              alt="Attached"
              className="w-full max-h-48 object-cover"
            />
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${
            isUser
              ? "bg-saffron-600/20 border border-saffron-500/30 text-stone-100 rounded-tr-sm"
              : "bg-mountain-800/60 border border-mountain-700/50 text-stone-200 rounded-tl-sm"
          }`}
        >
          {isUser ? (
            <p className="font-body whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div
              className="prose prose-invert prose-sm max-w-none
                            prose-p:my-1 prose-ul:my-1 prose-ol:my-1
                            prose-li:my-0.5 prose-headings:text-stone-100
                            prose-strong:text-saffron-300 prose-code:text-saffron-300
                            prose-code:bg-mountain-900/60 prose-code:px-1 prose-code:rounded"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <span className="font-sans text-xs text-stone-600">{timeAgo}</span>
      </div>
    </div>
  );
}
