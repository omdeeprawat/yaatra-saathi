import { useState, useCallback } from 'react';
import { uploadApi } from '@/services/api';
import toast from 'react-hot-toast';

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export interface UploadedImage {
  url: string;
  previewUrl: string;   
  file: File;
}

export function useImageUpload() {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const selectImage = useCallback((file: File): boolean => {
    // Client-side validation before upload
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPEG, PNG, WebP, and GIF images are allowed.');
      return false;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(`Image must be under ${MAX_SIZE_MB}MB.`);
      return false;
    }

    if (image?.previewUrl) {
      URL.revokeObjectURL(image.previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setImage({ url: '', previewUrl, file });
    return true;
  }, [image]);

  const uploadImage = useCallback(async (): Promise<string | null> => {
    if (!image?.file) return null;

    setIsUploading(true);
    setUploadProgress(0);

    // Fake progress for UX — real progress needs XMLHttpRequest
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 15, 85));
    }, 200);

    try {
      const result = await uploadApi.uploadImage(image.file);
      setUploadProgress(100);

      // Update image state with the real cloudinary URL
      setImage(prev => prev ? { ...prev, url: result.url } : null);
      return result.url;
    } catch {
      toast.error('Image upload failed. Post will be shared without image.');
      return null;
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  }, [image]);

  const clearImage = useCallback(() => {
    if (image?.previewUrl) {
      URL.revokeObjectURL(image.previewUrl);
    }
    setImage(null);
    setUploadProgress(0);
  }, [image]);

  return {
    image,
    isUploading,
    uploadProgress,
    selectImage,
    uploadImage,
    clearImage,
  };
}