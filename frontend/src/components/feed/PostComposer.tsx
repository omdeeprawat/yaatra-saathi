import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import Spinner from "@/components/ui/Spinner";

interface PostComposerProps {
  onSubmit: (content: string) => Promise<void>;
}

const MAX_CHARS = 2000;

export default function PostComposer({ onSubmit }: PostComposerProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const charsLeft = MAX_CHARS - content.length;
  const isOverLimit = charsLeft < 0;
  const isEmpty = !content.trim();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isEmpty || isOverLimit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="card border-mountain-600/40 mb-6">
      <div className="flex gap-3">
        <Avatar name={user.full_name} avatarUrl={user.avatar_url} size="md" />

        <div className="flex-1 min-w-0">
          {/* Text area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, experiences, or questions about the Yatra..."
            rows={3}
            disabled={isSubmitting}
            className="w-full bg-transparent text-stone-200 font-body text-sm
                       placeholder-stone-600 resize-none outline-none leading-relaxed
                       disabled:opacity-50"
          />

          {/* Toolbar + submit */}
          <div
            className="flex items-center justify-between pt-3
                          border-t border-mountain-700/50 mt-3"
          >
            {/* Character counter */}
            <span
              className={`font-sans text-xs ${
                isOverLimit
                  ? "text-red-400"
                  : charsLeft < 100
                    ? "text-amber-400"
                    : "text-stone-600"
              }`}
            >
              {charsLeft}
            </span>

            <button
              onClick={handleSubmit}
              disabled={isEmpty || isOverLimit || isSubmitting}
              className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="small" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Post
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
