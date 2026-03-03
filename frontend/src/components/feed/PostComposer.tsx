import { useState, type FormEvent } from "react";
import { Send, ImagePlus, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import Spinner from "@/components/ui/Spinner";

import { useImageUpload } from "@/hooks/useImageUpload";
import ImageDropzone from "@/components/ui/ImageDropzone";

interface PostComposerProps {
  onSubmit: (content: string, imageUrl?: string) => Promise<void>;
}

const MAX_CHARS = 2000;

export default function PostComposer({ onSubmit }: PostComposerProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDropzone, setShowDropzone] = useState(false);

  const {
    image,
    isUploading,
    uploadProgress,
    selectImage,
    clearImage,
    uploadImage,
  } = useImageUpload();

  const charsLeft = MAX_CHARS - content.length;
  const isOverLimit = charsLeft < 0;
  const isEmpty = !content.trim();
  const isBusy = isSubmitting || isUploading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isEmpty || isOverLimit || isBusy) return;

    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (image?.file) {
        const uploaded = await uploadImage();
        imageUrl = uploaded ?? undefined;
      }
      await onSubmit(content.trim(), imageUrl);

      setContent("");
      clearImage();
      setShowDropzone(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelect = (file: File) => {
    const valid = selectImage(file);
    if (!valid) setShowDropzone(false);
  };

  const handleClearImage = () => {
    clearImage();
    setShowDropzone(false);
  };

  if (!user) return null;

  return (
    <div className="card border-mountain-600/40 mb-6">
      <div className="flex gap-3">
        <Avatar name={user.full_name} avatarUrl={user.avatar_url} size="md" />

        <div className="flex-1 min-w-0">
          {/* Text area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, experiences, or questions about the Yatra..."
            rows={3}
            disabled={isBusy}
            className="w-full bg-transparent text-stone-200 font-body text-sm
                       placeholder-stone-600 resize-none outline-none leading-relaxed
                       disabled:opacity-50"
          />

          {/* Image dropzone — shown when toggled or image selected */}
          {(showDropzone || image) && (
            <div className="mt-3">
              <ImageDropzone
                previewUrl={image?.previewUrl ?? null}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                onFileSelect={handleImageSelect}
                onClear={handleClearImage}
              />
            </div>
          )}

          {/* Toolbar + submit */}
          <div
            className="flex items-center justify-between pt-3
                          border-t border-mountain-700/50 mt-3"
          >
            <div className="flex items-center gap-2">
              {/* Image toggle button */}
              {!image && (
                <button
                  type="button"
                  onClick={() => setShowDropzone((v) => !v)}
                  disabled={isBusy}
                  className={`p-1.5 rounded-md transition-colors
                    ${
                      showDropzone
                        ? "text-saffron-400 bg-saffron-500/10"
                        : "text-stone-500 hover:text-stone-300 hover:bg-mountain-700/50"
                    }`}
                  title={showDropzone ? "Hide image upload" : "Add image"}
                >
                  {showDropzone ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <ImagePlus className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Character counter */}
              <span
                className={`font-sans text-xs ${
                  isOverLimit
                    ? "text-red-400"
                    : charsLeft < 100
                      ? "text-amber-400"
                      : "text-stone-600"
                }`}
              >
                {charsLeft}
              </span>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={isEmpty || isOverLimit || isBusy}
              className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
            >
              {isBusy ? (
                <>
                  <Spinner size="small" />
                  {isUploading ? "Uploading..." : "Posting..."}
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Post
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
