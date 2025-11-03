# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 portfolio with PWA, animated background, and a small server API route for local photo albums.

Commands
- Dev server: npm run dev (http://localhost:3000)
- Build: npm run build
- Start (prod): npm run start  # or: npx next start -p 3001
- Lint: npm run lint
- Typecheck: npm run typecheck
- Tests: none configured in this repo

Environment
- NEXT_PUBLIC_API_URL: base URL for external API used by Projects/Contact (defaults to http://localhost:4000). If unset/offline, Projects falls back to static examples; Contact will fail gracefully.

Architecture overview
- Framework/runtime
  - Next.js App Router in src/app with React Server Components by default; Client Components are explicitly marked with "use client".
  - React Optimizing Compiler enabled (next.config.ts: reactCompiler: true) and Turbopack enabled for dev.
  - TypeScript strict mode; path alias @/* -> src/*.
- Routing and pages (high level)
  - Home: src/app/page.tsx composes the main sections (Hero, ExperienceHighlights, AlbumsMemories, Skills, Projects, LiveCodeSection, Contact).
  - Resume: src/app/resume/page.tsx shows profile photos (with modal lightbox) and embeds the PDF from public/.
  - API route: src/app/api/albums/route.ts returns metadata for images under public/albums (filename, mtime, size), plus a computed list of "significant" items (blend of newest/largest). No external network calls.
- Styling
  - Tailwind CSS v4 via @tailwindcss/postcss; global tokens and utilities live in src/app/globals.css.
  - A fixed content-scrim overlay enforces contrast above the animated background; print-specific styles optimize the /resume page.
- Images and performance
  - next/image configured (next.config.ts) with AVIF/WebP and common device/image sizes.
  - BackgroundAnimation (WebGL2) renders under the app; respects prefers-reduced-motion with a static/canvas fallback.
- PWA
  - next-pwa wraps next.config.ts. Service worker is disabled in development and enabled for production output (dest: public). Runtime caching covers Google Fonts, static assets, Next.js static chunks, and excludes large album images from precache.
- Components (selected roles)
  - AlbumsMemories: client-side carousel + thumbnails; supports sort modes (algorithmic/chronological/random) and auto-advance; consumes /api/albums.
  - Projects: client component fetching `${NEXT_PUBLIC_API_URL}/projects`; shows static examples on error.
  - Contact: client form posting to `${NEXT_PUBLIC_API_URL}/contact` with zod/react-hook-form validation.
  - LiveCodeSection: dynamically imports a Sandpack-based LiveCode to reduce initial bundle.
  - ImageLightbox: reusable modal lightbox for high-quality image zoom.

Operational notes
- Adding photos to the site: place images in public/albums (jpg/jpeg/png/webp). The /api/albums route will index them automatically and the UI will reflect changes without code edits.
- SEO/metadata: src/app/layout.tsx defines Metadata (OpenGraph, Twitter), structured data (JSON-LD), and global fonts. Adjust here for site-wide changes.
- CI (as per README): lint, typecheck, and build run on push/PR via GitHub Actions (workflow file may live outside this folder if part of a monorepo).

Key paths
- App router: src/app
- Components: src/components
- Global styles/tokens: src/app/globals.css
- PWA/Next config: next.config.ts
- Static assets & PWA manifest: public/
- Local albums (served via /api/albums): public/albums
