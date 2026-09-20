/**
 * AtmosphereLayer — CSS-only background system
 * Phase 13A: Cinematic Visual Foundation
 *
 * Provides layered depth: gradient → topology grid → vignette
 * Pure CSS — no WebGL draw calls, no GPU geometry.
 * Drops behind all workspace content via position:fixed or position:absolute.
 */
import React from 'react';
import { EnvironmentMode, ENVIRONMENT_IDENTITY } from '../tokens';

interface AtmosphereLayerProps {
  mode: EnvironmentMode;
  /** If true, renders as position:fixed covering full viewport */
  fixed?: boolean;
}

export const AtmosphereLayer: React.FC<AtmosphereLayerProps> = ({ mode, fixed = false }) => {
  const identity = ENVIRONMENT_IDENTITY[mode];
  const accent = identity.accentColor;
  const fogHex = identity.fogColor;

  return (
    <div
      aria-hidden="true"
      style={{
        position: fixed ? 'fixed' : 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Layer 1: Deep base gradient — no pure black */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 120% 80% at 30% 20%,
              ${hexToRgba(accent, 0.07)} 0%,
              transparent 60%
            ),
            radial-gradient(ellipse 80% 60% at 80% 80%,
              ${hexToRgba(accent, 0.04)} 0%,
              transparent 50%
            ),
            linear-gradient(165deg, ${fogHex} 0%, #06101e 50%, #040a14 100%)
          `,
        }}
      />

      {/* Layer 2: Topology grid — very subtle */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(${hexToRgba(accent, 0.06)} 1px, transparent 1px),
            linear-gradient(90deg, ${hexToRgba(accent, 0.06)} 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)',
        }}
      />

      {/* Layer 3: Scan line (respects prefers-reduced-motion) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, ${hexToRgba(accent, 0.15)} 40%, ${hexToRgba(accent, 0.15)} 60%, transparent 100%)`,
          animation: 'fx-scanline 8s linear infinite',
          opacity: 0.6,
        }}
      />

      {/* Layer 4: Edge vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(3,6,15,0.7) 100%)`,
        }}
      />
    </div>
  );
};

// ─── Utility ──────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
