You are a senior frontend architect.

Refactor my existing Next.js 14 (App Router) personal finance tracker UI 
to use shadcn/ui components with a modern light fintech design.

IMPORTANT:
- Do NOT break existing business logic
- Do NOT change API calls
- Do NOT remove state management
- Only refactor UI layer and styling
- Keep React Hook Form and Chart.js integration working

--------------------------------------------------
STACK:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Context API
- Axios
- Chart.js + react-chartjs-2
- React Hook Form

--------------------------------------------------
TASKS:

1) Install and configure shadcn/ui correctly for Next.js 14 App Router.
2) Replace existing UI elements with shadcn/ui components:
   - Cards → Card
   - Buttons → Button
   - Inputs → Input
   - Selects → Select
   - Tables → Table
   - Dialogs → Dialog
   - Dropdown menus → DropdownMenu
   - Sidebar → use Sheet or custom layout with shadcn primitives
3) Refactor layout using consistent spacing and container structure.

--------------------------------------------------
DESIGN REQUIREMENTS (LIGHT SOFT FINTECH):

Style:
- Light theme
- Soft, modern fintech aesthetic
- Clean and minimal
- Rounded corners (rounded-2xl)
- Soft shadows (shadow-sm, hover:shadow-md)
- Plenty of whitespace

Colors:
- Background: #F8FAFC
- Cards: #FFFFFF
- Primary: #6366F1
- Secondary: #10B981
- Border: #E2E8F0
- Text primary: #0F172A
- Text secondary: #64748B

Typography:
- Use Inter or Manrope
- Large balance numbers (text-3xl or text-4xl)
- Clear hierarchy (font-semibold for important numbers)

--------------------------------------------------
CHART.JS STYLING:

Refactor chart configuration to:
- Remove default bright colors
- Use soft primary/secondary palette
- Subtle grid lines (#E2E8F0)
- Smooth animation
- Clean tooltip styling
- No heavy borders

--------------------------------------------------
RUSSIAN UI TEXT:

Replace all UI labels with Russian language.

Use professional fintech terminology in Russian.
Do not translate variable names — only UI text.

--------------------------------------------------
STRUCTURE:

Create a clean layout:

- Sidebar (left)
- Header (top)
- Main content area with max-width container
- Cards grid for dashboard
- Table for transactions

--------------------------------------------------
OUTPUT:

- Show updated layout.tsx
- Show updated Dashboard page
- Show example refactored TransactionTable component
- Show updated Chart config
- Show any required Tailwind config changes

Ensure everything compiles and follows best practices.