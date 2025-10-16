# Shipping Fulfillment Expense Tracker

## Overview

A web-based expense tracking application designed for e-commerce fulfillment businesses to track product and shipping costs. The application allows users to record expenses with product descriptions and costs, view dashboard analytics, and generate monthly PDF reports for client billing.

**Key Features:**
- Expense entry and management (CRUD operations)
- Real-time dashboard with monthly statistics
- Monthly report generation with PDF export
- Light/dark theme support
- Responsive Material Design interface

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool:**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (dashboard, expenses, reports pages)

**UI Component System:**
- shadcn/ui component library with Radix UI primitives
- Tailwind CSS for styling with custom Material Design theme
- Inter font from Google Fonts for optimal readability
- Custom color system supporting light/dark modes with HSL color variables

**State Management:**
- TanStack Query (React Query) for server state management
- React Hook Form with Zod validation for form handling
- Local component state for UI interactions

**Design System:**
- Material Design principles focusing on clarity and efficiency
- Consistent spacing using Tailwind's spacing scale (2, 4, 6, 8, 12, 16)
- Professional color palette with primary blue (210 100% 45% light, 210 90% 60% dark)
- Custom elevation system using rgba overlays for hover/active states

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- HTTP server with custom request logging middleware
- RESTful API design pattern

**API Structure:**
- `GET /api/expenses` - Fetch all expenses
- `GET /api/expenses/:id` - Fetch single expense
- `POST /api/expenses` - Create new expense
- `DELETE /api/expenses/:id` - Delete expense

**Data Validation:**
- Zod schemas for runtime validation
- Shared schema definitions between client and server
- Input validation with detailed error messages using zod-validation-error

**Development Environment:**
- Vite middleware mode for HMR during development
- Separate static file serving for production
- Custom error handling with status codes and JSON responses

### Data Storage

**Current Implementation:**
- In-memory storage using Map data structure (MemStorage class)
- Interface-based storage abstraction (IStorage) for future extensibility

**Database Schema (Prepared for PostgreSQL):**
- Expenses table with fields:
  - id (UUID, primary key)
  - date (timestamp)
  - productDescription (text)
  - productCost (decimal 10,2)
  - parcelCost (decimal 10,2)
  - createdAt (timestamp)

**ORM Configuration:**
- Drizzle ORM configured with PostgreSQL dialect
- Schema defined in shared directory for type sharing
- Migrations directory configured for database versioning

### External Dependencies

**Core Libraries:**
- `@neondatabase/serverless` - PostgreSQL database driver (prepared for use)
- `drizzle-orm` and `drizzle-kit` - Database ORM and migration tools
- `@tanstack/react-query` - Server state management
- `react-hook-form` and `@hookform/resolvers` - Form handling
- `zod` and `drizzle-zod` - Schema validation

**UI Component Libraries:**
- `@radix-ui/*` - Headless UI primitives (dialogs, popovers, dropdowns, etc.)
- `tailwindcss` - Utility-first CSS framework
- `class-variance-authority` - Component variant management
- `lucide-react` - Icon library

**Date & Report Generation:**
- `date-fns` - Date manipulation and formatting
- `jspdf` and `jspdf-autotable` - PDF generation for reports

**Development Tools:**
- `@replit/vite-plugin-*` - Replit-specific development enhancements
- `tsx` - TypeScript execution for development
- `esbuild` - Server bundle compilation for production

**Third-Party Services:**
- Google Fonts CDN (Inter font family)
- Configured for Neon Database PostgreSQL hosting (connection via DATABASE_URL environment variable)