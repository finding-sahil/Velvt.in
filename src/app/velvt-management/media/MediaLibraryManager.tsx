"use client";

import { useState } from "react";
import Image from "next/image";
import { deleteMediaAsset, bulkDeleteMediaAssets } from "@/app/actions";

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: number;
  category: "upload" | "gallery" | "brand";
  modifiedAt?: string;
  usageStatus: "in_use" | "not_in_use" | "cache_clutter";
  usedIn: string[];
}

interface MediaLibraryManagerProps {
  initialItems: MediaItem[];
}

export function MediaLibraryManager({ initialItems }: MediaLibraryManagerProps) {
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [filterUsage, setFilterUsage] = useState<"all" | "in_use" | "not_in_use" | "cache_clutter">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MediaItem | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState<boolean>(false);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Counts for tabs
  const inUseCount = items.filter((i) => i.usageStatus === "in_use").length;
  const notInUseCount = items.filter((i) => i.usageStatus === "not_in_use").length;
  const clutterCount = items.filter((i) => i.usageStatus === "cache_clutter").length;

  const totalSize = items.reduce((acc, i) => acc + (i.size || 0), 0);
  const clutterSize = items
    .filter((i) => i.usageStatus === "cache_clutter")
    .reduce((acc, i) => acc + (i.size || 0), 0);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesUsage = filterUsage === "all" || item.usageStatus === filterUsage;
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.usedIn.some((u) => u.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesUsage && matchesCategory && matchesSearch;
  });

  const selectedItemsList = items.filter((i) => selectedUrls.has(i.url));
  const selectedTotalSize = selectedItemsList.reduce((acc, i) => acc + (i.size || 0), 0);

  // Single delete
  const handleDeleteAsset = async (item: MediaItem) => {
    setIsDeleting(true);
    setActionFeedback(null);
    try {
      const res = await deleteMediaAsset(item.url);
      if (res.success) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setSelectedUrls((prev) => {
          const next = new Set(prev);
          next.delete(item.url);
          return next;
        });
        if (selectedItem?.id === item.id) {
          setSelectedItem(null);
        }
        setConfirmDelete(null);
        setActionFeedback({
          type: "success",
          text: `Asset "${item.name}" was permanently deleted from storage.`,
        });
        setTimeout(() => setActionFeedback(null), 4000);
      } else {
        setActionFeedback({
          type: "error",
          text: res.error || "Failed to delete asset.",
        });
      }
    } catch (err: any) {
      setActionFeedback({
        type: "error",
        text: err?.message || "An unexpected error occurred while deleting.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedUrls.size === 0) return;
    setIsDeleting(true);
    setActionFeedback(null);

    const urlsToDelete = Array.from(selectedUrls);
    try {
      const res = await bulkDeleteMediaAssets(urlsToDelete);
      if (res.success) {
        setItems((prev) => prev.filter((i) => !selectedUrls.has(i.url)));
        setSelectedUrls(new Set());
        setConfirmBulkDelete(false);
        setActionFeedback({
          type: "success",
          text: `Successfully deleted ${res.count} media asset(s). Reclaimed ${formatSize(selectedTotalSize)}.`,
        });
        setTimeout(() => setActionFeedback(null), 5000);
      } else {
        setActionFeedback({
          type: "error",
          text: res.error || "Some assets could not be deleted.",
        });
      }
    } catch (err: any) {
      setActionFeedback({
        type: "error",
        text: err?.message || "Failed to perform bulk deletion.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

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
        usageStatus: "not_in_use",
        usedIn: [],
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

  const toggleSelectUrl = (url: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedUrls((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  };

  const selectAllClutter = () => {
    const clutterUrls = items.filter((i) => i.usageStatus === "cache_clutter").map((i) => i.url);
    setSelectedUrls(new Set(clutterUrls));
    setFilterUsage("cache_clutter");
  };

  const selectAllNotInUse = () => {
    const notInUseUrls = items
      .filter((i) => i.usageStatus === "not_in_use" || i.usageStatus === "cache_clutter")
      .map((i) => i.url);
    setSelectedUrls(new Set(notInUseUrls));
  };

  const toggleSelectAllFiltered = () => {
    const allFilteredUrls = filteredItems.map((i) => i.url);
    const allSelected = allFilteredUrls.every((u) => selectedUrls.has(u));

    if (allSelected) {
      setSelectedUrls((prev) => {
        const next = new Set(prev);
        for (const u of allFilteredUrls) next.delete(u);
        return next;
      });
    } else {
      setSelectedUrls((prev) => {
        const next = new Set(prev);
        for (const u of allFilteredUrls) next.add(u);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header & Storage Overview ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#09090b] border border-white/[0.08] p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-g5">
              CENTRALIZED ASSETS &amp; STORAGE
            </span>
          </div>
          <h1 className="font-display font-black text-3xl uppercase tracking-wider text-white">
            Media Library
          </h1>
          <p className="text-xs sm:text-sm font-sans text-g5">
            Audit imagery across events, galleries, and pages. Identify and safely purge unused files and clutter.
          </p>

          <div className="flex items-center gap-3 pt-2 text-xs font-mono text-muted flex-wrap">
            <span>Total: <strong className="text-white">{items.length} files</strong> ({formatSize(totalSize)})</span>
            <span>•</span>
            <span className="text-emerald-400">🟢 In Use: <strong>{inUseCount}</strong></span>
            <span>•</span>
            <span className="text-amber-400">🟡 Not In Use: <strong>{notInUseCount}</strong></span>
            <span>•</span>
            <span className="text-purple-400">🟣 Clutter/Cache: <strong>{clutterCount}</strong> ({formatSize(clutterSize)})</span>
          </div>
        </div>

        {/* Upload & Quick Clean Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {clutterCount > 0 && (
            <button
              onClick={selectAllClutter}
              className="px-4 py-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🧹 Purge Clutter ({clutterCount})</span>
            </button>
          )}

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
                <span>Optimizing &amp; Uploading...</span>
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

      {actionFeedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-mono flex items-center justify-between animate-fade-in ${
            actionFeedback.type === "success"
              ? "bg-emerald-950/60 border-emerald-800/60 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              : "bg-red-dim border-red/40 text-red shadow-[0_0_20px_rgba(200,16,46,0.2)]"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{actionFeedback.type === "success" ? "✓" : "⚠️"}</span>
            <span>{actionFeedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-g5 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {uploadError && (
        <div className="p-4 rounded-xl bg-red-dim border border-red/40 text-red text-xs font-mono">
          {uploadError}
        </div>
      )}

      {/* ─── Usage State Tabs & Controls ─── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          {/* Usage Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/[0.08] rounded-xl flex-wrap">
            <button
              onClick={() => setFilterUsage("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                filterUsage === "all"
                  ? "bg-white/[0.1] text-white font-bold shadow-sm"
                  : "text-g5 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              All Assets ({items.length})
            </button>
            <button
              onClick={() => setFilterUsage("in_use")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                filterUsage === "in_use"
                  ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold"
                  : "text-g5 hover:text-emerald-400 hover:bg-white/[0.05]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>In Use ({inUseCount})</span>
            </button>
            <button
              onClick={() => setFilterUsage("not_in_use")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                filterUsage === "not_in_use"
                  ? "bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold"
                  : "text-g5 hover:text-amber-400 hover:bg-white/[0.05]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Not In Use ({notInUseCount})</span>
            </button>
            <button
              onClick={() => setFilterUsage("cache_clutter")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                filterUsage === "cache_clutter"
                  ? "bg-purple-950/60 border border-purple-500/40 text-purple-300 font-bold"
                  : "text-g5 hover:text-purple-400 hover:bg-white/[0.05]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>Cache / Clutter ({clutterCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search file name, path, or usage..."
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

        {/* Secondary Category Filter & Multi-Select Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.06] p-3 rounded-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase text-muted">Folder:</span>
            {["all", "upload", "gallery", "brand"].map((c) => (
              <button
                key={c}
                onClick={() => setFilterCategory(c)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase transition-all cursor-pointer ${
                  filterCategory === c
                    ? "bg-white/[0.1] text-white font-bold"
                    : "text-muted hover:text-white"
                }`}
              >
                {c === "all" ? "All Folders" : c}
              </button>
            ))}
          </div>

          {/* Multi-Selection Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAllFiltered}
              className="px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-muted hover:text-white transition-all cursor-pointer"
            >
              {filteredItems.every((i) => selectedUrls.has(i.url)) && filteredItems.length > 0
                ? "Deselect All"
                : "Select All"}
            </button>

            <button
              onClick={selectAllNotInUse}
              className="px-3 py-1 rounded-lg bg-amber-950/20 hover:bg-amber-950/40 border border-amber-500/20 text-xs font-mono text-amber-300 transition-all cursor-pointer"
            >
              Select Unused
            </button>

            {selectedUrls.size > 0 && (
              <button
                onClick={() => setConfirmBulkDelete(true)}
                className="px-3.5 py-1 rounded-lg bg-red hover:bg-red/90 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(200,16,46,0.35)] flex items-center gap-1.5 cursor-pointer"
              >
                <span>Delete Selected ({selectedUrls.size})</span>
                <span className="text-white/70 font-normal">({formatSize(selectedTotalSize)})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Grid of Assets ─── */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-[#09090b] border border-white/[0.08] rounded-2xl space-y-2">
          <p className="text-sm font-mono text-g5">No media assets found in this filter.</p>
          <button
            onClick={() => {
              setFilterUsage("all");
              setFilterCategory("all");
              setSearchQuery("");
            }}
            className="text-xs text-primary underline font-mono cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredItems.map((item) => {
            const isSelected = selectedUrls.has(item.url);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`group relative bg-[#09090b] border rounded-xl overflow-hidden cursor-pointer transition-all ${
                  isSelected
                    ? "border-red shadow-[0_0_18px_rgba(200,16,46,0.35)] ring-1 ring-red"
                    : selectedItem?.id === item.id
                    ? "border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                    : "border-white/[0.08] hover:border-white/25 hover:scale-[1.01]"
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

                  {/* Top Status Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    {item.usageStatus === "in_use" && (
                      <span
                        className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[9px] font-mono uppercase tracking-wider backdrop-blur-sm shadow-sm"
                        title={item.usedIn.join(", ")}
                      >
                        In Use
                      </span>
                    )}
                    {item.usageStatus === "not_in_use" && (
                      <span
                        className="px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[9px] font-mono uppercase tracking-wider backdrop-blur-sm shadow-sm"
                        title="Not referenced anywhere. Safe to delete."
                      >
                        Unused
                      </span>
                    )}
                    {item.usageStatus === "cache_clutter" && (
                      <span
                        className="px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-500/50 text-purple-300 text-[9px] font-mono uppercase tracking-wider backdrop-blur-sm shadow-sm"
                        title="Temporary upload or orphaned cache file."
                      >
                        Clutter
                      </span>
                    )}
                  </div>

                  {/* Checkbox Select Button */}
                  <button
                    type="button"
                    onClick={(e) => toggleSelectUrl(item.url, e)}
                    className={`absolute top-2 right-2 w-6 h-6 rounded-md border flex items-center justify-center transition-all z-10 cursor-pointer ${
                      isSelected
                        ? "bg-primary border-primary text-white shadow-sm"
                        : "bg-black/60 border-white/30 text-transparent hover:border-white opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    ✓
                  </button>

                  {/* Bottom Hover Filename */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 pointer-events-none">
                    <span className="text-[10px] font-mono text-white/90 truncate w-full">
                      {item.name}
                    </span>
                  </div>
                </div>

                {/* Meta */}
                <div className="p-2.5 border-t border-white/[0.06] bg-black/40 space-y-1">
                  <p className="text-[11px] font-mono text-white font-medium truncate">
                    {item.name}
                  </p>

                  <div className="flex items-center justify-between text-[9px] font-mono text-g5">
                    <span className="uppercase">{item.category}</span>
                    <span>{formatSize(item.size)}</span>
                  </div>

                  {item.usedIn.length > 0 && (
                    <p className="text-[9px] font-mono text-emerald-400 truncate" title={item.usedIn.join(", ")}>
                      {item.usedIn[0]}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Detail / Inspection Modal ─── */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-[#09090b] border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-white truncate max-w-md">
                  {selectedItem.name}
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono text-g5 mt-1">
                  <span className="uppercase text-white">{selectedItem.category}</span>
                  <span>•</span>
                  <span>{formatSize(selectedItem.size)}</span>
                  <span>•</span>
                  {selectedItem.usageStatus === "in_use" ? (
                    <span className="text-emerald-400 font-bold">🟢 In Active Use</span>
                  ) : selectedItem.usageStatus === "cache_clutter" ? (
                    <span className="text-purple-400 font-bold">🟣 Cache / Clutter File</span>
                  ) : (
                    <span className="text-amber-400 font-bold">🟡 Not In Use (Safe to Delete)</span>
                  )}
                </div>
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

            {/* Usage References List */}
            {selectedItem.usedIn.length > 0 ? (
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                  Active Reference Locations:
                </span>
                <ul className="text-xs font-mono text-white/90 space-y-1 list-disc list-inside">
                  {selectedItem.usedIn.map((loc, idx) => (
                    <li key={idx}>{loc}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] text-xs font-mono text-muted">
                {selectedItem.usageStatus === "cache_clutter"
                  ? "This asset is an unreferenced temporary upload or cache file. You can safely delete it to reclaim disk space."
                  : "This image is not currently referenced by any active events, gallery items, or team members."}
              </div>
            )}

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

              {/* Delete Action inside Modal */}
              <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => toggleSelectUrl(selectedItem.url)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-white cursor-pointer"
                >
                  {selectedUrls.has(selectedItem.url) ? "✓ Selected for Bulk Action" : "+ Select for Bulk Delete"}
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmDelete(selectedItem)}
                  className="px-4 py-2 rounded-xl bg-red/15 hover:bg-red text-red hover:text-white border border-red/40 transition-all font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(200,16,46,0.25)] font-bold"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete Image</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Single Deletion Confirmation Modal ─── */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => !isDeleting && setConfirmDelete(null)}
        >
          <div
            className="bg-[#0c0c0e] border border-red/40 rounded-2xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(200,16,46,0.3)] space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red/20 border border-red/40 flex items-center justify-center shrink-0">
                <span className="text-red text-lg">⚠️</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-lg text-white uppercase tracking-wide">
                  Delete Media Asset?
                </h4>
                <p className="text-xs font-mono text-g5">
                  Permanent removal from storage &amp; CDN
                </p>
              </div>
            </div>

            {/* Asset Preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/60 border border-white/10">
              <div className="w-12 h-12 relative rounded-lg overflow-hidden shrink-0 bg-black/40">
                <Image
                  src={confirmDelete.url}
                  alt={confirmDelete.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-mono text-white font-bold truncate">
                  {confirmDelete.name}
                </p>
                <p className="text-[10px] font-mono text-g5 mt-0.5">
                  <span className="uppercase text-white/80">{confirmDelete.category}</span> • {formatSize(confirmDelete.size)}
                </p>
              </div>
            </div>

            {confirmDelete.usageStatus === "in_use" && (
              <div className="p-3 rounded-xl bg-red-dim/60 border border-red text-xs font-mono text-white space-y-1">
                <p className="font-bold text-primary">⚠️ WARNING: THIS ASSET IS CURRENTLY IN USE!</p>
                <p className="text-[11px] text-white/80">
                  Deleting it will leave broken images in: {confirmDelete.usedIn.join(", ")}
                </p>
              </div>
            )}

            <p className="text-xs font-sans text-muted leading-relaxed">
              This action <span className="text-white font-semibold">cannot be undone</span>. The file will be deleted from disk and purged from storage.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono uppercase tracking-wider text-g5 hover:text-white transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDeleteAsset(confirmDelete)}
                className="px-5 py-2 rounded-xl bg-red hover:bg-red/90 text-white border border-red/50 text-xs font-mono uppercase tracking-wider font-bold shadow-[0_0_20px_rgba(200,16,46,0.4)] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm & Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Bulk Deletion Confirmation Modal ─── */}
      {confirmBulkDelete && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => !isDeleting && setConfirmBulkDelete(false)}
        >
          <div
            className="bg-[#0c0c0e] border border-red/40 rounded-2xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(200,16,46,0.3)] space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red/20 border border-red/40 flex items-center justify-center shrink-0">
                <span className="text-red text-lg">⚠️</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-lg text-white uppercase tracking-wide">
                  Bulk Delete {selectedUrls.size} Asset(s)?
                </h4>
                <p className="text-xs font-mono text-g5">
                  Reclaiming approximately {formatSize(selectedTotalSize)}
                </p>
              </div>
            </div>

            {selectedItemsList.some((i) => i.usageStatus === "in_use") && (
              <div className="p-3 rounded-xl bg-red-dim/60 border border-red text-xs font-mono text-white space-y-1">
                <p className="font-bold text-primary">⚠️ CAUTION: IN-USE ASSETS SELECTED</p>
                <p className="text-[11px] text-white/80">
                  Some selected files are currently in active use by events or profiles.
                </p>
              </div>
            )}

            <p className="text-xs font-sans text-muted leading-relaxed">
              Are you sure you want to permanently delete these <strong className="text-white">{selectedUrls.size}</strong> files from storage? This cannot be reversed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmBulkDelete(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono uppercase tracking-wider text-g5 hover:text-white transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleBulkDelete}
                className="px-5 py-2 rounded-xl bg-red hover:bg-red/90 text-white border border-red/50 text-xs font-mono uppercase tracking-wider font-bold shadow-[0_0_20px_rgba(200,16,46,0.4)] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? "Purging Files..." : `Delete ${selectedUrls.size} Files`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
