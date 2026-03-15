import { useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Users, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePosts, useCreatePost, useDeletePost } from "@/hooks/usePosts";
import PostCard from "@/components/feed/PostCard";
import PostCardSkeleton from "@/components/feed/PostCardSkeleton";
import PostComposer from "@/components/feed/PostComposer";
import EmptyState from "@/components/ui/EmptyState";
import type { Post } from "@/types";

export default function Feed() {
  const { isAuthenticated } = useAuth();
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePosts();

  const { mutateAsync: createPost } = useCreatePost();
  const { mutate: deletePost } = useDeletePost();

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
      });
      observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  // Flatten all pages into a single array
  const allPosts: Post[] = data?.pages.flatMap((page) => page.items) ?? [];

  // Handler passed to PostComposer
  const handleSubmit = async (content: string, imageUrl?: string) => {
    await createPost({ content, imageUrl });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6 text-saffron-500" />
          <span className="font-sans text-[11px] text-stone-600 uppercase tracking-[3px]">
            Community
          </span>
        </div>
        <h1 className="font-display text-4xl text-stone-100 mb-2">
          Pilgrim Feed
        </h1>
        <p className="font-body text-stone-400 text-lg">
          Stories, questions, and wisdom from the Yatra community.
        </p>
      </div>

      {/* Composer — only for authenticated users */}
      {isAuthenticated ? (
        <PostComposer onSubmit={handleSubmit} />
      ) : (
        <div
          className="card border-mountain-600/30 mb-6 flex items-center
                        justify-between gap-4 bg-mountain-800/30"
        >
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-stone-500 shrink-0" />
            <p className="font-sans text-sm text-stone-400">
              Sign in to share your experience with the community.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link to="/login" className="btn-secondary py-1.5 px-3 text-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary py-1.5 px-3 text-sm">
              Join
            </Link>
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="card border-red-500/20 bg-red-500/5 text-center py-8 mb-6">
          <p className="font-sans text-red-400 text-sm">
            Failed to load posts. Please refresh the page.
          </p>
        </div>
      )}

      {/* Posts list */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : allPosts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No posts yet"
          description="Be the first to share something with the Yatra community."
          action={
            !isAuthenticated ? (
              <Link to="/register" className="btn-primary text-sm">
                Create Account
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {allPosts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={deletePost} />
          ))}

          {/* Infinite scroll sentinel */}
          <div ref={loadMoreRef} className="py-4 flex justify-center">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-stone-500 font-sans text-sm">
                <div
                  className="w-4 h-4 border-2 border-saffron-500 border-t-transparent
                                rounded-full animate-spin"
                />
                Loading more...
              </div>
            )}
            {!hasNextPage && allPosts.length > 0 && (
              <p className="font-sans text-xs text-stone-600">
                You've reached the end of the feed.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
