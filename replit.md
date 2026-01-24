# GrapeReverse - Juggler Slot Machine Setting Analysis Tool

## Overview

GrapeReverse is a Japanese web application designed to help pachinko slot players analyze "Juggler" series machines. The tool reverse-calculates grape (ぶどう) probabilities from game statistics (total spins, bonus counts, coin differential) to estimate machine settings (1-6). It also supports "HanaHana" series machines with bell probability analysis.

The application serves as a free, SEO-optimized tool deployed to a custom domain (grape-reverse.com) via GitHub Pages.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7 for fast development and production builds
- **Styling**: Tailwind CSS 3 with PostCSS and Autoprefixer
- **Routing**: React Router DOM 7 for client-side navigation
- **Charts**: Recharts for visualization (slump graph simulator)

### Project Structure
The main application resides in `grape-reverse_antigravity/`:
- `src/pages/` - Route-based page components (machine-specific pages, columns/articles)
- `src/components/` - Reusable UI components (GrapeCalculator, HanaHanaCalculator, Header, Breadcrumbs)
- `src/data/` - Machine specification data (probabilities, payouts per setting)
- `src/lib/` - Core calculation logic (reverse grape probability algorithm)

### Calculation Logic
The core algorithm in `src/lib/reverse.ts`:
1. Takes coin input, bonus payouts, and optional cherry payouts
2. Calculates estimated grape count: `(coins - bonus - cherry) / grape_payout`
3. Derives grape probability as `coins / grapeCount`

### Machine Data Architecture
- Each slot machine has detailed specs defined in `src/data/machineSpecs.ts`
- Settings 1-6 have different probabilities for grapes, cherries, BIG/REG bonuses
- HanaHana machines use separate data structure in `src/data/hanahanaData.ts`

### SEO Strategy
- Individual pages per machine type for targeted SEO
- Dynamic meta descriptions and page titles
- Breadcrumb navigation for site structure
- Japanese language optimization

### Deployment
- GitHub Pages deployment via `gh-pages` package
- Custom domain configuration (grape-reverse.com)
- 404.html created during build for SPA routing support

## External Dependencies

### Analytics
- **Google Analytics 4** (GA4): Tracking ID `G-40PZGCDP8H`
- Admin exclusion feature via localStorage flag (`is_admin_user`)

### Deployment
- **GitHub Pages**: Static hosting via `gh-pages` npm package
- **Custom Domain**: grape-reverse.com

### Development Tools
- ESLint with TypeScript and React plugins
- Vite dev server configured for external access (host: 0.0.0.0, port: 5000)

### No Backend Required
This is a purely client-side calculation tool with no database, API, or server-side processing. All calculations happen in the browser.