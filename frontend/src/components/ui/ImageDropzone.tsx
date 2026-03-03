import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, X, Upload } from 'lucide-react';
import clsx from 'clsx';

interface ImageDropzoneProps {
  previewUrl: string | null;
  isUploading: boolean;
  uploadProgress: number;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export default function ImageDropzone({
  previewUrl,
  isUploading,
  uploadProgress,
  onFileSelect,
  onClear,
}: ImageDropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFileSelect(accepted[0]);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] },
    maxFiles: 1,
    disabled: isUploading,
  });

  // Preview mode 
  if (previewUrl) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-mountain-600/50
                      group max-h-64">
        <img
          src={previewUrl}
          alt="Preview"
          className="w-full max-h-64 object-cover"
        />

        {/* Upload progress overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-mountain-900/70 flex flex-col
                          items-center justify-center gap-3">
            <Upload className="w-6 h-6 text-saffron-400 animate-bounce" />
            <div className="w-48 h-1.5 bg-mountain-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-saffron-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="font-sans text-xs text-stone-300">
              Uploading... {uploadProgress}%
            </span>
          </div>
        )}

        {/* Remove button */}
        {!isUploading && (
          <button
            onClick={e => { e.stopPropagation(); onClear(); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full
                       bg-mountain-900/80 hover:bg-red-500/80
                       flex items-center justify-center
                       opacity-0 group-hover:opacity-100
                       transition-all duration-200"
            title="Remove image"
          >
            <X className="w-3.5 h-3.5 text-stone-200" />
          </button>
        )}
      </div>
    );
  }

  // Dropzone mode 
  return (
    <div
      {...getRootProps()}
      className={clsx(
        'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer',
        'transition-all duration-200',
        isDragActive
          ? 'border-saffron-500 bg-saffron-500/5'
          : 'border-mountain-600/50 hover:border-mountain-500 hover:bg-mountain-800/30'
      )}
    >
      <input {...getInputProps()} />
      <ImagePlus className={clsx(
        'w-8 h-8 mx-auto mb-3 transition-colors',
        isDragActive ? 'text-saffron-400' : 'text-stone-600'
      )} />
      <p className="font-sans text-sm text-stone-400">
        {isDragActive
          ? 'Drop your image here'
          : 'Drag & drop or click to add an image'}
      </p>
      <p className="font-sans text-xs text-stone-600 mt-1">
        JPEG, PNG, WebP, GIF · Max 5MB
      </p>
    </div>
  );
}