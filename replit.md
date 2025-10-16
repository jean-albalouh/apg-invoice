# Shipping Fulfillment Expense Tracker

## Overview

A web-based expense tracking application designed for France-based e-commerce fulfillment businesses to track product and shipping costs. The application allows users to record expenses with product descriptions, costs, and shipping company information, view dashboard analytics, and generate monthly PDF reports for client billing in Euros.

**Key Features:**
- Expense entry and management (CRUD operations) with persistent PostgreSQL storage
- Track who paid for shipping: A TA PORTE, BEST DEAT, or custom shipping companies
- All amounts displayed in Euros (€) for France-based business
- Real-time dashboard with monthly statistics
- Monthly report generation with PDF export (including Paid By information)
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
- `POST /api/expenses` - Create new expense (requires: date, productDescription, productCost, parcelCost, paidBy)
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
- PostgreSQL database via Neon (serverless PostgreSQL)
- DatabaseStorage class implementing IStorage interface
- Persistent data storage with automatic UUID generation

**Database Schema (PostgreSQL):**
- Expenses table with fields:
  - id (UUID varchar, primary key, auto-generated)
  - date (timestamp, required)
  - productDescription (text, required)
  - productCost (decimal 10,2, required)
  - parcelCost (decimal 10,2, required)
  - paidBy (text, required) - Shipping company: "A TA PORTE", "BEST DEAT", or custom entry
  - createdAt (timestamp, auto-generated)

**ORM Configuration:**
- Drizzle ORM with PostgreSQL dialect
- Schema defined in shared directory for type sharing
- Database migration via `npm run db:push` command

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
- Neon Database PostgreSQL hosting (active, connection via DATABASE_URL environment variable)

### Recent Changes (October 2025)

**Currency Update:**
- Changed from USD ($) to Euros (€) throughout the entire application
- All cost displays, calculations, and PDF reports now use € symbol

**Paid By Feature:**
- Added "Paid By" field to track shipping company/payer
- Dropdown options: "A TA PORTE", "BEST DEAT"
- Custom entry option for other shipping companies
- Displayed in expense tables and included in PDF reports

**Database Migration:**
- Migrated from in-memory storage to PostgreSQL database
- Data now persists permanently across sessions
- Schema includes paidBy field for shipping company tracking