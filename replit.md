# Overview

This is a fully functional home inspector marketplace web application called "InspectNow" that connects users with licensed home inspectors. The application features dual functionality: a client-facing directory for finding inspectors and an inspector-facing dashboard for managing requests. The system includes complete authentication with user roles (client/inspector), protected routes, and a live system where inspector signups immediately appear in the client directory. Users can create accounts, inspectors can manage profiles, and the platform facilitates real connections between clients and inspectors.

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
- **Storage**: LocalStorage-based system with centralized inspector profile management
- **Schema**: TypeScript interfaces for type safety between frontend components
- **Real-time Updates**: Inspector profiles created during signup immediately appear in client directory
- **Data Structure**: Separate storage for user accounts, inspector profiles, and service requests

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
- **Inspector Data**: Live system where inspector accounts create real profiles that appear in client directory
- **Profile Management**: Inspectors can customize their profiles, specialties, service areas, and pricing
- **User-Generated Content**: All inspector profiles come from actual user signups with customizable details
- **Demo Accounts**: Available for testing (client_demo@example.com / inspector_demo@example.com with DemoPass123)
- **Images**: Randomly assigned Unsplash photos for new inspector profiles