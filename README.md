# FuelEU Maritime Compliance Platform

## Overview

This is a full-stack compliance tracking platform for FuelEU Maritime regulations. The application helps manage route data, calculate compliance balances (CB), handle banking of surplus emissions credits, and facilitate pooling arrangements between vessels. The platform enables maritime operators to track GHG intensity against regulatory targets (89.34 gCO₂e/MJ for 2025) and manage compliance strategies through banking and pooling mechanisms.

You can view the site by Clicking : [Deployed Link](https://fuel-eu.onrender.com)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing
- Single-page application architecture with tab-based navigation

**UI Component Strategy:**
- Radix UI primitives for accessible, unstyled component foundations
- shadcn/ui component library (New York style variant) for consistent design system
- Carbon Design System principles for data-intensive enterprise interface (IBM Plex Sans typography)
- TailwindCSS for utility-first styling with custom design tokens
- Responsive grid layouts with IBM Carbon's spacing primitives

**State Management:**
- TanStack Query (React Query) v5 for server state management, caching, and data synchronization
- Custom query client configuration with disabled refetch-on-focus for stability
- Form state handled via React Hook Form with Zod schema validation

**Design System:**
- Custom CSS variables for theming (light/dark mode support via HSL color system)
- IBM Plex Sans font family loaded from Google Fonts CDN
- Carbon Design System typography hierarchy (light weights for headers, semibold for data labels)
- Consistent spacing using Tailwind's 4px-based scale

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for type-safe API development
- RESTful API design with structured route handlers
- Custom middleware for request logging and response timing
- HTTP server with Vite middleware integration for development

**Application Structure:**
- Repository pattern via storage abstraction layer (`IStorage` interface)
- Business logic in route handlers with domain calculations (compliance balance, pooling allocation)
- Separation of concerns: routes define API contracts, storage handles data persistence

**Key Domain Logic:**
- Compliance Balance calculation: `(targetIntensity - actualIntensity) * energyInScope / 1000000`
- Energy conversion factor: 41,000 MJ for fuel consumption normalization
- Greedy pooling algorithm: surplus vessels transfer credits to deficit vessels in sorted order
- Banking mechanism: temporal storage of surplus CB for future compliance periods

### Data Architecture

**ORM & Database:**
- Drizzle ORM for type-safe database operations with PostgreSQL
- Neon serverless PostgreSQL as the database provider (WebSocket-based connection)
- Schema-first approach with shared TypeScript types between client and server

**Database Schema:**
- `routes`: Voyage data with GHG intensity, fuel consumption, vessel metadata
- `ship_compliance`: Per-ship compliance balance tracking with route references
- `bank_entries`: Banking transactions for surplus compliance credits
- `pools`: Pooling arrangements with year-based grouping
- `pool_members`: Individual ship participation in pools with before/after CB states

**Data Validation:**
- Drizzle-Zod integration for runtime schema validation
- Insert schemas derived from table definitions
- Shared validation logic between frontend forms and backend APIs

### Development Workflow

**Monorepo Structure:**
- `client/`: Frontend React application
- `server/`: Express backend with API routes
- `shared/`: Common TypeScript types and database schema
- Path aliases configured (`@/`, `@shared/`, `@assets/`) for clean imports

**Build Process:**
- Development: Vite dev server with Express middleware mode
- Production: Vite builds client to `dist/public`, esbuild bundles server to `dist/`
- Type checking via `tsc --noEmit` without compilation

**Database Management:**
- Drizzle Kit for schema migrations and database push
- Migration files generated in `./migrations` directory
- Environment-based database URL configuration

## External Dependencies

**Database Service:**
- Neon Serverless PostgreSQL (`@neondatabase/serverless`)
- WebSocket-based connection pooling via `ws` package
- Connection string via `DATABASE_URL` environment variable

**UI Component Libraries:**
- Radix UI component primitives (18+ individual packages for dialogs, dropdowns, tabs, etc.)
- Recharts for data visualization (bar charts, compliance comparisons)
- Embla Carousel for responsive carousels
- Lucide React for iconography

**Development Tools:**
- Replit-specific Vite plugins for error overlay, cartographer, and dev banner
- PostCSS with Tailwind CSS and Autoprefixer
- TypeScript with strict mode and ESNext module resolution

**Validation & Forms:**
- Zod for runtime type validation and schema definitions
- React Hook Form for performant form state management
- `@hookform/resolvers` for Zod integration

**Date Utilities:**
- date-fns for date manipulation and formatting

**Styling:**
- TailwindCSS with custom configuration extending base theme
- class-variance-authority for component variant management
- clsx and tailwind-merge (via `cn` utility) for conditional class composition

**Session Management:**
- connect-pg-simple for PostgreSQL session storage (indicated by dependency, though session logic not visible in provided code)
