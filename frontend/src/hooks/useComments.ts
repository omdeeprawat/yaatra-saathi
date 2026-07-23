import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "@/services/api";
import type { CreateCommentRequest, UpdateCommentRequest } from "@/types";

/**
 * Hook for fetching comments on a post with nested replies
 */
export function useComments(postId: number, sort: "recent" | "top" = "recent") {
  return useQuery({
    queryKey: ["comments", postId, sort],
    queryFn: () => commentsApi.getComments(postId, sort),
    enabled: postId > 0,
  });
}

/**
 * Hook for fetching a specific comment with its reply thread
 */
export function useComment(postId: number, commentId: number) {
  return useQuery({
    queryKey: ["comment", postId, commentId],
    queryFn: () => commentsApi.getComment(postId, commentId),
    enabled: postId > 0 && commentId > 0,
  });
}

/**
 * Hook for creating a comment or reply
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      request,
    }: {
      postId: number;
      request: CreateCommentRequest;
    }) => commentsApi.createComment(postId, request),
    onSuccess: (_, { postId }) => {
      // Invalidate all comment queries for this post
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}

/**
 * Hook for updating a comment
 */
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      commentId,
      request,
    }: {
      postId: number;
      commentId: number;
      request: UpdateCommentRequest;
    }) => commentsApi.updateComment(postId, commentId, request),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}

/**
 * Hook for deleting a comment
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      commentId,
    }: {
      postId: number;
      commentId: number;
    }) => commentsApi.deleteComment(postId, commentId),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}

/**
 * Hook for liking a comment
 */
export function useLikeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      commentId,
    }: {
      postId: number;
      commentId: number;
    }) => commentsApi.likeComment(postId, commentId),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}

/**
 * Hook for unliking a comment
 */
export function useUnlikeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      commentId,
    }: {
      postId: number;
      commentId: number;
    }) => commentsApi.unlikeComment(postId, commentId),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}
