import { useCallback } from "react";
import { useChatStore } from "@/store/chatStore";
import { chatApi } from "@/services/api";
import type { ChatHistoryItem } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

export function useChat() {
  const { token } = useAuth();
  const {
    messages,
    isStreaming,
    streamingContent,
    error,
    addUserMessage,
    startAssistantMessage,
    appendStreamChunk,
    finalizeAssistantMessage,
    setError,
    clearMessages,
  } = useChatStore();

  const sendMessage = useCallback(
    async (content: string, imageUrl?: string) => {
      if (!token || isStreaming) return;

      // 1. Add user message to store immediately
      addUserMessage(content, imageUrl);

      // 2. Build history from existing messages (exclude the one we just added)
      const history: ChatHistoryItem[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // 3. Start streaming state
      startAssistantMessage();

      try {
        const response = await chatApi.openStream(
          {
            message: content,
            history,
            image_url: imageUrl ?? null,
          },
          token,
        );

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        // 4. Read the SSE stream chunk by chunk
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const raw = decoder.decode(value, { stream: true });
          const lines = raw.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;

            const payload = line.slice(6).trim();
            if (payload === "[DONE]") break;

            try {
              const { text } = JSON.parse(payload) as { text?: string };
              if (text) appendStreamChunk(text);
            } catch {
              // Partial JSON — ignore
            }
          }
        }

        // 5. Commit accumulated content as a final message
        finalizeAssistantMessage();
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.";
        setError(message);
      }
    },
    [
      token,
      isStreaming,
      messages,
      addUserMessage,
      startAssistantMessage,
      appendStreamChunk,
      finalizeAssistantMessage,
      setError,
    ],
  );

  return {
    messages,
    isStreaming,
    streamingContent,
    error,
    sendMessage,
    clearMessages,
  };
}
