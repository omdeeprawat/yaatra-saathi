import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { postsApi } from "@/services/api";
import toast from "react-hot-toast";

const POSTS_KEY = ["posts"];

export function usePosts() {
  return useInfiniteQuery({
    queryKey: POSTS_KEY,
    queryFn: ({ pageParam = 1 }) => postsApi.getPosts(pageParam as number, 10),
    initialPageParam: 1,
    getNextPageParam: (lastPage: { page: number; pages: number }) =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content, imageUrl }: { content: string; imageUrl?: string }) =>
      postsApi.createPost(content, imageUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_KEY });
      toast.success("Post shared!");
    },
    onError: (error) => {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as { detail?: string } | undefined)?.detail
          : "";
      toast.error(message || "Failed to post. Please try again.");
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => postsApi.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_KEY });
      toast.success("Post deleted.");
    },
    onError: () => {
      toast.error("Failed to delete post.");
    },
  });
}
