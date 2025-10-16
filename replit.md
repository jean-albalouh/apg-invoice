# Shipping Fulfillment Expense Tracker

## Overview

A web-based expense tracking application for France-based e-commerce fulfillment businesses. It allows users to record product and shipping costs, apply French VAT (TVA) with flexible markup options (before or after TVA), generate monthly PDF reports for client billing, and track payments. The system supports multiple clients, provides real-time dashboard analytics, and manages client-specific financial summaries in Euros.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

-   **Framework:** React 18 with TypeScript, Vite.
-   **UI:** shadcn/ui, Radix UI, Tailwind CSS with Material Design principles, custom HSL color system, Inter font.
-   **State Management:** TanStack Query for server state, React Hook Form with Zod for form validation.
-   **Routing:** Wouter for client-side navigation.

### Backend

-   **Server:** Express.js with TypeScript, RESTful API design.
-   **Data Validation:** Zod schemas shared between client/server, `zod-validation-error` for detailed messages.
-   **API Endpoints:** CRUD operations for expenses and payments, with payment auto-distribution and reversal logic.
    -   `POST /api/expenses`: Create expense (includes date, client, productDescription, quantity, productCost (TTC), markupPercentage, shippingCost, shippingCarrier, status, tvaPercentage, markupAppliesTo, notes).
    -   `PATCH /api/expenses/:id`: Update existing expense.
    -   `POST /api/payments`: Create payment with auto-distribution to oldest unpaid expenses.
    -   `DELETE /api/payments/:id`: Delete payment and reverse applications.

### Data Storage

-   **Database:** PostgreSQL (via Neon serverless) using Drizzle ORM.
-   **Schema:**
    -   `expenses` table: Stores detailed expense records including `tvaPercentage`, `markupAppliesTo` (HT/TTC), and calculated amounts.
    -   `payments` table: Records client payments.
    -   `payment_applications` table: Links payments to specific expenses for tracking distribution.
-   **ORM:** Drizzle ORM with `drizzle-kit` for migrations.

### Core Features & Business Logic

-   **Expense Tracking:** Comprehensive fields including quantity, status, shipping carrier, and payment tracking.
-   **TVA Calculation:** Automatic HT/TTC calculation based on selectable TVA rates (5.5%, 10%, 20%).
-   **Flexible Markup (Option A):** 5% default markup (adjustable) with two application modes:
    -   **Markup on HT**: Entered price is treated as HT, markup applied, then TVA added (e.g., €100 HT × 1.05 × 1.055 = €110.78 TTC)
    -   **Markup on TTC**: Entered price is treated as TTC, markup applied directly (e.g., €100 TTC × 1.05 = €105.00 TTC)
    -   Form label dynamically changes to show "Product Cost (HT)" or "Product Cost (TTC)" based on markup selection
-   **Client Management:** Client-based organization (A TA PORTE, BEST DEAL, LE PHÉNICIEN, GRAND MARCHÉ) with statutory company information (SIREN, TVA, address, phone).
-   **Payment System:** Dedicated payments page to record payments, which auto-distribute to the oldest unpaid expenses (FIFO). Payments can be deleted, reversing applications.
-   **Reporting:** Monthly PDF reports (full consolidated or per-company) with A TA PORTE header, financial summaries (Total Billed, Paid, Balance), and payment history exports. Month selector dynamically shows all months that have expenses (not limited to recent months).
-   **French Invoicing (Factures):** Professional French invoice generation with date-based numbering (YYYY-MM-NNN format, auto-increments per month), complete statutory information (SIREN, TVA intracommunautaire, addresses, phone numbers), detailed HT/TVA/TTC breakdown tables, TVA summary by rate (includes markup), payment terms, and compliance with French invoicing regulations. Accessible via "Générer Facture" button on company-specific reports.
-   **Dashboard Analytics:** Real-time monthly statistics, per-client balance tracking, and "A TA PORTE Financial Overview" showing paid out vs. received from each company.
-   **Dynamic Inputs:** Custom status and shipping carrier text input alongside predefined choices.
-   **Auto-fill Logic:** BEST DEAL shipping cost auto-fills to €3.15 for *new* entries only when empty.
-   **Calculations:** Centralized `calculateExpense()` utility for consistent TVA-aware calculations across the application.

## External Dependencies

-   **Database:** Neon Database (PostgreSQL hosting)
-   **ORM:** `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`
-   **Frontend Libraries:** `react`, `wouter`, `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers`, `@radix-ui/*`, `tailwindcss`, `class-variance-authority`, `lucide-react`
-   **Date & PDF Generation:** `date-fns`, `jspdf`, `jspdf-autotable`
-   **Development Tools:** `vite`, `@replit/vite-plugin-*`, `tsx`, `esbuild`
-   **Fonts:** Google Fonts CDN (Inter font)