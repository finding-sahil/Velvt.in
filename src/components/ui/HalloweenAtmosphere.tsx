"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  fadeSpeed: number;
  color: string;
}

export function HalloweenAtmosphere() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isAdmin = pathname?.startsWith("/velvt-management");
  const [currentTheme, setCurrentTheme] = useState<string>("legacy");

  // Track active theme dynamically from html[data-theme] and events
  useEffect(() => {
    const updateTheme = () => {
      const themeAttr = document.documentElement.getAttribute("data-theme") || "legacy";
      setCurrentTheme(themeAttr);
    };

    updateTheme();

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setCurrentTheme(customEvent.detail);
      } else {
        updateTheme();
      }
    };

    window.addEventListener("velvt-theme-change", handleThemeChange);

    // MutationObserver to watch html[data-theme] changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
          updateTheme();
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      window.removeEventListener("velvt-theme-change", handleThemeChange);
      observer.disconnect();
    };
  }, []);

  const isHalloweenActive = !isAdmin && currentTheme !== "legacy" && currentTheme !== "velvt2";

  useEffect(() => {
    if (!isHalloweenActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Palette dynamically adapts to the current theme
    let colors = [
      "rgba(220, 38, 38,",   // Crimson
      "rgba(180, 20, 30,",   // Dark arterial
      "rgba(255, 60, 60,",   // Spark
    ];

    if (currentTheme === "halloween_pumpkin") {
      colors = [
        "rgba(255, 107, 0,",   // Burnt pumpkin
        "rgba(245, 158, 11,",  // Candleglow amber
        "rgba(234, 88, 12,",   // Harvest flame
      ];
    } else if (currentTheme === "phantom_ghost") {
      colors = [
        "rgba(0, 255, 157,",   // Spectral neon
        "rgba(6, 182, 212,",   // Cyan ectoplasm
        "rgba(16, 185, 129,",  // Emerald mist
      ];
    } else if (currentTheme === "witch_coven") {
      colors = [
        "rgba(168, 85, 247,",  // Poison violet
        "rgba(192, 132, 252,", // Amethyst flame
        "rgba(126, 34, 206,",  // Occult purple
      ];
    } else if (currentTheme === "halloween_mix") {
      colors = [
        "rgba(220, 38, 38,",
        "rgba(245, 158, 11,",
        "rgba(168, 85, 247,",
      ];
    }

    const particleCount = Math.min(24, Math.floor(width / 55));
    const particles: Particle[] = [];

    function createParticle(resetToBottom = false): Particle {
      return {
        x: Math.random() * width,
        y: resetToBottom ? height + Math.random() * 20 : Math.random() * height,
        size: Math.random() * 2.0 + 0.6,
        speedY: -(Math.random() * 0.5 + 0.25),
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.6 + 0.15,
        fadeSpeed: Math.random() * 0.005 + 0.002,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(false));
    }

    let isDocumentVisible = true;
    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const render = () => {
      if (isDocumentVisible) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(p.y * 0.008) * 0.25;
          p.opacity -= p.fadeSpeed;

          if (p.opacity <= 0 || p.y < -10) {
            particles[i] = createParticle(true);
            continue;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color} ${p.opacity})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isHalloweenActive, currentTheme]);

  // Strictly return null for legacy or admin (100% untouched VELVT)
  if (!isHalloweenActive) return null;

  return (
    <>
      {/* Editorial Floating Atmospheric Particles */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[2] opacity-50 transition-opacity duration-700"
      />

      {/* Hairline Editorial Gothic Corner Cobwebs (Top Left & Top Right) */}
      <div
        className="editorial-corner-web fixed top-0 left-0 w-36 h-36 sm:w-48 sm:h-48 pointer-events-none z-[3]"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-white fill-none stroke-current opacity-30 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]"
          style={{ strokeWidth: "0.55" }}
        >
          {/* Main radial anchor lines */}
          <line x1="0" y1="0" x2="100" y2="0" />
          <line x1="0" y1="0" x2="92" y2="38" />
          <line x1="0" y1="0" x2="70" y2="70" />
          <line x1="0" y1="0" x2="38" y2="92" />
          <line x1="0" y1="0" x2="0" y2="100" />
          {/* Concentric curved connecting threads */}
          <path d="M 22 0 Q 20 8 18 18 Q 8 20 0 22" />
          <path d="M 44 0 Q 40 16 34 34 Q 16 40 0 44" />
          <path d="M 68 0 Q 60 25 50 50 Q 25 60 0 68" />
          <path d="M 94 0 Q 82 35 68 68 Q 35 82 0 94" />
        </svg>
      </div>

      <div
        className="editorial-corner-web fixed top-0 right-0 w-36 h-36 sm:w-48 sm:h-48 pointer-events-none z-[3] -scale-x-100"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-white fill-none stroke-current opacity-30 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]"
          style={{ strokeWidth: "0.55" }}
        >
          <line x1="0" y1="0" x2="100" y2="0" />
          <line x1="0" y1="0" x2="92" y2="38" />
          <line x1="0" y1="0" x2="70" y2="70" />
          <line x1="0" y1="0" x2="38" y2="92" />
          <line x1="0" y1="0" x2="0" y2="100" />
          <path d="M 22 0 Q 20 8 18 18 Q 8 20 0 22" />
          <path d="M 44 0 Q 40 16 34 34 Q 16 40 0 44" />
          <path d="M 68 0 Q 60 25 50 50 Q 25 60 0 68" />
          <path d="M 94 0 Q 82 35 68 68 Q 35 82 0 94" />
        </svg>
      </div>
    </>
  );
}
