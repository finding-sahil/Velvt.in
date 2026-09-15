"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  createGalleryItem,
  bulkCreateGalleryItems,
  toggleGalleryPublish,
  deleteGalleryItem,
  bulkDeleteGalleryItems,
  bulkUpdateGalleryItems,
} from "@/app/actions";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { ToastNotification, ToastMessage } from "@/components/ui/ToastNotification";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

interface EventItem {
  id: string;
  name: string;
  date?: string | Date;
  status?: string;
}

interface GalleryItem {
  id: string;
  url: string;
  caption: string | null;
  type: string;
  year: number | null;
  eventId: string | null;
  displayOrder: number;
  isPublished: boolean;
  event?: EventItem | null;
}

interface GalleryManagerProps {
  items: GalleryItem[];
  events: EventItem[];
}

export function GalleryManager({ items, events }: GalleryManagerProps) {
  const router = useRouter();
  const [itemList, setItemList] = useState<GalleryItem[]>(items);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploadMode, setUploadMode] = useState<"batch" | "single">("batch");
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterEvent, setFilterEvent] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Bulk Edit Bar States
  const [bulkYear, setBulkYear] = useState<number>(new Date().getFullYear());
  const [bulkEventId, setBulkEventId] = useState<string>("");
  const [bulkSyncYearWithEvent, setBulkSyncYearWithEvent] = useState<boolean>(true);

  // Default Event: Current timeline event (upcoming or first event, or matching current year)
  const defaultEvent = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const upcoming = events.find((e) => e.status === "upcoming");
    if (upcoming) return upcoming;
    const thisYear = events.find(
      (e) => e.date && new Date(e.date).getFullYear() === currentYear
    );
    return thisYear || events[0] || null;
  }, [events]);

  useEffect(() => {
    setItemList(items);
  }, [items]);

  // Form states for Single Add
  const [singleForm, setSingleForm] = useState({
    url: "",
    caption: "",
    type: "image",
    year: defaultEvent?.date ? new Date(defaultEvent.date).getFullYear() : new Date().getFullYear(),
    eventId: defaultEvent?.id || "",
    displayOrder: 0,
    isPublished: true,
  });

  // Form states for Batch Upload
  const [batchForm, setBatchForm] = useState({
    eventId: defaultEvent?.id || "",
    year: defaultEvent?.date ? new Date(defaultEvent.date).getFullYear() : new Date().getFullYear(),
    captionPrefix: "",
    isPublished: true,
    files: [] as File[],
  });

  // Unique list of years from items
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    years.add(2026);
    years.add(2025);
    itemList.forEach((item) => {
      if (item.year) years.add(item.year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [itemList]);

  // Filtered items based on search and filters
  const filteredItems = useMemo(() => {
    return itemList.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCaption = item.caption?.toLowerCase().includes(q);
        const matchesEvent = item.event?.name?.toLowerCase().includes(q);
        const matchesUrl = item.url.toLowerCase().includes(q);
        if (!matchesCaption && !matchesEvent && !matchesUrl) return false;
      }

      // Year
      if (filterYear !== "all") {
        if (String(item.year) !== filterYear) return false;
      }

      // Event
      if (filterEvent !== "all") {
        if (filterEvent === "none") {
          if (item.eventId) return false;
        } else if (item.eventId !== filterEvent) {
          return false;
        }
      }

      // Status
      if (filterStatus !== "all") {
        if (filterStatus === "published" && !item.isPublished) return false;
        if (filterStatus === "hidden" && item.isPublished) return false;
      }

      return true;
    });
  }, [itemList, searchQuery, filterYear, filterEvent, filterStatus]);

  // Selection handlers
  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelectedIds(new Set(filteredItems.map((item) => item.id)));
  }

  function deselectAll() {
    setSelectedIds(new Set());
  }

  // ─── Bulk Operations ─────────────────────────────────────────────────────────

  async function handleBulkDelete() {
    const count = selectedIds.size;
    if (count === 0) return;

    const idsToDelete = Array.from(selectedIds);
    const prevItems = itemList;

    // Instant optimistic deletion from UI (0ms)
    setItemList((prev) => prev.filter((item) => !selectedIds.has(item.id)));
    setSelectedIds(new Set());

    // Show bottom notification overlay (no popups)
    setToast({
      message: `${count} media item${count > 1 ? "s" : ""} deleted`,
      type: "success",
      actionLabel: "Undo",
      onAction: () => {
        setItemList(prevItems);
      },
    });

    try {
      const res = await bulkDeleteGalleryItems(idsToDelete);
      if (!res.success) {
        setToast({ message: res.error || "Failed to delete selected items", type: "error" });
        setItemList(prevItems);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to delete selected items", type: "error" });
      setItemList(prevItems);
    }
  }

  async function handleBulkYearChange() {
    const count = selectedIds.size;
    if (count === 0) return;

    const idsToUpdate = Array.from(selectedIds);
    const targetYear = Number(bulkYear);
    const prevItems = itemList;

    // Instant optimistic update (0ms)
    setItemList((prev) =>
      prev.map((item) =>
        selectedIds.has(item.id) ? { ...item, year: targetYear } : item
      )
    );

    setToast({
      message: `Updated year to ${targetYear} for ${count} item${count > 1 ? "s" : ""}`,
      type: "success",
    });

    try {
      const res = await bulkUpdateGalleryItems(idsToUpdate, { year: targetYear });
      if (!res.success) {
        setToast({ message: res.error || "Failed to update year", type: "error" });
        setItemList(prevItems);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to update year", type: "error" });
      setItemList(prevItems);
    }
  }

  async function handleBulkEventChange() {
    const count = selectedIds.size;
    if (count === 0) return;

    const idsToUpdate = Array.from(selectedIds);
    const targetEventId = bulkEventId || null;
    const targetEvent = events.find((e) => e.id === targetEventId) || null;

    let targetYear: number | undefined = undefined;
    if (bulkSyncYearWithEvent && targetEvent?.date) {
      targetYear = new Date(targetEvent.date).getFullYear();
    }

    const prevItems = itemList;

    // Instant optimistic update (0ms)
    setItemList((prev) =>
      prev.map((item) => {
        if (!selectedIds.has(item.id)) return item;
        return {
          ...item,
          eventId: targetEventId,
          event: targetEvent ? { id: targetEvent.id, name: targetEvent.name } : null,
          ...(targetYear !== undefined ? { year: targetYear } : {}),
        };
      })
    );

    setToast({
      message: `Linked ${count} item${count > 1 ? "s" : ""} to ${targetEvent ? targetEvent.name : "General Archive"}`,
      type: "success",
    });

    try {
      const res = await bulkUpdateGalleryItems(idsToUpdate, {
        eventId: targetEventId,
        ...(targetYear !== undefined ? { year: targetYear } : {}),
      });
      if (!res.success) {
        setToast({ message: res.error || "Failed to link items to event", type: "error" });
        setItemList(prevItems);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to link items to event", type: "error" });
      setItemList(prevItems);
    }
  }

  async function handleBulkPublish(isPublished: boolean) {
    const count = selectedIds.size;
    if (count === 0) return;

    const idsToUpdate = Array.from(selectedIds);
    const prevItems = itemList;

    // Instant optimistic update (0ms)
    setItemList((prev) =>
      prev.map((item) =>
        selectedIds.has(item.id) ? { ...item, isPublished } : item
      )
    );

    setToast({
      message: isPublished ? `Published ${count} item${count > 1 ? "s" : ""}` : `Hidden ${count} item${count > 1 ? "s" : ""}`,
      type: "success",
    });

    try {
      const res = await bulkUpdateGalleryItems(idsToUpdate, { isPublished });
      if (!res.success) {
        setToast({ message: res.error || "Failed to update publish state", type: "error" });
        setItemList(prevItems);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to update publish state", type: "error" });
      setItemList(prevItems);
    }
  }

  // ─── Single Item Operations ──────────────────────────────────────────────────

  async function handleTogglePublish(id: string, current: boolean) {
    setItemList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isPublished: !current } : item))
    );
    setToast({
      message: !current ? "Published to public gallery" : "Hidden from public gallery",
      type: "success",
    });

    try {
      const res = await toggleGalleryPublish(id, !current);
      if (!res.success) {
        setToast({ message: res.error || "Failed to update status", type: "error" });
        setItemList(items);
      } else {
        router.refresh();
      }
    } catch {
      setItemList(items);
    }
  }

  async function handleDelete(id: string) {
    const prevItems = itemList;
    setItemList((prev) => prev.filter((item) => item.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    // Show bottom notification overlay (no popups)
    setToast({
      message: "Media item deleted",
      type: "success",
      actionLabel: "Undo",
      onAction: () => {
        setItemList(prevItems);
      },
    });

    try {
      const res = await deleteGalleryItem(id);
      if (!res.success) {
        setToast({ message: res.error || "Failed to delete media item", type: "error" });
        setItemList(prevItems);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to delete media item", type: "error" });
      setItemList(prevItems);
    }
  }

  // ─── Creation Handlers ───────────────────────────────────────────────────────

  async function handleSingleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    fd.append("url", singleForm.url);
    fd.append("caption", singleForm.caption);
    fd.append("type", singleForm.type);
    fd.append("year", String(singleForm.year));
    fd.append("eventId", singleForm.eventId);
    fd.append("displayOrder", String(singleForm.displayOrder));
    fd.append("isPublished", String(singleForm.isPublished));

    const res = await createGalleryItem(fd);
    setLoading(false);

    if (res.success) {
      setShowCreateModal(false);
      setSingleForm({
        url: "",
        caption: "",
        type: "image",
        year: defaultEvent?.date ? new Date(defaultEvent.date).getFullYear() : new Date().getFullYear(),
        eventId: defaultEvent?.id || "",
        displayOrder: 0,
        isPublished: true,
      });
      setToast({ message: "Media item successfully added to gallery", type: "success" });
      router.refresh();
    } else {
      setToast({ message: res.error || "Failed to add media item", type: "error" });
    }
  }

  async function handleBatchUpload(e: React.FormEvent) {
    e.preventDefault();
    if (batchForm.files.length === 0) {
      setToast({ message: "Please select at least one image to upload", type: "error" });
      return;
    }

    setBatchLoading(true);
    setUploadProgress({ current: 0, total: batchForm.files.length });

    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < batchForm.files.length; i++) {
        const file = batchForm.files[i];
        setUploadProgress({ current: i + 1, total: batchForm.files.length });

        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (data.success && data.url) {
          uploadedUrls.push(data.url);
        } else {
          console.error("Upload failed for file:", file.name, data.error);
        }
      }

      if (uploadedUrls.length === 0) {
        setToast({ message: "All file uploads failed. Please verify file formats and try again.", type: "error" });
        setBatchLoading(false);
        setUploadProgress(null);
        return;
      }

      // Bulk create gallery items in database
      const itemsToCreate = uploadedUrls.map((url, idx) => ({
        url,
        caption: batchForm.captionPrefix
          ? `${batchForm.captionPrefix} #${idx + 1}`
          : null,
        type: "image",
        year: Number(batchForm.year),
        eventId: batchForm.eventId || null,
        isPublished: batchForm.isPublished,
      }));

      const res = await bulkCreateGalleryItems(itemsToCreate);
      if (res.success) {
        setShowCreateModal(false);
        const count = itemsToCreate.length;
        setToast({ message: `Successfully uploaded & published ${count} photo${count > 1 ? "s" : ""}`, type: "success" });
        setBatchForm({
          eventId: defaultEvent?.id || "",
          year: defaultEvent?.date ? new Date(defaultEvent.date).getFullYear() : new Date().getFullYear(),
          captionPrefix: "",
          isPublished: true,
          files: [],
        });
        router.refresh();
      } else {
        setToast({ message: res.error || "Failed to register uploaded photos in database", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: "Batch upload error: " + err.message, type: "error" });
    } finally {
      setBatchLoading(false);
      setUploadProgress(null);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Top Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-primary">
            Visual Documentation
          </span>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-white">
            Gallery &amp; Media Archive
          </h1>
          <p className="text-xs text-muted mt-1">
            Manage photo documentation, link to previous year or current timeline events, and batch edit captures.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-full bg-primary text-white font-bold hover:bg-primary/80 transition-all cursor-pointer shadow-[0_0_20px_rgba(200,16,46,0.3)] self-start sm:self-auto"
        >
          + Add / Upload Media
        </button>
      </div>

      {/* ─── Filters & Search Toolbar ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white/[0.02] p-4 rounded-xl border border-white/10 text-xs font-mono">
        {/* Search */}
        <div>
          <label className="block text-[10px] text-muted-foreground uppercase mb-1">Search Captions</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by keyword..."
            className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-primary/50"
          />
        </div>

        {/* Year Filter */}
        <div>
          <label className="block text-[10px] text-muted-foreground uppercase mb-1">Filter by Year</label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-primary/50 cursor-pointer"
          >
            <option value="all">All Timelines (All Years)</option>
            {availableYears.map((yr) => (
              <option key={yr} value={String(yr)}>
                {yr} {yr === new Date().getFullYear() ? "(Current Timeline)" : "(Archive)"}
              </option>
            ))}
          </select>
        </div>

        {/* Event Filter */}
        <div>
          <label className="block text-[10px] text-muted-foreground uppercase mb-1">Filter by Event</label>
          <select
            value={filterEvent}
            onChange={(e) => setFilterEvent(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-primary/50 cursor-pointer"
          >
            <option value="all">All Productions</option>
            <option value="none">General Archive (Unlinked)</option>
            {events.map((ev) => {
              const yr = ev.date ? new Date(ev.date).getFullYear() : "";
              return (
                <option key={ev.id} value={ev.id}>
                  {ev.name} {yr ? `(${yr})` : ""}
                </option>
              );
            })}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[10px] text-muted-foreground uppercase mb-1">Visibility</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-primary/50 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="hidden">Hidden Only</option>
          </select>
        </div>
      </div>

      {/* ─── Selection Stats & Controls ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <button
            onClick={selectedIds.size === filteredItems.length && filteredItems.length > 0 ? deselectAll : selectAllVisible}
            className="px-3 py-1.5 rounded bg-white/[0.05] border border-white/10 text-white hover:bg-white/10 cursor-pointer flex items-center gap-2"
          >
            <input
              type="checkbox"
              readOnly
              checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
              className="cursor-pointer"
            />
            <span>
              {selectedIds.size === filteredItems.length && filteredItems.length > 0
                ? "Deselect All"
                : `Select All (${filteredItems.length})`}
            </span>
          </button>

          {selectedIds.size > 0 && (
            <button
              onClick={deselectAll}
              className="text-muted-foreground hover:text-white underline cursor-pointer text-[11px]"
            >
              Clear Selection
            </button>
          )}
        </div>

        <div className="text-muted-foreground text-[11px]">
          Showing <span className="text-white font-bold">{filteredItems.length}</span> of {itemList.length} items
          {selectedIds.size > 0 && (
            <span className="ml-2 text-primary font-bold">({selectedIds.size} selected)</span>
          )}
        </div>
      </div>

      {/* ─── Sticky Bulk Action Bar ─── */}
      {selectedIds.size > 0 && (
        <div className="sticky top-4 z-40 bg-neutral-900/95 backdrop-blur-md border-2 border-primary/60 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-wrap items-center justify-between gap-4 animate-slide-up">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
              {selectedIds.size}
            </span>
            <span className="font-mono text-xs text-white font-bold">
              Item(s) Selected for Bulk Actions:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* 1. Bulk Connect to Event */}
            <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-lg border border-white/10">
              <select
                value={bulkEventId}
                onChange={(e) => {
                  setBulkEventId(e.target.value);
                  const ev = events.find((item) => item.id === e.target.value);
                  if (ev?.date) {
                    setBulkYear(new Date(ev.date).getFullYear());
                  }
                }}
                className="bg-transparent text-xs font-mono text-white focus:outline-none max-w-[180px] cursor-pointer"
              >
                <option value="" className="bg-neutral-900">General Archive (No Event)</option>
                {events.map((ev) => {
                  const yr = ev.date ? new Date(ev.date).getFullYear() : "";
                  const isCurrent = ev.status === "upcoming" || yr === new Date().getFullYear();
                  return (
                    <option key={ev.id} value={ev.id} className="bg-neutral-900">
                      {ev.name} {yr ? `(${yr})` : ""} {isCurrent ? "★ Current" : "• Previous"}
                    </option>
                  );
                })}
              </select>

              <button
                onClick={handleBulkEventChange}
                className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded bg-primary text-white hover:bg-primary/80 transition-colors cursor-pointer font-bold"
                title="Connect selected items to chosen event"
              >
                Link Event
              </button>
            </div>

            {/* 2. Bulk Change Year */}
            <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-lg border border-white/10">
              <span className="text-[10px] font-mono text-muted-foreground uppercase pl-1">Year:</span>
              <input
                type="number"
                value={bulkYear}
                onChange={(e) => setBulkYear(parseInt(e.target.value, 10) || new Date().getFullYear())}
                className="w-16 bg-transparent text-xs font-mono text-white text-center focus:outline-none"
              />
              <button
                onClick={handleBulkYearChange}
                className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer font-bold"
                title="Update Year for all selected items"
              >
                Set Year
              </button>
            </div>

            {/* 3. Bulk Publish / Hide */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleBulkPublish(true)}
                className="px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-wider rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/80 cursor-pointer"
              >
                Publish All
              </button>
              <button
                onClick={() => handleBulkPublish(false)}
                className="px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-wider rounded bg-white/[0.05] text-muted-foreground border border-white/10 hover:text-white cursor-pointer"
              >
                Hide All
              </button>
            </div>

            {/* 4. Bulk Delete Selected */}
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider rounded bg-red-600 text-white font-bold hover:bg-red-700 transition-colors cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            >
              Delete Selected ({selectedIds.size})
            </button>
          </div>
        </div>
      )}

      {/* ─── Media Items Grid ─── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-white/10 bg-white/[0.02] rounded-2xl font-mono text-xs text-muted space-y-2">
            <p className="text-white font-bold text-sm uppercase">No Media Items Match Your Filters</p>
            <p>Try resetting the search query or year/event filter above.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSelected = selectedIds.has(item.id);

            return (
              <div
                key={item.id}
                className={`group relative border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                  isSelected
                    ? "border-red shadow-[0_0_22px_rgba(200,16,46,0.35)] ring-1 ring-red scale-[1.01] bg-red/[0.04]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:scale-[1.01]"
                }`}
              >
                {/* Image Container with Top Badges & Selection Checkbox */}
                <div className="aspect-video relative bg-black/60 overflow-hidden">
                  {item.url ? (
                    <img
                      src={item.url}
                      alt={item.caption || "Gallery"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-mono text-xs">
                      No Preview
                    </div>
                  )}

                  {/* Multi-Select Animated Button matching Media Library */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(item.id);
                    }}
                    className={`absolute top-2.5 left-2.5 w-6 h-6 rounded-md border flex items-center justify-center transition-all duration-200 z-10 cursor-pointer text-xs font-bold ${
                      isSelected
                        ? "bg-red border-red text-white shadow-md scale-100 ring-2 ring-red/30"
                        : "bg-black/70 border-white/30 text-transparent hover:border-white opacity-0 group-hover:opacity-100 scale-90 hover:scale-100"
                    }`}
                    title={isSelected ? "Deselect item" : "Select item"}
                  >
                    ✓
                  </button>

                  {/* Top Right Status & Year Badge */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-black/80 backdrop-blur-md text-white border border-white/20">
                      {item.year || "—"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                        item.isPublished
                          ? "bg-emerald-950/90 text-emerald-400 border border-emerald-800/60"
                          : "bg-red-950/90 text-red-400 border border-red-900/60"
                      }`}
                    >
                      {item.isPublished ? "Public" : "Hidden"}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-2.5 text-xs font-mono">
                  <p className="text-white font-medium line-clamp-1">
                    {item.caption || "Untitled Media Item"}
                  </p>

                  <div className="flex items-center justify-between text-muted-foreground text-[11px] bg-white/[0.02] p-2 rounded-lg border border-white/[0.05]">
                    <div className="flex items-center gap-1 text-white">
                      <span>◈ Event:</span>
                      <span className="font-bold text-gold line-clamp-1">
                        {item.event?.name || "General Archive"}
                      </span>
                    </div>
                    <span className="text-muted-foreground/70">
                      Year: {item.year || "—"}
                    </span>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                    <ToggleSwitch
                      checked={item.isPublished}
                      onChange={() => handleTogglePublish(item.id, item.isPublished)}
                      size="sm"
                      activeLabel="Public"
                      inactiveLabel="Hidden"
                      ariaLabel={`Publish status for ${item.caption || item.id}`}
                    />

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-[11px] text-red-400 hover:text-red-300 underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── Add / Upload Modal ─── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-white/15 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <div>
                <h3 className="font-display text-2xl text-white font-bold uppercase tracking-wider">
                  Add / Upload Event Media
                </h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Link captures to previous years or current timeline productions
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setBatchLoading(false);
                  setUploadProgress(null);
                }}
                className="text-muted hover:text-white cursor-pointer text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher: Batch Upload vs Single URL */}
            <div className="flex border border-white/10 rounded-lg p-1 bg-white/[0.02]">
              <button
                type="button"
                onClick={() => setUploadMode("batch")}
                className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition-all cursor-pointer ${
                  uploadMode === "batch"
                    ? "bg-primary text-white font-bold shadow-sm"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Batch Multi-Photo Upload (Recommended)
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("single")}
                className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition-all cursor-pointer ${
                  uploadMode === "single"
                    ? "bg-primary text-white font-bold shadow-sm"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Single URL / Photo
              </button>
            </div>

            {/* ─── BATCH UPLOAD FORM ─── */}
            {uploadMode === "batch" && (
              <form onSubmit={handleBatchUpload} className="space-y-4 text-xs font-mono">
                {/* Event & Year selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/10">
                  <div>
                    <label className="block text-white font-bold mb-1 uppercase text-[11px]">
                      Connect to Event (Dropdown) *
                    </label>
                    <select
                      value={batchForm.eventId}
                      onChange={(e) => {
                        const selId = e.target.value;
                        const ev = events.find((item) => item.id === selId);
                        setBatchForm((prev) => ({
                          ...prev,
                          eventId: selId,
                          ...(ev?.date ? { year: new Date(ev.date).getFullYear() } : {}),
                        }));
                      }}
                      className="w-full bg-black/60 border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-primary"
                    >
                      <option value="">General Archive (No Event)</option>
                      {events.map((ev) => {
                        const yr = ev.date ? new Date(ev.date).getFullYear() : "";
                        const isCurrent = ev.status === "upcoming" || yr === new Date().getFullYear();
                        return (
                          <option key={ev.id} value={ev.id}>
                            {ev.name} {yr ? `(${yr})` : ""} {isCurrent ? "— [Current Timeline]" : "— [Previous Year]"}
                          </option>
                        );
                      })}
                    </select>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Select 2025 or 2026 event. Default is current timeline.
                    </p>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-1 uppercase text-[11px]">
                      Timeline Year *
                    </label>
                    <input
                      type="number"
                      required
                      value={batchForm.year}
                      onChange={(e) =>
                        setBatchForm((prev) => ({
                          ...prev,
                          year: parseInt(e.target.value, 10) || new Date().getFullYear(),
                        }))
                      }
                      className="w-full bg-black/60 border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      e.g. 2025 (Previous Year) or 2026 (Current)
                    </p>
                  </div>
                </div>

                {/* Multiple File Input */}
                <div>
                  <label className="block text-white font-bold mb-1 uppercase text-[11px]">
                    Select Photos to Upload (Multiple Allowed) *
                  </label>
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-primary/60 transition-colors bg-white/[0.01]">
                    <input
                      type="file"
                      id="batch-file-input"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          setBatchForm((prev) => ({
                            ...prev,
                            files: Array.from(e.target.files || []),
                          }));
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="batch-file-input"
                      className="cursor-pointer block space-y-2"
                    >
                      <div className="text-2xl">📸</div>
                      <p className="text-white font-bold">
                        Click to select images (JPG, PNG, WebP)
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        Select all photos from your previous event folder at once
                      </p>
                    </label>
                  </div>

                  {batchForm.files.length > 0 && (
                    <div className="mt-2 p-2.5 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-between">
                      <span className="text-primary font-bold text-xs">
                        ✓ {batchForm.files.length} file(s) selected ready to upload
                      </span>
                      <button
                        type="button"
                        onClick={() => setBatchForm((prev) => ({ ...prev, files: [] }))}
                        className="text-[10px] text-muted-foreground hover:text-white underline cursor-pointer"
                      >
                        Clear files
                      </button>
                    </div>
                  )}
                </div>

                {/* Optional Caption Prefix */}
                <div>
                  <label className="block text-muted-foreground mb-1 uppercase text-[11px]">
                    Caption / Tagline (Optional)
                  </label>
                  <input
                    type="text"
                    value={batchForm.captionPrefix}
                    onChange={(e) => setBatchForm({ ...batchForm, captionPrefix: e.target.value })}
                    placeholder="e.g. Nocturnal Atmosphere at Velvt Curse"
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                  />
                </div>

                {/* Publish Checkbox */}
                <div className="flex items-center pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={batchForm.isPublished}
                      onChange={(e) => setBatchForm({ ...batchForm, isPublished: e.target.checked })}
                    />
                    Publish immediately to live public gallery
                  </label>
                </div>

                {/* Live Progress Bar */}
                {batchLoading && uploadProgress && (
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs text-white">
                      <span>Compressing to WebP &amp; Uploading...</span>
                      <span>
                        {uploadProgress.current} / {uploadProgress.total}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{
                          width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    disabled={batchLoading}
                    className="px-4 py-2 text-xs rounded bg-white/[0.05] text-white hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={batchLoading || batchForm.files.length === 0}
                    className="px-5 py-2 text-xs font-bold rounded bg-primary text-white hover:bg-red-700 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(200,16,46,0.3)]"
                  >
                    {batchLoading
                      ? `Uploading (${uploadProgress?.current || 0}/${uploadProgress?.total || 0})...`
                      : `Upload All ${batchForm.files.length} Photo(s)`}
                  </button>
                </div>
              </form>
            )}

            {/* ─── SINGLE URL / PHOTO FORM ─── */}
            {uploadMode === "single" && (
              <form onSubmit={handleSingleCreate} className="space-y-4 text-xs font-mono">
                <ImageUploader
                  value={singleForm.url}
                  onChange={(url) => setSingleForm({ ...singleForm, url })}
                  label="Image / Media Artwork"
                  recommendedText="Upload photography (JPEG, PNG, WebP up to 10MB)"
                  aspectRatio="auto"
                />

                <div>
                  <label className="block text-muted-foreground mb-1">Caption</label>
                  <input
                    type="text"
                    value={singleForm.caption}
                    onChange={(e) => setSingleForm({ ...singleForm, caption: e.target.value })}
                    placeholder="e.g. Stage lighting installation at Velvt Curse"
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground mb-1">Associated Event</label>
                    <select
                      value={singleForm.eventId}
                      onChange={(e) => {
                        const selId = e.target.value;
                        const ev = events.find((item) => item.id === selId);
                        setSingleForm((prev) => ({
                          ...prev,
                          eventId: selId,
                          ...(ev?.date ? { year: new Date(ev.date).getFullYear() } : {}),
                        }));
                      }}
                      className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                    >
                      <option value="">General Archive</option>
                      {events.map((ev) => {
                        const yr = ev.date ? new Date(ev.date).getFullYear() : "";
                        return (
                          <option key={ev.id} value={ev.id}>
                            {ev.name} {yr ? `(${yr})` : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-muted-foreground mb-1">Year</label>
                    <input
                      type="number"
                      value={singleForm.year}
                      onChange={(e) =>
                        setSingleForm({
                          ...singleForm,
                          year: parseInt(e.target.value, 10) || new Date().getFullYear(),
                        })
                      }
                      className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={singleForm.isPublished}
                      onChange={(e) => setSingleForm({ ...singleForm, isPublished: e.target.checked })}
                    />
                    Publish Immediately
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-xs rounded bg-white/[0.05] text-white hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !singleForm.url}
                    className="px-4 py-2 text-xs font-bold rounded bg-primary text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add to Archive"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification Overlay */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
