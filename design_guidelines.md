# FuelEU Maritime Compliance Platform - Design Guidelines

## Design Approach: Carbon Design System

**Rationale:** This is a data-intensive enterprise compliance platform requiring clarity, efficiency, and professional credibility. Carbon Design System (IBM) is specifically architected for complex data applications with strong information hierarchy and accessibility.

**Core Principles:**
- Clarity over decoration
- Efficient data density
- Professional authority
- Scannable information architecture

---

## Typography System

**Font Family:** IBM Plex Sans (via Google Fonts CDN)

**Hierarchy:**
- Page Headers: 2.5rem (40px), font-weight: 300 (Light)
- Section Headers: 1.75rem (28px), font-weight: 400 (Regular)
- Tab Labels: 0.875rem (14px), font-weight: 600 (Semibold), uppercase, letter-spacing: 0.16px
- Data Table Headers: 0.875rem (14px), font-weight: 600 (Semibold)
- Body/Table Content: 0.875rem (14px), font-weight: 400 (Regular)
- Metrics/KPIs: 2rem (32px), font-weight: 300 (Light)
- Helper Text: 0.75rem (12px), font-weight: 400 (Regular)

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 1, 2, 4, 6, 8, 12, 16 (e.g., p-4, gap-6, mb-8)

**Grid Structure:**
- Container: max-w-7xl with px-6 for consistent edge spacing
- Data tables: Full container width (w-full)
- Form sections: max-w-2xl for optimal readability
- Multi-column layouts: grid-cols-2 lg:grid-cols-4 for KPI cards

**Vertical Rhythm:**
- Section spacing: mb-12 between major sections
- Component spacing: mb-6 within sections
- Form field spacing: space-y-4
- Table row height: h-12 for comfortable scanning

---

## Component Library

### Navigation & Structure

**Tab Navigation:**
- Horizontal tab bar with 4 equal-width tabs
- Active state: bottom border (border-b-2)
- Tab padding: px-6 py-4
- Sticky positioning at top of dashboard (sticky top-0)

**Page Header:**
- Page title with subtitle/description below
- Breadcrumb navigation (Dashboard > Routes)
- Action buttons aligned right (flex justify-between)

### Data Display

**Data Tables:**
- Zebra striping for rows (alternate row backgrounds)
- Sticky header (sticky top-16 after tab bar)
- Column headers with sort indicators (arrows)
- Fixed height scrollable area: max-h-[600px] overflow-y-auto
- Row hover state with subtle transition
- Cell padding: px-4 py-3
- Borders: border-b on rows for separation

**Table Features:**
- Filtering toolbar above table: flex gap-4 items-center with dropdowns
- Column alignment: Left for text, Right for numbers
- Status indicators: Icon + text (✅ Compliant, ❌ Non-compliant)
- Action buttons in rightmost column

**KPI Cards:**
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
- Card structure: p-6 with rounded-lg
- Metric value: Large number (2rem) at top
- Label below metric: 0.75rem helper text
- Optional trend indicator with icon (↑ ↓)

**Charts (Comparison Tab):**
- Bar chart container: h-[400px] w-full
- Chart positioned below comparison table
- Use Chart.js or Recharts library via CDN
- Axis labels: 0.75rem
- Legend: Bottom positioned

### Forms & Controls

**Filters Bar:**
- Horizontal layout: flex gap-4 items-center mb-6
- Label + Select pairs
- Select dropdowns: h-10 px-3 rounded
- "Apply Filters" button at end

**Action Buttons:**
- Primary actions: px-6 py-2.5 rounded font-medium
- Secondary actions: px-4 py-2 rounded
- Disabled state: opacity-50 cursor-not-allowed
- Icon + text combinations where appropriate

**Input Forms (Banking/Pooling):**
- Label above input: block mb-2 text-sm font-medium
- Text inputs: w-full h-10 px-3 rounded border
- Number inputs with proper type="number" constraints
- Validation messages: text-sm mt-1
- Form sections in card containers

**Pool Member Selection:**
- Checkbox list with data preview
- Ship ID + Current CB + Adjusted CB columns
- Visual indicator for deficit/surplus ships
- Scrollable container if list exceeds 8 items

### Feedback & States

**Loading States:**
- Skeleton screens for table rows (animate-pulse)
- Spinner for button actions (inline with text)

**Empty States:**
- Centered container with icon + message
- "No routes found" or "No banked surplus available"
- Helpful action prompt below message

**Error Messages:**
- Inline form errors: text-sm with error icon
- Alert banners: p-4 rounded-lg with dismiss button
- API error responses displayed prominently

**Success Confirmations:**
- Toast notifications (top-right corner)
- Inline success messages with checkmark icon
- Updated data reflecting changes immediately

### Pooling Tab Specifics

**Pool Creation Interface:**
- Two-column layout: Member selection (left) | Pool Summary (right)
- Pool Summary Card showing:
  - Total Pool CB (large number)
  - Individual member before/after preview
  - Validation status indicator
  - "Create Pool" button disabled until valid
- Member list with checkboxes and CB values
- Real-time validation feedback

---

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation for tables (tab through rows)
- Focus indicators: ring-2 ring-offset-2
- Proper heading hierarchy (h1 → h2 → h3)
- Alt text for status icons
- Form field associations with labels
- Error announcements for screen readers

---

## Images

**No hero images.** This is a data-focused enterprise dashboard where information takes priority over visual storytelling. The interface should feel purposeful and efficient from the first pixel.

---

## Animation Policy

**Minimal and purposeful only:**
- Smooth tab transitions (transition-colors duration-200)
- Table row hover (transition duration-150)
- Dropdown expand/collapse
- Chart data loading animation (built into chart library)

**Avoid:** Page transitions, decorative animations, scroll-triggered effects