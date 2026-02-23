You are a senior fintech product designer and frontend architect.

My project already uses Next.js 14, Tailwind CSS, TypeScript, and shadcn/ui.

Your task is to perform a COMPLETE UI REDESIGN of the personal finance tracker.

IMPORTANT:
This is NOT a migration to shadcn/ui.
shadcn/ui is already installed and configured.

This is a FULL REDESIGN of the visual system, layout, and components.

DO NOT change:

- business logic
- API calls
- state management
- data models
- backend integration

Only redesign the UI layer.

--------------------------------------------------
DESIGN GOAL:

Create a modern, soft fintech SaaS interface.

Style:

- Light theme
- Soft fintech aesthetic
- Minimalistic
- Professional
- Calm, not flashy
- Premium quality

Inspired by:

- Stripe dashboard
- Linear
- Notion
- Modern banking apps

--------------------------------------------------
DESIGN SYSTEM:

Use these colors:

Background:
#F8FAFC

Card background:
#FFFFFF

Primary:
#6366F1

Secondary:
#10B981

Border:
#E2E8F0

Text primary:
#0F172A

Text secondary:
#64748B

--------------------------------------------------
STYLE RULES:

Use consistently:

- rounded-2xl
- shadow-sm
- hover:shadow-md
- border border-slate-200
- large padding (p-6 or p-8)
- clean spacing between sections

Avoid:

- sharp corners
- heavy borders
- bright saturated colors
- visual clutter

--------------------------------------------------
TYPOGRAPHY:

Use Inter or Manrope.

Create hierarchy:

Balance numbers:
text-3xl or text-4xl font-semibold

Section titles:
text-lg font-semibold

Secondary text:
text-sm text-slate-500

--------------------------------------------------
CREATE NEW LAYOUT STRUCTURE:

Sidebar (left):

- Logo / App name
- Обзор
- Транзакции
- Категории
- Бюджеты

Sidebar must use shadcn/ui primitives and proper spacing.

Header (top):

- Page title
- Add transaction button (primary)
- Optional user menu

Main content:

- Balance cards row
- Charts card
- Recent transactions card

Centered layout with max width container.

--------------------------------------------------
REDESIGN THESE COMPONENTS USING shadcn/ui:

Create or rewrite:

components/layout/AppLayout.tsx
components/layout/Sidebar.tsx
components/layout/Header.tsx

components/dashboard/BalanceCards.tsx
components/dashboard/ChartsCard.tsx

components/transactions/TransactionTable.tsx

components/categories/CategoryList.tsx

--------------------------------------------------
USE shadcn/ui COMPONENTS:

Card
Button
Table
Input
Select
DropdownMenu
Dialog
Badge

--------------------------------------------------
CHART.JS REDESIGN:

Update chart styling to match fintech look:

- soft colors
- primary and secondary palette
- subtle grid lines (#E2E8F0)
- smooth curves
- clean tooltip

Remove default Chart.js styling.

--------------------------------------------------
RUSSIAN UI TEXT:

Use Russian interface text.

Only UI text must be Russian.
Keep code identifiers in English.

--------------------------------------------------
OUTPUT:

Show full code for:

AppLayout
Sidebar
Header
Dashboard cards
Transaction table

Ensure design is production-quality fintech SaaS level.