# Zenggrix Digital Solutions — Static Web App

**Build • Digitize • Grow** — The Digital Engine for Business Growth.

A clean, modern, mobile-first static React (Vite) + Tailwind CSS site where **all copy/content lives in JSON**, so non-developers can update the site by editing data files only.

## Quick start
```bash
cd zenggrix
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/ (fully static)
npm run preview  # serve the production build locally
```

## Decoupled data architecture (`zenggrix/src/data/`)
| File | Drives |
| --- | --- |
| `company.json` | Name, tagline, sub-tagline, phone, email, address, working hours, socials (LinkedIn / Facebook / WhatsApp) |
| `hero.json` | Headline, main tagline, description, about paragraph, value points/badges, CTA labels & targets |
| `services.json` | The 6 service cards (id, title, code chip, description) used in Hero mini-grid + Services section + Contact chips |
| `team.json` | Founder & CEO (Hasaan Moeen) and Co-Founder & CTO cards |
| `process.json` | "How we work" numbered timeline (Discover → Design → Build & Digitize → Launch & Grow) |

Components import these JSON modules directly (`import services from '../data/services.json'`) — **no text is hardcoded in UI components**. Adding a 7th service or new team member requires a JSON edit only.

## Components (`zenggrix/src/components/`)
- `Navbar.jsx` — sticky/blur-on-scroll nav, Logo, links (Home, Services, Team, Contact), animated WhatsApp CTA, accessible mobile drawer.
- `Logo.jsx` — inline SVG cyan “Z” wordmark + `DIGITAL SOLUTIONS` sub-tagline.
- `Hero.jsx` — split view: left = big `Zenggrix` title, `Build • Digitize • Grow`, 6-card service grid with custom icons/codes + intro text; right = floating/sticky value-proposition card with cyan badges and tagline.
- `ServicesGrid.jsx` — detailed 6-card offerings grid with icon tiles, mono code chips and hover glow.
- `Process.jsx` — 4-step timeline from `process.json`.
- `TeamSection.jsx` — leadership cards with deterministic initials avatars + LinkedIn links.
- `Footer.jsx` — exports `Contact` (phone/email/office/hours panel + CTAs) and `Footer` (brand block, quick links, Sukkur location, operating hours, socials).
- `Reveal.jsx` + `hooks/useReveal.js` — IntersectionObserver scroll animations (no animation library, respects `prefers-reduced-motion`).
- `icons.jsx` — all inline SVG icons (WhatsApp, LinkedIn, Facebook, phone, mail, pin, clock, arrow, check, menu/close, per-service icons keyed by `id`).

## Brand design system (`tailwind.config.js`)
```
brand.dark   #0B192C  page background
brand.card   #111827  cards / containers
brand.border #1E293B  borders / dividers
brand.accent #00C4CC  logo accent, badges, hover states
```
Text: white bold headings (`font-display` Space Grotesk), `slate-300` body copy, mono `JetBrains Mono` code chips. Reusable `.card`, `.btn-primary`, `.eyebrow`, `.code-chip`, `.container-x`, `.section` utilities live in `src/index.css`.

## Performance & deployment
- Zero runtime dependencies beyond React; ~54 kB gzipped JS, ~5 kB gzipped CSS, no images (CSS gradients/grid/SVG only), fonts preconnected.
- `base: './'` relative asset paths → works on any static host/sub-path.
- `vercel.json` included: Vite framework preset, `npm run build`, output `dist`. Commit to GitHub → import repo in Vercel → every push auto-deploys.

© Zenggrix Digital Solutions · Sukkur, Sindh
