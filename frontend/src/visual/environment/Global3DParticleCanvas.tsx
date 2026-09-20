import React, { useEffect, useRef } from 'react';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  baseAlpha: number;
  pulsePhase: number;
  color: string;
}

export const Global3DParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { environmentMode } = useVisualEnvironmentStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Color schemes depending on active environment mode
    const getAccentColors = (mode: string) => {
      switch (mode) {
        case 'INTELLIGENCE':
          return ['#a855f7', '#c084fc', '#38bdf8', '#818cf8'];
        case 'WORLD':
          return ['#06b6d4', '#22d3ee', '#3b82f6', '#34d399'];
        case 'RESPONSE':
          return ['#ef4444', '#f97316', '#fbbf24', '#38bdf8'];
        case 'SIMULATION':
          return ['#10b981', '#06b6d4', '#3b82f6', '#a855f7'];
        default:
          return ['#38bdf8', '#22d3ee', '#818cf8', '#34d399'];
      }
    };

    const palette = getAccentColors(environmentMode);

    // Initialize 3D particles
    const particleCount = 110;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 1600,
        y: (Math.random() - 0.5) * 1000,
        z: Math.random() * 800 + 100,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        vz: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        baseAlpha: Math.random() * 0.5 + 0.3,
        pulsePhase: Math.random() * Math.PI * 2,
        color: palette[Math.floor(Math.random() * palette.length)],
      });
    }

    let gridOffset = 0;
    let scanlineY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep dark space background gradient
      const bgGradient = ctx.createRadialGradient(
        width / 2, height / 2, 100,
        width / 2, height / 2, Math.max(width, height)
      );
      bgGradient.addColorStop(0, '#060d19');
      bgGradient.addColorStop(0.5, '#030812');
      bgGradient.addColorStop(1, '#010408');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const fov = 450;

      // ── 1. Animated 3D Cyber Floor Grid ──
      gridOffset = (gridOffset + 0.4) % 40;
      ctx.save();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;

      // Perspective horizon
      const horizonY = height * 0.65;
      for (let x = -width; x < width * 2; x += 60) {
        ctx.beginPath();
        ctx.moveTo(cx + (x - cx) * 0.1, horizonY);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = horizonY; y < height; y += (y - horizonY + 10) * 0.18) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // ── 2. Render & Connect 3D Particles ──
      const projected: { px: number; py: number; scale: number; p: Particle }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move 3D coordinates
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.pulsePhase += 0.02;

        // Wrap boundaries
        if (p.x < -1000) p.x = 1000;
        if (p.x > 1000) p.x = -1000;
        if (p.y < -700) p.y = 700;
        if (p.y > 700) p.y = -700;
        if (p.z < 50) p.z = 900;
        if (p.z > 900) p.z = 50;

        // 3D Perspective Projection
        const scale = fov / (fov + p.z);
        const px = cx + p.x * scale;
        const py = cy + p.y * scale;

        if (px >= -50 && px <= width + 50 && py >= -50 && py <= height + 50) {
          projected.push({ px, py, scale, p });
        }
      }

      // Draw constellation vector connections between nearby particles
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.18 * p1.scale;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 0.8 * p1.scale;
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Draw glowing particle nodes
      for (let i = 0; i < projected.length; i++) {
        const { px, py, scale, p } = projected[i];
        const alpha = (Math.sin(p.pulsePhase) * 0.25 + 0.75) * p.baseAlpha * scale;
        const radius = p.radius * scale * 1.5;

        // Outer glow halo
        ctx.beginPath();
        ctx.arc(px, py, radius * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${alpha * 0.25})`;
        ctx.fill();

        // Core particle
        ctx.beginPath();
        ctx.arc(px, py, Math.max(1, radius), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      // ── 3. Subtle Moving Laser Scanline ──
      scanlineY = (scanlineY + 1.2) % height;
      const scanGradient = ctx.createLinearGradient(0, scanlineY - 20, 0, scanlineY + 20);
      scanGradient.addColorStop(0, 'rgba(6, 182, 212, 0)');
      scanGradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.04)');
      scanGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = scanGradient;
      ctx.fillRect(0, scanlineY - 20, width, 40);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [environmentMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
      style={{ opacity: 0.95 }}
    />
  );
};
