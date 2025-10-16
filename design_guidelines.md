# Design Guidelines: Shipping Fulfillment Expense Tracker

## Design Approach: Material Design System
**Justification:** This productivity tool requires efficient data entry, clear data visualization, and professional report generation. Material Design's strong emphasis on structured layouts, clear hierarchy, and data-dense interfaces makes it ideal for expense tracking applications.

**Core Principles:**
- Clarity over decoration - every element serves a functional purpose
- Efficient workflows with minimal clicks
- Professional aesthetics suitable for business communications
- Strong visual feedback for data entry actions

## Color Palette

**Light Mode:**
- Primary: 210 100% 45% (Professional blue for actions, headers)
- Surface: 0 0% 98% (Clean background)
- Surface Variant: 210 20% 96% (Card backgrounds, input fields)
- On Surface: 215 25% 20% (Primary text)
- On Surface Variant: 215 15% 45% (Secondary text)
- Success: 140 65% 45% (Positive amounts, completed states)
- Border: 215 20% 88% (Subtle divisions)

**Dark Mode:**
- Primary: 210 90% 60% (Brighter for visibility)
- Surface: 215 25% 12% (Deep background)
- Surface Variant: 215 20% 18% (Cards, inputs)
- On Surface: 210 10% 95% (Primary text)
- On Surface Variant: 210 8% 70% (Secondary text)
- Success: 140 60% 55%
- Border: 215 15% 25%

## Typography
**Font Family:** 'Inter' from Google Fonts for exceptional readability in data-dense contexts
- Headings: 600 weight, sizes 24px (h1), 20px (h2), 16px (h3)
- Body: 400 weight, 15px for optimal scanning
- Data/Numbers: 500 weight, tabular-nums for alignment
- Labels: 500 weight, 13px, uppercase tracking

## Layout System
**Spacing Primitives:** Consistent use of Tailwind units - 2, 4, 6, 8, 12, 16 for predictable rhythm
- Component padding: p-6 or p-8
- Section spacing: space-y-6 or space-y-8
- Form fields: gap-4
- Card margins: mb-6
- Tight groupings: space-y-2

**Grid System:**
- Container: max-w-7xl mx-auto px-4
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Expense table: Full width with horizontal scroll on mobile
- Form layouts: Single column on mobile, strategic 2-column on desktop

## Component Library

**Navigation:**
- Fixed top bar with app title, current month display, and user profile
- Primary actions: "Add Expense" button (prominent, primary color)
- Secondary navigation: Tabs for "Dashboard", "Expenses", "Reports"

**Dashboard Cards:**
- Elevated cards (shadow-md) with distinct sections
- Current month summary: Large number display with currency formatting
- Quick stats: Grid showing product costs, shipping costs, total expenses
- Recent entries: Compact list of last 5 expenses with inline actions

**Data Entry Form:**
- Modal overlay for adding expenses (prevents context switching)
- Clear visual grouping: Date picker, product description textarea, cost inputs
- Inline validation with helpful error states
- Dual currency inputs: Product cost and parcel cost with auto-sum display
- Quick-submit keyboard shortcut (Ctrl+Enter)

**Expense Table:**
- Sticky header row with sortable columns
- Columns: Date, Product Description, Product Cost, Parcel Cost, Total, Actions
- Alternating row backgrounds for scannability (subtle)
- Hover states revealing edit/delete actions
- Inline editing capability for quick corrections
- Footer row displaying column totals

**Reports Section:**
- Month/Year picker with dropdown navigation
- Summary card showing: Total products, total parcels, grand total
- Itemized breakdown table (similar to expense view but read-only)
- Prominent "Export PDF" and "Send to Client" action buttons
- PDF preview thumbnail

**Filtering Controls:**
- Date range picker with preset options (This Month, Last Month, Custom)
- Search by product description
- Clear filters button when active

## Key Interactions

**Data Entry Flow:**
1. Floating action button (bottom-right) to add expense
2. Modal slides up with form
3. Auto-focus on date field
4. Tab navigation between fields
5. Visual confirmation on save with success toast
6. Return to updated expense list

**Report Generation:**
1. Select month from dropdown
2. Preview summary calculations
3. Click "Generate Report" 
4. Show formatted report preview
5. "Download PDF" action with loading state
6. Success confirmation with download link

**Visual Feedback:**
- Loading states: Skeleton screens for data tables
- Success actions: Green checkmark toast (3s duration)
- Errors: Red outline on form fields with helper text
- Hover states: Subtle background change (8% opacity)

## Animations
Use sparingly and purposefully:
- Modal entrance: 200ms ease-out slide-up
- Toast notifications: 150ms fade-in from top
- Button press: Scale 0.98 on active
- Row hover: 100ms background color transition
- NO scroll animations or decorative motion

## Images
**No hero image required** - This is a utility application focused on function. Use icon-based visual communication instead:
- Dashboard illustrations: Simple line art icons for empty states
- Report header: Company logo placeholder area
- Empty states: Friendly illustrations suggesting first action