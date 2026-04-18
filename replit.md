# Sunbula Front End

## Overview
Sunbula is a productivity and financial management web application built with Angular 21. It combines task management, time tracking (with gamification via a "plant store"), and personal finance tracking.

## Tech Stack
- **Framework:** Angular 21 (standalone components, signals-based state management)
- **State Management:** NgRx Signals, NgRx Store, NgRx Effects
- **Styling:** Tailwind CSS 4
- **Animations:** GSAP + Angular Animations
- **Charts:** Chart.js + ng2-charts
- **Date Handling:** date-fns
- **Real-time:** `@microsoft/fetch-event-source` (SSE)
- **SSR:** Angular SSR with Express
- **Build Tool:** Angular CLI v21 (uses Vite internally)
- **Package Manager:** npm

## Project Structure
```
src/
  app/
    core/         # Singleton services, layout components, auth, theme
    features/     # Business modules (tasks, finance, timer, plant-store, debts, reports, settings)
    shared/       # Reusable UI components (sb- prefix), directives, pipes, validators, models
  environments/   # Dev/prod environment configs
  styles/         # Global styles and animations
public/           # Static assets
```

## Development
- **Dev server:** `npm run start` → runs on `0.0.0.0:5000`
- **Build:** `npm run build` → outputs to `dist/SunbulaFrontEnd/`
- `allowedHosts: true` and `host: 0.0.0.0` are set in `angular.json` for Replit proxy compatibility

## Design Conventions
- All components use `templateUrl` / `styleUrl` (external `.html` + `.scss` files) — no inline templates or styles
- Icons: Font Awesome 6 via CDN (`<i class="fa-solid fa-...">`) — emojis replaced except for data-driven enum emojis (PLANT_LEVEL_META, GROWTH_STAGE_META, BEHAVIOR_META)
- 3D effects: `perspective` + `rotateX/Y` hover tilts, `@keyframes float` for empty-state icons, `translateY` lift on card hover
- SCSS uses CSS custom properties from `src/styles/global.css` (Tailwind v4 `@theme` block) — no hardcoded colors
- One exception: `sb-icon-coin.component.ts` keeps inline SVG template (pure SVG, no HTML binding needed)

## Deployment
- **Type:** Static site
- **Build command:** `npm run build`
- **Public directory:** `dist/SunbulaFrontEnd/browser`
