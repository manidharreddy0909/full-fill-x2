/**
 * StatusPill — Inline operational status indicator
 * Phase 13A: Cinematic Visual Foundation
 */
import React from 'react';

interface StatusPillProps {
  /** Dot color (CSS color string) */
  color: string;
  label: string;
  value?: string | number;
  pulse?: boolean;
  size?: 'sm' | 'md';
}

export const StatusPill: React.FC<StatusPillProps> = ({
  color,
  label,
  value,
  pulse = false,
  size = 'md',
}) => {
  const textSize = size === 'sm' ? '10px' : '11px';
  const dotSize  = size === 'sm' ? '6px' : '7px';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: `${color}12`,
        border: `1px solid ${color}30`,
        borderRadius: '6px',
        padding: size === 'sm' ? '3px 8px' : '4px 10px',
      }}
    >
      {/* Status dot */}
      <span
        style={{
          display: 'block',
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 6px ${color}`,
          flexShrink: 0,
          animation: pulse ? 'fx-dot-pulse 1.8s ease-in-out infinite' : 'none',
        }}
      />

      {/* Label */}
      <span
        style={{
          fontSize: textSize,
          fontFamily: 'var(--font-mono, monospace)',
          fontWeight: 600,
          color: 'rgba(200,216,240,0.7)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>

      {/* Value */}
      {value !== undefined && (
        <span
          style={{
            fontSize: textSize,
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 700,
            color,
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
};
