# Overview

This is a home inspector marketplace web application called "InspectNow" that helps users find and book licensed home inspectors in their area. The application features a modern React frontend with a clean, professional design and an Express.js backend. Users can search for inspectors by location, view detailed inspector profiles with ratings and specialties, and see availability for booking appointments.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing with three main pages (landing, inspectors list, inspector profile)
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod for validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Data Storage**: Currently using in-memory storage with an abstraction layer (IStorage interface) for future database integration
- **Development**: Hot reload with Vite middleware integration for seamless development experience
- **API Structure**: RESTful API design with /api prefix routing

## Data Layer
- **ORM**: Drizzle ORM configured for PostgreSQL with type-safe database operations
- **Schema**: Defined in shared directory for type consistency between frontend and backend
- **Database**: PostgreSQL (configured but not yet implemented - currently using memory storage)
- **Migrations**: Drizzle Kit for database schema management

## Design System
- **Component Library**: Custom implementation built on Radix UI primitives
- **Styling**: Utility-first CSS with Tailwind, using CSS custom properties for theming
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Accessibility**: ARIA compliance through Radix UI components

## Development Workflow
- **Build System**: Vite for fast development and optimized production builds
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
- **Code Organization**: Monorepo structure with clear separation between client, server, and shared code
- **Path Aliases**: Configured for clean imports (@/ for client, @shared/ for shared utilities)

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Router (Wouter)
- **Backend**: Express.js with TypeScript support via tsx
- **Build Tools**: Vite with React plugin and TypeScript support

## UI and Styling
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **Styling**: Tailwind CSS with PostCSS for processing
- **Icons**: Lucide React for consistent iconography
- **Utilities**: clsx and tailwind-merge for conditional styling

## Data Management
- **Database**: Neon Database (PostgreSQL) with Drizzle ORM
- **Validation**: Zod for runtime type validation and schema definition
- **State Management**: TanStack React Query for server state
- **Forms**: React Hook Form with Hookform Resolvers

## Development Tools
- **TypeScript**: Full type safety across the application
- **ESBuild**: For server-side bundling in production
- **Date Handling**: date-fns for date manipulation
- **Development**: Replit-specific plugins for enhanced development experience

## Data Source
- **Inspector Data**: Static JSON file containing inspector profiles, ratings, availability, and contact information
- **Images**: Unsplash for inspector profile photos