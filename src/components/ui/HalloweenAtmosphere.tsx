"use client";

import { useEffect, useRef, useState } from "react";

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

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

    // Warm embers & spectral crimson sparks
    const colors = [
      "rgba(255, 107, 53,",   // Burnt pumpkin
      "rgba(229, 169, 60,",   // Candleglow amber
      "rgba(184, 29, 46,",    // Blood velvt
      "rgba(255, 140, 66,",   // Jack-o'-lantern flare
    ];

    const particleCount = Math.min(28, Math.floor(width / 45));
    const particles: Particle[] = [];

    function createParticle(resetToBottom = false): Particle {
      return {
        x: Math.random() * width,
        y: resetToBottom ? height + Math.random() * 20 : Math.random() * height,
        size: Math.random() * 2.2 + 0.8,
        speedY: -(Math.random() * 0.7 + 0.3),
        speedX: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.7 + 0.2,
        fadeSpeed: Math.random() * 0.006 + 0.002,
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
          p.x += p.speedX + Math.sin(p.y * 0.01) * 0.2;
          p.opacity -= p.fadeSpeed;

          if (p.opacity <= 0 || p.y < -10) {
            particles[i] = createParticle(true);
            continue;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color} ${p.opacity})`;
          ctx.shadowColor = `${p.color} 0.8)`;
          ctx.shadowBlur = 8;
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
  }, [isActive]);

  return (
    <>
      {isActive && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-[1] opacity-50 transition-opacity duration-1000"
        />
      )}
    </>
  );
}
