---
name: Mission Control
colors:
  surface: '#13121b'
  surface-dim: '#13121b'
  surface-bright: '#393842'
  surface-container-lowest: '#0e0d16'
  surface-container-low: '#1b1b24'
  surface-container: '#1f1f28'
  surface-container-high: '#2a2933'
  surface-container-highest: '#35343e'
  on-surface: '#e4e1ee'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#e4e1ee'
  inverse-on-surface: '#302f39'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#1d00a5'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#4d44e3'
  secondary: '#89ceff'
  on-secondary: '#00344d'
  secondary-container: '#00a2e6'
  on-secondary-container: '#00344e'
  tertiary: '#ffb695'
  on-tertiary: '#571f00'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#13121b'
  on-background: '#e4e1ee'
  surface-variant: '#35343e'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  data-mono:
    fontFamily: IBM Plex Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  timer-lg:
    fontFamily: IBM Plex Mono
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: -0.05em
  label-caps:
    fontFamily: IBM Plex Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-max: 1440px
  gutter: 20px
---

## Brand & Style

The design system is built around the "Mission Control Console" narrative—a high-fidelity, technical environment designed to provide calm, decisive guidance during high-pressure hackathons. The aesthetic rejects the whimsical or overly organic "playful AI" trends in favor of a precise, structured, and utilitarian interface. 

The visual language draws heavily from **Modern Technical Minimalism** and **Information Architecture**. It prioritizes data density, legibility, and state-awareness. The UI should evoke the feeling of a flight deck: everything has a place, status is communicated through color and iconography rather than decoration, and the "AI" is presented as a sophisticated co-pilot rather than a chatty assistant. Surface treatments are flat or subtly layered, using micro-interactions to provide feedback without distracting from the mission-critical tasks at hand.

## Colors

The palette is anchored in a dark, professional spectrum to reduce eye strain during long coding sessions. 

- **Core Tones:** The background utilizes Deep Slate (`#0F172A`), providing a more sophisticated depth than pure black. Surfaces and containers use slightly lighter slate tones to establish hierarchy.
- **Primary Action:** Deep Indigo (`#4F46E5`) is reserved for high-intent actions, signaling the "active" path.
- **Functional Accents:** Technical Cyan (`#22D3EE`) serves as the secondary accent for telemetry and progress indicators. 
- **Semantic States:** Status colors are high-chroma but used sparingly (badges, borders, or pips) to ensure they command attention without overwhelming the user. Avoid using these colors for large background areas.

## Typography

This system uses a three-tier typographic strategy to separate intent:
1. **Space Grotesk (Headers):** Used for structural navigation and major headings. Its geometric, slightly condensed nature feels engineered and authoritative.
2. **Inter (Body):** Used for AI coaching transcripts, documentation, and general instructions. It provides maximum readability and a touch of humanist approachability amidst the technical aesthetic.
3. **IBM Plex Mono (Data/Labels):** Used for all telemetry, timestamps, code snippets, and status labels. The monospaced nature ensures tabular data remains aligned and reinforces the "terminal" feel of the tool.

**Hierarchy Note:** Use `label-caps` for section headers and small metadata to maintain the professional, "cataloged" look of a console.

## Layout & Spacing

The layout follows a **Rigid Grid System** based on a 4px baseline. This ensures all technical elements feel locked into a structural framework.

- **Desktop:** A 12-column grid with a fixed maximum width of 1440px. Use consistent 20px gutters. Information should be grouped into logical "Modules" or panels.
- **Sidebars:** Use fixed-width left navigation (approx. 240px) for mission parameters and a collapsible right panel for the AI Coach chat.
- **Density:** High density is encouraged. Use `16px` (md) as the standard padding for cards and containers to keep the interface compact and efficient.
- **Mobile:** Transition to a single-column fluid layout, prioritizing the "Mission Clock" and the "Active Task" card at the top of the stack.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Low-Contrast Outlines** rather than traditional shadows. This maintains a flat, technical appearance.

- **Level 0 (Background):** Deep Slate (`#0F172A`).
- **Level 1 (Cards/Panels):** Surface Slate (`#1E293B`) with a 1px solid border of `#334155`.
- **Level 2 (Modals/Popovers):** Surface Slate (`#334155`) with a slightly brighter border (`#475569`) and a very soft, 10% opacity black ambient shadow to subtly lift it from the background.
- **Interactive States:** When hovering over interactive elements, increase the border brightness or use a subtle inner-glow rather than traditional drop shadows.

## Shapes

The shape language is "Soft-Technical." We avoid sharp 90-degree corners to maintain a professional software feel, but we also avoid the "bubble" look of consumer apps.

- **Standard Radius:** 4px (`rounded-sm`) for buttons, inputs, and small badges.
- **Container Radius:** 8px (`rounded-lg`) for main content cards and panels.
- **Pill Shape:** Reserved exclusively for status indicators and active toggles to make them distinct from structural elements.

## Components

### Mission Clock
A custom component at the top of the UI. It features a large `timer-lg` monospaced countdown. Below the numbers, a horizontal bar depletes from right to left. The bar color shifts from `status_on_track` (cyan) to `status_at_risk` (amber) as the deadline approaches.

### Cards
Cards are the primary content container. They must have a subtle 1px border. No shadows. Use a `label-caps` header bar inside the card to title the data section, separated by a thin horizontal line.

### Buttons
- **Primary:** Solid Indigo background with white text. 4px rounded corners.
- **Secondary:** Ghost style. No background, 1px border using the primary indigo color.
- **Tertiary/Ghost:** No background or border. Text-only using `data-mono` font.

### Status Tags
Small badges using `label-caps`. They consist of a 10% opacity background of the status color and a 100% opacity text and left-side "pip" (small dot) of the same color.

### Input Fields
Dark backgrounds (`#0F172A`) with a subtle border. On focus, the border changes to the primary Indigo. Use IBM Plex Mono for placeholder text to signal a "command line" or technical input style.

### Lists
Lists should be dense. Use thin dividers between items. Every list item should lead with a monospaced index (e.g., `01.`, `02.`) or a status icon.