import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { uploadApi } from "@/services/api";
import { User, Camera, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatar_url ?? null,
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    setAvatarPreview(URL.createObjectURL(file));

    try {
      setUploading(true);
      const res = await uploadApi.uploadImage(file);
      setAvatarPreview(res.url);
      // Save avatar URL right away
      await updateProfile({ avatar_url: res.url });
      toast.success("Avatar updated!");
    } catch {
      toast.error("Failed to upload image");
      setAvatarPreview(user?.avatar_url ?? null);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      setSaving(true);
      await updateProfile({ full_name: fullName.trim() });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-200 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="font-display text-2xl font-bold text-stone-100 mb-8">
        Edit Profile
      </h1>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative group"
          disabled={uploading}
        >
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover border-2 border-mountain-600 group-hover:border-saffron-500 transition-colors"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-mountain-700 flex items-center justify-center border-2 border-mountain-600 group-hover:border-saffron-500 transition-colors">
              <User className="w-10 h-10 text-stone-400" />
            </div>
          )}
          <span className="absolute bottom-0 right-0 bg-saffron-500 rounded-full p-1.5 shadow-lg group-hover:bg-saffron-400 transition-colors">
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5 text-white" />
            )}
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <p className="text-xs text-stone-500 mt-2">Click to change photo</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-stone-400 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={user?.email ?? ""}
            disabled
            className="w-full rounded bg-mountain-800 border border-mountain-600 px-4 py-2.5 text-stone-400 text-sm cursor-not-allowed"
          />
          <p className="text-xs text-stone-600 mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-stone-400 mb-1"
          >
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded bg-mountain-800 border border-mountain-600 focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 px-4 py-2.5 text-stone-100 text-sm outline-none transition-colors"
            placeholder="Your name"
          />
        </div>

        <button
          type="submit"
          disabled={saving || fullName.trim() === user?.full_name}
          className="btn-primary w-full py-2.5"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </span>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </div>
  );
}
