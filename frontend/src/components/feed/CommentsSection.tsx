import { MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useComments } from "@/hooks/useComments";
import CommentForm from "./CommentForm";
import CommentThread from "./CommentThread";

interface CommentsSectionProps {
  postId: number;
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const { isAuthenticated } = useAuth();
  const { data: commentData, isLoading, isError } = useComments(postId);

  const comments = commentData?.comments || [];
  const totalCount = commentData?.total_count || 0;

  if (isError) {
    return (
      <div className="p-4 text-center text-red-400 text-sm">
        Failed to load comments
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-stone-800 pt-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-saffron-500" />
        <h3 className="font-sans text-sm font-medium text-stone-200">
          {totalCount} {totalCount === 1 ? "Comment" : "Comments"}
        </h3>
      </div>

      {/* Comment Form for authenticated users */}
      {isAuthenticated && (
        <CommentForm postId={postId} placeholder="Share your thoughts..." />
      )}

      {/* Comments Loading */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-2 border-saffron-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Comments List */}
      {!isLoading && comments.length === 0 ? (
        <div className="text-center py-8 text-stone-400">
          <p className="text-sm">No comments yet. Be the first to share!</p>
        </div>
      ) : (
        <CommentThread comments={comments} postId={postId} />
      )}
    </div>
  );
}
