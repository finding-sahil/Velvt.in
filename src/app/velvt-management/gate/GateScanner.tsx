"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import Link from "next/link";
import { Html5Qrcode } from "html5-qrcode";
import {
  checkInIssuedTicket,
  searchTicketsForGate,
  getRecentGateCheckIns,
  getTicketVerificationData,
} from "@/app/actions";
import { adminPath } from "@/lib/admin-path";

interface GateUser {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedEventId: string | null;
}

interface EventOption {
  id: string;
  name: string;
  slug: string;
  date: string;
  status: string;
  isFeatured: boolean;
}

interface GateScannerProps {
  currentUser: GateUser;
  events: EventOption[];
  initialStats: {
    total: number;
    admitted: number;
    pending: number;
  };
}

interface TicketResult {
  id: string;
  ticketNumber: string;
  securityToken: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string | null;
  tierName: string;
  status: string;
  isCheckedIn: boolean;
  checkedInAt: string | null;
  checkedInBy: string | null;
  notes: string | null;
  event: {
    id: string;
    name: string;
  };
}

interface RecentCheckIn {
  id: string;
  ticketNumber: string;
  securityToken: string;
  attendeeName: string;
  tierName: string;
  checkedInAt: string | null;
  checkedInBy: string | null;
  event: {
    id: string;
    name: string;
  };
}

// ─── Sound Feedback Utilities ────────────────────────────────────────────────

function playAudioChime(isSuccess: boolean) {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (isSuccess) {
      // Pleasant futuristic high dual chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1318.5, ctx.currentTime + 0.08); // E6

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.12);
      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.35);
    } else {
      // Urgent double warning buzz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // Ignore audio errors if context blocked
  }
}

function triggerHaptic(isSuccess: boolean) {
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      if (isSuccess) {
        navigator.vibrate([80, 40, 80]);
      } else {
        navigator.vibrate([250, 100, 250]);
      }
    }
  } catch {
    // Ignore vibration errors
  }
}

// ─── Extract token from any QR payload (URL or raw token) ────────────────────

function extractTicketIdentifier(rawText: string): string {
  const clean = rawText.trim();
  // Check if it's a URL like .../verify/ticket/<identifier>
  const urlMatch = clean.match(/\/verify\/ticket\/([a-zA-Z0-9_-]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  // Check if it's a UUID
  const uuidMatch = clean.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  if (uuidMatch) {
    return uuidMatch[0];
  }
  // Check if it's a ticket serial number (e.g. VLT-2026-XXXXXX)
  const ticketNumMatch = clean.match(/VLT-[0-9]{4}-[A-Z0-9]+/i);
  if (ticketNumMatch) {
    return ticketNumMatch[0].toUpperCase();
  }
  return clean;
}

export function GateScanner({
  currentUser,
  events,
  initialStats,
}: GateScannerProps) {
  const [activeTab, setActiveTab] = useState<"scan" | "search" | "recent">("scan");
  const [isPending, startTransition] = useTransition();

  // Active event selection
  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    if (currentUser.assignedEventId) return currentUser.assignedEventId;
    const featured = events.find((e) => e.isFeatured);
    return featured ? featured.id : events[0]?.id || "";
  });

  // Stats
  const [stats, setStats] = useState(initialStats);

  // Scanner configuration & state
  const [isScannerRunning, setIsScannerRunning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [torchOn, setTorchOn] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoAdmit, setAutoAdmit] = useState(true);

  // Scan Result Overlay
  const [scanResult, setScanResult] = useState<{
    status: "admitted" | "already_checked_in" | "revoked" | "not_found" | "wrong_event" | "confirm_needed" | "error";
    message: string;
    ticket?: any;
  } | null>(null);

  // Manual Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TicketResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Recent Admissions List
  const [recentScans, setRecentScans] = useState<RecentCheckIn[]>([]);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  // ─── Manual Search Handler ──────────────────────────────────────────────────

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchTicketsForGate(query, selectedEventId);
      setSearchResults(results);
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setIsSearching(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch(searchQuery);
      } else if (searchQuery.trim().length === 0) {
        setSearchResults([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Load recent admissions on mount or when tab changes
  useEffect(() => {
    if (activeTab === "recent") {
      getRecentGateCheckIns(selectedEventId).then(setRecentScans);
    }
  }, [activeTab, selectedEventId]);

  // ─── Direct Check-In Execution ──────────────────────────────────────────────

  const executeCheckIn = useCallback(
    async (identifier: string, skipConfirm = false) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      const cleanCode = extractTicketIdentifier(identifier);

      try {
        // If not auto-admit and not confirmed, fetch details first
        if (!autoAdmit && !skipConfirm) {
          const ticketData = await getTicketVerificationData(cleanCode);
          if (!ticketData) {
            setScanResult({
              status: "not_found",
              message: "Pass not found. Unrecognized or invalid QR code.",
            });
            if (soundEnabled) playAudioChime(false);
            triggerHaptic(false);
            return;
          }

          if (ticketData.isCheckedIn) {
            setScanResult({
              status: "already_checked_in",
              message: `Pass ALREADY USED on ${new Date(ticketData.checkedInAt!).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} by ${ticketData.checkedInBy || "Gate Staff"}`,
              ticket: ticketData,
            });
            if (soundEnabled) playAudioChime(false);
            triggerHaptic(false);
            return;
          }

          setScanResult({
            status: "confirm_needed",
            message: "Verify Pass Holder & Admit",
            ticket: ticketData,
          });
          return;
        }

        // Auto-admit or confirmed
        const res = await checkInIssuedTicket(cleanCode, currentUser.name);

        if (res.success && res.ticket) {
          setScanResult({
            status: "admitted",
            message: "ACCESS GRANTED • Attendee Admitted Successfully",
            ticket: res.ticket,
          });

          if (soundEnabled) playAudioChime(true);
          triggerHaptic(true);

          setStats((prev) => ({
            ...prev,
            admitted: prev.admitted + 1,
            pending: Math.max(0, prev.pending - 1),
          }));

          // Add to recent admissions
          setRecentScans((prev) => [
            {
              id: res.ticket.id,
              ticketNumber: res.ticket.ticketNumber,
              securityToken: res.ticket.securityToken,
              attendeeName: res.ticket.attendeeName,
              tierName: res.ticket.tierName,
              checkedInAt: new Date().toISOString(),
              checkedInBy: currentUser.name,
              event: { id: res.ticket.eventId, name: res.ticket.event?.name || "" },
            },
            ...prev.slice(0, 14),
          ]);

          // Update search results if present
          setSearchResults((prev) =>
            prev.map((t) =>
              t.ticketNumber === res.ticket.ticketNumber || t.securityToken === res.ticket.securityToken
                ? {
                    ...t,
                    isCheckedIn: true,
                    checkedInAt: new Date().toISOString(),
                    checkedInBy: currentUser.name,
                  }
                : t
            )
          );

          // Auto-resume scanner after 1.8 seconds if in auto-admit mode
          if (autoAdmit) {
            setTimeout(() => {
              setScanResult(null);
              isProcessingRef.current = false;
            }, 1800);
          }
        } else {
          setScanResult({
            status: (res.status as any) || "error",
            message: res.message || "Failed to admit attendee.",
            ticket: res.ticket,
          });

          if (soundEnabled) playAudioChime(false);
          triggerHaptic(false);
        }
      } catch (err: any) {
        console.error("Gate checkin error:", err);
        setScanResult({
          status: "error",
          message: err?.message || "Check-in failed. Please verify credentials.",
        });
        if (soundEnabled) playAudioChime(false);
        triggerHaptic(false);
      } finally {
        if (!autoAdmit) {
          isProcessingRef.current = false;
        }
      }
    },
    [autoAdmit, currentUser.name, soundEnabled]
  );

  // ─── Camera Scanner Lifecycle ───────────────────────────────────────────────

  const executeCheckInRef = useRef(executeCheckIn);
  useEffect(() => {
    executeCheckInRef.current = executeCheckIn;
  }, [executeCheckIn]);
  const isTransitioningRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (!html5QrCodeRef.current) {
      setIsScannerRunning(false);
      return;
    }
    try {
      if (html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }
    } catch {
      // ignore
    } finally {
      setIsScannerRunning(false);
    }
  }, []);

  const startScanner = useCallback(async () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setCameraError(null);

    try {
      const qrRegionId = "velvt-gate-reader";
      const elem = document.getElementById(qrRegionId);
      if (!elem) return;

      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          try {
            await html5QrCodeRef.current.stop();
          } catch {
            // ignore
          }
        }
      } else {
        html5QrCodeRef.current = new Html5Qrcode(qrRegionId);
      }

      // Try camera enumeration gracefully without failing startup if permission is still pending
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setAvailableCameras(
            devices.map((d) => ({ id: d.id, label: d.label || `Camera ${d.id.slice(0, 5)}` }))
          );
        }
      } catch {
        // Enumerate devices may throw before user grants permission — proceed with start() directly
      }

      // Prioritize environment/back camera
      const cameraConfig = selectedCameraId
        ? { deviceId: { exact: selectedCameraId } }
        : { facingMode: "environment" };

      await html5QrCodeRef.current.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.72);
            return {
              width: qrboxSize,
              height: qrboxSize,
            };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // On QR Code detected!
          if (!isProcessingRef.current) {
            executeCheckInRef.current(decodedText);
          }
        },
        () => {
          // Frame decode pass (silent)
        }
      );

      setIsScannerRunning(true);
    } catch (err: any) {
      if (err?.message?.includes("Cannot clear while scan is ongoing")) {
        setIsScannerRunning(true);
        return;
      }
      console.error("Camera startup error:", err);
      setIsScannerRunning(false);
      setCameraError(
        err?.message ||
          "Unable to access camera. Please allow camera permissions in your browser or type serial code manually below."
      );
    } finally {
      isTransitioningRef.current = false;
    }
  }, [selectedCameraId]);

  // Toggle Torch
  const handleToggleTorch = async () => {
    if (!html5QrCodeRef.current || !isScannerRunning) return;
    try {
      const nextState = !torchOn;
      await html5QrCodeRef.current.applyVideoConstraints({
        advanced: [{ torch: nextState } as any],
      });
      setTorchOn(nextState);
    } catch (err) {
      console.warn("Torch not supported on this device/camera:", err);
    }
  };

  // Start scanner on activeTab change to 'scan'
  useEffect(() => {
    if (activeTab === "scan") {
      const timer = setTimeout(() => {
        startScanner();
      }, 150);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [activeTab, startScanner, stopScanner]);

  return (
    <div className="space-y-6">
      {/* ── Top Station Control Bar ──────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-white/[0.1] shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
              Gate Terminal Online
            </span>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl uppercase tracking-wider text-white mt-0.5">
            VELVT Gate Admission Scanner
          </h1>
          <p className="text-xs text-g5 font-mono">
            Station Operator: <strong className="text-white">{currentUser.name}</strong>
          </p>
        </div>

        {/* Event Scope & Switcher */}
        <div className="flex items-center gap-2">
          {events.length > 1 && !currentUser.assignedEventId ? (
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="px-3 py-1.5 rounded-lg bg-black/80 border border-white/[0.15] text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-g3">
              {events.find((e) => e.id === selectedEventId)?.name || "All Events"}
            </span>
          )}

          {currentUser.role === "admin" && (
            <Link
              href={adminPath("/gatemen")}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-g4 hover:text-white border border-white/[0.1] transition-colors"
            >
              Gate Staff
            </Link>
          )}
        </div>
      </div>

      {/* ── Attendance Gate Ticker ───────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] text-center">
          <div className="text-[10px] font-mono text-g5 uppercase tracking-wider">Total Passes</div>
          <div className="font-heading text-xl sm:text-2xl text-white font-bold mt-0.5">{stats.total}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold">Admitted</div>
          <div className="font-heading text-xl sm:text-2xl text-emerald-300 font-bold mt-0.5">{stats.admitted}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] text-center">
          <div className="text-[10px] font-mono text-g5 uppercase tracking-wider">Pending Arrival</div>
          <div className="font-heading text-xl sm:text-2xl text-g4 font-bold mt-0.5">{stats.pending}</div>
        </div>
      </div>

      {/* ── Primary Mode Selector Tabs ───────────────────────────────── */}
      <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/[0.08]">
        <button
          onClick={() => setActiveTab("scan")}
          className={`flex-1 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "scan"
              ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              : "text-g5 hover:text-white"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <span>Live QR Scanner</span>
        </button>

        <button
          onClick={() => setActiveTab("search")}
          className={`flex-1 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "search"
              ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              : "text-g5 hover:text-white"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Manual Search & Entry</span>
        </button>

        <button
          onClick={() => setActiveTab("recent")}
          className={`flex-1 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "recent"
              ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              : "text-g5 hover:text-white"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Recent Scans ({recentScans.length})</span>
        </button>
      </div>

      {/* ── TAB 1: Live QR Scanner ───────────────────────────────────── */}
      {activeTab === "scan" && (
        <div className="space-y-4">
          {/* Scanner Controls & Toggles Bar */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono">
            <div className="flex items-center gap-4">
              {/* Auto-Admit Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoAdmit}
                  onChange={(e) => setAutoAdmit(e.target.checked)}
                  className="rounded bg-black border-white/20 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span className={autoAdmit ? "text-emerald-400 font-bold" : "text-g5"}>
                  Auto-Admit on Scan
                </span>
              </label>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                  soundEnabled ? "text-emerald-400" : "text-g6"
                }`}
                title="Toggle Beep Sounds"
              >
                <span>{soundEnabled ? "🔊 Sound ON" : "🔇 Muted"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Flashlight button */}
              <button
                type="button"
                onClick={handleToggleTorch}
                disabled={!isScannerRunning}
                className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all cursor-pointer disabled:opacity-30 ${
                  torchOn
                    ? "bg-amber-400 text-black border-amber-300 font-bold shadow-[0_0_10px_#f59e0b]"
                    : "bg-white/[0.06] text-g4 hover:text-white border-white/[0.1]"
                }`}
              >
                🔦 {torchOn ? "Torch ON" : "Torch"}
              </button>

              {/* Camera switcher if multiple cameras */}
              {availableCameras.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const nextIndex =
                      (availableCameras.findIndex((c) => c.id === selectedCameraId) + 1) %
                      availableCameras.length;
                    setSelectedCameraId(availableCameras[nextIndex]?.id || "");
                    stopScanner().then(() => startScanner());
                  }}
                  className="px-2.5 py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] text-g4 hover:text-white border border-white/[0.1] text-[11px] font-mono cursor-pointer"
                >
                  🔄 Switch Lens
                </button>
              )}
            </div>
          </div>

          {/* Scanner Viewfinder Box */}
          <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-white/[0.15] shadow-2xl aspect-square max-w-md mx-auto flex items-center justify-center">
            {/* HTML5 QR Container */}
            <div id="velvt-gate-reader" className="w-full h-full object-cover" />

            {/* Laser scanning beam animation */}
            {isScannerRunning && !scanResult && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col justify-center items-center">
                {/* Visual reticle box */}
                <div className="w-[72%] h-[72%] border-2 border-emerald-500/40 rounded-2xl relative shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                  {/* Glowing Corner Accents */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                  {/* Animated laser line */}
                  <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-scanner-laser" />
                </div>

                <div className="absolute bottom-6 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
                  Align Pass QR in Frame
                </div>
              </div>
            )}

            {/* Error Overlay */}
            {cameraError && (
              <div className="absolute inset-0 bg-black/95 p-6 flex flex-col items-center justify-center text-center space-y-4 z-20">
                <div className="w-12 h-12 rounded-full bg-red/20 border border-red flex items-center justify-center text-red">
                  ⚠️
                </div>
                <h3 className="font-heading text-lg uppercase text-white">Camera Access Required</h3>
                <p className="text-xs text-g5 font-mono max-w-sm leading-relaxed">
                  {cameraError.includes("Permission") || cameraError.includes("NotAllowed")
                    ? "Camera permission was denied. Click the lock or camera icon in your browser address bar to allow camera access, or switch to manual serial code entry."
                    : cameraError}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={startScanner}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Retry Camera
                  </button>
                  <button
                    onClick={() => setActiveTab("search")}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Type Serial Code &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* ── Scan Result Feedback Overlay ───────────────────────── */}
            {scanResult && (
              <div
                className={`absolute inset-0 p-6 flex flex-col items-center justify-center text-center z-30 animate-fade-in backdrop-blur-md ${
                  scanResult.status === "admitted"
                    ? "bg-emerald-950/90 border-4 border-emerald-400 shadow-[0_0_60px_rgba(16,185,129,0.5)]"
                    : scanResult.status === "already_checked_in"
                    ? "bg-amber-950/95 border-4 border-amber-400 shadow-[0_0_60px_rgba(245,158,11,0.5)]"
                    : scanResult.status === "confirm_needed"
                    ? "bg-black/95 border-2 border-white/30"
                    : "bg-red-950/95 border-4 border-red shadow-[0_0_60px_rgba(200,16,46,0.5)]"
                }`}
              >
                {/* Result Status Icon */}
                <div className="mb-3">
                  {scanResult.status === "admitted" ? (
                    <div className="w-16 h-16 rounded-full bg-emerald-500 text-black flex items-center justify-center mx-auto shadow-[0_0_30px_#10b981] animate-bounce">
                      <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : scanResult.status === "already_checked_in" ? (
                    <div className="w-16 h-16 rounded-full bg-amber-500 text-black flex items-center justify-center mx-auto shadow-[0_0_30px_#f59e0b] animate-pulse">
                      <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  ) : scanResult.status === "confirm_needed" ? (
                    <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-red text-white flex items-center justify-center mx-auto shadow-[0_0_30px_#c8102e]">
                      <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Status Heading */}
                <h2 className="font-heading text-2xl uppercase tracking-wider text-white font-bold">
                  {scanResult.status === "admitted"
                    ? "ACCESS GRANTED"
                    : scanResult.status === "already_checked_in"
                    ? "ALREADY SCANNED"
                    : scanResult.status === "confirm_needed"
                    ? "VERIFY TICKET"
                    : "ENTRY DENIED"}
                </h2>

                <p className="text-xs font-mono text-white/80 mt-1 max-w-xs">
                  {scanResult.message}
                </p>

                {/* Attendee Details Card */}
                {scanResult.ticket && (
                  <div className="mt-3 p-3.5 rounded-xl bg-black/70 border border-white/20 w-full text-left font-mono text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-g5 text-[10px] uppercase">Tier</span>
                      <span className="px-2 py-0.5 rounded bg-red-dim border border-red-glow text-white font-bold uppercase text-[10px]">
                        {scanResult.ticket.tierName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-g5 uppercase block">Attendee</span>
                      <strong className="text-white text-sm uppercase tracking-wide block">
                        {scanResult.ticket.attendeeName}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
                      <span className="text-g4">{scanResult.ticket.ticketNumber}</span>
                      <span className="text-g5 truncate max-w-[140px]">{scanResult.ticket.attendeeEmail}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2 w-full">
                  {scanResult.status === "confirm_needed" ? (
                    <>
                      <button
                        onClick={() => {
                          setScanResult(null);
                          isProcessingRef.current = false;
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-white/10 text-g4 hover:text-white text-xs font-mono uppercase font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => executeCheckIn(scanResult.ticket.securityToken, true)}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono uppercase font-bold cursor-pointer shadow-[0_0_20px_#10b981]"
                      >
                        Admit & Give Entry
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setScanResult(null);
                        isProcessingRef.current = false;
                      }}
                      className="w-full py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-mono uppercase font-bold tracking-wider cursor-pointer"
                    >
                      Scan Next Pass ↵
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Manual Entry Strip right below camera */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] max-w-md mx-auto">
            <div className="text-[10px] font-mono text-g5 uppercase tracking-wider mb-1.5">
              Quick Code Entry (if screen is dim or damaged)
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.currentTarget.elements.namedItem("quickCode") as HTMLInputElement).value;
                if (input.trim()) {
                  executeCheckIn(input.trim());
                  (e.currentTarget.elements.namedItem("quickCode") as HTMLInputElement).value = "";
                }
              }}
              className="flex gap-2"
            >
              <input
                name="quickCode"
                type="text"
                placeholder="Type VLT-2026-XXXXXX or token..."
                className="w-full px-3 py-2 bg-black/60 border border-white/[0.12] rounded-lg text-xs font-mono text-white placeholder-g6 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-lg shrink-0 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              >
                Admit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB 2: Manual Search & Entry ─────────────────────────────── */}
      {activeTab === "search" && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-g4 block">
              Search Guestlist by Name, Phone, Email, or Serial Number
            </label>
            <div className="relative">
              <svg
                className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-g5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                autoFocus
                placeholder="Type attendee name (e.g. Sahil), phone, email, or serial..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-black/70 border border-white/[0.15] rounded-xl text-sm font-mono text-white placeholder-g6 focus:outline-none focus:border-emerald-500 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
              />
              {isSearching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-emerald-400 animate-pulse">
                  Searching...
                </div>
              )}
            </div>
          </div>

          {/* Search Results List */}
          <div className="space-y-3">
            {searchResults.length === 0 ? (
              <div className="py-16 text-center text-g5 font-mono text-xs rounded-xl border border-white/[0.06] bg-white/[0.01]">
                {searchQuery.trim().length >= 2
                  ? "No passes found matching your search. Double check spelling or serial number."
                  : "Type at least 2 characters to search the live event guestlist."}
              </div>
            ) : (
              searchResults.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    ticket.isCheckedIn
                      ? "bg-[#0d0c07] border-amber-500/30"
                      : "bg-white/[0.02] border-white/[0.1] hover:border-emerald-500/40"
                  }`}
                >
                  <div className="space-y-1 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-dim border border-red-glow text-white">
                        {ticket.tierName}
                      </span>
                      <span className="text-xs text-g4 font-bold">{ticket.ticketNumber}</span>
                      {ticket.isCheckedIn && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Already Admitted
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading text-lg text-white tracking-wide uppercase font-bold">
                      {ticket.attendeeName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-g4">
                      <span>✉ {ticket.attendeeEmail}</span>
                      {ticket.attendeePhone && <span>📞 {ticket.attendeePhone}</span>}
                    </div>

                    {ticket.isCheckedIn && (
                      <div className="text-[11px] text-amber-300/80 pt-1">
                        Checked in at{" "}
                        <strong className="text-white">
                          {ticket.checkedInAt
                            ? new Date(ticket.checkedInAt).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "earlier"}
                        </strong>
                        {ticket.checkedInBy ? ` by ${ticket.checkedInBy}` : ""}
                      </div>
                    )}
                  </div>

                  <div>
                    {!ticket.isCheckedIn ? (
                      <button
                        onClick={() => executeCheckIn(ticket.securityToken, true)}
                        disabled={isPending}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Admit & Give Entry</span>
                      </button>
                    ) : (
                      <div className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-mono font-bold border border-amber-500/20 text-center">
                        Pass Verified
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: Recent Admissions ─────────────────────────────────── */}
      {activeTab === "recent" && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-mono text-g5 px-1">
            <span>Last 15 admissions at this gate terminal</span>
            <button
              onClick={() => getRecentGateCheckIns(selectedEventId).then(setRecentScans)}
              className="text-emerald-400 hover:underline cursor-pointer"
            >
              ↻ Refresh Feed
            </button>
          </div>

          {recentScans.length === 0 ? (
            <div className="py-16 text-center text-g5 font-mono text-xs rounded-xl border border-white/[0.06] bg-white/[0.01]">
              No admissions logged yet today. Scan a ticket to start admission feed.
            </div>
          ) : (
            recentScans.map((scan, idx) => (
              <div
                key={scan.id + idx}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between font-mono text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-white font-bold">{scan.attendeeName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-g3">
                      {scan.tierName}
                    </span>
                  </div>
                  <div className="text-[11px] text-g5">
                    {scan.ticketNumber} &bull; Admitted by {scan.checkedInBy || "Gate Staff"}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-emerald-400 font-bold">
                    {scan.checkedInAt
                      ? new Date(scan.checkedInAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "Just now"}
                  </div>
                  <span className="text-[10px] text-g5">Verified</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
