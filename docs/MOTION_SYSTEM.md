# CloudSun Motion System

This document describes the motion system implemented in the CloudSun codebase. It matches the actual implementation in `src/lib/motion/` and `src/components/cloudsun/motion/`.

## Motion principles

Every movement should do one of the following — nothing else:

1. **Explain state** — show that the AI is listening, a call is connecting, a message was sent.
2. **Reinforce hierarchy** — draw attention to the primary CTA, the active nav item, the selected conversation.
3. **Preserve context** — use layout animation so elements don't teleport when lists reorder or panels open.
4. **Acknowledge an action** — buttons depress, cards lift, success states confirm.

If an animation does not serve one of these purposes, it should not exist.

## Technology

- **Motion for React** (`motion` package) — stateful, layout, gesture, presence and scroll animation.
- **CSS transitions** — simple colour and border changes.
- **CSS keyframes** — tiny self-contained decorative loops (waveform, pulse-ring).
- **LazyMotion + domAnimation** — smaller bundle for the marketing site.
- `framer-motion` has been removed. `motion` is the sole animation library.

## Timing tokens

```ts
export const motionDuration = {
  instant: 0.1,   // dropdown exits
  micro: 0.16,    // small UI feedback
  fast: 0.22,     // button taps, small transitions
  standard: 0.32, // default for most UI
  deliberate: 0.48, // hero headline, important reveals
  reveal: 0.65,   // section reveals on scroll
} as const;
```

## Easing tokens

```ts
export const motionEase = {
  out: [0.16, 1, 0.3, 1],     // premium ease-out, most UI
  inOut: [0.65, 0, 0.35, 1],  // symmetric, page transitions
  soft: [0.22, 1, 0.36, 1],   // softer ease-out
} as const;
```

## Spring presets

```ts
export const motionSpring = {
  soft:   { type: "spring", stiffness: 260, damping: 30, mass: 0.8 },
  snappy: { type: "spring", stiffness: 420, damping: 32, mass: 0.65 },
  panel:  { type: "spring", stiffness: 300, damping: 34, mass: 0.9 },
} as const;
```

No exaggerated elastic bouncing. CloudSun is a professional business product.

## Reusable variants

Located in `src/lib/motion/variants.ts`:

| Variant | Purpose |
|---------|---------|
| `revealVariants` | Section content entering viewport (opacity + y + blur) |
| `revealScaleVariants` | Product panels (opacity + y + scale 0.985→1) |
| `staggerContainer(stagger, delayChildren)` | Parent for staggered children |
| `staggerChild` | Pair with staggerContainer |
| `headlineReveal` | Hero headline mask reveal (y: 110% → 0) |
| `drawerRightVariants` | Right-edge drawer presence |
| `modalVariants` | Modal dialog presence (scale + y + opacity) |
| `backdropVariants` | Backdrop opacity |
| `dropdownVariants` | Dropdown / popover (y: -6 → 0) |
| `buttonTap` | `whileHover: { y: -1 }, whileTap: { scale: 0.98 }` |
| `cardHover` | `whileHover: { y: -3 }` |
| `pageTransition` | Dashboard section change (opacity + y, 220ms) |
| `messageEntrance` | New inbox message (opacity + y + scale) |

## Reusable components

Located in `src/components/cloudsun/motion/`:

| Component | Purpose |
|-----------|---------|
| `Reveal` | Wraps content that should animate into view on scroll |
| `RevealGroup` | Staggers children into view |
| `RevealItem` | Pair with RevealGroup |
| `StaggerList` | Convenience wrapper for mapped lists |
| `MotionProvider` | Wraps app in `MotionConfig` + `LazyMotion` |
| `MotionDiv` | Div with buttonTap hover/tap feedback |

## Global motion provider

The root layout wraps the app in `MotionProvider`:

```tsx
<MotionConfig reducedMotion="user" transition={{ type: "tween", ease: [0.16, 1, 0.3, 1] }}>
  <LazyMotion features={domAnimation} strict>
    {children}
  </LazyMotion>
</MotionConfig>
```

- `reducedMotion="user"` — automatically respects OS-level `prefers-reduced-motion`.
- `LazyMotion` — reduces bundle size by lazy-loading animation features.
- Client boundaries remain narrow — only components that need browser animation state use `"use client"`.

## Four motion patterns

### A. Reveal

Content entering the viewport:
- Opacity 0 → 1
- Vertical offset 12–24px
- Optional subtle blur 4px → 0
- Duration 0.45–0.65s
- Stagger 60–80ms between items
- Runs once (`viewport: { once: true }`)

Used in: marketing sections (ChannelOverview, AICapabilities, PricingSection, and all section headings).

### B. Reflow

Layout animation for filters, tabs, cards, panels:
- `layout` prop on motion components
- `layoutId` for shared element transitions
- Preserves spatial continuity — no teleporting

Used in: sidebar active indicator (`layoutId="sidebar-active"`), mobile bottom nav indicator (`layoutId="mobile-nav-active"`), hero preview step transitions, marketing nav underline (`layoutId="nav-underline"`).

### C. Presence

Drawers, modals, menus, context panels:
- `AnimatePresence` with `mode="wait"` or `mode="popLayout"`
- Entrance + exit animated
- Short exit duration
- No invisible elements blocking pointer input

Used in: mobile slide-over nav, inbox context panel, hero preview steps.

### D. Feedback

Hover, tap, selection, success, loading:
- Buttons: `whileHover: { y: -1 }, whileTap: { scale: 0.98 }`
- Cards: `whileHover: { y: -3 }` (interactive cards only)
- Selected nav indicators glide via `layoutId`
- No constant pulsing where no action is occurring

Used in: marketing CTAs, pricing cards, channel cards, AI capability cards.

## Marketing motion map

| Section | Motion |
|---------|--------|
| Header | Scroll-state height/opacity/shadow transition; nav underline `layoutId` |
| Hero | Staggered entrance (badge → headline → paragraph → CTAs → channels); headline mask reveal; product preview scale-in; preview steps with `AnimatePresence` + `layout` |
| Channel overview | RevealGroup stagger; card hover lift |
| Unified timeline | Reveal heading |
| AI capabilities | RevealGroup stagger; card hover lift |
| Phone experience | Reveal heading |
| Appointments | Reveal heading |
| Handoff | Reveal heading |
| Knowledge | Reveal heading |
| Automation | Reveal heading |
| Analytics | Reveal heading |
| Security | Reveal heading |
| Integrations | Reveal heading |
| Pricing | RevealGroup stagger; card hover lift |
| Final CTA | Reveal heading; button hover/tap |

## Dashboard motion map

| Area | Motion |
|------|--------|
| Page transition | `AnimatePresence mode="wait"` keyed on pathname; opacity + y 8px; 220ms |
| Sidebar | Active indicator `layoutId="sidebar-active"` glides between items |
| Mobile bottom nav | Active indicator `layoutId="mobile-nav-active"` glides |
| Mobile slide-over | Spring slide from left; backdrop fade; `AnimatePresence` exit |
| Inbox context panel | Slide 24px from right + fade; `AnimatePresence` exit |
| Inbox messages | New messages: opacity + y 10px + scale 0.99; 320ms |
| Inbox send button | `whileHover: { y: -1 }, whileTap: { scale: 0.98 }` |

## Reduced-motion behaviour

When `prefers-reduced-motion` is enabled (handled automatically by `MotionConfig reducedMotion="user"`):

- All parallax removed
- Large translations replaced with opacity-only
- Continuous decorative loops disabled (waveform falls back to static height)
- Cursor tilt disabled (not implemented — dashboard tables and inbox rows never get cursor effects)
- Hero preview loop pauses
- Essential status feedback preserved (opacity-only transitions)
- All content and actions remain available

Components also check `useReducedMotion()` directly for cases where the automatic reduction isn't enough.

## Performance rules

- Prefer `transform` and `opacity` — never animate `width`, `height`, `top`, `left` directly.
- Use Motion `layout` animation for measured reflow (sidebar collapse, list reordering).
- No continuous animation of large blurred layers.
- Pause offscreen loops — hero preview uses `useInView` to pause when outside viewport.
- Pause hidden-tab animations — hero preview listens to `visibilitychange`.
- Use `LazyMotion` + `domAnimation` for smaller bundle.
- Use `m` component inside `LazyMotion` regions instead of `motion`.
- No `setInterval` for simple continuous animation — the hero loop uses `setInterval` only for step progression, not for visual animation (that's CSS keyframes + Motion).

## Components using continuous animation

| Component | Animation | Pause conditions |
|-----------|-----------|------------------|
| Hero product preview | Step progression (2s interval) + CSS waveform | Outside viewport (`useInView`), tab hidden (`visibilitychange`), reduced motion |
| Hero waveform bars | CSS `cs-wave` keyframes | Reduced motion (static height fallback) |
| Hero badge ping | CSS `animate-ping` | Always on (tiny, decorative) |
| Inbox AI status dot | CSS `animate-pulse` | Always on (tiny, communicates "listening") |
| Call live indicator | CSS `animate-ping` | Always on during live call view |

## Animation testing checklist

- [x] Marketing entrance sequence (hero staggered entrance)
- [x] Header scroll state (height + opacity + shadow)
- [x] Mobile navigation (slide-over with AnimatePresence)
- [x] Hero workflow loop (steps with AnimatePresence + layout)
- [x] Section reveals (Reveal + RevealGroup across marketing)
- [x] Dashboard navigation (page transition crossfade)
- [x] Sidebar active indicator (layoutId glide)
- [x] Inbox message entrance (new messages animate)
- [x] Context panel opening (AnimatePresence slide)
- [x] Reduced motion (MotionConfig reducedMotion="user")
- [ ] Inbox filtering layout animation (not yet implemented — filter changes use React re-render, not layout)
- [ ] Call simulation motion (not yet implemented)
- [ ] Calendar interaction motion (not yet implemented)
- [ ] AI agent tab indicator layoutId (not yet implemented)
- [ ] Modal/drawer presence variants for all dialogs (only mobile slide-over and context panel done)

## Browser sizes tested

- 1440px (desktop)
- 1280px (laptop)
- 1024px (tablet landscape)
- 768px (tablet portrait)
- 430px (large mobile)
- 390px (iPhone)
- 360px (small Android)

No horizontal overflow. Mobile motion uses same durations (already restrained). No hover assumptions on mobile — tap feedback only.

## Remaining static areas (intentional)

The following areas are intentionally left without motion:

- **Dashboard tables** (Contacts, Team, Audit log) — tabular data should be stable and scannable, not animated.
- **Form inputs** — typing should feel immediate, not animated.
- **Non-interactive information cards** — cards that don't lead anywhere should not lift on hover.
- **Body copy** — no split-character or typewriter animation on paragraphs.
- **Dashboard topbar and sidebar shell** — these remain stable during page transitions; only the main content region animates.

## Genuine limitations

- Inbox filtering uses React state re-render, not Motion `layout` — filtered rows appear/disappear with a crossfade rather than reflowing spatially. This is a deliberate trade-off to avoid layout thrashing on large lists.
- Call simulation, calendar interactions, AI agent tabs, and most dashboard dialogs do not yet have motion applied — this pass focused on the marketing site, hero, header, dashboard page transitions, sidebar, and inbox.
- The hero preview loop uses `setInterval` for step progression (2s) which is acceptable because the visual animation is CSS keyframes, not JS-driven transforms.
