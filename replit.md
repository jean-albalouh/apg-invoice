# Shipping Fulfillment Expense Tracker

## Overview

A web-based expense tracking application designed for France-based e-commerce fulfillment businesses to track product and shipping costs. The application allows users to record expenses with product descriptions, costs, and shipping company information, view dashboard analytics, and generate monthly PDF reports for client billing in Euros.

**Key Features:**
- Comprehensive expense tracking with quantity, status, shipping carrier, and payment tracking
- Client-based organization with tabs: A TA PORTE, BEST DEAL, LE PHÉNICIEN, LE GRAND MARCHÉ DE FRANCE
- Automatic markup calculation (5% default, adjustable per expense)
- Client-specific shipping costs (BEST DEAL auto-set to €3.15)
- Real-time dashboard with monthly statistics and per-client balance tracking
- Payment tracking showing amounts owed vs. paid per client
- Monthly report generation with comprehensive PDF export
- Light/dark theme support with Material Design interface
- All amounts in Euros (€) for France-based business operations

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
- `POST /api/expenses` - Create new expense (requires: date, client, productDescription, quantity, productCost, markupPercentage, shippingCost, shippingCarrier, status, paymentReceived, notes)
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
  - client (text, required) - Client company: "A TA PORTE", "BEST DEAL", "LE PHÉNICIEN", "LE GRAND MARCHÉ DE FRANCE"
  - productDescription (text, required)
  - quantity (text, required) - Quantity of items
  - productCost (decimal 10,2, required) - Base product cost
  - markupPercentage (decimal 5,2, required, default 5) - Markup percentage
  - shippingCost (decimal 10,2, required) - Shipping cost (auto-set to 3.15 for BEST DEAL)
  - shippingCarrier (text, required, default "Colissimo") - Shipping company
  - status (text, required, default "Shipped") - Shipment status: Shipped, Cancelled, Refund, Pending, Processing
  - paymentReceived (decimal 10,2, required, default 0) - Amount paid by client
  - notes (text, nullable) - Optional notes
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

### Recent Changes (October 16, 2025)

**Major Feature Update - Comprehensive Expense Tracking:**

**Client Management:**
- Added four client companies: A TA PORTE, BEST DEAL, LE PHÉNICIEN, LE GRAND MARCHÉ DE FRANCE
- Client tabs on Expenses page for filtering by client
- Client-specific shipping cost automation (BEST DEAL = €3.15)

**Enhanced Expense Fields:**
- Quantity tracking for multiple items per expense
- Markup percentage with 5% default (adjustable per expense)
- Automatic product cost with markup calculation
- Shipping carrier selection (default: Colissimo, or custom)
- Status tracking: Shipped, Cancelled, Refund, Pending, Processing
- Payment tracking: record amounts received from clients
- Notes field for additional information

**Dashboard Enhancements:**
- Client balance cards showing per-client totals, payments, and balances owed
- Four-stat overview: Product Costs, Shipping Costs, Total Expenses, Balance Owed
- Recent expenses table with all new fields

**Expense Table Updates:**
- Displays: Client, Product, Quantity, Status (with color badges), Product+Markup, Shipping, Total, Paid, Balance
- Color-coded status indicators (green for Shipped, red for Cancelled, etc.)
- Balance tracking showing amounts owed in red, payments in green

**Report Improvements:**
- PDF exports include all new columns: Client, Product, Qty, Product+Markup, Shipping, Total, Status
- Monthly totals with comprehensive breakdown

**Business Logic:**
- Total = Product Cost × (1 + Markup%) + Shipping Cost
- Balance = Total - Payment Received
- BEST DEAL automatically gets €3.15 shipping cost
- All amounts calculated and displayed in Euros (€)

**Database Schema:**
- Replaced "paidBy" with "client" field for client company tracking
- Replaced "parcelCost" with "shippingCost" for clarity
- Added: quantity, markupPercentage, shippingCarrier, status, paymentReceived, notes
- All decimal fields use (10,2) precision for accurate Euro calculations