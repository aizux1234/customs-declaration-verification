# UI Refinement (Refined Corporate) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the visual design of the existing Verify Export Risk Intelligent prototype across all pages and shared components to a polished, production-grade "Refined Corporate" look — without changing any behavior.

**Architecture:** Design-tokens-first. Establish a Tailwind theme (colors, typography, spacing, shadows) plus a web font and an icon set, then restyle the 16 shared components so every page inherits the upgrade, then polish layouts and pages. Pure visual change — no logic, API, routing, RBAC, or state changes.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v3, lucide-react (icons), @fontsource/ibm-plex-sans-thai (font), Vitest.

---

## Hard Constraints (apply to EVERY task)

1. **No behavior change.** Do not touch logic, API modules, routing, RBAC, or state. Visual/markup-for-styling changes only.
2. **Do not change shared-component prop contracts.** Prop names, types, and signatures stay identical (defined in the original Task 16). You may add OPTIONAL props only if truly needed; never change or remove existing ones.
3. **The 65 existing tests must keep passing.** Preserve everything tests depend on:
   - Visible text content (button labels, headings, cell text, error messages, Thai strings).
   - Accessible names / `<label>`-to-input associations (`getByLabelText`, `getByRole('button',{name})`).
   - `Pagination` must keep rendering the exact literal text `${start}-${end} of ${total}`.
   - `DataTable` keeps rendering an HTML `<table>` and renders nothing when `rows` is empty.
   - `Modal`/`Toast`/`DataTable` keep returning `null`/nothing when closed/empty.
   - `EmptyState` keeps rendering its `message` text.
4. **Verification gate** — every task ends by running, and confirming green:
   - `npx vitest run` → **65 tests pass** (24 files)
   - `npx tsc --noEmit` → clean
   - `npm run build` → succeeds
   If a test fails because of a restyle, the restyle changed something a test depends on — fix the restyle to preserve it. **Never edit or weaken a test.**
5. **Commit** after every task.

---

## File Structure

```
tailwind.config.js          design tokens (colors, fonts, shadows, radius)
src/index.css               font imports, base layer, print CSS (existing)
src/components/*.tsx         16 shared components — restyle (15 existing + new Skeleton)
src/components/Skeleton.tsx  NEW loading-skeleton component
src/layouts/*.tsx            AppLayout, AuthLayout — restyle
src/pages/**/*.tsx           7 pages + sub-components — restyle
package.json                 add lucide-react, @fontsource/ibm-plex-sans-thai
```

---

## Task 1: Design tokens, font & icon set

**Files:**
- Modify: `package.json` (deps), `tailwind.config.js`, `src/index.css`, `src/main.tsx`

- [ ] **Step 1: Install the font and icon packages**

```bash
npm install lucide-react @fontsource/ibm-plex-sans-thai
```

- [ ] **Step 2: Replace `tailwind.config.js` with the extended theme**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9', 100: '#dae4f0', 200: '#b8cce0', 300: '#8da9c8',
          400: '#5e80a8', 500: '#3d6089', 600: '#2d4a6e', 700: '#1e3a5f',
          800: '#172d49', 900: '#101f33',
        },
        brand: '#2563eb',
        teal: '#0d9488',
        success: { soft: '#dcfce7', DEFAULT: '#16a34a', text: '#15803d' },
        danger:  { soft: '#fee2e2', DEFAULT: '#dc2626', text: '#b91c1c' },
        warning: { soft: '#fef3c7', DEFAULT: '#d97706', text: '#b45309' },
        info:    { soft: '#dbeafe', DEFAULT: '#2563eb', text: '#1d4ed8' },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Thai"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(16 31 51 / 0.04), 0 1px 3px 0 rgb(16 31 51 / 0.08)',
        pop: '0 4px 6px -1px rgb(16 31 51 / 0.10), 0 2px 4px -2px rgb(16 31 51 / 0.08)',
        overlay: '0 20px 25px -5px rgb(16 31 51 / 0.18), 0 8px 10px -6px rgb(16 31 51 / 0.14)',
      },
      borderRadius: { md: '0.5rem', lg: '0.75rem' },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': { from: { opacity: '0', transform: 'scale(0.97)' }, to: { opacity: '1', transform: 'scale(1)' } },
        'slide-in-right': { from: { opacity: '0', transform: 'translateX(1rem)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'scale-in': 'scale-in 150ms ease-out',
        'slide-in-right': 'slide-in-right 200ms ease-out',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 3: Import the font in `src/main.tsx`**

Add these import lines near the top of `src/main.tsx` (before `import './index.css'`):
```ts
import '@fontsource/ibm-plex-sans-thai/300.css';
import '@fontsource/ibm-plex-sans-thai/400.css';
import '@fontsource/ibm-plex-sans-thai/500.css';
import '@fontsource/ibm-plex-sans-thai/600.css';
import '@fontsource/ibm-plex-sans-thai/700.css';
```

- [ ] **Step 4: Update `src/index.css` base layer**

Read the current `src/index.css`. Keep the three `@tailwind` directives and the existing `@media print` block. Replace the plain `body { font-family: ... }` rule with a `@layer base` block that sets: `body` → `font-family` IBM Plex Sans Thai (Tailwind `font-sans` now covers this, so just set background `bg-navy-50` and text `text-navy-900` and `antialiased`); a default `*` border color of `neutral` gray; and smooth `scroll-behavior`. Example:
```css
@layer base {
  body { @apply bg-navy-50 text-navy-900 antialiased; }
}
```

- [ ] **Step 5: Verify**

Run: `npx vitest run` → 65 pass. `npx tsc --noEmit` → clean. `npm run build` → succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(ui): add design tokens, IBM Plex Sans Thai font and lucide icons"
```

---

## Task 2: Restyle shared primitive components + add Skeleton

**Files:**
- Modify: `src/components/Button.tsx`, `Badge.tsx`, `TextInput.tsx`, `PasswordInput.tsx`, `Dropdown.tsx`, `Toggle.tsx`, `Spinner.tsx`
- Create: `src/components/Skeleton.tsx`
- Test: `src/components/components.test.tsx` (extend — see Step 1)

- [ ] **Step 1: Add a Skeleton smoke test**

Append a test to `src/components/components.test.tsx` (keep all existing tests untouched). Add `Skeleton` to the imports at the top, and add inside the existing `describe('shared components', ...)` block:
```tsx
  it('Skeleton renders a placeholder element', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeTruthy();
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/components.test.tsx`
Expected: FAIL — cannot find module `./Skeleton`.

- [ ] **Step 3: Create `src/components/Skeleton.tsx`**

```tsx
// src/components/Skeleton.tsx
interface SkeletonProps {
  className?: string;
}

/** Animated grey placeholder block for loading states. */
export function Skeleton({ className = 'h-4 w-full' }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden rounded bg-navy-100 ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}
```

- [ ] **Step 4: Restyle the 7 primitive components**

Restyle each, keeping prop contracts and all test-relevant text/labels/roles identical:
- **Button** — variants: `primary` = `bg-navy-700 hover:bg-navy-800 text-white`, `secondary` = `bg-white border border-navy-200 text-navy-700 hover:bg-navy-50`, `danger` = `bg-danger hover:bg-danger-text text-white`. Add `rounded-md`, `font-medium`, `transition-colors`, `focus-visible:ring-2 focus-visible:ring-navy-400 focus-visible:ring-offset-1`, `disabled:opacity-50 disabled:cursor-not-allowed`, comfortable padding. Keep the loading spinner + `disabled` when `loading`.
- **Badge** — pill, `rounded-full`, small `font-medium`. Map tone → `{soft bg, text color}` using the new tokens (e.g. green→`bg-success-soft text-success-text`, red→`bg-danger-soft text-danger-text`, amber→`bg-warning-soft text-warning-text`, blue/info→`bg-info-soft text-info-text`, navy→`bg-navy-100 text-navy-700`, gray→`bg-navy-100 text-navy-500`, teal→`bg-teal/10 text-teal`).
- **TextInput / Dropdown** — label `text-sm font-medium text-navy-700`, control `rounded-md border border-navy-200 bg-white`, `focus:border-navy-400 focus:ring-2 focus:ring-navy-100`, error state `border-danger`, error text `text-sm text-danger-text`. Keep `useId` label association and the red asterisk.
- **PasswordInput** — same as TextInput; replace the emoji eye toggle with lucide `Eye` / `EyeOff` icons (keep it `type="button"` and keep the Thai aria-label `แสดงรหัสผ่าน`/`ซ่อนรหัสผ่าน`).
- **Toggle** — smooth `transition` switch, on = `bg-navy-600`, off = `bg-navy-200`, keep `role="switch"` + `aria-checked`.
- **Spinner** — `animate-spin` ring in `text-navy-500`, keep optional `size`.

- [ ] **Step 5: Run the verification gate**

Run: `npx vitest run` → **66 pass** (65 existing + 1 new Skeleton test). `npx tsc --noEmit` → clean. `npm run build` → succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(ui): restyle primitive components and add Skeleton"
```

---

## Task 3: Restyle shared composite components

**Files:**
- Modify: `src/components/Modal.tsx`, `ConfirmDialog.tsx`, `Alert.tsx`, `Toast.tsx`, `DataTable.tsx`, `Pagination.tsx`, `EmptyState.tsx`, `DateRangePicker.tsx`

- [ ] **Step 1: Restyle each composite component**

Keep prop contracts and all test-relevant behavior identical (see Hard Constraints):
- **Modal** — overlay `bg-navy-900/40 backdrop-blur-sm` with `animate-fade-in`; panel white `rounded-lg shadow-overlay` with `animate-scale-in`; clean header (title `text-lg font-semibold text-navy-800`, lucide `X` close button); padded body; footer divided by a top border. Still returns `null` when `open` is false; overlay click + X still call `onClose`.
- **ConfirmDialog** — rebuilds on the restyled `Modal`; keep Cancel (secondary) + confirm (danger/primary) buttons and the `danger` behavior.
- **Alert** — tone → token soft bg + text + matching `border-l-4`; lead with a lucide icon per tone (`AlertCircle`/`AlertTriangle`/`Info`/`CheckCircle2`); `inline` compact vs `banner` full-width; keep the retry button when `onRetry` is provided.
- **Toast** — fixed bottom-right, `bg-navy-800 text-white rounded-md shadow-overlay`, `animate-slide-in-right`; still returns nothing when not visible.
- **DataTable** — MUST stay an HTML `<table>` and still render nothing when `rows` is empty. Header row `bg-navy-50 text-navy-600 text-xs font-semibold uppercase tracking-wide`; body rows `border-t border-navy-100`, `hover:bg-navy-50/60 transition-colors`, pointer cursor only when `onRowClick` set; comfortable cell padding. Keep `key={rowKey(row)}` and the `render`/`row[key]` cell logic.
- **Pagination** — restyle buttons (secondary-button look, disabled state) and the page-size `<select>`. MUST keep the exact literal range text `${start}-${end} of ${total}`.
- **EmptyState** — centered, a muted lucide icon (e.g. `Inbox`) above the message; MUST keep rendering the `message` text.
- **DateRangePicker** — two restyled date inputs matching TextInput styling, with a small "ถึง" separator.

- [ ] **Step 2: Run the verification gate**

Run: `npx vitest run` → **66 pass**. `npx tsc --noEmit` → clean. `npm run build` → succeeds.
If any test fails, a restyle broke something a test depends on (text/role/structure) — fix the restyle to preserve it.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(ui): restyle composite components (modal, table, alert, toast...)"
```

---

## Task 4: Restyle layouts

**Files:**
- Modify: `src/layouts/AppLayout.tsx`, `src/layouts/AuthLayout.tsx`

- [ ] **Step 1: Restyle `AppLayout`**

Keep ALL behavior (the null-user redirect, `accessibleModules` sidebar filtering, the exact nav labels/paths, the role-switcher `<select>` wired to `switchRole`+`store.users`, the logout button wired to `signOut`+navigate). Visual only:
- **Sidebar** — `bg-navy-800 text-navy-100`, fixed width; brand block at top (a small square logo mark + "EXIM" / system name); each nav item gets a lucide icon (`Search`→verify, `FileBarChart`→history, `Users`→users, `Building2`→borrowers, `ScrollText`→activity log); active link (use `NavLink` `isActive`) = `bg-navy-700 text-white` with a left accent bar; inactive `hover:bg-navy-700/50`; rounded items, comfortable spacing.
- **Header** — `sticky top-0`, white, `border-b border-navy-100`, `shadow-card`; left = page-context/system name; right = role-switcher `<select>` (restyled), a user chip (circular initials avatar in `bg-navy-100 text-navy-700` + full name + role `Badge`), and a Logout `Button` (secondary, lucide `LogOut` icon).
- **Main** — `bg-navy-50`, padded content area.

- [ ] **Step 2: Restyle `AuthLayout`**

Keep it rendering `<Outlet />`. Visual: full-height navy gradient background (`bg-gradient-to-br from-navy-800 to-navy-900`), centered white `rounded-lg shadow-overlay` card with generous padding.

- [ ] **Step 3: Run the verification gate**

Run: `npx vitest run` → **66 pass**. `npx tsc --noEmit` → clean. `npm run build` → succeeds.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(ui): restyle app shell and auth layout"
```

---

## Task 5: Establish the PageHeader pattern + restyle Login, Users

**Files:**
- Create: `src/components/PageHeader.tsx`
- Modify: `src/pages/login/LoginPage.tsx`, `src/pages/users/UsersPage.tsx`, `src/pages/users/UserFormModal.tsx`

- [ ] **Step 1: Create `src/components/PageHeader.tsx`**

```tsx
// src/components/PageHeader.tsx
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

/** Consistent page title block: title + optional description + right-aligned actions. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold text-navy-800">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-navy-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Restyle `LoginPage`**

Visual only — keep the form logic, all error branches, the disabled Forgot Password link, labels containing "Username"/"Password", and the submit button text "เข้าสู่ระบบ". Polish: a branded logo mark, clear heading + subtext, the system name, generously spaced fields, a full-width primary submit button, a muted version line. It sits inside the restyled `AuthLayout` card.

- [ ] **Step 3: Restyle `UsersPage` + `UserFormModal`**

Use `PageHeader` (title "จัดการผู้ใช้งาน", a short description, the "เพิ่มผู้ใช้" button as `actions`). Wrap the filter row and the table each in a white `rounded-lg shadow-card` card with consistent padding. Keep all behavior, the `DataTable` columns, the row-click-to-edit, the Deactivate visibility rule, `Pagination`, and `EmptyState`. `UserFormModal` — tidy form layout (a two-column grid for short fields), section spacing; keep all fields, validation, and the create/edit titles.

- [ ] **Step 4: Run the verification gate**

Run: `npx vitest run` → **66 pass**. `npx tsc --noEmit` → clean. `npm run build` → succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(ui): add PageHeader, restyle login and user management"
```

---

## Task 6: Restyle Borrowers, Search History, Activity Log

**Files:**
- Modify: `src/pages/borrowers/BorrowersPage.tsx`, `BorrowerDetailPage.tsx`, `BorrowerFormModal.tsx`, `DeclarationLinkTab.tsx`, `LinkDeclarationModal.tsx`, `src/pages/reports/SearchHistoryPage.tsx`, `src/pages/activity-log/ActivityLogPage.tsx`

- [ ] **Step 1: Restyle the borrower pages**

Keep ALL behavior. `BorrowersPage` — use `PageHeader`, wrap filters + table in cards (as Task 5). `BorrowerDetailPage` — a clean header card with borrower name + status/consent `Badge`s + Edit/Deactivate actions; restyle the two-tab control as a proper tab bar (underline-active style); the info tab shows fields in a tidy two-column definition grid. `DeclarationLinkTab` — table in a card, clear "เชื่อมโยงใบขน" action. `BorrowerFormModal` / `LinkDeclarationModal` — tidy form layout consistent with `UserFormModal`. Keep all fields, validation, RBAC button gating, the duplicate-warning Alert.

- [ ] **Step 2: Restyle `SearchHistoryPage`**

Use `PageHeader` ("รายงานประวัติการค้นหา"). Filter panel in a card; the Export Excel button styled as a clear secondary/success action with a lucide `Download` icon; table in a card; keep the total-count badge, `Pagination`, `EmptyState`, the เลขที่ใบขน `Link`, and all column content/headers (the header text "Reference Number" must stay — a test queries it).

- [ ] **Step 3: Restyle `ActivityLogPage`**

Use `PageHeader` ("Activity Log" / บันทึกกิจกรรม). Filter panel in a card; table in a card; keep the expandable-row before/after behavior, `Pagination`, `EmptyState`, the multi-select action-type filter, and the "IP Address" column header text (a test queries it). Action-type and module badges use the restyled `Badge`.

- [ ] **Step 4: Run the verification gate**

Run: `npx vitest run` → **66 pass**. `npx tsc --noEmit` → clean. `npm run build` → succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(ui): restyle borrower, report and activity-log pages"
```

---

## Task 7: Polish the Verify page + apply Skeleton loaders

**Files:**
- Modify: `src/pages/verify/VerifyPage.tsx`, `SearchForm.tsx`, `SummaryCard.tsx`, `TransactionTable.tsx`, `DocumentPreview.tsx`
- Modify (Skeleton loaders): `src/pages/users/UsersPage.tsx`, `src/pages/borrowers/BorrowersPage.tsx`, `src/pages/reports/SearchHistoryPage.tsx`, `src/pages/activity-log/ActivityLogPage.tsx`

- [ ] **Step 1: Restyle the Verify page**

Keep ALL behavior (search flow, error banners with exact text, the history banner, status badges, hold warning, both summary buttons, the preview modal, `logActivity`). `VerifyPage` — use `PageHeader`. `SearchForm` — in a card, the two inputs + Search/Clear buttons laid out cleanly. `SummaryCard` — a proper card with a header strip (declaration no. in `font-mono` + status `Badge`), a tidy field grid, clear FOB/CIF figures. `TransactionTable` — restyled `<table>` (consistent with `DataTable` styling), the meta block (row count / container / vessel / linked borrower) as small labelled items. `DocumentPreview` — make the simulated document look like a real customs form: bordered sheet, header band, labelled sections, a clean line-item table, totals; keep the `document-preview` className, the zoom buttons, and the print button.

- [ ] **Step 2: Apply Skeleton loaders to list pages**

In each of `UsersPage`, `BorrowersPage`, `SearchHistoryPage`, `ActivityLogPage`: while the list is loading, render a small stack of `Skeleton` rows (e.g. 6× `<Skeleton className="h-10 w-full" />`) inside the table card instead of (or alongside) the bare `Spinner`. Keep the existing loading state variable; just change what is rendered while loading. Do not change when data loads or the empty-state logic.

- [ ] **Step 3: Run the verification gate**

Run: `npx vitest run` → **66 pass**. `npx tsc --noEmit` → clean. `npm run build` → succeeds.
Note: the verify-page and list-page tests use `findBy*` queries that wait for content — Skeletons shown briefly during loading will not break them, but confirm the suite is green.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(ui): polish verify page and add skeleton loaders"
```

---

## Task 8: Final verification & consistency pass

**Files:** any file needing a consistency fix

- [ ] **Step 1: Full verification**

Run: `npx vitest run` → **66 pass**. `npx tsc --noEmit` → clean. `npm run build` → succeeds.

- [ ] **Step 2: Dev-server boot check**

Start `npm run dev` in the background, confirm it prints a Local URL with no errors, then stop it.

- [ ] **Step 3: Consistency sweep**

Review the restyled files for consistency: are spacing, card styling, `PageHeader` usage, badge tones, and button variants uniform across all 7 pages? Are there leftover emoji icons (should be lucide now)? Are there hardcoded hex colors that should use theme tokens? Fix any inconsistencies found. Re-run the verification gate after any change.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(ui): final consistency pass for refined corporate theme"
```

---

## Self-Review — Spec Coverage

| Spec section | Covered by |
|---|---|
| 2. Design tokens (colors/type/spacing/shadow) | Task 1 |
| 2. Font (IBM Plex Sans Thai) | Task 1 |
| 2. Icons (lucide-react) | Task 1, applied in Tasks 2-7 |
| 3. Primitive components restyle + Skeleton | Task 2 |
| 3. Composite components restyle | Task 3 |
| 4. Layout (AppLayout, AuthLayout) | Task 4 |
| 5. Page polish — PageHeader pattern, cards | Task 5 (pattern), Tasks 5-7 (all 7 pages) |
| 5. Loading skeletons | Task 7 |
| 5. DocumentPreview polish | Task 7 |
| 6. Micro-interactions (transitions, fade, slide) | Task 1 (keyframes), applied Tasks 2-4 |
| 7. Quality gate (65 tests, tsc, build) | every task; final in Task 8 |

No placeholders. Component prop contracts are explicitly preserved. The only new test is the `Skeleton` smoke test (test count 65 → 66 from Task 2 onward). Every task carries the same verification gate so regressions are caught immediately.
