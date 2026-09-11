"use client";

import { useState, useRef } from "react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  recommendedText?: string;
  aspectRatio?: "poster" | "square" | "video" | "auto";
}

export function ImageUploader({
  value,
  onChange,
  label = "Image / Media",
  recommendedText = "JPG, PNG, WebP or GIF up to 8MB",
  aspectRatio = "poster",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useUrlMode, setUseUrlMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (8MB)
    if (file.size > 8 * 1024 * 1024) {
      setError("File exceeds 8MB maximum size.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
      } else {
        setError(data.error || "Upload failed. Please try another image.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to upload file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  const aspectClass =
    aspectRatio === "poster"
      ? "aspect-[3/4]"
      : aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "video"
      ? "aspect-video"
      : "min-h-[160px]";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-mono uppercase tracking-wider text-g5">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setUseUrlMode(!useUrlMode)}
          className="text-[10px] font-mono text-red hover:underline cursor-pointer"
        >
          {useUrlMode ? "Switch to File Upload" : "Or Paste Image URL"}
        </button>
      </div>

      {error && (
        <div className="p-2 rounded bg-red-dim border border-red-glow text-red text-[11px] font-mono">
          ✕ {error}
        </div>
      )}

      {value ? (
        /* Image Preview State */
        <div className="relative rounded-xl overflow-hidden border border-white/15 bg-black/60 p-2.5 flex items-center gap-4">
          <div className={`relative w-20 sm:w-24 ${aspectClass} rounded-lg overflow-hidden border border-white/10 bg-black flex-shrink-0`}>
            <img
              src={value}
              alt="Uploaded Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="space-y-0.5">
              <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                ✓ Image Selected
              </span>
              <p className="text-xs font-mono text-white truncate" title={value}>
                {value.split("/").pop() || value}
              </p>
              <p className="text-[10px] font-mono text-g5 truncate">{value}</p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-2.5 py-1 rounded bg-white/[0.06] hover:bg-white/10 border border-white/15 text-[10px] font-mono text-white transition-colors cursor-pointer"
              >
                {uploading ? "Uploading..." : "Change Image"}
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className="px-2.5 py-1 rounded bg-red-dim hover:bg-red/20 border border-red-glow text-[10px] font-mono text-red transition-colors cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : useUrlMode ? (
        /* Direct URL Input Mode */
        <div className="space-y-1.5">
          <input
            type="url"
            placeholder="https://images.unsplash.com/... or /uploads/..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white text-xs font-mono placeholder:text-g6 focus:outline-none focus:border-red"
          />
          <p className="text-[10px] font-mono text-g5">
            Direct image link from Unsplash, Imgur, or external CDN.
          </p>
        </div>
      ) : (
        /* Drag & Drop / Click to Upload Box */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/15 hover:border-red/60 rounded-xl p-5 text-center cursor-pointer transition-all bg-white/[0.02] hover:bg-white/[0.04] group space-y-2"
        >
          <div className="w-10 h-10 mx-auto rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
            {uploading ? (
              <span className="animate-spin text-red">◌</span>
            ) : (
              <span>📸</span>
            )}
          </div>
          <div>
            <p className="text-xs font-mono font-medium text-white group-hover:text-red transition-colors">
              {uploading ? "Uploading Image to Server..." : "Click to Upload Event Image / Poster"}
            </p>
            <p className="text-[10px] font-mono text-g5 mt-0.5">
              {recommendedText}
            </p>
          </div>
        </div>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
