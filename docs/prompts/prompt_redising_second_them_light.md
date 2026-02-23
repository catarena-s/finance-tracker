GOAL:
Redesign UI with improved visual consistency.
Dark theme remains default.
Light theme must be supported.
Do not change architecture or business logic.

STACK:
Next.js
TypeScript
Tailwind
shadcn/ui
lucide-react

THEME SYSTEM:

Use CSS variables only.
Use class-based dark mode.
Dark theme = default.
Light theme = optional via .light class on html.

Do NOT introduce new libraries.

DESIGN DIRECTION:

Style: modern fintech dashboard
Mood: clean, calm, structured
Base: neutral gray
Accent: blue + cyan
No pure black.
No pure white.
No neon colors.

COLOR SYSTEM:

Dark (default):

background: 17 24 39
card: 31 41 55
border: 55 65 81
foreground: 243 244 246
muted-foreground: 156 163 175
primary: 96 165 250
secondary: 34 211 238
destructive: 248 113 113

Light:

background: 243 244 246
card: 255 255 255
border: 229 231 235
foreground: 55 65 81
muted-foreground: 107 114 128
primary: 59 130 246
secondary: 6 182 212
destructive: 239 68 68

COMPONENT REQUIREMENTS:

Update styling of:
- Button
- Card
- Input
- Sidebar
- Table
- Tabs
- Dropdown
- Dialog

Use:
- soft shadows
- subtle borders
- consistent spacing
- smooth 150ms transitions

ICONS (lucide-react):

- default: text-muted-foreground
- interactive: inherit text color
- hover: use primary or secondary
- do not hardcode colors

CONSTRAINTS:

- Do not break layout
- Do not modify API logic
- Do not add state management
- Only visual refactoring
- Keep Tailwind + shadcn conventions