# DESIGN.md — taste-skill decisions for Aarogya Setu Grid

Skills present in `.agents/skills` and `.claude/skills` (see `skills-lock.json` source `Leonxlnx/taste-skill`).
This dashboard applies three of them. `design-taste-frontend` is landing-page scoped, so it is used
only for its hard layout discipline, not its marketing aesthetic.

## Design Read
Reading this as: trust-first public-sector health dashboard for district collectors and PHC officers,
with a calm utilitarian-minimalist language, leaning toward minimalist-ui warm monochrome + bento grids.

## Dials (design-taste-frontend §1, trust-first row)
- DESIGN_VARIANCE 3 — symmetrical grid, left-aligned headers, no art-chaos.
- MOTION_INTENSITY 2 — quiet fade-up only, no scroll-hijack, no marquee.
- VISUAL_DENSITY 5 — cockpit-readable: table + forecast + planner above the fold where possible.

## Applied rules and sources

### minimalist-ui (primary system)
- Palette locked to warm monochrome: canvas `#F7F6F3`, surface `#FFFFFF`, borders `1px solid #EAEAEA`,
  ink `#111111`, muted `#787774`. Status only via washed pastels (red/blue/green/yellow tokens in `styles.css`).
- No gradients, no glassmorphism beyond the sticky nav blur, no heavy shadows (hover lifts to `0 2px 8px rgba(0,0,0,.04)` max).
- Radius capped at 10px for cards, 6px for buttons. No pill cards.
- Type: Geist Sans stack for UI, Newsreader serif for the hero H1 only, Geist Mono for every number
  (stocks, days, km, quantities). No Inter, no Roboto.
- Icons: `@phosphor-icons/react` bold weight, one family, no Lucide, no emojis.
- Bento overview grid is asymmetric `2fr 1fr 1fr` with exactly 4 cells for 4 content blocks.
- Accordions avoided; alerts use hairline `border-bottom` rows like the skill's FAQ pattern.
- Motion: `translateY(12px) + opacity` over 600ms with `cubic-bezier(0.16,1,0.3,1)`, stagger 80ms,
  `IntersectionObserver` only, full `prefers-reduced-motion` collapse.

### high-end-visual-design (restrained for health)
- Macro-whitespace kept (`40px` sections, `24px` card padding) but not agency-huge; density wins for officers.
- Chose Soft Structuralism vibe (silver-grey/white, airy, diffused) over Ethereal Glass or Editorial Luxury —
  glass/neon would break trust for a clinical tool.
- Motion choreography reduced to entry fades + `active:scale(0.98)` press states; transforms/opacity only,
  blur only on the fixed nav, fixed z-scale (nav 20, content default).
- Rejected Double-Bezel `rounded-[2rem]` nesting: it conflicts with the minimalist 10px cap and reads
  premium-consumer, not public-sector. Single hairline cards used instead.

### design-taste-frontend (layout discipline only)
- Hero fits viewport: 2-line H1, subtext under 20 words, 1 primary + 1 secondary CTA, single eyebrow.
- Eyebrow restraint: exactly 1 eyebrow on the page (hero), none on later sections.
- Nav is single-line, 68px, collapses to brand + CTA under 900px.
- No duplicate CTA intent: nav uses "Open planner", hero uses "View forecast" + "Browse stocks".
- Button contrast audited: `#111` on `#fff` and `#fff` on `#111` only.
- Real data visuals only: forecast is a live SVG polyline from the API, never a div mock. No fake screenshots.
- Copy self-audit applied: plain officer language, no "seamless/elevate/unleash", numbers come from CSV or are labeled sample.

### full-output-enforcement
- No `TODO`, no `...` omissions, no skeleton components. Every section renders loading, populated,
  empty, and error states. Offline sample fallback guarantees the deployed link never blanks.
