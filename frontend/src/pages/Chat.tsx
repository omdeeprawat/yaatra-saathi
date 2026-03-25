import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  Send,
  User,
  AlertTriangle,
  Database,
  Sparkles,
  Upload,
  FileText,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { chatApi } from "@/services/api";
import Spinner from "@/components/ui/Spinner";
import type { ChatMessage } from "@/types";

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [lastUploadedDoc, setLastUploadedDoc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: status,
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: ["chat-status"],
    queryFn: chatApi.getStatus,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  const canChat = !!status?.ready;

  const conversationHistory = useMemo(
    () => messages.map((m) => ({ role: m.role, content: m.content })),
    [messages],
  );

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDocumentSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || isIngesting) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["txt", "md", "pdf"].includes(ext)) {
      setError("Only .txt, .md, and .pdf files are supported.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Document must be 10MB or smaller.");
      return;
    }

    setError(null);
    setIsIngesting(true);

    try {
      const result = await chatApi.uploadDocument(file);
      setLastUploadedDoc(result.filename);
      await refetchStatus();
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "response" in e
          ? ((e as { response?: { data?: { detail?: string } } }).response?.data
              ?.detail ?? "Failed to upload and index document.")
          : "Failed to upload and index document.";
      setError(message);
    } finally {
      setIsIngesting(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending || !canChat) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Please login again. Your session token is missing.");
      return;
    }

    setError(null);
    setIsSending(true);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const assistantId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    const historyForRequest = conversationHistory;
    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    scrollToBottom();

    try {
      const response = await chatApi.openStream(
        {
          message: text,
          history: historyForRequest,
        },
        token,
      );

      if (!response.ok || !response.body) {
        throw new Error("Unable to start chat stream.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        buffer += decoder.decode(value ?? new Uint8Array(), { stream: !readerDone });

        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const rawEvent of events) {
          const lines = rawEvent.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;

            const payload = line.slice(5).trim();
            if (payload === "[DONE]") {
              done = true;
              break;
            }

            try {
              const parsed = JSON.parse(payload) as { text?: string; error?: string };
              if (parsed.error) {
                throw new Error(parsed.error);
              }

              const chunk = parsed.text ?? "";
              if (!chunk) continue;

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId ? { ...msg, content: msg.content + chunk } : msg,
                ),
              );
              scrollToBottom();
            } catch {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? { ...msg, content: msg.content + payload }
                    : msg,
                ),
              );
              scrollToBottom();
            }
          }
        }
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to get chat response.";
      setError(message);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
              ...msg,
              content:
                msg.content ||
                "I hit an error while generating the response. Please try again.",
            }
            : msg,
        ),
      );
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-10 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 full border border-saffron-500/30 bg-saffron-500/10 mb-2">
          <Sparkles className="w-4 h-4 text-saffron-400" />
          <span className="font-sans text-xs tracking-wider uppercase text-saffron-300">
            RAG Assistant
          </span>
        </div>
        <h1 className="font-display text-3xl text-stone-100">AI Yatra Guide</h1>
      </div>

      <div className="card border-mountain-600/40 flex-1 min-h-0 flex flex-col">
        <div className="mb-4 pb-3 border-b border-mountain-700/50 flex items-center gap-2 text-sm">
          <Database className="w-4 h-4 text-saffron-400" />
          {statusLoading ? (
            <span className="text-stone-400 flex items-center gap-2">
              <Spinner size="small" /> Checking vector store...
            </span>
          ) : status?.ready ? (
            <span className="text-emerald-400">
              Knowledge base ready ({status.chunk_count} chunks indexed)
            </span>
          ) : (
            <span className="text-amber-400">{status?.message ?? "Knowledge base not ready"}</span>
          )}
        </div>

        <div className="mb-4 pb-3 border-b border-mountain-700/50 flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.pdf"
            className="hidden"
            onChange={handleDocumentSelected}
          />
          <button
            onClick={handleUploadClick}
            disabled={isIngesting || isSending}
            className="btn-secondary py-2 px-3 text-xs"
          >
            {isIngesting ? <Spinner size="small" /> : <Upload className="w-4 h-4" />}
            {isIngesting ? "Indexing..." : "Upload Document"}
          </button>
          <span className="text-xs text-stone-500 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Supports .txt, .md, .pdf (max 10MB)
          </span>
          {lastUploadedDoc && (
            <span className="text-xs text-emerald-400">
              Indexed: {lastUploadedDoc}
            </span>
          )}
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto pr-1 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center px-4">
              <div>
                <Bot className="w-10 h-10 text-saffron-400 mx-auto mb-3" />
                <p className="font-sans text-stone-300 mb-2">
                  Ask anything about route, rituals, safety, or Raj Jat history.
                </p>
                <p className="font-sans text-xs text-stone-500">
                  Example: “What should I pack for Bedni Bugyal and Homkund stages?”
                </p>
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-md border px-3 py-2.5 ${
                    m.role === "user"
                      ? "bg-saffron-500/15 border-saffron-500/30"
                      : "bg-mountain-800/60 border-mountain-600/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {m.role === "user" ? (
                      <User className="w-3.5 h-3.5 text-saffron-400" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span className="font-sans text-[11px] uppercase tracking-[2px] text-stone-500">
                      {m.role === "user" ? "You" : "Yatra Saathi"} • {formatTime(m.timestamp)}
                    </span>
                  </div>

                  {m.role === "assistant" ? (
                    <article className="prose prose-invert prose-sm max-w-none prose-p:text-stone-200 prose-li:text-stone-200 prose-strong:text-saffron-300 prose-a:text-saffron-400">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content || "..."}</ReactMarkdown>
                    </article>
                  ) : (
                    <p className="font-body text-sm text-stone-200 whitespace-pre-wrap">
                      {m.content}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {error && (
          <div className="mt-4 mb-1 rounded border border-red-500/30 bg-red-500/10 p-2.5 text-sm text-red-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-mountain-700/50 flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            disabled={!canChat || isSending || statusLoading}
            rows={2}
            placeholder={
              canChat
                ? "Ask your Yatra question..."
                : "Vector store is not ready yet. Run ingestion first."
            }
            className="input resize-none flex-1"
          />

          <button
            onClick={() => void handleSend()}
            disabled={!input.trim() || !canChat || isSending || statusLoading}
            className="btn-primary h-[44px] px-4"
          >
            {isSending ? <Spinner size="small" /> : <Send className="w-4 h-4" />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
