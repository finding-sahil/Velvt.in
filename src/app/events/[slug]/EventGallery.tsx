"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface GalleryItem {
  id: string;
  url: string;
  caption: string | null;
  type: string;
  year?: number | null;
}

interface EventGalleryProps {
  items: GalleryItem[];
  eventName: string;
}

export function EventGallery({ items, eventName }: EventGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight")
        setLightboxIndex((prev) => (prev !== null && prev < items.length - 1 ? prev + 1 : 0));
      if (e.key === "ArrowLeft")
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : items.length - 1));
    },
    [lightboxIndex, items.length]
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

  const activeItem = lightboxIndex !== null ? items[lightboxIndex] : null;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => setLightboxIndex(idx)}
            className="group relative aspect-[4/5] rounded-[16px] overflow-hidden border border-white/10 bg-white/[0.02] cursor-pointer hover:border-primary/50 hover:shadow-[0_0_25px_rgba(200,16,46,0.25)] transition-all duration-300"
          >
            <img
              src={item.url}
              alt={item.caption || `${eventName} capture`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
            
            {/* Hover expand badge */}
            <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </div>

            {item.caption && (
              <div className="absolute inset-x-0 bottom-0 p-3.5">
                <p className="text-xs text-white/90 font-display font-medium line-clamp-2 leading-snug">
                  {item.caption}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/[0.04] border border-white/15 hover:border-primary/50 hover:bg-primary/10 text-xs font-mono uppercase tracking-widest text-white transition-all"
        >
          Explore All Visual Archives &rarr;
        </Link>
      </div>

      {/* Lightbox Modal */}
      {activeItem && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md p-4 sm:p-8"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between pb-3 text-white/80 text-xs font-mono uppercase tracking-wider">
              <span>
                {eventName} &bull; Visual {lightboxIndex + 1} of {items.length}
              </span>
              <button
                onClick={() => setLightboxIndex(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Main Image */}
            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/60 shadow-[0_0_50px_rgba(200,16,46,0.3)] max-h-[75vh] flex items-center justify-center">
              <img
                src={activeItem.url}
                alt={activeItem.caption || "Enlarged visual"}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />

              <button
                onClick={() =>
                  setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : items.length - 1))
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-primary text-white border border-white/20 cursor-pointer transition-all"
              >
                &larr;
              </button>
              <button
                onClick={() =>
                  setLightboxIndex((prev) => (prev !== null && prev < items.length - 1 ? prev + 1 : 0))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-primary text-white border border-white/20 cursor-pointer transition-all"
              >
                &rarr;
              </button>
            </div>

            {/* Bottom Caption & Link */}
            <div className="w-full pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-white">
              <p className="font-display font-medium text-base text-white">
                {activeItem.caption || `${eventName} Official Capture`}
              </p>
              <a
                href={activeItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono uppercase tracking-widest px-4 py-2 rounded-full border border-white/20 hover:border-primary hover:bg-primary/20 text-white/80 hover:text-white transition-all"
              >
                Open Full Resolution ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
