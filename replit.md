# Shipping Fulfillment Expense Tracker

## Overview

A web-based expense tracking application designed for France-based e-commerce fulfillment businesses to track product and shipping costs. The application allows users to record expenses with product descriptions, costs, and shipping company information, view dashboard analytics, and generate monthly PDF reports for client billing in Euros.

**Key Features:**
- Comprehensive expense tracking with quantity, status, shipping carrier, and payment tracking
- **Edit expense functionality** - Modify existing expenses with pre-filled form data
- Client-based organization with tabs: A TA PORTE, BEST DEAL, LE PHÉNICIEN, GRAND MARCHÉ
- Automatic markup calculation (5% default, adjustable per expense)
- **Clear product + markup breakdown** - Shows "Product: €100.00 + 5% = €105.00" format
- Client-specific shipping costs (BEST DEAL auto-set to €3.15 for new entries only)
- **Custom status entry** - Manual status text input option alongside predefined choices
- Real-time dashboard with monthly statistics and per-client balance tracking
- **Enhanced company tabs** - Financial summary cards showing Orders, Total Billed, Paid, Balance per client
- **A TA PORTE Financial Overview** - Dashboard showing Paid Out vs Received From each company
- Payment tracking showing amounts owed vs. paid per client
- **Flexible report generation** - Full consolidated report OR per-company reports with recipient name
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
- `PATCH /api/expenses/:id` - Update existing expense (same fields as POST)
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

**Latest Update - Enhanced Features & Bug Fixes:**

**Edit Functionality:**
- Added PATCH `/api/expenses/:id` endpoint for updating existing expenses
- Edit button in expense table opens dialog pre-filled with expense data
- All expense fields can be modified except auto-generated ID and timestamps
- Form validation ensures data integrity on updates

**Product + Markup Display:**
- Clear breakdown shows: "Product: €100.00 + 5% = €105.00"
- Summary section displays individual components: Product Cost, Markup Amount, Product+Markup Subtotal, Shipping, Total
- All calculations visible to user during creation and editing

**UI/UX Improvements:**
- Tab overflow fixed: "LE GRAND MARCHÉ DE FRANCE" shortened to "GRAND MARCHÉ" 
- Custom status entry: Added "Other (Custom)..." option to status dropdown for manual text entry
- Works for both status and shipping carrier fields

**Enhanced Company Tabs:**
- Financial summary cards in each client tab showing:
  - Orders: Total count of expenses
  - Total Billed: Sum of all totals
  - Total Paid: Sum of payments received (displayed in green)
  - Balance Owed: Outstanding amount (displayed in red)
- Stats auto-calculate based on filtered expenses for each client

**A TA PORTE Financial Dashboard:**
- New "A TA PORTE Financial Overview" section on dashboard
- Shows financial relationship with each client company:
  - Paid Out (A TA PORTE): Amount A TA PORTE paid for client (red)
  - Received From Company: Amount client paid back to A TA PORTE (green)
  - Balance: Net amount owed to/from A TA PORTE
- Separate from "Client Payment Status" which tracks client-side balances

**Flexible Report Generation:**
- Report type selector: "Full Report (All)" or "Per Company"
- When "Per Company" selected, company dropdown appears
- Per-company reports filter to selected client only
- PDF filename includes company name for per-company reports: `expense-report-best-deal-2025-10.pdf`
- Full reports use standard naming: `expense-report-2025-10.pdf`
- Report header shows company name on per-company reports

**Critical Bug Fix:**
- Fixed BEST DEAL auto-fill overwriting existing shipping costs during edit
- Auto-fill now only applies to new expenses when shipping cost is empty
- Preserves custom shipping amounts on existing BEST DEAL expenses
- All other clients unaffected by auto-fill logic

**Business Logic:**
- Total = Product Cost × (1 + Markup%) + Shipping Cost
- Balance = Total - Payment Received
- BEST DEAL automatically gets €3.15 shipping cost for NEW entries only
- All amounts calculated and displayed in Euros (€)

**Technical Implementation:**
- Storage interface updated with `updateExpense` method
- DatabaseStorage implements PATCH with validation
- AddExpenseDialog supports both create and edit modes
- useEffect guards prevent data corruption on edits
- Report filtering logic handles both full and per-company views