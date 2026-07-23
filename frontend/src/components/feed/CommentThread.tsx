import CommentItem from "./CommentItem";
import type { PostComment } from "@/types";

interface CommentThreadProps {
  comments: PostComment[];
  postId: number;
  depth?: number;
  isReplies?: boolean;
}

export default function CommentThread({
  comments,
  postId,
  depth = 0,
  isReplies = false,
}: CommentThreadProps) {
  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <div className={isReplies ? "mt-4" : ""}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          depth={depth}
          isReply={isReplies}
        />
      ))}
    </div>
  );
}
