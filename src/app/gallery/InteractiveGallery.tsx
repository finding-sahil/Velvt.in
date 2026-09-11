"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";

interface GalleryItemType {
  id: string;
  url: string;
  caption: string | null;
  type: string;
  year: number | null;
  displayOrder: number;
  event: {
    name: string;
  } | null;
}

interface InteractiveGalleryProps {
  items: GalleryItemType[];
}

const CATEGORIES = [
  { id: "all", label: "All Visuals" },
  { id: "curse", label: "Curse 2.O" },
  { id: "atmosphere", label: "Atmosphere & Light" },
  { id: "crowd", label: "Crowd & Energy" },
  { id: "dia", label: "Dia de los Muertos" },
  { id: "creators", label: "Photographer Captures" },
];

export function InteractiveGallery({ items }: InteractiveGalleryProps) {
  const [selectedTimeline, setSelectedTimeline] = useState<string>("current");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(24);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filter items based on timeline, category and search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const caption = (item.caption || "").toLowerCase();
      const url = item.url.toLowerCase();
      const eventName = (item.event?.name || "").toLowerCase();

      // Timeline filter (default: current timeline, e.g. 2026)
      if (selectedTimeline === "current") {
        if (item.year && item.year !== 2026) return false;
      } else if (selectedTimeline !== "all") {
        if (String(item.year) !== selectedTimeline) return false;
      }

      // Category filter
      let matchesCategory = true;
      if (activeCategory === "curse") {
        matchesCategory = eventName.includes("curse") || caption.includes("curse");
      } else if (activeCategory === "atmosphere") {
        matchesCategory =
          caption.includes("atmosphere") ||
          caption.includes("light") ||
          caption.includes("sculpture") ||
          caption.includes("shadow") ||
          caption.includes("aura") ||
          caption.includes("resonance");
      } else if (activeCategory === "crowd") {
        matchesCategory =
          caption.includes("crowd") ||
          caption.includes("cadence") ||
          caption.includes("energy") ||
          caption.includes("rhythm") ||
          caption.includes("kinetic");
      } else if (activeCategory === "dia") {
        matchesCategory = caption.includes("dia de los muertos") || url.includes("dia-de-los-muertos");
      } else if (activeCategory === "creators") {
        matchesCategory = caption.includes("captured by @");
      }

      // Search filter
      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        matchesSearch =
          caption.includes(q) ||
          url.includes(q) ||
          eventName.includes(q);
      }

      return matchesCategory && matchesSearch;
    });
  }, [items, selectedTimeline, activeCategory, searchQuery]);

  // Reset pagination when filter changes
  useEffect(() => {
    setVisibleCount(24);
  }, [selectedTimeline, activeCategory, searchQuery]);

  // Lightbox keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;

      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1
        );
      }
    },
    [lightboxIndex, filteredItems.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown, lightboxIndex]);

  const activeLightboxItem =
    lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <div className="space-y-8">
      {/* ─── Timeline Archive Filter (Default: Current Timeline) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.08] p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-muted uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Timeline Archive:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/10">
          <button
            onClick={() => setSelectedTimeline("current")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              selectedTimeline === "current"
                ? "bg-primary text-white font-bold shadow-[0_0_15px_rgba(200,16,46,0.35)]"
                : "text-white/70 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            ● Current Timeline (2026)
          </button>
          <button
            onClick={() => setSelectedTimeline("2025")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              selectedTimeline === "2025"
                ? "bg-primary text-white font-bold shadow-[0_0_15px_rgba(200,16,46,0.35)]"
                : "text-white/70 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            2025 Archive
          </button>
          <button
            onClick={() => setSelectedTimeline("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              selectedTimeline === "all"
                ? "bg-primary text-white font-bold shadow-[0_0_15px_rgba(200,16,46,0.35)]"
                : "text-white/70 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            All Archives
          </button>
        </div>
      </div>

      {/* ─── Filter & Search Controls ─── */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-b border-white/10 pb-6">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 min-h-[44px] flex items-center ${
                  isActive
                    ? "bg-primary text-white border border-red-glow shadow-[0_0_15px_rgba(200,16,46,0.35)]"
                    : "bg-white/[0.04] text-white/70 hover:text-white border border-white/10 hover:border-white/25 hover:bg-white/[0.08]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search captures, artists..."
            className="w-full bg-white/[0.04] border border-white/10 focus:border-primary/60 rounded-full px-4 py-2.5 pl-10 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
          />
          <svg
            className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs font-mono"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* ─── Results Counter ─── */}
      <div className="flex items-center justify-between text-xs font-mono text-muted tracking-widest uppercase">
        <span>
          Showing {Math.min(visibleCount, filteredItems.length)} of {filteredItems.length} Visuals
        </span>
        <span className="text-primary font-bold">{items.length} Master WebP Assets</span>
      </div>

      {/* ─── Visual Grid ─── */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
          <p className="text-white/60 font-mono text-sm">No captures matched your filter.</p>
          <button
            onClick={() => {
              setSelectedTimeline("current");
              setActiveCategory("all");
              setSearchQuery("");
            }}
            className="mt-4 text-xs font-mono text-primary underline underline-offset-4 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.slice(0, visibleCount).map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setLightboxIndex(idx)}
              className="group relative overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.03] backdrop-blur-[12px] aspect-[4/5] cursor-pointer transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(200,16,46,0.25)] hover:-translate-y-1"
            >
              {/* Responsive Image with WebP */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={item.url}
                  alt={item.caption || "VELVT visual capture"}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

              {/* Crimson Accent */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-primary/30 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Zoom pill badge */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/20 text-white">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </div>

              {/* Caption Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                {item.event?.name && (
                  <span className="inline-block self-start text-[9px] font-mono tracking-widest uppercase text-white/90 px-2.5 py-0.5 rounded-full border border-red-glow/60 bg-red-dim/80 mb-1.5 font-medium">
                    {item.event.name}
                  </span>
                )}
                {item.caption && (
                  <h3 className="font-display font-semibold text-sm text-white tracking-tight leading-snug line-clamp-2">
                    {item.caption}
                  </h3>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Load More Button ─── */}
      {visibleCount < filteredItems.length && (
        <div className="pt-6 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 24)}
            className="px-8 py-3.5 rounded-full bg-white/[0.05] border border-white/15 hover:border-primary/60 hover:bg-primary/20 text-xs font-mono uppercase tracking-widest text-white transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.4)] min-h-[44px]"
          >
            Load More Visuals ({filteredItems.length - visibleCount} remaining) &darr;
          </button>
        </div>
      )}

      {/* ─── Lightbox Modal ─── */}
      {activeLightboxItem && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8 animate-fadeIn"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Modal Container */}
          <div
            className="relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar: Counter & Close */}
            <div className="w-full flex items-center justify-between pb-3 text-white/80">
              <span className="text-xs font-mono tracking-widest uppercase">
                Capture {lightboxIndex + 1} of {filteredItems.length}
              </span>
              <button
                onClick={() => setLightboxIndex(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Main Image View */}
            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/60 shadow-[0_0_50px_rgba(200,16,46,0.3)] max-h-[75vh] flex items-center justify-center">
              <img
                src={activeLightboxItem.url}
                alt={activeLightboxItem.caption || "Enlarged capture"}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />

              {/* Prev / Next navigation buttons */}
              <button
                onClick={() =>
                  setLightboxIndex((prev) =>
                    prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-primary/80 text-white border border-white/20 min-h-[44px] min-w-[44px] flex items-center justify-center transition-all"
                aria-label="Previous image"
              >
                &larr;
              </button>
              <button
                onClick={() =>
                  setLightboxIndex((prev) =>
                    prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-primary/80 text-white border border-white/20 min-h-[44px] min-w-[44px] flex items-center justify-center transition-all"
                aria-label="Next image"
              >
                &rarr;
              </button>
            </div>

            {/* Bottom Caption */}
            <div className="w-full pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-white">
              <div>
                <p className="font-display font-semibold text-lg tracking-tight">
                  {activeLightboxItem.caption || "VELVT Visual Archive"}
                </p>
                {activeLightboxItem.event?.name && (
                  <p className="text-xs font-mono text-primary uppercase tracking-widest mt-0.5">
                    {activeLightboxItem.event.name}
                  </p>
                )}
              </div>
              <a
                href={activeLightboxItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono uppercase tracking-widest px-4 py-2 rounded-full border border-white/20 hover:border-primary hover:bg-primary/20 transition-all text-white/80 hover:text-white"
              >
                Open Full Res &nearr;
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
