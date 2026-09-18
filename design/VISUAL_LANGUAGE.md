# FULFILL-X — Visual Language

## 1. Philosophy

FULFILL-X is designed for professionals who are under pressure.
The visual language must:

1. **Communicate state instantly** — healthy vs. degraded vs. critical must
   be distinguishable at a glance, across multiple simultaneous monitors.

2. **Earn trust through precision** — every number has a unit, every color
   has a meaning, every animation conveys information.

3. **Create presence without distraction** — the interface should feel alive
   and responsive, not decorative. Motion exists to communicate state change,
   not to impress.

4. **Scale with information density** — the interface should feel comfortable
   at low data load and expert-ready at maximum density.

---

## 2. Core Visual Principles

### 2.1 Dark as a Foundation

The application uses a deep navy-black as its base (`#080D14`). This:
- Reduces eye strain during extended use
- Makes colored status indicators (red, amber, green) maximally legible
- Creates a cinematic, high-contrast command center feel
- Makes the 3D world scene feel immersive (no white bleed around canvas)

### 2.2 Structured Information Hierarchy

Every screen has exactly 3 levels of visual weight:
1. **Hero level**: Large metric values, current status (font: display, 2.25rem)
2. **Primary level**: Labels, titles, main content (font: body-lg or heading-3)
3. **Secondary level**: Timestamps, metadata, captions (font: caption or body-sm)

Never introduce a 4th level. When in doubt, reduce to secondary.

### 2.3 Color Carries Meaning

Every color in the interface has a specific semantic meaning:

| Color Family | Meaning |
|-------------|---------|
| Green (`#34C77B`) | Healthy, passing, low risk |
| Amber (`#F5A623`) | Warning, degraded, elevated risk |
| Red (`#E8503A`) | Critical, failing, high risk |
| Blue (`#3B7FE0`) | Action, selected, informational |
| Purple (`#7B4FD4`) | Secondary accent, fulfillment agent |
| Neutral (`#8899AE`) | Inactive, secondary, disabled |

Never use color purely decoratively. Every color choice must map to one
of these meanings or an agent identity color.

### 2.4 Motion is Information

Animations serve exactly one of these purposes:
1. **State entry** — something appeared (fade + slide up, 250ms)
2. **State change** — a value updated (color lerp, 400ms)
3. **Process in progress** — something is running (spinner, pulse)
4. **Spatial relationship** — camera moves to show relationship (GSAP 800ms)
5. **Propagation** — risk or disruption spreading (wave animation)

No animation should exist without one of these purposes.

### 2.5 Density Without Clutter

The interface achieves high information density through:
- Compact but legible typography (Inter 0.875rem body)
- Mono spacing for data values (JetBrains Mono)
- Intentional whitespace at section boundaries (space-6 = 24px)
- Left-aligned data (easier to scan vertically)
- Consistent column widths in tables

---

## 3. Component Visual Language

### 3.1 Cards

Cards are the primary container unit. They:
- Have a 1px border (`border-subtle`)
- Use `bg-surface` background (slightly lighter than base)
- Have `radius-md` (8px) corners
- Use `shadow-card` for subtle depth
- On hover: slight scale + border brightens (transition 150ms)

### 3.2 Status Indicators

Status dots (6px circles) appear before entity names to communicate state:
- `●` green = healthy / idle / passing
- `●` amber = degraded / running / warning
- `●` red = critical / error / failing
- `○` gray = inactive / unknown

### 3.3 Data Values

All quantitative data values use JetBrains Mono font family.
Risk scores are displayed to 2 decimal places (e.g., `0.82`).
Percentages are rounded to nearest integer (e.g., `82%`).
Currency deltas show sign (e.g., `+$42K`, `-$12K`).
Time values are human-readable (e.g., `24h`, `3m ago`).

### 3.4 Progress / Bar Elements

All bar/progress elements:
- Height: 4px (slim bars) or 8px (prominent bars)
- Background: `bg-subtle`
- Fill: risk color from heat map palette
- Rounded ends: `radius-full`
- Animated on mount: grow from 0 to value (400ms ease-out)

---

## 4. 3D Visual Language

### 4.1 Lighting Philosophy

The 3D scene uses a single-source directional light (simulating a distant
star / data-center overhead light) with low ambient fill. This creates:
- Sharp shadows on node geometry that communicate shape
- High contrast between emissive (glowing) disrupted nodes and calm nodes
- A sense of physical space and depth

### 4.2 Material Philosophy

All node and edge materials are:
- **Physically based** (`MeshStandardMaterial`)
- **Muted metalness** (0.3–0.5) to feel industrial, not toy-like
- **Risk-driven emissive** — emissive intensity increases with risk score
- No pure white or black materials (reserved for background / text)

### 4.3 Scale and Proportion

The 3D world fits in a conceptual sphere of radius 10 units.
Node sizes range from 0.5 (customer zone) to 1.5 (fulfillment center).
Edge tube radius: 0.04 (default) to 0.10 (high-load routes).
Post-processing bloom threshold: 0.7 (only emissive/glow elements bloom).

---

## 5. Typography Specimens

```
DISPLAY (2.25rem 700 Inter)
0.58

HEADING-1 (1.5rem 600 Inter)
Command Center

HEADING-3 (1rem 600 Inter)
Osaka Warehouse

MONO-LG (1rem 500 JetBrains Mono)
0.82

BODY (0.875rem 400 Inter)
Network health degraded due to 2 concurrent disruption signals.

CAPTION (0.6875rem 400 Inter)
3 minutes ago · APAC region
```

---

## 6. Iconography Principles

- Use Lucide React exclusively (consistent stroke weight and style)
- Icon size: 16px (inline), 20px (card headers), 24px (navigation)
- Icons should accompany text labels, not replace them (except nav sidebar)
- Status icons pulse gently when status is active (CSS animation, 2s infinite)

---

## 7. Original Design Inspiration Sources

FULFILL-X draws visual principles (not copied designs) from:

| Source | Principle Extracted |
|--------|---------------------|
| Air traffic control systems | Information density, status hierarchy |
| Bloomberg Terminal | Monospace data values, dark density |
| SpaceX Starship UI (observed in press coverage) | Cinematic dark backgrounds, precise typography |
| Palantir Foundry aesthetics | Enterprise restraint, data-driven color |

These are **principle references only**. All designs are original FULFILL-X
implementations. No visual elements are copied from these sources.

---

*This document is the visual authority. When in doubt, refer here.*
*Deviations require a decision log entry in `docs/DECISION_LOG.md`.*
