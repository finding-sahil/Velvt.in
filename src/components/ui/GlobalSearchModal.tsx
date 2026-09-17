"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { performGlobalSearch } from "@/app/actions";

interface SearchResults {
  events: Array<{
    id: string;
    name: string;
    slug: string;
    date: Date;
    status: string;
    coverImage: string | null;
  }>;
  team: Array<{
    id: string;
    name: string;
    role: string;
    portrait: string | null;
    category: string;
  }>;
  press: Array<{
    id: string;
    title: string;
    publication: string;
    url: string | null;
  }>;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
    event: { slug: string; name: string } | null;
  }>;
}

export function GlobalSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Listen for Cmd+K / Ctrl+K and custom event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-global-search", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-global-search", handleCustomOpen);
    };
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Debounced live search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const res = await performGlobalSearch(query);
        setResults(res);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  if (!isOpen) return null;

  const totalResults =
    (results?.events?.length || 0) +
    (results?.team?.length || 0) +
    (results?.press?.length || 0) +
    (results?.faqs?.length || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global site search"
        className="relative w-full max-w-2xl bg-[#09090b] border border-white/15 rounded-2xl shadow-[0_16px_70px_rgba(0,0,0,0.9)] overflow-hidden z-10 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] gap-3">
          <svg
            className="w-5 h-5 text-g5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            role="searchbox"
            aria-label="Search events, artists, stories, passes, FAQs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, artists, stories, passes, FAQs..."
            className="flex-1 bg-transparent text-sm sm:text-base font-sans text-white placeholder-g5 focus:outline-none"
          />

          {isPending && (
            <svg className="animate-spin h-4 w-4 text-red shrink-0" viewBox="0 0 24 24" aria-label="Loading search results">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close search"
            className="sm:hidden p-1.5 text-g5 hover:text-white transition-colors rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded border border-white/10 bg-white/[0.04] text-[10px] font-mono text-g5 uppercase">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5 no-scrollbar">
          {query.trim().length >= 2 && results && totalResults === 0 && !isPending && (
            <div className="py-12 text-center text-g5 font-mono text-xs">
              No results found for &ldquo;<span className="text-white">{query}</span>&rdquo;.
            </div>
          )}

          {(!query || query.trim().length < 2) && (
            <div className="py-8 px-2 space-y-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-g5 font-bold">
                Quick Navigation
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "Upcoming Events", href: "/events" },
                  { label: "Founder's Story", href: "/founder" },
                  { label: "Sponsorship Deck", href: "/sponsors" },
                  { label: "Volunteer Crew", href: "/volunteers" },
                ].map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleSelect(item.href)}
                    className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-left text-xs font-mono text-g5 hover:text-white transition-all cursor-pointer"
                  >
                    {item.label} →
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Events Results */}
          {results?.events && results.events.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-red font-bold px-2">
                Events & Chapters ({results.events.length})
              </p>
              <div className="space-y-1">
                {results.events.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => handleSelect(`/events/${evt.slug}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-red/10 border border-white/5 hover:border-red/30 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-white/5 relative overflow-hidden shrink-0 border border-white/10">
                        {evt.coverImage ? (
                          <Image
                            src={evt.coverImage}
                            alt={evt.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-display font-black text-red text-xs">
                            V
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-display font-bold uppercase text-white truncate group-hover:text-red transition-colors">
                          {evt.name}
                        </p>
                        <p className="text-[10px] font-mono text-g5">
                          {new Date(evt.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-g5 shrink-0">
                      {evt.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Team Members */}
          {results?.team && results.team.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold px-2">
                Core Team & Visionaries ({results.team.length})
              </p>
              <div className="space-y-1">
                {results.team.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleSelect(`/team/${member.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-white/5 relative overflow-hidden shrink-0 border border-white/10">
                        {member.portrait ? (
                          <Image
                            src={member.portrait}
                            alt={member.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-display font-bold text-g5 text-xs">
                            {member.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-display font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                          {member.name}
                        </p>
                        <p className="text-[10px] font-mono text-g5 truncate">
                          {member.role}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono uppercase text-g5 shrink-0">
                      {member.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Press / Stories */}
          {results?.press && results.press.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold px-2">
                Press & Media ({results.press.length})
              </p>
              <div className="space-y-1">
                {results.press.map((p) => (
                  <a
                    key={p.id}
                    href={p.url || "/press"}
                    target={p.url ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/30 transition-all text-left group cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-sans text-white truncate group-hover:text-purple-300 transition-colors font-medium">
                        {p.title}
                      </p>
                      <p className="text-[10px] font-mono text-g5">
                        {p.publication}
                      </p>
                    </div>
                    <span className="text-xs text-g5 group-hover:text-white shrink-0">
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* FAQs */}
          {results?.faqs && results.faqs.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold px-2">
                FAQs & Guidelines ({results.faqs.length})
              </p>
              <div className="space-y-1">
                {results.faqs.map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() =>
                      handleSelect(
                        faq.event?.slug ? `/events/${faq.event.slug}#faqs` : "/events"
                      )
                    }
                    className="w-full p-2.5 rounded-xl bg-white/[0.02] hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 transition-all text-left group cursor-pointer"
                  >
                    <p className="text-xs font-sans text-white font-medium group-hover:text-amber-300 transition-colors">
                      {faq.question}
                    </p>
                    <p className="text-[10px] font-mono text-g5 line-clamp-1 mt-0.5">
                      {faq.answer}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-white/[0.08] bg-black/60 flex items-center justify-between text-[10px] font-mono text-g5">
          <span>Navigate with ↵ or click</span>
          <span>VELVT Global Index</span>
        </div>
      </div>
    </div>
  );
}

export function GlobalSearchTrigger({ className = "" }: { className?: string }) {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("open-global-search"));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Open global search"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-xs font-mono text-g5 hover:text-white transition-all cursor-pointer ${className}`}
    >
      <svg
        className="w-3.5 h-3.5 text-g5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" strokeWidth="2" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
      </svg>
      <span className="hidden lg:inline text-[11px]">Search</span>
      <kbd className="hidden sm:inline-block text-[9px] px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-g5">
        ⌘K
      </kbd>
    </button>
  );
}
