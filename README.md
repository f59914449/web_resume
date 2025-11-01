# Portfolio (Web)

Next.js 16 (App Router) + TypeScript + Tailwind CSS frontend for Sopheakdey Chen's portfolio. Includes dark/light mode, animated sections, and PWA support.

## Features
- Theming: next-themes with Inter + Poppins fonts
- Animations: framer-motion for Hero, Skills, and interactive Project cards
- Live code: Sandpack example dynamically loaded to reduce initial bundle
- Data: Projects fetched from Express API with robust fallback if API is offline
- PWA: Manifest + icons and service worker via next-pwa (production only)

## Dev

```bash
npm run dev
# open http://localhost:3000
```

Environment variables:
- `NEXT_PUBLIC_API_URL` (defaults to http://localhost:4000)

## Production

```bash
npm run build
npx next start -p 3001
# open http://localhost:3001
```

Note: service worker runs only in production build, not in dev.

## CI
GitHub Actions runs lint, typecheck, and build for the web project on push/pull_request.

## Structure
- `src/app` – App Router pages and layout
- `src/components` – Reusable UI components
- `public/manifest.json` – PWA manifest
- `public/icons` – PWA icons

## Performance checklist
- next/image used for project visuals
- dynamic import for Sandpack LiveCode
- minimal bundle footprint for initial load

## Color & Accessibility

The site uses a single theme designed to maintain brand consistency and high contrast over the animated background.

Tokens (globals.css):
- `--background`: `#0A192F` (Navy) — primary page background
- `--foreground`: `#E6EDF3` (Soft white) — default text color
- `--accent`: `#FF6B35` (Neon orange) — buttons and highlights

Contrast notes (WCAG 2.1):
- Foreground `#E6EDF3` on base background `#0A192F` has a contrast ratio ≈ 11.8:1 (AA/AAA compliant).
- To ensure contrast over animated areas, a global scrim is layered above the background:
  - `.content-scrim` combines a radial gradient and a vertical fade to reduce brightness behind content.
  - This preserves readability across bright animation frames while keeping the aesthetic.

Animation tuning:
- In `src/app/layout.tsx`, the `<BackgroundAnimation />` uses `intensity={0.4}` to limit vignetting and accent brightness.
- You can adjust `speed` and `intensity` to taste while maintaining contrast with the scrim.

Testing guidance:
- Verify readability in various environments:
  - Indoors with bright screens and dark mode
  - Outdoors with high ambient light
  - On mobile devices and high‑DPI displays
- Check key sections (Hero, Skills, Projects, Resume) for sufficient contrast.

If you need stricter contrast, increase scrim strength in `globals.css` by raising alpha values (e.g., 0.45 / 0.25).
