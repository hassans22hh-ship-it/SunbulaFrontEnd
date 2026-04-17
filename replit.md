# SunbulaFrontEnd

## Project Overview
A comprehensive productivity and personal management web application featuring task management, financial tracking, time tracking with a live timer and streak system, a virtual plant store (gamification), and detailed reporting. Localized for Arabic (ar-EG).

## Tech Stack
- **Framework:** Angular 21
- **State Management:** NgRx (Signal Store + @ngrx/store + @ngrx/effects)
- **Styling:** Tailwind CSS 4.0 with @tailwindcss/postcss
- **Animations:** GSAP + Angular animations
- **Charts:** Chart.js via ng2-charts
- **HTTP:** Angular HttpClient with auth/error interceptors
- **Date Handling:** date-fns
- **Language:** TypeScript ~5.9.2

## Build System
- **Package Manager:** npm
- **Build Tool:** Angular CLI with @angular/build:application (Esbuild/Vite)
- **Test Runner:** Vitest

## Project Structure
- `src/app/core/` - Singleton services, guards, interceptors, layout (shell, sidebar, topbar), auth, theme
- `src/app/features/` - Feature modules: auth, dashboard, tasks, folders, timer, finance, debts, plant-store, reports
- `src/app/shared/` - Reusable components (sb- prefix), directives, pipes, models, utilities
- `src/environments/` - Environment configs
- `public/` - Static assets

## Running the App
The app runs via `npm run start` (ng serve) on port 5000, binding to 0.0.0.0.

## Deployment
Configured as a static site deployment:
- Build: `npm run build`
- Public dir: `dist/SunbulaFrontEnd/browser`

## Notes
- Proxy/host headers are allowed via `allowedHosts: true` in angular.json for Replit preview compatibility
- The `@tailwindcss/postcss` package is required (not included in default tailwind install)
