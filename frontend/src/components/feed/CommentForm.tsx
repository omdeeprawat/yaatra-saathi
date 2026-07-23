import { useState } from "react";
import { Send } from "lucide-react";
import { useCreateComment } from "@/hooks/useComments";
import type { CreateCommentRequest } from "@/types";

interface CommentFormProps {
  postId: number;
  parentCommentId?: number;
  isReply?: boolean;
  onSuccess?: () => void;
  placeholder?: string;
}

export default function CommentForm({
  postId,
  parentCommentId,
  isReply = false,
  onSuccess,
  placeholder = "Share your thoughts...",
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const { mutate: createComment, isPending } = useCreateComment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const request: CreateCommentRequest = {
      content: content.trim(),
      ...(parentCommentId && { parent_comment_id: parentCommentId }),
    };

    createComment(
      { postId, request },
      {
        onSuccess: () => {
          setContent("");
          onSuccess?.();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className={isReply ? "" : "mb-6"}>
      <div
        className={`flex gap-3 ${isReply ? "p-3 bg-stone-900/30 rounded" : ""}`}
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={isReply ? 2 : 3}
          className="flex-1 bg-stone-800 border border-stone-700 rounded px-3 py-2 
                     text-sm text-stone-100 placeholder-stone-500 resize-none
                     focus:outline-none focus:border-saffron-500"
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={!content.trim() || isPending}
          className="btn-primary py-2 px-3 text-sm h-fit shrink-0 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
