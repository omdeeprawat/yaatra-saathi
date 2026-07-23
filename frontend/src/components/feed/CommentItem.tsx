import { useState } from "react";
import { Heart, MessageCircle, Trash2, Edit2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useDeleteComment,
  useLikeComment,
  useUnlikeComment,
  useUpdateComment,
} from "@/hooks/useComments";
import CommentForm from "./CommentForm";
import type { PostComment } from "@/types";

interface CommentItemProps {
  comment: PostComment;
  postId: number;
  depth?: number;
  isReply?: boolean;
}

export default function CommentItem({
  comment,
  postId,
  depth = 0,
  isReply = false,
}: CommentItemProps) {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const { mutate: deleteComment } = useDeleteComment();
  const { mutate: likeComment } = useLikeComment();
  const { mutate: unlikeComment } = useUnlikeComment();
  const { mutate: updateComment, isPending: isUpdating } = useUpdateComment();

  const isAuthor = user?.id === comment.user_id;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const maxDepth = 3; // Limit reply nesting depth
  const canReply = depth < maxDepth;

  const handleLike = () => {
    if (comment.user_liked) {
      unlikeComment({ postId, commentId: comment.id });
    } else {
      likeComment({ postId, commentId: comment.id });
    }
  };

  const handleDelete = () => {
    if (confirm("Delete this comment?")) {
      deleteComment({ postId, commentId: comment.id });
    }
  };

  const handleUpdateSubmit = () => {
    if (!editContent.trim()) return;

    updateComment(
      {
        postId,
        commentId: comment.id,
        request: { content: editContent.trim() },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const indentClass = isReply ? "ml-4" : "";

  return (
    <div className={indentClass}>
      {/* Comment Container */}
      <div className="flex gap-3 py-4 border-b border-stone-800 last:border-b-0">
        {/* Avatar */}
        <img
          src={comment.user.avatar_url || "/default-avatar.png"}
          alt={comment.user.name}
          className="w-8 h-8 rounded-full object-cover shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-sans font-medium text-sm text-stone-100">
              {comment.user.name}
            </h4>
            <span className="font-sans text-xs text-stone-500">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
            {comment.is_edited && (
              <span className="font-sans text-xs text-stone-600 italic">
                (edited)
              </span>
            )}
          </div>

          {/* Comment Text */}
          {isEditing ? (
            <div className="mb-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded px-2 py-1
                           text-sm text-stone-100 resize-none
                           focus:outline-none focus:border-saffron-500"
                disabled={isUpdating}
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleUpdateSubmit}
                  disabled={isUpdating}
                  className="btn-primary py-1 px-2 text-xs"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary py-1 px-2 text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="font-body text-sm text-stone-300 mb-3 break-words">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex gap-3 mb-3">
              <button
                onClick={handleLike}
                className="flex items-center gap-1 text-xs text-stone-400 hover:text-saffron-400 transition"
              >
                <Heart
                  className={`w-4 h-4 ${comment.user_liked ? "fill-saffron-500 text-saffron-500" : ""}`}
                />
                <span>{comment.like_count}</span>
              </button>

              {canReply && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="flex items-center gap-1 text-xs text-stone-400 hover:text-saffron-400 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  Reply
                </button>
              )}

              {isAuthor && !isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-xs text-stone-400 hover:text-blue-400 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1 text-xs text-stone-400 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}

          {/* Reply Form */}
          {isReplying && canReply && (
            <CommentForm
              postId={postId}
              parentCommentId={comment.id}
              isReply
              onSuccess={() => setIsReplying(false)}
              placeholder={`Reply to ${comment.user.name}...`}
            />
          )}

          {/* Nested Replies */}
          {hasReplies && (
            <div className="mt-4">
              {comment.replies!.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  depth={depth + 1}
                  isReply
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
