import { useState } from 'react';
import { Trash2, ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Post } from '@/types';
import Avatar from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';

interface PostCardProps {
  post: Post;
  onDelete: (postId: number) => void;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
  const { user } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOwner = user?.id === post.author.id;
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  return (
    <article className="card border-mountain-700/40 hover:border-mountain-600/60
                        transition-all duration-200 group">

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar
            name={post.author.full_name}
            avatarUrl={post.author.avatar_url}
            size="md"
          />
          <div>
            <p className="font-sans font-medium text-stone-200 text-sm">
              {post.author.full_name}
            </p>
            <p className="font-sans text-xs text-stone-500">{timeAgo}</p>
          </div>
        </div>

        {/* Delete button — only visible to post owner */}
        {isOwner && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="font-sans text-xs text-stone-400">Delete?</span>
                <button
                  onClick={() => onDelete(post.id)}
                  className="font-sans text-xs text-red-400 hover:text-red-300 font-medium"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="font-sans text-xs text-stone-500 hover:text-stone-400"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded-md hover:bg-red-500/10 text-stone-600
                           hover:text-red-400 transition-colors"
                title="Delete post"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <p className="font-body text-stone-300 leading-relaxed whitespace-pre-wrap mb-4">
        {post.content}
      </p>

      {/* Image */}
      {post.image_url && !imgError && (
        <div className="rounded-lg overflow-hidden border border-mountain-700/40 mb-2">
          <img
            src={post.image_url}
            alt="Post attachment"
            className="w-full max-h-80 object-cover"
            onError={() => setImgError(true)}
          />
        </div>
      )}

      {post.image_url && imgError && (
        <div className="flex items-center gap-2 text-stone-600 text-sm font-sans py-2">
          <ImageIcon className="w-4 h-4" />
          <span>Image unavailable</span>
        </div>
      )}
    </article>
  );
}
