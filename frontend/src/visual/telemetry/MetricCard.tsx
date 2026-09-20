/**
 * MetricCard — Premium KPI card
 * Phase 13A: Cinematic Visual Foundation
 *
 * Shows a metric value with semantic color, optional trend bar,
 * and label. Used across Command, Home, and Evaluation dashboards.
 */
import React from 'react';
import { COLOR } from '../tokens';

interface MetricCardProps {
  label: string;
  value: string | number;
  /** 0–1 representing fill of trend bar */
  fill?: number;
  /** CSS color */
  color?: string;
  unit?: string;
  sub?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  fill,
  color = COLOR.info,
  unit,
  sub,
  icon,
  onClick,
}) => {
  const hasFill = fill !== undefined;
  const fillPct = hasFill ? Math.min(100, Math.max(0, fill * 100)) : 0;

  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px',
        borderRadius: '10px',
        background: `${color}0d`,
        border: `1px solid ${color}25`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (onClick) (e.currentTarget as HTMLDivElement).style.borderColor = `${color}50`;
      }}
      onMouseLeave={(e) => {
        if (onClick) (e.currentTarget as HTMLDivElement).style.borderColor = `${color}25`;
      }}
    >
      {/* Subtle corner glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '60px',
          height: '60px',
          background: `radial-gradient(circle at 100% 0%, ${color}18, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Label row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 600,
            color: 'rgba(170,190,210,0.7)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {label}
        </span>
        {icon && (
          <span style={{ color, opacity: 0.7 }}>
            {icon}
          </span>
        )}
      </div>

      {/* Value */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '4px',
        }}
      >
        <span
          style={{
            fontSize: '22px',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 800,
            color,
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              color: `${color}aa`,
              fontWeight: 600,
            }}
          >
            {unit}
          </span>
        )}
      </div>

      {/* Sub-label */}
      {sub && (
        <div
          style={{
            fontSize: '10px',
            color: 'rgba(120,140,165,0.8)',
            fontFamily: 'var(--font-mono, monospace)',
          }}
        >
          {sub}
        </div>
      )}

      {/* Trend bar */}
      {hasFill && (
        <div
          style={{
            height: '3px',
            borderRadius: '2px',
            background: 'rgba(255,255,255,0.07)',
            overflow: 'hidden',
          }}
          role="progressbar"
          aria-valuenow={fillPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            style={{
              height: '100%',
              width: `${fillPct}%`,
              background: `linear-gradient(90deg, ${color}80, ${color})`,
              borderRadius: '2px',
              transition: 'width 0.6s ease',
            }}
          />
        </div>
      )}
    </div>
  );
};
