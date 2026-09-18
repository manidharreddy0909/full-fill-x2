# FULFILL-X — Design System

## 1. Purpose

Define the complete visual design language, component library, and
interaction patterns for FULFILL-X. This is the authoritative reference
for all UI implementation decisions.

## 2. Visual Direction

**Enterprise Operational Command Center**

The FULFILL-X interface is designed for professionals who need:
- Maximum information density without visual noise
- Instant state recognition (healthy / degraded / critical)
- Confidence that comes from precision and restraint
- Cinematic presence without gratuitous decoration

**Anti-patterns to avoid**:
- Generic SaaS blue-and-white dashboards
- Cyberpunk neon overuse
- Decoration without meaning
- Animations that obscure information

---

## 3. Color System

### Background Palette (Dark)

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-base` | `#080D14` | App background |
| `bg-surface` | `#0D1520` | Card / panel background |
| `bg-elevated` | `#111D2E` | Elevated panel |
| `bg-overlay` | `#162339` | Modal / tooltip |
| `bg-subtle` | `#1A2B40` | Hover states, subtle borders |

### Text Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `text-primary` | `#E8EDF4` | Main text |
| `text-secondary` | `#8899AE` | Secondary / labels |
| `text-muted` | `#4A5C73` | Placeholders, disabled |
| `text-inverse` | `#080D14` | Text on light backgrounds |

### Status Palette

| Token | Hex | State |
|-------|-----|-------|
| `status-healthy` | `#34C77B` | Healthy / success |
| `status-warning` | `#F5A623` | Warning / degraded |
| `status-critical` | `#E8503A` | Critical / error |
| `status-neutral` | `#6B8EAE` | Unknown / inactive |
| `status-info` | `#4A9FE8` | Informational |

### Accent Palette (Branded)

| Token | Hex | Usage |
|-------|-----|-------|
| `accent-primary` | `#3B7FE0` | Primary actions, focus |
| `accent-secondary` | `#7B4FD4` | Secondary accent |
| `accent-glow` | `#3B7FE040` | Bloom / glow effects |

### Risk Heat Map Palette

Interpolated as a 5-stop gradient from low to critical risk:

| Risk Score | Hex | Label |
|-----------|-----|-------|
| 0.0 – 0.2 | `#34C77B` | Low |
| 0.2 – 0.4 | `#7EC84A` | Moderate-Low |
| 0.4 – 0.6 | `#F5A623` | Moderate |
| 0.6 – 0.8 | `#E87A30` | High |
| 0.8 – 1.0 | `#E8503A` | Critical |

---

## 4. Typography

### Font Stack

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

Both fonts loaded from Google Fonts. Inter for all UI text; JetBrains Mono
for data values, metric numbers, code, and JSON.

### Type Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `display` | 2.25rem | 700 | 1.1 | Hero numbers |
| `heading-1` | 1.5rem | 600 | 1.2 | Screen titles |
| `heading-2` | 1.25rem | 600 | 1.3 | Section titles |
| `heading-3` | 1rem | 600 | 1.4 | Card titles |
| `body-lg` | 1rem | 400 | 1.6 | Main text |
| `body` | 0.875rem | 400 | 1.5 | Default text |
| `body-sm` | 0.75rem | 400 | 1.4 | Secondary text |
| `caption` | 0.6875rem | 400 | 1.3 | Timestamps, labels |
| `mono-lg` | 1rem | 500 | 1.2 | Large metric values |
| `mono` | 0.875rem | 400 | 1.2 | Data values |
| `mono-sm` | 0.75rem | 400 | 1.2 | Small data |

---

## 5. Spacing System

8px base grid:

```
space-1  =  4px
space-2  =  8px
space-3  = 12px
space-4  = 16px
space-5  = 20px
space-6  = 24px
space-8  = 32px
space-10 = 40px
space-12 = 48px
space-16 = 64px
space-20 = 80px
```

---

## 6. Border System

| Token | Value | Usage |
|-------|-------|-------|
| `border-subtle` | `1px solid #162339` | Card borders |
| `border-default` | `1px solid #1A2B40` | Default dividers |
| `border-strong` | `1px solid #2A3D55` | Prominent borders |
| `border-accent` | `1px solid #3B7FE0` | Focus / selected |
| `radius-sm` | `4px` | Small components |
| `radius-md` | `8px` | Cards, inputs |
| `radius-lg` | `12px` | Panels |
| `radius-xl` | `16px` | Modals |
| `radius-full` | `9999px` | Pills, badges |

---

## 7. Shadow & Glow

```css
--shadow-card: 0 1px 3px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.25);
--shadow-elevated: 0 4px 16px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.3);
--glow-primary: 0 0 12px rgba(59,127,224,0.3), 0 0 24px rgba(59,127,224,0.15);
--glow-critical: 0 0 12px rgba(232,80,58,0.4), 0 0 24px rgba(232,80,58,0.2);
--glow-healthy: 0 0 12px rgba(52,199,123,0.3);
```

---

## 8. Core Components

### 8.1 MetricCard

```
┌─────────────────────────────────┐
│  ↗ Network Health               │
│                                 │
│  0.58      ████████░░  58%      │
│                                 │
│  ● Degraded  △ -12% vs 1h ago  │
└─────────────────────────────────┘
```

- Background: `bg-surface`
- Border: `border-subtle`
- Value: `mono-lg`, color by status
- Sparkline: Recharts LineChart

### 8.2 AgentCard

```
┌─────────────────────────────────┐
│  ◎ Inventory Agent    RUNNING   │
│  ─────────────────────────────  │
│  Minimize stockout risk          │
│                                 │
│  Processing 47 nodes...          │
│  ▓▓▓▓▓▓░░░░  60%               │
└─────────────────────────────────┘
```

- Status indicator: colored dot (agent identity color)
- Progress bar: Tailwind

### 8.3 SignalBadge

```
● CRITICAL  WEATHER  0.94
```

Pill badge with severity color and type label.

### 8.4 RiskBar

```
Financial  ██████████░░░░░  0.72
```

Horizontal bar, color from risk heat map palette.

### 8.5 PlanCard

```
┌─────────────────────────────────┐
│  #1  Priority Reroute + Stock   │
│  ─────────────────────────────  │
│  SLA: 0.91  Cost: +$42K         │
│  Emissions: +8%  Fragility: -15%│
│  Adversary Rating: ██████  0.81 │
│                                 │
│  [Select Plan]                  │
└─────────────────────────────────┘
```

---

## 9. Animation Principles

### 9.1 Motion Philosophy

- Animations communicate state, not decorate
- Duration: 150–400ms for UI, 800ms–2s for 3D
- Easing: `ease-out` for entrances, `ease-in-out` for transitions
- Never block user interaction

### 9.2 Framer Motion Variants

```typescript
const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: 'easeOut' }
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } }
}

const cardHover = {
  whileHover: { scale: 1.015, y: -2 },
  transition: { duration: 0.15 }
}
```

### 9.3 Status Animations

| State | Animation |
|-------|-----------|
| RUNNING | Spinner + pulse ring (CSS animation) |
| CRITICAL | Slow pulse glow (critical color) |
| HEALTHY | Steady green glow |
| ERROR | Shake + red flash |

---

## 10. Icon System

Uses Lucide React exclusively. Key icons:

| Icon | Usage |
|------|-------|
| `Activity` | Network health |
| `AlertTriangle` | Warning signals |
| `Shield` | Resilience / security |
| `Zap` | Agent activity |
| `GitBranch` | Route / dependency |
| `Globe` | 3D world view |
| `TrendingDown` | Risk reduction |
| `CheckCircle` | Plan approved |
| `XCircle` | Plan rejected |
| `Crosshair` | Adversary agent |

---

## 11. Layout System

### Shell Layout

```
┌────────────────────────────────────────────────────┐
│  Header (48px): Logo | Status | AI Provider | User │
├──────────┬─────────────────────────────────────────┤
│ Sidebar  │           Main Content Area              │
│  (240px) │                                          │
│ Nav Menu │          Screen Content                  │
│          │                                          │
│          │                                          │
│          │                                          │
│          │                                          │
│          │                                          │
│          │                                          │
│          │                                          │
│──────────│─────────────────────────────────────────│
│  WS      │    Status Bar (24px)                     │
└──────────┴─────────────────────────────────────────┘
```

### Grid System

Main content: 12-column grid with `gap-6` (24px).
Common layouts:
- Full: `col-span-12`
- Split 60/40: `col-span-7` + `col-span-5`
- Split 50/50: `col-span-6` + `col-span-6`
- Three: `col-span-4` × 3
- Four: `col-span-3` × 4

---

## 12. Responsive Behavior

| Breakpoint | Width | Behavior |
|-----------|-------|---------|
| `sm` | 640px | Sidebar collapses to icon-only |
| `md` | 768px | Two-column layouts become single |
| `lg` | 1024px | Full layout |
| `xl` | 1280px | Optimal layout |
| `2xl` | 1536px | Wide layout, additional data density |

FULFILL-X is optimized for `xl` (1440px). All screens must be functional
at `md` (768px).

---

*Full component library to be implemented in Phase 08.*
*See `design/VISUAL_LANGUAGE.md` for visual references.*
