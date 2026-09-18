# FULFILL-X — Visual Design Bible

## 1. Brand Identity

### 1.1 Name and Purpose

FULFILL-X: The "X" denotes cross-functional intelligence, adversarial testing, and the
unknown disruption. The brand communicates: **precision under pressure**.

### 1.2 Brand Keywords

```
PRECISE  |  COMMANDING  |  INTELLIGENT  |  RESTRAINED  |  CINEMATIC
```

### 1.3 What We Are NOT

- Not a generic SaaS dashboard (no Tailwind blue everywhere)
- Not a gaming product (no XP bars, achievement popups)
- Not a decorative experience (no spinning globes without meaning)
- Not a startup (no playful curves, bouncy animations, gradient blobs)
- Not copied from any existing tool

---

## 2. Color System

### 2.1 Base Palette (CSS Custom Properties)

```css
:root {
  /* Background scale */
  --color-base:        #080D14;  /* Canvas background — deepest navy */
  --color-surface:     #0D1520;  /* Cards, panels */
  --color-surface-alt: #111C2A;  /* Elevated surfaces */
  --color-overlay:     #162030;  /* Modals, drawers */

  /* Borders */
  --color-border-subtle:  rgba(255,255,255,0.06);
  --color-border-default: rgba(255,255,255,0.12);
  --color-border-focus:   rgba(91,147,246,0.60);

  /* Text */
  --color-text-primary:   #E8EEFF;  /* Main content */
  --color-text-secondary: #8899AE;  /* Labels, metadata */
  --color-text-tertiary:  #4A5C72;  /* Disabled, placeholder */
  --color-text-accent:    #5B93F6;  /* Links, interactive */

  /* Status / Risk semantic colors */
  --color-healthy:    #34C77B;  /* Green — no risk / passing */
  --color-elevated:   #F5A623;  /* Amber — warning / elevated risk */
  --color-critical:   #E8503A;  /* Red — critical / high risk */
  --color-disrupted:  #FF3B30;  /* Bright red — active disruption */
  --color-recovering: #7EC84A;  /* Lime green — recovering state */

  /* Action colors */
  --color-primary:    #5B93F6;  /* Primary interactive */
  --color-primary-hover: #4A82E5;
  --color-success:    #34C77B;
  --color-warning:    #F5A623;
  --color-error:      #E8503A;

  /* Agent identity colors */
  --agent-inventory:       #4A90D9;  /* blue */
  --agent-supplier:        #7BC67E;  /* green */
  --agent-transportation:  #E8A24A;  /* amber */
  --agent-fulfillment:     #9B7FE8;  /* purple */
  --agent-sustainability:  #52B788;  /* forest green */
  --agent-resilience:      #E8574A;  /* red-orange */
  --agent-coordinator:     #A8B5C5;  /* neutral */
  --agent-adversary:       #E85D4A;  /* red */

  /* Risk score gradient (interpolate for intermediate values) */
  --risk-0:   #34C77B;  /* 0.0 — healthy */
  --risk-25:  #7EC84A;  /* 0.25 — low risk */
  --risk-50:  #F5A623;  /* 0.50 — elevated */
  --risk-75:  #E87A30;  /* 0.75 — high */
  --risk-100: #E8503A;  /* 1.0 — critical */
}
```

### 2.2 Risk Color Interpolation Function

```typescript
export function riskToHex(score: number): string {
  // Interpolate through: healthy → elevated → critical
  if (score <= 0.5) {
    return interpolate('#34C77B', '#F5A623', score / 0.5)
  } else {
    return interpolate('#F5A623', '#E8503A', (score - 0.5) / 0.5)
  }
}

export function riskToThreeColor(score: number): THREE.Color {
  return new THREE.Color(riskToHex(score))
}
```

### 2.3 Color Usage Rules

| Color | ONLY for | NEVER for |
|-------|---------|---------|
| `color-critical` (#E8503A) | Critical signals, high risk, error states | Decorative elements |
| `color-elevated` (#F5A623) | Warnings, medium risk, running states | Success indicators |
| `color-healthy` (#34C77B) | Healthy state, passing tests, success | Error states |
| `color-primary` (#5B93F6) | Interactive elements, links, selected | Status indicators |
| Agent colors | That agent's UI elements only | Any other purpose |

---

## 3. Typography

### 3.1 Font Families

```css
/* Google Fonts */
--font-display: 'Inter', system-ui, sans-serif;      /* All UI text */
--font-mono:    'JetBrains Mono', 'Fira Code', monospace; /* Data values */
```

Import:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### 3.2 Type Scale

```css
--text-display:   2.25rem / 700 / letter-spacing: -0.02em  /* Hero metrics */
--text-heading-1: 1.5rem  / 600 / letter-spacing: -0.01em  /* Screen titles */
--text-heading-2: 1.25rem / 600 / letter-spacing: -0.01em  /* Section headers */
--text-heading-3: 1rem    / 600                             /* Card titles */
--text-body-lg:   1rem    / 400                             /* Primary content */
--text-body:      0.875rem/ 400                             /* Default body */
--text-body-sm:   0.75rem / 400                             /* Secondary content */
--text-caption:   0.6875rem/ 400                            /* Timestamps, labels */
--text-mono-lg:   1rem    / 500 / (JetBrains Mono)         /* Large data values */
--text-mono:      0.875rem/ 400 / (JetBrains Mono)         /* Data values */
--text-mono-sm:   0.75rem / 400 / (JetBrains Mono)         /* Compact data */
```

### 3.3 Typography Rules

- **All numeric data values** (risk scores, costs, percentages) → JetBrains Mono
- **Risk scores**: always 2 decimal places `0.82`
- **Percentages**: always integer `82%`
- **Currency deltas**: show sign `+$42K` | `-$12K`
- **Time**: human-readable `3m ago`, `72h`, `2026-09-18 21:00 UTC`
- **No uppercase tracking** (no `text-transform: uppercase` on content)

---

## 4. Spacing System

```css
/* 4px base unit */
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
--space-16: 64px

/* Component-specific */
--card-padding: var(--space-5)          /* 20px */
--panel-padding: var(--space-6)        /* 24px */
--section-gap: var(--space-8)          /* 32px */
--sidebar-width: 72px
--topbar-height: 56px
--statusbar-height: 32px
```

---

## 5. Layout System

### 5.1 Grid

The application uses CSS Grid for page layout:
```css
.app-shell {
  display: grid;
  grid-template-areas:
    "topbar topbar"
    "sidebar main"
    "statusbar statusbar";
  grid-template-columns: 72px 1fr;
  grid-template-rows: 56px 1fr 32px;
  height: 100vh;
}
```

Screen content areas use 8-column grid with 24px gutters.

### 5.2 Z-Index Scale

```css
--z-base:      0
--z-raised:    10     /* Cards, panels */
--z-sticky:    20     /* Sidebar, topbar */
--z-dropdown:  30     /* Dropdowns */
--z-floating:  40     /* Floating panels (3D inspector) */
--z-modal:     50     /* Modals */
--z-toast:     60     /* Toast notifications */
```

---

## 6. Cards

### 6.1 Standard Card

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: 8px;
  padding: var(--card-padding);
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.card:hover {
  border-color: var(--color-border-default);
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}
```

### 6.2 Card Variants

| Variant | Border | Background | Use |
|---------|--------|-----------|-----|
| default | `border-subtle` | `surface` | General content |
| elevated | `border-default` | `surface-alt` | Selected / active |
| critical | `color-critical + 40%` | `surface` | Alert states |
| agent | Agent color + 40% | `surface` | Agent cards |

---

## 7. Navigation (Sidebar)

```css
.sidebar {
  width: 72px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border-subtle);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-4) 0;
}

.sidebar-item {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  transition: all 150ms ease;
}

.sidebar-item:hover {
  background: var(--color-surface-alt);
  color: var(--color-text-primary);
}

.sidebar-item.active {
  background: rgba(91,147,246,0.15);
  color: var(--color-primary);
}
```

Sidebar has tooltip labels (Radix UI Tooltip) on hover. No text labels — icons only.

---

## 8. Buttons

### 8.1 Primary Button

```css
.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 20px;
  font: 500 0.875rem var(--font-display);
  transition: background 150ms ease, transform 100ms ease;
}

.btn-primary:hover { background: var(--color-primary-hover); }
.btn-primary:active { transform: scale(0.98); }
```

### 8.2 Button Variants

| Variant | Use |
|---------|-----|
| `primary` | Main CTAs (Run Agents, Approve) |
| `secondary` | Alternative actions (Export, Re-run) |
| `danger` | Destructive actions (Reject, Reset) |
| `ghost` | Low-emphasis (Cancel, Back) |
| `icon` | Icon-only actions (sidebar, toolbar) |

---

## 9. Status Indicators

### 9.1 Status Dots

```css
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

/* Active / running status dot pulses */
.status-dot.pulsing {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.8); }
}
```

| Class | Color | Use |
|-------|-------|-----|
| `.healthy` | #34C77B | Healthy, passing |
| `.elevated` | #F5A623 | Warning, running |
| `.critical` | #E8503A | Critical, error |
| `.inactive` | #4A5C72 | Offline, unknown |

---

## 10. Risk Bars

```css
.risk-bar {
  height: 4px;
  background: var(--color-surface-alt);
  border-radius: 9999px;
  overflow: hidden;
}

.risk-bar-fill {
  height: 100%;
  border-radius: 9999px;
  background: var(--fill-color);  /* computed from risk score */
  transition: width 400ms ease-out;
  animation: grow-in 400ms ease-out forwards;
}

@keyframes grow-in {
  from { width: 0; }
}
```

---

## 11. Motion Design

### 11.1 Animation Principles

1. **State entry**: Elements appear via `opacity 0→1` + `translateY 8px→0` (250ms ease-out)
2. **State change**: Values update via lerp/transition (400ms)
3. **In-progress**: Pulsing dots (2s infinite ease-in-out)
4. **Spatial**: Camera / panel movements (GSAP, 800ms power2.inOut)
5. **Data-driven**: Only animate when underlying data changes

### 11.2 Duration Reference

| Interaction | Duration | Easing |
|------------|---------|--------|
| Button hover | 150ms | ease |
| Sidebar item active | 150ms | ease |
| Card hover | 150ms | ease |
| Panel slide in | 250ms | ease-out |
| Toast appear | 250ms | spring |
| Data value update | 400ms | linear |
| Modal appear | 200ms | ease-out |
| Camera transition | 800ms | power2.inOut |
| 3D node color lerp | 400ms | linear (useFrame) |

### 11.3 Framer Motion Variants

```typescript
export const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
  transition: { duration: 0.25, ease: "easeOut" },
}

export const slideInRight = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: 24 },
  transition: { duration: 0.25, ease: "easeOut" },
}
```

---

## 12. Tables

### 12.1 Data Table Style

```css
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  font: 500 0.6875rem var(--font-display);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-subtle);
  text-align: left;
}

.data-table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-subtle);
  font: 0.875rem var(--font-display);
  color: var(--color-text-primary);
}

.data-table tr:hover td {
  background: var(--color-surface-alt);
}

/* Numeric cells */
.data-table td.numeric {
  font-family: var(--font-mono);
  text-align: right;
}
```

---

## 13. Charts

All charts use **Recharts** for 2D visualization.

Chart style tokens:
```typescript
const chartTheme = {
  backgroundColor: 'transparent',
  gridColor: 'rgba(255,255,255,0.06)',
  textColor: '#8899AE',
  tooltipBackground: '#0D1520',
  tooltipBorder: 'rgba(255,255,255,0.12)',
}
```

Chart types used:
| Chart | Screen | Library |
|-------|--------|---------|
| RadarChart | Plan Comparison | Recharts |
| LineChart | Evaluation history | Recharts |
| AreaChart | System latency | Recharts |
| BarChart | Risk comparison | Recharts |
| AttackTree | Adversary Attack | React Flow |
| ScenarioCanvas | Scenario Lab | React Flow |

---

## 14. Glassmorphism (3D Floating Panels Only)

Used ONLY for floating panels in the 3D WorldScene:

```css
.glass-panel {
  background: rgba(13, 21, 32, 0.85);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
}
```

Glassmorphism is NOT used on standard 2D UI screens.

---

## 15. Accessibility

| Requirement | Implementation |
|-------------|---------------|
| Color contrast ≥ 4.5:1 (text on surface) | `#E8EEFF` on `#0D1520` → 11.2:1 ✓ |
| Focus rings | `outline: 2px solid var(--color-primary); outline-offset: 2px` |
| Keyboard navigation | Full Tab + Arrow + Enter + Escape support |
| Screen reader | `aria-live="polite"` on live data regions |
| 3D fallback | React Flow 2D mode fully accessible |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` disables all animations |
| Font size | Minimum 0.6875rem (11px) for caption text |

---

## 16. Responsive Design

FULFILL-X targets desktop command center use (1920×1080 minimum).

| Breakpoint | Layout |
|-----------|--------|
| ≥ 1920px | Full layout, full sidebar labels optional |
| ≥ 1440px | Primary supported (full design) |
| ≥ 1280px | Reduced panel widths |
| ≥ 1024px | Minimum supported; sidebar icon-only |
| < 1024px | Not supported; "Use on desktop" message |

The 3D scene's canvas always fills available space.
Floating panels adapt width at narrower viewports.

---

## 17. Dark / Light Mode

FULFILL-X is **dark mode only** in Phase 01–11.
Light mode is a Phase 12+ future consideration.
No light mode toggle is exposed in the UI.
