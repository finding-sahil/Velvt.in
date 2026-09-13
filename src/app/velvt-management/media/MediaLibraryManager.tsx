"use client";

import { useState, useTransition } from "react";
import Image from "next/image";

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: number;
  category: "upload" | "gallery" | "brand";
  modifiedAt?: string;
}

interface MediaLibraryManagerProps {
  initialItems: MediaItem[];
}

export function MediaLibraryManager({ initialItems }: MediaLibraryManagerProps) {
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", "media-library");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload file");
      }

      const newItem: MediaItem = {
        id: data.filename || `upload-${Date.now()}`,
        name: data.filename || file.name,
        url: data.url,
        size: data.compressedSize || file.size,
        category: "upload",
        modifiedAt: new Date().toISOString(),
      };

      setItems((prev) => [newItem, ...prev]);
      setSelectedItem(newItem);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatSize = (bytes: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* ─── Header & Upload Zone ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#09090b] border border-white/[0.08] p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red/5 rounded-full blur-3xl pointer-events-none" />

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-g5">
              CENTRALIZED ASSETS & STORAGE
            </span>
          </div>
          <h1 className="font-display font-black text-3xl uppercase tracking-wider text-white">
            Media Library
          </h1>
          <p className="text-sm font-sans text-g5 mt-1">
            Upload, optimize, and manage imagery across all events, galleries, and pages.
          </p>
        </div>

        {/* Upload Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <label className="relative inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red hover:bg-red/90 text-white font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-[0_0_20px_rgba(200,16,46,0.3)] cursor-pointer">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileUpload}
              disabled={uploading}
              className="sr-only"
            />
            {uploading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Optimizing & Uploading...</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Upload New Asset</span>
              </>
            )}
          </label>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 rounded-xl bg-red-dim border border-red/40 text-red text-xs font-mono">
          {uploadError}
        </div>
      )}

      {/* ─── Search & Category Filters ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/[0.03] border border-white/[0.08] rounded-xl">
          {[
            { id: "all", label: "All Assets", count: items.length },
            { id: "upload", label: "Uploads", count: items.filter((i) => i.category === "upload").length },
            { id: "gallery", label: "Gallery", count: items.filter((i) => i.category === "gallery").length },
            { id: "brand", label: "Brand", count: items.filter((i) => i.category === "brand").length },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                filterCategory === cat.id
                  ? "bg-red text-white font-bold shadow-[0_0_10px_rgba(200,16,46,0.3)]"
                  : "text-g5 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or URL..."
            className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-2 pl-9 text-xs font-mono text-white placeholder-g5 focus:outline-none focus:border-red transition-all"
          />
          <svg
            className="w-4 h-4 text-g5 absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* ─── Grid of Assets ─── */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-[#09090b] border border-white/[0.08] rounded-2xl">
          <p className="text-sm font-mono text-g5">No assets found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`group relative bg-[#09090b] border rounded-xl overflow-hidden cursor-pointer transition-all ${
                selectedItem?.id === item.id
                  ? "border-red shadow-[0_0_15px_rgba(200,16,46,0.3)] scale-[1.02]"
                  : "border-white/[0.08] hover:border-white/20 hover:scale-[1.01]"
              }`}
            >
              {/* Thumbnail */}
              <div className="aspect-square relative bg-black/60 overflow-hidden">
                <Image
                  src={item.url}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <span className="text-[10px] font-mono text-white/90 truncate w-full">
                    {item.name}
                  </span>
                </div>
              </div>

              {/* Meta */}
              <div className="p-2.5 border-t border-white/[0.06] bg-black/40">
                <p className="text-[11px] font-mono text-white font-medium truncate">
                  {item.name}
                </p>
                <div className="flex items-center justify-between text-[9px] font-mono text-g5 mt-1">
                  <span className="uppercase">{item.category}</span>
                  <span>{formatSize(item.size)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Detail / Action Modal ─── */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className="bg-[#09090b] border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-white truncate max-w-md">
                  {selectedItem.name}
                </h3>
                <p className="text-xs font-mono text-g5 mt-0.5">
                  Category: <span className="uppercase text-white">{selectedItem.category}</span> • Size: {formatSize(selectedItem.size)}
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-g5 hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Preview Image */}
            <div className="relative aspect-video max-h-72 w-full bg-black/80 rounded-xl overflow-hidden border border-white/[0.06] flex items-center justify-center">
              <Image
                src={selectedItem.url}
                alt={selectedItem.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>

            {/* Copy Actions */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-g5 block mb-1">
                  Public CDN / Local URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={selectedItem.url}
                    className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white select-all focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(selectedItem.url, "url")}
                    className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-red hover:text-white border border-white/10 text-xs font-mono uppercase tracking-wider text-g5 transition-all cursor-pointer"
                  >
                    {copiedId === "url" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() =>
                    copyToClipboard(`![${selectedItem.name}](${selectedItem.url})`, "md")
                  }
                  className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{copiedId === "md" ? "Copied Markdown!" : "Copy Markdown"}</span>
                </button>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `<img src="${selectedItem.url}" alt="${selectedItem.name}" />`,
                      "html"
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{copiedId === "html" ? "Copied HTML!" : "Copy <img> Tag"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
