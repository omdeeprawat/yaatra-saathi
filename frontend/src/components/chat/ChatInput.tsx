import { useState, useRef } from "react";
import type { KeyboardEvent } from "react";
import { Send, ImagePlus, X, Loader2 } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

interface ChatInputProps {
  onSend: (message: string, imageUrl?: string) => void;
  isStreaming: boolean;
}

export default function ChatInput({ onSend, isStreaming }: ChatInputProps) {
  const [text, setText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { image, uploadImage, selectImage, clearImage } = useImageUpload();

  const isBusy = isStreaming || isUploading;
  const canSend = text.trim().length > 0 && !isBusy;

  const handleSend = async () => {
    if (!canSend) return;

    const content = text.trim();
    setText("");

    let imageUrl: string | undefined;

    if (image?.file) {
      setIsUploading(true);
      try {
        const uploaded = await uploadImage();
        imageUrl = uploaded ?? undefined;
      } finally {
        setIsUploading(false);
        clearImage();
      }
    }

    onSend(content, imageUrl);

    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) selectImage(file);
    e.target.value = "";
  };

  return (
    <div className="border-t border-mountain-700/50 bg-mountain-900/50 p-4">
      {image?.previewUrl && (
        <div
          className="flex items-center gap-2 mb-3 p-2 rounded-lg
                        bg-mountain-800/50 border border-mountain-600/40"
        >
          <img
            src={image.previewUrl}
            alt="Preview"
            className="w-10 h-10 rounded-md object-cover"
          />
          <span className="font-sans text-xs text-stone-400 flex-1 truncate">
            {image.file.name}
          </span>
          <button
            onClick={clearImage}
            disabled={isBusy}
            className="text-stone-500 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-3">
        <label
          className={`shrink-0 p-2 rounded-lg cursor-pointer transition-colors
          ${
            image
              ? "text-saffron-400 bg-saffron-500/10"
              : "text-stone-500 hover:text-stone-300 hover:bg-mountain-700/50"
          }
          ${isBusy ? "opacity-40 pointer-events-none" : ""}`}
          title="Attach image"
        >
          <ImagePlus className="w-5 h-5" />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
            disabled={isBusy}
          />
        </label>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about the Yatra..."
          rows={1}
          disabled={isBusy}
          className="flex-1 bg-mountain-800/60 border border-mountain-600/50
                     rounded-xl px-4 py-3 text-sm text-stone-200 font-body
                     placeholder-stone-600 resize-none outline-none leading-relaxed
                     focus:border-mountain-500 focus:ring-1 focus:ring-mountain-500/30
                     transition-colors disabled:opacity-50
                     max-h-32 overflow-y-auto"
          style={{ height: "auto" }}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
          }}
        />

        <button
          onClick={handleSend}
          disabled={!canSend}
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                     bg-saffron-600 hover:bg-saffron-500 disabled:opacity-40
                     disabled:cursor-not-allowed transition-all duration-150"
          title="Send (Enter)"
        >
          {isBusy ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Send className="w-4 h-4 text-white" />
          )}
        </button>
      </div>

      <p className="font-sans text-xs text-stone-600 mt-2 text-center">
        Shift+Enter for new line · Answers grounded in Yatra knowledge base
      </p>
    </div>
  );
}
