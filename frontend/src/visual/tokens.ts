/**
 * FULFILL-X Visual Design System — Semantic Tokens
 * Phase 13A: Cinematic Visual Foundation
 *
 * Single source of truth for all visual semantics.
 * Used by both 2D CSS components and 3D R3F primitives.
 */

// ─── Semantic Color Palette ───────────────────────────────────────────────────

export const COLOR = {
  // Risk / Status Semantics
  healthy:     '#34c77b',   // Green — nominal, verified, success
  info:        '#38bdf8',   // Cyan — information, normal, cool
  warning:     '#f5a623',   // Amber — caution, degraded
  critical:    '#e8503a',   // Red — high risk, critical, disrupted
  intelligence:'#7c3aed',  // Violet — AI, agent, intelligence
  decision:    '#3b82f6',   // Blue — decision, approval
  simulation:  '#06b6d4',  // Cyan — simulation, twin
  governance:  '#a78bfa',  // Lavender — governance, compliance

  // Environment backgrounds
  bg: {
    deep:       '#040813',  // Deepest layer — canvas
    base:       '#070d1a',  // Base layer — scene
    surface:    '#0d1520',  // Surface — panels
    elevated:   '#111c2a',  // Elevated surface
    overlay:    '#162030',  // Tooltip / modal
  },

  // Border system
  border: {
    subtle:     'rgba(255,255,255,0.05)',
    default:    'rgba(255,255,255,0.10)',
    emphasis:   'rgba(255,255,255,0.18)',
    accent:     'rgba(91,147,246,0.45)',
  },

  // Text system
  text: {
    primary:    '#ddeeff',
    secondary:  '#7a90aa',
    tertiary:   '#3d5168',
    accent:     '#5b93f6',
    muted:      '#2a3d52',
  },
} as const;

// ─── Risk Score → Color mapping ───────────────────────────────────────────────

export function riskColor(score: number, isDisrupted?: boolean): string {
  if (isDisrupted || score >= 0.75) return COLOR.critical;
  if (score >= 0.5)  return '#fb923c';   // orange-400
  if (score >= 0.25) return COLOR.info;
  return COLOR.healthy;
}

export function riskEmissiveIntensity(score: number, isDisrupted?: boolean): number {
  if (isDisrupted || score >= 0.75) return 0.9;
  if (score >= 0.5) return 0.55;
  if (score >= 0.25) return 0.3;
  return 0.15;
}

// ─── Environment Mode Identity ────────────────────────────────────────────────

export type EnvironmentMode =
  | 'HOME' | 'COMMAND' | 'WORLD' | 'RISK' | 'INTELLIGENCE'
  | 'GOVERNANCE' | 'DECISION' | 'OBSERVABILITY' | 'RESPONSE'
  | 'SIMULATION' | 'LEARNING' | 'EVALUATION';

export interface EnvironmentIdentity {
  accentColor: string;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  ambientIntensity: number;
  directionalIntensity: number;
  label: string;
  description: string;
}

export const ENVIRONMENT_IDENTITY: Record<EnvironmentMode, EnvironmentIdentity> = {
  HOME: {
    accentColor: '#5b93f6',
    fogColor: '#040d1c',
    fogNear: 30,
    fogFar: 80,
    ambientIntensity: 0.25,
    directionalIntensity: 0.7,
    label: 'Home',
    description: 'Autonomous Operations OS',
  },
  COMMAND: {
    accentColor: '#38bdf8',
    fogColor: '#050f1f',
    fogNear: 25,
    fogFar: 70,
    ambientIntensity: 0.4,
    directionalIntensity: 0.9,
    label: 'Command',
    description: 'Operational Control Center',
  },
  WORLD: {
    accentColor: '#34c77b',
    fogColor: '#04120d',
    fogNear: 30,
    fogFar: 90,
    ambientIntensity: 0.5,
    directionalIntensity: 1.0,
    label: 'Digital Twin',
    description: 'Supply Chain Topology',
  },
  RISK: {
    accentColor: '#e8503a',
    fogColor: '#180606',
    fogNear: 20,
    fogFar: 60,
    ambientIntensity: 0.35,
    directionalIntensity: 0.8,
    label: 'Risk',
    description: 'Risk Intelligence Layer',
  },
  INTELLIGENCE: {
    accentColor: '#7c3aed',
    fogColor: '#0d0520',
    fogNear: 20,
    fogFar: 65,
    ambientIntensity: 0.3,
    directionalIntensity: 0.7,
    label: 'Intelligence',
    description: 'AI Constellation',
  },
  GOVERNANCE: {
    accentColor: '#a78bfa',
    fogColor: '#0e0820',
    fogNear: 25,
    fogFar: 70,
    ambientIntensity: 0.35,
    directionalIntensity: 0.75,
    label: 'Governance',
    description: 'Enterprise Control',
  },
  DECISION: {
    accentColor: '#3b82f6',
    fogColor: '#040d1c',
    fogNear: 25,
    fogFar: 70,
    ambientIntensity: 0.4,
    directionalIntensity: 0.85,
    label: 'Decision',
    description: 'Multi-Objective Decision Engine',
  },
  OBSERVABILITY: {
    accentColor: '#22d3ee',
    fogColor: '#04141f',
    fogNear: 25,
    fogFar: 70,
    ambientIntensity: 0.4,
    directionalIntensity: 0.8,
    label: 'Observability',
    description: 'Telemetry & Event Stream',
  },
  RESPONSE: {
    accentColor: '#f87171',
    fogColor: '#180407',
    fogNear: 20,
    fogFar: 60,
    ambientIntensity: 0.3,
    directionalIntensity: 0.8,
    label: 'Response',
    description: 'Incident Response',
  },
  SIMULATION: {
    accentColor: '#06b6d4',
    fogColor: '#04121a',
    fogNear: 25,
    fogFar: 75,
    ambientIntensity: 0.4,
    directionalIntensity: 0.85,
    label: 'Simulation',
    description: 'Digital Twin Laboratory',
  },
  LEARNING: {
    accentColor: '#818cf8',
    fogColor: '#0a0618',
    fogNear: 25,
    fogFar: 70,
    ambientIntensity: 0.3,
    directionalIntensity: 0.75,
    label: 'Learning',
    description: 'Agent Memory & Learning',
  },
  EVALUATION: {
    accentColor: '#fbbf24',
    fogColor: '#150e04',
    fogNear: 25,
    fogFar: 70,
    ambientIntensity: 0.35,
    directionalIntensity: 0.8,
    label: 'Evaluation',
    description: 'Benchmark Harness',
  },
};

// ─── Node Type Color ──────────────────────────────────────────────────────────

export const NODE_TYPE_COLOR: Record<string, string> = {
  SUPPLIER:       '#3b82f6',   // blue
  PORT:           '#8b5cf6',   // violet
  WAREHOUSE:      '#06b6d4',   // cyan
  FULFILLMENT_CENTER: '#10b981', // emerald
  CUSTOMS_ZONE:   '#f59e0b',   // amber
  DISTRIBUTION_CENTER: '#14b8a6', // teal
};

export function nodeTypeColor(type: string): string {
  return NODE_TYPE_COLOR[type?.toUpperCase()] ?? '#5b93f6';
}

// ─── Animation Durations ──────────────────────────────────────────────────────

export const DURATION = {
  instant:   0,
  fast:      0.15,
  normal:    0.25,
  slow:      0.45,
  cinematic: 0.8,
  enter:     0.6,
} as const;

export const EASING = {
  standard:  [0.4, 0, 0.2, 1] as const,
  decelerate:[0, 0, 0.2, 1]   as const,
  accelerate:[0.4, 0, 1, 1]   as const,
  spring:    { type: 'spring' as const, stiffness: 300, damping: 30 },
} as const;
