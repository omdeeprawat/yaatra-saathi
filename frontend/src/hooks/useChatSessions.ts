import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatHistoryApi } from "@/services/api";
import type { ChatSession, CreateChatSessionRequest } from "@/types";

/**
 * Hook for fetching list of chat sessions for current user
 */
export function useChatSessions(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["chatSessions", limit, offset],
    queryFn: () => chatHistoryApi.getSessions(limit, offset),
  });
}

/**
 * Hook for fetching a specific chat session with all messages
 */
export function useChatSession(sessionId: string | null) {
  return useQuery({
    queryKey: ["chatSession", sessionId],
    queryFn: () => chatHistoryApi.getSession(sessionId!),
    enabled: !!sessionId,
  });
}

/**
 * Hook for fetching paginated chat history for a session
 */
export function useChatHistory(
  sessionId: string | null,
  limit = 12,
  offset = 0,
) {
  return useQuery({
    queryKey: ["chatHistory", sessionId, limit, offset],
    queryFn: () => chatHistoryApi.getHistory(sessionId!, limit, offset),
    enabled: !!sessionId,
  });
}

/**
 * Hook for creating a new chat session
 */
export function useCreateChatSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateChatSessionRequest) =>
      chatHistoryApi.createSession(request),
    onSuccess: (newSession) => {
      // Add new session to the sessions list
      queryClient.setQueryData(
        ["chatSessions", 20, 0],
        (old: ChatSession[] | undefined) => {
          if (!old) return [newSession];
          return [newSession, ...old];
        },
      );
    },
  });
}

/**
 * Hook for updating a chat session
 */
export function useUpdateChatSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      title,
      archived,
    }: {
      sessionId: string;
      title?: string;
      archived?: boolean;
    }) => chatHistoryApi.updateSession(sessionId, title, archived),
    onSuccess: (updatedSession, { sessionId }) => {
      // Update session in the sessions list
      queryClient.setQueryData(
        ["chatSessions", 20, 0],
        (old: ChatSession[] | undefined) => {
          if (!old) return [updatedSession];
          return old.map((s) =>
            s.session_id === sessionId ? updatedSession : s,
          );
        },
      );
      // Update the session detail
      queryClient.setQueryData(["chatSession", sessionId], updatedSession);
    },
  });
}

/**
 * Hook for deleting a chat session
 */
export function useDeleteChatSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => chatHistoryApi.deleteSession(sessionId),
    onSuccess: (_, sessionId) => {
      // Remove from sessions list
      queryClient.setQueryData(
        ["chatSessions", 20, 0],
        (old: ChatSession[] | undefined) => {
          if (!old) return [];
          return old.filter((s) => s.session_id !== sessionId);
        },
      );
      // Remove session detail
      queryClient.removeQueries({ queryKey: ["chatSession", sessionId] });
    },
  });
}
