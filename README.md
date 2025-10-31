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
