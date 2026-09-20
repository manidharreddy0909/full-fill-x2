/**
 * GlassPanel — Semantic glassmorphism panel primitive
 * Phase 13A: Cinematic Visual Foundation
 *
 * Replaces scattered bg-slate-900/85 border border-slate-800 backdrop-blur-md patterns.
 * Maps semantic variant to visual state via design tokens.
 */
import React, { CSSProperties, ReactNode } from 'react';

export type PanelVariant =
  | 'default'
  | 'critical'
  | 'warning'
  | 'success'
  | 'intelligence'
  | 'info'
  | 'decision'
  | 'simulation'
  | 'ghost';

interface GlassPanelProps {
  children: ReactNode;
  variant?: PanelVariant;
  /** Glow intensity: 0–1 */
  glow?: number;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  as?: 'div' | 'section' | 'article';
  /** Accessible label when not providing visible text */
  'aria-label'?: string;
}

const VARIANT_STYLES: Record<PanelVariant, {
  bg: string;
  border: string;
  shadow: string;
}> = {
  default: {
    bg: 'rgba(13,21,32,0.82)',
    border: 'rgba(255,255,255,0.09)',
    shadow: '0 8px 32px rgba(0,0,0,0.45)',
  },
  critical: {
    bg: 'rgba(30,5,5,0.85)',
    border: 'rgba(232,80,58,0.35)',
    shadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 20px rgba(232,80,58,0.12)',
  },
  warning: {
    bg: 'rgba(25,15,5,0.85)',
    border: 'rgba(245,166,35,0.35)',
    shadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 20px rgba(245,166,35,0.10)',
  },
  success: {
    bg: 'rgba(5,22,15,0.85)',
    border: 'rgba(52,199,123,0.30)',
    shadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 20px rgba(52,199,123,0.10)',
  },
  intelligence: {
    bg: 'rgba(15,5,30,0.85)',
    border: 'rgba(124,58,237,0.35)',
    shadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 20px rgba(124,58,237,0.12)',
  },
  info: {
    bg: 'rgba(5,18,30,0.85)',
    border: 'rgba(56,189,248,0.30)',
    shadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 16px rgba(56,189,248,0.08)',
  },
  decision: {
    bg: 'rgba(5,12,28,0.85)',
    border: 'rgba(59,130,246,0.35)',
    shadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 20px rgba(59,130,246,0.10)',
  },
  simulation: {
    bg: 'rgba(4,18,26,0.85)',
    border: 'rgba(6,182,212,0.30)',
    shadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 16px rgba(6,182,212,0.08)',
  },
  ghost: {
    bg: 'rgba(13,21,32,0.40)',
    border: 'rgba(255,255,255,0.06)',
    shadow: 'none',
  },
};

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  variant = 'default',
  glow = 0,
  className = '',
  style,
  onClick,
  as: Tag = 'div',
  'aria-label': ariaLabel,
}) => {
  const v = VARIANT_STYLES[variant];

  const glowExtra = glow > 0
    ? `, 0 0 ${Math.round(glow * 40)}px ${getBorderColorForGlow(variant, glow)}`
    : '';

  const baseStyle: CSSProperties = {
    background: v.bg,
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border: `1px solid ${v.border}`,
    borderRadius: '12px',
    boxShadow: `${v.shadow}${glowExtra}`,
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  return (
    <Tag
      className={className}
      style={baseStyle}
      onClick={onClick}
      aria-label={ariaLabel}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </Tag>
  );
};

function getBorderColorForGlow(variant: PanelVariant, _intensity: number): string {
  const colorMap: Partial<Record<PanelVariant, string>> = {
    critical:    'rgba(232,80,58,0.4)',
    warning:     'rgba(245,166,35,0.35)',
    success:     'rgba(52,199,123,0.35)',
    intelligence:'rgba(124,58,237,0.4)',
    info:        'rgba(56,189,248,0.35)',
    decision:    'rgba(59,130,246,0.35)',
  };
  return colorMap[variant] ?? 'rgba(91,147,246,0.3)';
}
