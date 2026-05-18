# Verify Export Risk Intelligent — Frontend Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React frontend prototype of the Customs Declaration Verification System for Loan Processing, covering all 7 modules with mock data and no real backend.

**Architecture:** React SPA with a Mock Service Layer — TypeScript `api/` modules return Promises (with simulated latency) reading/writing in-memory stores seeded at startup. Global state via React Context. RBAC enforced by route guards and conditional rendering. When a real backend exists later, only the `api/` modules change.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, React Router v6, SheetJS (xlsx), Vitest + React Testing Library.

---

## Conventions

- **Language:** UI text in Thai. Code identifiers/comments in English.
- **IDs:** users `U-001`, borrowers `BR-00001`, links/history/log use `crypto.randomUUID()`.
- **Dates:** stored as ISO strings; displayed `DD/MM/YYYY` or `DD/MM/YYYY HH:mm:ss`.
- **Mock data resets on page refresh** (in-memory only).
- **TDD:** every task writes the failing test first. Run `npx vitest run <path>` for a single file.
- **Commit** after every task. Commit message prefix: `feat:`, `test:`, `chore:`.

---

## File Structure

```
src/
  types/index.ts                  All TypeScript interfaces & enums
  utils/validators.ts             Field validation functions
  utils/formatters.ts             Date & currency formatting
  utils/permissions.ts            RBAC matrix + canAccess()
  data/store.ts                   In-memory arrays + reset()
  data/seed.ts                    Seed data generators
  data/activityLog.ts             logActivity() writer
  api/_helpers.ts                 delay() + mock latency
  api/authApi.ts                  login / logout
  api/customsApi.ts               searchDeclaration (mock Customs Dept)
  api/userApi.ts                  user CRUD
  api/borrowerApi.ts              borrower CRUD
  api/declarationApi.ts           link / unlink declarations
  api/historyApi.ts               search history record/query
  api/activityLogApi.ts           activity log query
  context/AuthContext.tsx         current user + login/logout
  components/                     shared UI components (1 file each)
  layouts/AppLayout.tsx           sidebar + header shell
  layouts/AuthLayout.tsx          centered card for login
  routes/AppRoutes.tsx            route table
  routes/ProtectedRoute.tsx       RBAC guard
  pages/login/LoginPage.tsx
  pages/verify/VerifyPage.tsx + sub-components
  pages/reports/SearchHistoryPage.tsx
  pages/users/UsersPage.tsx + sub-components
  pages/borrowers/BorrowersPage.tsx + BorrowerDetailPage.tsx + sub-components
  pages/activity-log/ActivityLogPage.tsx
  App.tsx, main.tsx
```

---

## Task 1: Project scaffold & tooling

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `vitest.setup.ts`, `.gitignore`

- [ ] **Step 1: Initialize git and scaffold Vite project**

Run in `C:\Users\ice10\Desktop\eximth test`:
```bash
git init
npm create vite@latest . -- --template react-ts
npm install
```
If the directory is not empty, accept the prompt to continue (existing `docs/` and `เอกสารข้อมูล/` folders are kept).

- [ ] **Step 2: Install dependencies**

```bash
npm install react-router-dom xlsx
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npx tailwindcss init -p
```

- [ ] **Step 3: Configure Tailwind**

`tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1e3a5f',
        brand: '#2563eb',
        teal: '#0d9488',
      },
    },
  },
  plugins: [],
};
```

Replace `src/index.css` with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body { font-family: 'Sarabun', 'Segoe UI', sans-serif; }
```

- [ ] **Step 4: Configure Vitest**

Add to `vite.config.ts` inside `defineConfig({ ... })`:
```ts
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
```

Create `vitest.setup.ts`:
```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 5: Verify scaffold works**

Run: `npm run dev`
Expected: Vite dev server starts with no errors. Stop it with Ctrl+C.
Run: `npx vitest run`
Expected: "No test files found" (exit 0).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite React+TS project with Tailwind and Vitest"
```

---

## Task 2: TypeScript types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Write the types file**

```ts
// src/types/index.ts
export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'CREDIT_OFFICER'
  | 'BORROWER_DATA_ENTRY'
  | 'CUSTOMS_DATA_ENTRY'
  | 'AUDITOR';

export type EntityStatus = 'ACTIVE' | 'INACTIVE';
export type DeclarationStatus = 'RELEASED' | 'HOLD' | 'IN_PROCESS';
export type BorrowerType = 'JURISTIC' | 'INDIVIDUAL';
export type LogModule =
  | 'AUTH' | 'USER_MGMT' | 'BORROWER' | 'DECLARATION'
  | 'VERIFICATION' | 'REPORT' | 'SYSTEM';

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  role: Role;
  status: EntityStatus;
  password: string;            // mock only — never do this in production
  failedLoginCount: number;
  lockedUntil: string | null;  // ISO string
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Borrower {
  id: string;                  // BR-00001
  nameTh: string;
  nameEn: string;
  taxId: string;               // 13 digits
  borrowerType: BorrowerType;
  contactName: string;
  phone: string;
  email: string;
  creditLimit: number;
  consentGiven: boolean;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LineItem {
  productName: string;
  hsCode: string;
  quantity: number;
  unit: string;
  weight: number;
  unitPrice: number;
  totalValue: number;
  originCountry: string;
}

export interface Declaration {
  declarationNo: string;
  declarationDate: string;
  status: DeclarationStatus;
  fobValue: number;
  cifValue: number;
  currency: string;
  exporterName: string;
  destinationCountry: string;
  exportDate: string;
  containerNo: string | null;
  vesselName: string | null;
  lineItems: LineItem[];
}

export interface DeclarationLink {
  id: string;
  borrowerId: string;
  declarationNo: string;
  linkedAt: string;
  linkedByUsername: string;
  documentFileName: string;
}

export interface SearchHistoryRecord {
  id: string;
  declarationNo: string;
  referenceNumber: string;
  searchedByUserId: string;
  searchedByUsername: string;
  searchedByFullName: string;
  searchedByRole: Role;
  declarationStatus: DeclarationStatus;
  fobValue: number;
  currency: string;
  searchedAt: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  fullName: string;
  role: Role;
  actionType: string;
  module: LogModule;
  detail: string;
  beforeValue: string | null;
  afterValue: string | null;
  ipAddress: string;
}

/** Discriminated result for the mock Customs API. */
export type CustomsSearchResult =
  | { ok: true; declaration: Declaration }
  | { ok: false; error: 'NOT_FOUND' | 'TIMEOUT' };
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add core TypeScript types"
```

---

## Task 3: Validators

**Files:**
- Create: `src/utils/validators.ts`
- Test: `src/utils/validators.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/utils/validators.test.ts
import { describe, it, expect } from 'vitest';
import {
  validateUsername, validatePassword, validateReferenceNumber,
  validateTaxId, validatePhone, validateCreditLimit, validateEmail,
  validateDateRange,
} from './validators';

describe('validators', () => {
  it('username: 6-50 chars, no spaces', () => {
    expect(validateUsername('user01')).toBeNull();
    expect(validateUsername('abc')).toMatch(/6-50/);
    expect(validateUsername('has space')).toMatch(/6-50/);
  });

  it('password: 8+ chars with upper, lower, digit, special', () => {
    expect(validatePassword('Passw0rd!')).toBeNull();
    expect(validatePassword('weak')).not.toBeNull();
    expect(validatePassword('alllowercase1!')).not.toBeNull();
  });

  it('reference number: ^[A-Za-z0-9]{1,20}$', () => {
    expect(validateReferenceNumber('ABC123')).toBeNull();
    expect(validateReferenceNumber('')).not.toBeNull();
    expect(validateReferenceNumber('has-dash')).not.toBeNull();
    expect(validateReferenceNumber('A'.repeat(21))).not.toBeNull();
  });

  it('taxId: exactly 13 digits', () => {
    expect(validateTaxId('1234567890123')).toBeNull();
    expect(validateTaxId('123')).not.toBeNull();
  });

  it('phone: 9-10 digits', () => {
    expect(validatePhone('0812345678')).toBeNull();
    expect(validatePhone('123')).not.toBeNull();
  });

  it('creditLimit: number > 0', () => {
    expect(validateCreditLimit(100)).toBeNull();
    expect(validateCreditLimit(0)).not.toBeNull();
  });

  it('email: basic format', () => {
    expect(validateEmail('a@b.com')).toBeNull();
    expect(validateEmail('bad')).not.toBeNull();
  });

  it('dateRange: start <= end', () => {
    expect(validateDateRange('2026-01-01', '2026-01-02')).toBeNull();
    expect(validateDateRange('2026-01-03', '2026-01-01')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/utils/validators.test.ts`
Expected: FAIL — cannot find module `./validators`.

- [ ] **Step 3: Write the implementation**

```ts
// src/utils/validators.ts
/** Each validator returns a Thai error message, or null when valid. */

export function validateUsername(v: string): string | null {
  return /^[A-Za-z0-9]{6,50}$/.test(v)
    ? null
    : 'Username ต้องมี 6-50 ตัวอักษร ไม่มีช่องว่าง';
}

export function validatePassword(v: string): string | null {
  const ok =
    v.length >= 8 &&
    /[A-Z]/.test(v) && /[a-z]/.test(v) &&
    /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v);
  return ok ? null : 'Password ไม่ตรงตามเงื่อนไขความปลอดภัย';
}

export function validateReferenceNumber(v: string): string | null {
  return /^[A-Za-z0-9]{1,20}$/.test(v)
    ? null
    : 'Reference Number ต้องเป็นตัวอักษรภาษาอังกฤษหรือตัวเลข ไม่เกิน 20 หลัก';
}

export function validateTaxId(v: string): string | null {
  return /^[0-9]{13}$/.test(v)
    ? null
    : 'เลขนิติบุคคลต้องเป็นตัวเลข 13 หลัก';
}

export function validatePhone(v: string): string | null {
  return /^[0-9]{9,10}$/.test(v)
    ? null
    : 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง';
}

export function validateCreditLimit(v: number): string | null {
  return v > 0 ? null : 'วงเงินสินเชื่อต้องมากกว่า 0';
}

export function validateEmail(v: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
    ? null
    : 'รูปแบบอีเมลไม่ถูกต้อง';
}

export function validateDateRange(start: string, end: string): string | null {
  return new Date(start) <= new Date(end)
    ? null
    : 'วันเริ่มต้นต้องน้อยกว่าหรือเท่ากับวันสิ้นสุด';
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/utils/validators.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/utils/validators.ts src/utils/validators.test.ts
git commit -m "feat: add field validators"
```

---

## Task 4: Formatters

**Files:**
- Create: `src/utils/formatters.ts`
- Test: `src/utils/formatters.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/utils/formatters.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, formatCurrency } from './formatters';

describe('formatters', () => {
  it('formatDate -> DD/MM/YYYY', () => {
    expect(formatDate('2026-05-18T10:30:00.000Z')).toBe('18/05/2026');
  });
  it('formatDateTime -> DD/MM/YYYY HH:mm:ss', () => {
    expect(formatDateTime('2026-05-18T03:05:09.000Z'))
      .toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/);
  });
  it('formatCurrency -> #,###.## with 2 decimals', () => {
    expect(formatCurrency(1234567.5)).toBe('1,234,567.50');
    expect(formatCurrency(0)).toBe('0.00');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/utils/formatters.test.ts`
Expected: FAIL — cannot find module `./formatters`.

- [ ] **Step 3: Write the implementation**

```ts
// src/utils/formatters.ts
function pad(n: number): string { return String(n).padStart(2, '0'); }

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${formatDate(iso)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function formatCurrency(n: number): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/utils/formatters.test.ts`
Expected: PASS (3 tests). Note `formatDateTime` uses local time; the regex assertion tolerates timezone.

- [ ] **Step 5: Commit**

```bash
git add src/utils/formatters.ts src/utils/formatters.test.ts
git commit -m "feat: add date and currency formatters"
```

---

## Task 5: RBAC permissions

**Files:**
- Create: `src/utils/permissions.ts`
- Test: `src/utils/permissions.test.ts`

Module keys: `users`, `verify`, `history`, `borrowers`, `declarations`, `activityLog`.
Access derived from SRS 2.4 Permissions Matrix.

- [ ] **Step 1: Write the failing tests**

```ts
// src/utils/permissions.test.ts
import { describe, it, expect } from 'vitest';
import { canAccess, accessibleModules, landingRoute } from './permissions';

describe('permissions', () => {
  it('only Super Admin and Admin reach user management', () => {
    expect(canAccess('SUPER_ADMIN', 'users')).toBe(true);
    expect(canAccess('ADMIN', 'users')).toBe(true);
    expect(canAccess('CREDIT_OFFICER', 'users')).toBe(false);
  });
  it('Credit Officer can verify but not manage borrowers', () => {
    expect(canAccess('CREDIT_OFFICER', 'verify')).toBe(true);
    expect(canAccess('CREDIT_OFFICER', 'borrowers')).toBe(false);
  });
  it('only Super Admin and Auditor reach activity log', () => {
    expect(canAccess('AUDITOR', 'activityLog')).toBe(true);
    expect(canAccess('ADMIN', 'activityLog')).toBe(false);
  });
  it('accessibleModules excludes denied modules', () => {
    expect(accessibleModules('ADMIN')).toContain('users');
    expect(accessibleModules('ADMIN')).not.toContain('verify');
  });
  it('landingRoute picks the first accessible route', () => {
    expect(landingRoute('CREDIT_OFFICER')).toBe('/verify');
    expect(landingRoute('ADMIN')).toBe('/users');
    expect(landingRoute('BORROWER_DATA_ENTRY')).toBe('/borrowers');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/utils/permissions.test.ts`
Expected: FAIL — cannot find module `./permissions`.

- [ ] **Step 3: Write the implementation**

```ts
// src/utils/permissions.ts
import type { Role } from '../types';

export type ModuleKey =
  | 'users' | 'verify' | 'history'
  | 'borrowers' | 'declarations' | 'activityLog';

const MATRIX: Record<ModuleKey, Role[]> = {
  users:       ['SUPER_ADMIN', 'ADMIN'],
  verify:      ['SUPER_ADMIN', 'CREDIT_OFFICER', 'AUDITOR'],
  history:     ['SUPER_ADMIN', 'CREDIT_OFFICER', 'AUDITOR'],
  borrowers:   ['SUPER_ADMIN', 'BORROWER_DATA_ENTRY', 'AUDITOR'],
  declarations:['SUPER_ADMIN', 'CUSTOMS_DATA_ENTRY', 'AUDITOR'],
  activityLog: ['SUPER_ADMIN', 'AUDITOR'],
};

const ROUTE_ORDER: { module: ModuleKey; path: string }[] = [
  { module: 'verify', path: '/verify' },
  { module: 'users', path: '/users' },
  { module: 'borrowers', path: '/borrowers' },
  { module: 'history', path: '/reports/search-history' },
  { module: 'activityLog', path: '/activity-log' },
];

export function canAccess(role: Role, module: ModuleKey): boolean {
  return MATRIX[module].includes(role);
}

export function accessibleModules(role: Role): ModuleKey[] {
  return (Object.keys(MATRIX) as ModuleKey[]).filter((m) => canAccess(role, m));
}

export function landingRoute(role: Role): string {
  const hit = ROUTE_ORDER.find((r) => canAccess(role, r.module));
  return hit ? hit.path : '/verify';
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/utils/permissions.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/utils/permissions.ts src/utils/permissions.test.ts
git commit -m "feat: add RBAC permission matrix"
```

---

## Task 6: In-memory store & seed data

**Files:**
- Create: `src/data/store.ts`, `src/data/seed.ts`
- Test: `src/data/seed.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/data/seed.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { store, resetStore } from './store';

describe('seed data', () => {
  beforeEach(() => resetStore());

  it('seeds all 6 roles across users', () => {
    const roles = new Set(store.users.map((u) => u.role));
    expect(roles.size).toBe(6);
    expect(store.users.length).toBeGreaterThanOrEqual(8);
  });
  it('seeds borrowers, declarations, history, log', () => {
    expect(store.borrowers.length).toBeGreaterThanOrEqual(15);
    expect(store.declarations.length).toBeGreaterThanOrEqual(30);
    expect(store.searchHistory.length).toBeGreaterThanOrEqual(40);
    expect(store.activityLog.length).toBeGreaterThanOrEqual(60);
  });
  it('resetStore restores original counts', () => {
    store.users.pop();
    resetStore();
    expect(store.users.length).toBeGreaterThanOrEqual(8);
  });
  it('every declaration link points to a real borrower', () => {
    for (const link of store.declarationLinks) {
      expect(store.borrowers.some((b) => b.id === link.borrowerId)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/seed.test.ts`
Expected: FAIL — cannot find module `./store`.

- [ ] **Step 3: Write `seed.ts`**

Create `src/data/seed.ts` exporting builder functions that return fresh arrays each call:
- `buildUsers(): User[]` — 8 users, one per role plus 2 extra Credit Officers. Username pattern `superadmin`, `admin01`, `officer01`, `officer02`, `bde01`, `cde01`, `auditor01`, `admin02`. All `password: 'Passw0rd!'`, `status: 'ACTIVE'`, `failedLoginCount: 0`, `lockedUntil: null`. Thai `firstName`/`lastName`/`position`.
- `buildBorrowers(): Borrower[]` — 15 borrowers, IDs `BR-00001`..`BR-00015`, mixed `JURISTIC`/`INDIVIDUAL`, mixed `consentGiven`, 2 with `status: 'INACTIVE'`, unique 13-digit `taxId`.
- `buildDeclarations(): Declaration[]` — 30 declarations, `declarationNo` like `A012-650518000001` incrementing, statuses spread across `RELEASED`/`HOLD`/`IN_PROCESS`, each with 1-4 `lineItems` (each line: realistic `productName`, `hsCode`, `quantity`, `unit`, `weight`, `unitPrice`, `totalValue = quantity*unitPrice`, `originCountry`). `currency: 'USD'`.
- `buildDeclarationLinks(declarations, borrowers): DeclarationLink[]` — link ~20 declarations to borrowers that have `consentGiven: true`.
- `buildSearchHistory(declarations, users): SearchHistoryRecord[]` — 40 records over the last 30 days, `referenceNumber` values like `REF001`..`REFnnn`, `searchedAt` ISO strings.
- `buildActivityLog(users): ActivityLogEntry[]` — 60 entries across all 7 modules and varied `actionType` values, `ipAddress` like `192.168.1.x`.

All builders use fixed deterministic values (no `Math.random`) so counts and content are stable for tests.

- [ ] **Step 4: Write `store.ts`**

```ts
// src/data/store.ts
import type {
  User, Borrower, Declaration, DeclarationLink,
  SearchHistoryRecord, ActivityLogEntry,
} from '../types';
import {
  buildUsers, buildBorrowers, buildDeclarations,
  buildDeclarationLinks, buildSearchHistory, buildActivityLog,
} from './seed';

export interface Store {
  users: User[];
  borrowers: Borrower[];
  declarations: Declaration[];
  declarationLinks: DeclarationLink[];
  searchHistory: SearchHistoryRecord[];
  activityLog: ActivityLogEntry[];
}

export const store: Store = {
  users: [], borrowers: [], declarations: [],
  declarationLinks: [], searchHistory: [], activityLog: [],
};

export function resetStore(): void {
  store.users = buildUsers();
  store.borrowers = buildBorrowers();
  store.declarations = buildDeclarations();
  store.declarationLinks = buildDeclarationLinks(store.declarations, store.borrowers);
  store.searchHistory = buildSearchHistory(store.declarations, store.users);
  store.activityLog = buildActivityLog(store.users);
}

resetStore(); // seed on first import
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/data/seed.test.ts`
Expected: PASS (4 tests). Fix seed counts if any assertion fails.

- [ ] **Step 6: Commit**

```bash
git add src/data/store.ts src/data/seed.ts src/data/seed.test.ts
git commit -m "feat: add in-memory store and seed data"
```

---

## Task 7: Activity log writer & API helpers

**Files:**
- Create: `src/data/activityLog.ts`, `src/api/_helpers.ts`
- Test: `src/data/activityLog.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/data/activityLog.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { store, resetStore } from './store';
import { logActivity } from './activityLog';
import type { User } from '../types';

const actor: User = {
  id: 'U-001', username: 'officer01', firstName: 'สมชาย', lastName: 'ใจดี',
  email: 'a@b.com', phone: '0812345678', position: 'เจ้าหน้าที่สินเชื่อ',
  role: 'CREDIT_OFFICER', status: 'ACTIVE', password: 'x',
  failedLoginCount: 0, lockedUntil: null, lastLoginAt: null,
  createdAt: '2026-01-01', updatedAt: '2026-01-01',
};

describe('logActivity', () => {
  beforeEach(() => resetStore());

  it('prepends a new entry with the actor details', () => {
    const before = store.activityLog.length;
    logActivity(actor, 'VERIFICATION', 'DECLARATION_SEARCHED', 'ค้นหาใบขน X');
    expect(store.activityLog.length).toBe(before + 1);
    expect(store.activityLog[0].username).toBe('officer01');
    expect(store.activityLog[0].actionType).toBe('DECLARATION_SEARCHED');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/activityLog.test.ts`
Expected: FAIL — cannot find module `./activityLog`.

- [ ] **Step 3: Write the implementations**

```ts
// src/data/activityLog.ts
import { store } from './store';
import type { User, LogModule } from '../types';

export function logActivity(
  actor: User,
  module: LogModule,
  actionType: string,
  detail: string,
  beforeValue: string | null = null,
  afterValue: string | null = null,
): void {
  store.activityLog.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    userId: actor.id,
    username: actor.username,
    fullName: `${actor.firstName} ${actor.lastName}`,
    role: actor.role,
    actionType,
    module,
    detail,
    beforeValue,
    afterValue,
    ipAddress: '192.168.1.10',
  });
}
```

```ts
// src/api/_helpers.ts
/** Simulate network latency so the UI exercises real loading states. */
export function delay<T>(value: T, ms = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/activityLog.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/data/activityLog.ts src/api/_helpers.ts src/data/activityLog.test.ts
git commit -m "feat: add activity log writer and API delay helper"
```

---

## Task 8: Auth API

**Files:**
- Create: `src/api/authApi.ts`
- Test: `src/api/authApi.test.ts`

Rules: account locks after 5 consecutive failed logins; locked accounts reject login;
`INACTIVE` users cannot log in; success resets `failedLoginCount` and sets `lastLoginAt`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/api/authApi.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { resetStore, store } from '../data/store';
import { login } from './authApi';

describe('authApi.login', () => {
  beforeEach(() => resetStore());

  it('logs in with correct credentials', async () => {
    const r = await login('officer01', 'Passw0rd!');
    expect(r.ok).toBe(true);
  });
  it('rejects wrong password and increments counter', async () => {
    const r = await login('officer01', 'wrong');
    expect(r.ok).toBe(false);
    const u = store.users.find((x) => x.username === 'officer01')!;
    expect(u.failedLoginCount).toBe(1);
  });
  it('locks the account after 5 failures', async () => {
    for (let i = 0; i < 5; i++) await login('officer01', 'wrong');
    const r = await login('officer01', 'Passw0rd!');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('LOCKED');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/api/authApi.test.ts`
Expected: FAIL — cannot find module `./authApi`.

- [ ] **Step 3: Write the implementation**

```ts
// src/api/authApi.ts
import { store } from '../data/store';
import { logActivity } from '../data/activityLog';
import { delay } from './_helpers';
import type { User } from '../types';

export type LoginResult =
  | { ok: true; user: User }
  | { ok: false; reason: 'INVALID' | 'LOCKED' | 'INACTIVE'; attemptsLeft: number };

const MAX_ATTEMPTS = 5;

export function login(username: string, password: string): Promise<LoginResult> {
  const user = store.users.find((u) => u.username === username);

  if (!user) return delay({ ok: false, reason: 'INVALID', attemptsLeft: MAX_ATTEMPTS });

  if (user.lockedUntil) {
    logActivity(user, 'AUTH', 'LOGIN_FAILED', `บัญชีถูกล็อก: ${username}`);
    return delay({ ok: false, reason: 'LOCKED', attemptsLeft: 0 });
  }
  if (user.status === 'INACTIVE') {
    return delay({ ok: false, reason: 'INACTIVE', attemptsLeft: MAX_ATTEMPTS });
  }
  if (user.password !== password) {
    user.failedLoginCount += 1;
    const left = MAX_ATTEMPTS - user.failedLoginCount;
    if (user.failedLoginCount >= MAX_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + 30 * 60_000).toISOString();
      logActivity(user, 'AUTH', 'ACCOUNT_LOCKED', `บัญชีถูกล็อก: ${username}`);
      return delay({ ok: false, reason: 'LOCKED', attemptsLeft: 0 });
    }
    logActivity(user, 'AUTH', 'LOGIN_FAILED', `เข้าสู่ระบบไม่สำเร็จ: ${username}`);
    return delay({ ok: false, reason: 'INVALID', attemptsLeft: left });
  }

  user.failedLoginCount = 0;
  user.lastLoginAt = new Date().toISOString();
  logActivity(user, 'AUTH', 'LOGIN_SUCCESS', `เข้าสู่ระบบสำเร็จ: ${username}`);
  return delay({ ok: true, user });
}

export function logout(user: User): Promise<void> {
  logActivity(user, 'AUTH', 'LOGOUT', `ออกจากระบบ: ${user.username}`);
  return delay(undefined);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/api/authApi.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/api/authApi.ts src/api/authApi.test.ts
git commit -m "feat: add mock auth API with account locking"
```

---

## Task 9: Customs API (mock Customs Department)

**Files:**
- Create: `src/api/customsApi.ts`
- Test: `src/api/customsApi.test.ts`

Behavior: a known declaration number returns `{ ok: true }`; the special number
`TIMEOUT000000` returns `{ ok: false, error: 'TIMEOUT' }`; anything else returns
`{ ok: false, error: 'NOT_FOUND' }`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/api/customsApi.test.ts
import { describe, it, expect } from 'vitest';
import { store } from '../data/store';
import { searchDeclaration } from './customsApi';

describe('customsApi.searchDeclaration', () => {
  it('returns a known declaration', async () => {
    const known = store.declarations[0].declarationNo;
    const r = await searchDeclaration(known);
    expect(r.ok).toBe(true);
  });
  it('returns NOT_FOUND for unknown numbers', async () => {
    const r = await searchDeclaration('ZZZ-000000000000');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('NOT_FOUND');
  });
  it('returns TIMEOUT for the timeout sentinel', async () => {
    const r = await searchDeclaration('TIMEOUT000000');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('TIMEOUT');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/api/customsApi.test.ts`
Expected: FAIL — cannot find module `./customsApi`.

- [ ] **Step 3: Write the implementation**

```ts
// src/api/customsApi.ts
import { store } from '../data/store';
import { delay } from './_helpers';
import type { CustomsSearchResult } from '../types';

/** Mock of the Thai Customs Department API — all data is simulated. */
export function searchDeclaration(declarationNo: string): Promise<CustomsSearchResult> {
  if (declarationNo.trim() === 'TIMEOUT000000') {
    return delay<CustomsSearchResult>({ ok: false, error: 'TIMEOUT' }, 1200);
  }
  const found = store.declarations.find((d) => d.declarationNo === declarationNo.trim());
  if (found) return delay<CustomsSearchResult>({ ok: true, declaration: found }, 1000);
  return delay<CustomsSearchResult>({ ok: false, error: 'NOT_FOUND' }, 800);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/api/customsApi.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/api/customsApi.ts src/api/customsApi.test.ts
git commit -m "feat: add mock Customs Department search API"
```

---

## Task 10: Search history API

**Files:**
- Create: `src/api/historyApi.ts`
- Test: `src/api/historyApi.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/api/historyApi.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { resetStore, store } from '../data/store';
import { recordSearch, listHistory, hasHistory } from './historyApi';
import type { User, Declaration } from '../types';

const actor: User = {
  id: 'U-001', username: 'officer01', firstName: 'สมชาย', lastName: 'ใจดี',
  email: 'a@b.com', phone: '0812345678', position: 'CO', role: 'CREDIT_OFFICER',
  status: 'ACTIVE', password: 'x', failedLoginCount: 0, lockedUntil: null,
  lastLoginAt: null, createdAt: '2026-01-01', updatedAt: '2026-01-01',
};

describe('historyApi', () => {
  beforeEach(() => resetStore());

  it('recordSearch appends a record', async () => {
    const decl: Declaration = store.declarations[0];
    const before = store.searchHistory.length;
    await recordSearch(actor, decl, 'REFTEST');
    expect(store.searchHistory.length).toBe(before + 1);
  });
  it('hasHistory is true after recording', async () => {
    const decl = store.declarations[0];
    await recordSearch(actor, decl, 'REFTEST');
    expect(await hasHistory(decl.declarationNo)).toBe(true);
  });
  it('listHistory filters by declarationNo', async () => {
    const decl = store.declarations[0];
    await recordSearch(actor, decl, 'REFTEST');
    const rows = await listHistory({ declarationNo: decl.declarationNo });
    expect(rows.every((r) => r.declarationNo === decl.declarationNo)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/api/historyApi.test.ts`
Expected: FAIL — cannot find module `./historyApi`.

- [ ] **Step 3: Write the implementation**

```ts
// src/api/historyApi.ts
import { store } from '../data/store';
import { logActivity } from '../data/activityLog';
import { delay } from './_helpers';
import type { User, Declaration, SearchHistoryRecord } from '../types';

export interface HistoryFilter {
  dateFrom?: string;
  dateTo?: string;
  searchedBy?: string;       // matches username or full name (contains)
  declarationNo?: string;
  referenceNumber?: string;
}

export function recordSearch(
  actor: User, decl: Declaration, referenceNumber: string,
): Promise<SearchHistoryRecord> {
  const rec: SearchHistoryRecord = {
    id: crypto.randomUUID(),
    declarationNo: decl.declarationNo,
    referenceNumber,
    searchedByUserId: actor.id,
    searchedByUsername: actor.username,
    searchedByFullName: `${actor.firstName} ${actor.lastName}`,
    searchedByRole: actor.role,
    declarationStatus: decl.status,
    fobValue: decl.fobValue,
    currency: decl.currency,
    searchedAt: new Date().toISOString(),
  };
  store.searchHistory.unshift(rec);
  logActivity(actor, 'VERIFICATION', 'DECLARATION_SEARCHED',
    `ค้นหาใบขน ${decl.declarationNo} / Ref: ${referenceNumber}`);
  return delay(rec);
}

export function hasHistory(declarationNo: string): Promise<boolean> {
  return delay(store.searchHistory.some((r) => r.declarationNo === declarationNo), 100);
}

export function listHistory(filter: HistoryFilter = {}): Promise<SearchHistoryRecord[]> {
  let rows = [...store.searchHistory];
  if (filter.dateFrom)
    rows = rows.filter((r) => r.searchedAt >= filter.dateFrom!);
  if (filter.dateTo)
    rows = rows.filter((r) => r.searchedAt <= filter.dateTo! + 'T23:59:59.999Z');
  if (filter.searchedBy) {
    const q = filter.searchedBy.toLowerCase();
    rows = rows.filter((r) =>
      r.searchedByUsername.toLowerCase().includes(q) ||
      r.searchedByFullName.toLowerCase().includes(q));
  }
  if (filter.declarationNo)
    rows = rows.filter((r) => r.declarationNo.includes(filter.declarationNo!));
  if (filter.referenceNumber)
    rows = rows.filter((r) => r.referenceNumber.includes(filter.referenceNumber!));
  rows.sort((a, b) => b.searchedAt.localeCompare(a.searchedAt));
  return delay(rows);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/api/historyApi.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/api/historyApi.ts src/api/historyApi.test.ts
git commit -m "feat: add search history API"
```

---

## Task 11: User API

**Files:**
- Create: `src/api/userApi.ts`
- Test: `src/api/userApi.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/api/userApi.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { resetStore, store } from '../data/store';
import { listUsers, createUser, updateUser, deactivateUser } from './userApi';
import type { User } from '../types';

const admin = () => store.users.find((u) => u.role === 'ADMIN')!;
const newUserInput = {
  username: 'newuser01', firstName: 'ทดสอบ', lastName: 'ระบบ',
  email: 'new@b.com', phone: '0899999999', position: 'เจ้าหน้าที่',
  role: 'CREDIT_OFFICER' as const, password: 'Passw0rd!',
};

describe('userApi', () => {
  beforeEach(() => resetStore());

  it('listUsers filters by role', async () => {
    const rows = await listUsers({ role: 'AUDITOR' });
    expect(rows.every((u) => u.role === 'AUDITOR')).toBe(true);
  });
  it('createUser appends a user', async () => {
    const before = store.users.length;
    await createUser(admin(), newUserInput);
    expect(store.users.length).toBe(before + 1);
  });
  it('createUser rejects duplicate username', async () => {
    await expect(createUser(admin(), { ...newUserInput, username: 'admin01' }))
      .rejects.toThrow();
  });
  it('deactivateUser sets status INACTIVE', async () => {
    const target = store.users.find((u) => u.role === 'AUDITOR')!;
    await deactivateUser(admin(), target.id);
    expect(store.users.find((u) => u.id === target.id)!.status).toBe('INACTIVE');
  });
  it('deactivateUser rejects self-deactivation', async () => {
    const a = admin();
    await expect(deactivateUser(a, a.id)).rejects.toThrow();
  });
  it('updateUser changing role logs ROLE_CHANGED', async () => {
    const target = store.users.find((u) => u.role === 'AUDITOR')!;
    await updateUser(admin(), target.id, { role: 'CREDIT_OFFICER' });
    expect(store.activityLog.some((l) => l.actionType === 'ROLE_CHANGED')).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/api/userApi.test.ts`
Expected: FAIL — cannot find module `./userApi`.

- [ ] **Step 3: Write the implementation**

```ts
// src/api/userApi.ts
import { store } from '../data/store';
import { logActivity } from '../data/activityLog';
import { delay } from './_helpers';
import type { User, Role, EntityStatus } from '../types';

export interface UserFilter { query?: string; role?: Role; status?: EntityStatus; }
export interface NewUserInput {
  username: string; firstName: string; lastName: string; email: string;
  phone: string; position: string; role: Role; password: string;
}

let userSeq = 100;
function nextUserId(): string { userSeq += 1; return `U-${userSeq}`; }

export function listUsers(filter: UserFilter = {}): Promise<User[]> {
  let rows = [...store.users];
  if (filter.query) {
    const q = filter.query.toLowerCase();
    rows = rows.filter((u) =>
      u.username.toLowerCase().includes(q) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q));
  }
  if (filter.role) rows = rows.filter((u) => u.role === filter.role);
  if (filter.status) rows = rows.filter((u) => u.status === filter.status);
  return delay(rows);
}

export function createUser(actor: User, input: NewUserInput): Promise<User> {
  if (store.users.some((u) => u.username === input.username)) {
    return Promise.reject(new Error('Username นี้มีอยู่แล้วในระบบ'));
  }
  const now = new Date().toISOString();
  const user: User = {
    id: nextUserId(), ...input, status: 'ACTIVE',
    failedLoginCount: 0, lockedUntil: null, lastLoginAt: null,
    createdAt: now, updatedAt: now,
  };
  store.users.push(user);
  logActivity(actor, 'USER_MGMT', 'USER_CREATED', `สร้างผู้ใช้ ${user.username}`);
  return delay(user);
}

export function updateUser(
  actor: User, id: string, patch: Partial<NewUserInput & { status: EntityStatus }>,
): Promise<User> {
  const user = store.users.find((u) => u.id === id);
  if (!user) return Promise.reject(new Error('ไม่พบผู้ใช้'));
  const before = { ...user };
  Object.assign(user, patch, { updatedAt: new Date().toISOString() });
  if (patch.role && patch.role !== before.role) {
    logActivity(actor, 'USER_MGMT', 'ROLE_CHANGED',
      `เปลี่ยน Role ของ ${user.username}`, before.role, patch.role);
  } else {
    logActivity(actor, 'USER_MGMT', 'USER_UPDATED', `แก้ไขผู้ใช้ ${user.username}`);
  }
  return delay(user);
}

export function deactivateUser(actor: User, id: string): Promise<User> {
  if (actor.id === id) {
    return Promise.reject(new Error('ไม่สามารถปิดใช้งานบัญชีของตนเองได้'));
  }
  const user = store.users.find((u) => u.id === id);
  if (!user) return Promise.reject(new Error('ไม่พบผู้ใช้'));
  user.status = 'INACTIVE';
  user.updatedAt = new Date().toISOString();
  logActivity(actor, 'USER_MGMT', 'USER_DEACTIVATED', `ปิดใช้งานผู้ใช้ ${user.username}`);
  return delay(user);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/api/userApi.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/api/userApi.ts src/api/userApi.test.ts
git commit -m "feat: add user management API"
```

---

## Task 12: Borrower API

**Files:**
- Create: `src/api/borrowerApi.ts`
- Test: `src/api/borrowerApi.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/api/borrowerApi.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { resetStore, store } from '../data/store';
import { listBorrowers, getBorrower, createBorrower, deactivateBorrower } from './borrowerApi';

const admin = () => store.users.find((u) => u.role === 'SUPER_ADMIN')!;
const input = {
  nameTh: 'บริษัท ทดสอบ จำกัด', nameEn: 'Test Co', taxId: '9999999999999',
  borrowerType: 'JURISTIC' as const, contactName: 'ผู้ติดต่อ', phone: '0811111111',
  email: 't@b.com', creditLimit: 500000, consentGiven: true,
};

describe('borrowerApi', () => {
  beforeEach(() => resetStore());

  it('createBorrower appends and generates BR id', async () => {
    const b = await createBorrower(admin(), input);
    expect(b.id).toMatch(/^BR-\d{5}$/);
  });
  it('createBorrower rejects duplicate taxId', async () => {
    const existing = store.borrowers[0].taxId;
    await expect(createBorrower(admin(), { ...input, taxId: existing }))
      .rejects.toThrow();
  });
  it('getBorrower returns by id', async () => {
    const id = store.borrowers[0].id;
    expect((await getBorrower(id))?.id).toBe(id);
  });
  it('deactivateBorrower sets INACTIVE', async () => {
    const id = store.borrowers[0].id;
    await deactivateBorrower(admin(), id);
    expect(store.borrowers.find((b) => b.id === id)!.status).toBe('INACTIVE');
  });
  it('listBorrowers filters by type', async () => {
    const rows = await listBorrowers({ borrowerType: 'INDIVIDUAL' });
    expect(rows.every((b) => b.borrowerType === 'INDIVIDUAL')).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/api/borrowerApi.test.ts`
Expected: FAIL — cannot find module `./borrowerApi`.

- [ ] **Step 3: Write the implementation**

```ts
// src/api/borrowerApi.ts
import { store } from '../data/store';
import { logActivity } from '../data/activityLog';
import { delay } from './_helpers';
import type { User, Borrower, BorrowerType, EntityStatus } from '../types';

export interface BorrowerFilter {
  query?: string; status?: EntityStatus; borrowerType?: BorrowerType;
}
export interface NewBorrowerInput {
  nameTh: string; nameEn: string; taxId: string; borrowerType: BorrowerType;
  contactName: string; phone: string; email: string;
  creditLimit: number; consentGiven: boolean;
}

let borrowerSeq = 15;
function nextBorrowerId(): string {
  borrowerSeq += 1;
  return `BR-${String(borrowerSeq).padStart(5, '0')}`;
}

export function listBorrowers(filter: BorrowerFilter = {}): Promise<Borrower[]> {
  let rows = [...store.borrowers];
  if (filter.query) {
    const q = filter.query.toLowerCase();
    rows = rows.filter((b) =>
      b.nameTh.toLowerCase().includes(q) ||
      b.nameEn.toLowerCase().includes(q) ||
      b.taxId.includes(q) || b.id.toLowerCase().includes(q));
  }
  if (filter.status) rows = rows.filter((b) => b.status === filter.status);
  if (filter.borrowerType) rows = rows.filter((b) => b.borrowerType === filter.borrowerType);
  return delay(rows);
}

export function getBorrower(id: string): Promise<Borrower | undefined> {
  return delay(store.borrowers.find((b) => b.id === id), 300);
}

export function isTaxIdDuplicate(taxId: string): boolean {
  return store.borrowers.some((b) => b.taxId === taxId);
}

export function createBorrower(actor: User, input: NewBorrowerInput): Promise<Borrower> {
  if (isTaxIdDuplicate(input.taxId)) {
    return Promise.reject(new Error('เลขนิติบุคคลนี้มีอยู่แล้วในระบบ'));
  }
  const now = new Date().toISOString();
  const borrower: Borrower = {
    id: nextBorrowerId(), ...input, status: 'ACTIVE', createdAt: now, updatedAt: now,
  };
  store.borrowers.push(borrower);
  logActivity(actor, 'BORROWER', 'BORROWER_CREATED', `เพิ่มผู้กู้ ${borrower.nameTh}`);
  return delay(borrower);
}

export function updateBorrower(
  actor: User, id: string, patch: Partial<NewBorrowerInput>,
): Promise<Borrower> {
  const b = store.borrowers.find((x) => x.id === id);
  if (!b) return Promise.reject(new Error('ไม่พบผู้กู้'));
  const before = JSON.stringify(b);
  Object.assign(b, patch, { updatedAt: new Date().toISOString() });
  logActivity(actor, 'BORROWER', 'BORROWER_UPDATED', `แก้ไขผู้กู้ ${b.nameTh}`,
    before, JSON.stringify(b));
  return delay(b);
}

export function deactivateBorrower(actor: User, id: string): Promise<Borrower> {
  const b = store.borrowers.find((x) => x.id === id);
  if (!b) return Promise.reject(new Error('ไม่พบผู้กู้'));
  b.status = 'INACTIVE';
  b.updatedAt = new Date().toISOString();
  logActivity(actor, 'BORROWER', 'BORROWER_DEACTIVATED', `ปิดใช้งานผู้กู้ ${b.nameTh}`);
  return delay(b);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/api/borrowerApi.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/api/borrowerApi.ts src/api/borrowerApi.test.ts
git commit -m "feat: add borrower management API"
```

---

## Task 13: Declaration linkage API

**Files:**
- Create: `src/api/declarationApi.ts`
- Test: `src/api/declarationApi.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/api/declarationApi.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { resetStore, store } from '../data/store';
import { listLinksByBorrower, linkDeclaration, unlinkDeclaration } from './declarationApi';

const admin = () => store.users.find((u) => u.role === 'SUPER_ADMIN')!;

describe('declarationApi', () => {
  beforeEach(() => resetStore());

  it('linkDeclaration adds a link', async () => {
    const borrowerId = store.borrowers[0].id;
    const before = store.declarationLinks.length;
    await linkDeclaration(admin(), borrowerId, 'NEW-DECL-0001', 'doc.pdf');
    expect(store.declarationLinks.length).toBe(before + 1);
  });
  it('linkDeclaration rejects a duplicate link for the same borrower', async () => {
    const borrowerId = store.borrowers[0].id;
    await linkDeclaration(admin(), borrowerId, 'DUP-0001', 'doc.pdf');
    await expect(linkDeclaration(admin(), borrowerId, 'DUP-0001', 'doc.pdf'))
      .rejects.toThrow();
  });
  it('unlinkDeclaration removes the link', async () => {
    const borrowerId = store.borrowers[0].id;
    const link = await linkDeclaration(admin(), borrowerId, 'TMP-0001', 'doc.pdf');
    await unlinkDeclaration(admin(), link.id);
    expect(store.declarationLinks.some((l) => l.id === link.id)).toBe(false);
  });
  it('listLinksByBorrower returns only that borrower links', async () => {
    const borrowerId = store.borrowers[0].id;
    const rows = await listLinksByBorrower(borrowerId);
    expect(rows.every((l) => l.borrowerId === borrowerId)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/api/declarationApi.test.ts`
Expected: FAIL — cannot find module `./declarationApi`.

- [ ] **Step 3: Write the implementation**

```ts
// src/api/declarationApi.ts
import { store } from '../data/store';
import { logActivity } from '../data/activityLog';
import { delay } from './_helpers';
import type { User, DeclarationLink } from '../types';

export function listLinksByBorrower(borrowerId: string): Promise<DeclarationLink[]> {
  const rows = store.declarationLinks
    .filter((l) => l.borrowerId === borrowerId)
    .sort((a, b) => b.linkedAt.localeCompare(a.linkedAt));
  return delay(rows);
}

export function linkDeclaration(
  actor: User, borrowerId: string, declarationNo: string, documentFileName: string,
): Promise<DeclarationLink> {
  const dup = store.declarationLinks.some(
    (l) => l.borrowerId === borrowerId && l.declarationNo === declarationNo);
  if (dup) return Promise.reject(new Error('ใบขนนี้ถูกเชื่อมโยงกับผู้กู้รายนี้แล้ว'));

  const link: DeclarationLink = {
    id: crypto.randomUUID(),
    borrowerId, declarationNo, documentFileName,
    linkedAt: new Date().toISOString(),
    linkedByUsername: actor.username,
  };
  store.declarationLinks.push(link);
  logActivity(actor, 'DECLARATION', 'DECLARATION_LINKED',
    `เชื่อมโยงใบขน ${declarationNo} กับผู้กู้ ${borrowerId}`);
  return delay(link);
}

export function unlinkDeclaration(actor: User, linkId: string): Promise<void> {
  const idx = store.declarationLinks.findIndex((l) => l.id === linkId);
  if (idx === -1) return Promise.reject(new Error('ไม่พบการเชื่อมโยง'));
  const [removed] = store.declarationLinks.splice(idx, 1);
  logActivity(actor, 'DECLARATION', 'DECLARATION_UNLINKED',
    `ยกเลิกการเชื่อมโยงใบขน ${removed.declarationNo}`);
  return delay(undefined);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/api/declarationApi.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/api/declarationApi.ts src/api/declarationApi.test.ts
git commit -m "feat: add declaration linkage API"
```

---

## Task 14: Activity log query API

**Files:**
- Create: `src/api/activityLogApi.ts`
- Test: `src/api/activityLogApi.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/api/activityLogApi.test.ts
import { describe, it, expect } from 'vitest';
import { resetStore, store } from '../data/store';
import { listActivityLog } from './activityLogApi';

describe('activityLogApi', () => {
  it('filters by module', async () => {
    resetStore();
    const rows = await listActivityLog({ module: 'AUTH' });
    expect(rows.every((r) => r.module === 'AUTH')).toBe(true);
  });
  it('returns newest first', async () => {
    resetStore();
    const rows = await listActivityLog({});
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].timestamp >= rows[i].timestamp).toBe(true);
    }
  });
  it('filters by actionType list', async () => {
    resetStore();
    const sample = store.activityLog[0].actionType;
    const rows = await listActivityLog({ actionTypes: [sample] });
    expect(rows.every((r) => r.actionType === sample)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/api/activityLogApi.test.ts`
Expected: FAIL — cannot find module `./activityLogApi`.

- [ ] **Step 3: Write the implementation**

```ts
// src/api/activityLogApi.ts
import { store } from '../data/store';
import { delay } from './_helpers';
import type { ActivityLogEntry, LogModule } from '../types';

export interface ActivityLogFilter {
  dateFrom?: string;
  dateTo?: string;
  username?: string;
  actionTypes?: string[];
  module?: LogModule;
}

export function listActivityLog(
  filter: ActivityLogFilter = {},
): Promise<ActivityLogEntry[]> {
  let rows = [...store.activityLog];
  if (filter.dateFrom) rows = rows.filter((r) => r.timestamp >= filter.dateFrom!);
  if (filter.dateTo)
    rows = rows.filter((r) => r.timestamp <= filter.dateTo! + 'T23:59:59.999Z');
  if (filter.username) {
    const q = filter.username.toLowerCase();
    rows = rows.filter((r) => r.username.toLowerCase().includes(q));
  }
  if (filter.actionTypes && filter.actionTypes.length)
    rows = rows.filter((r) => filter.actionTypes!.includes(r.actionType));
  if (filter.module) rows = rows.filter((r) => r.module === filter.module);
  rows.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return delay(rows);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/api/activityLogApi.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/api/activityLogApi.ts src/api/activityLogApi.test.ts
git commit -m "feat: add activity log query API"
```

---

## Task 15: AuthContext

**Files:**
- Create: `src/context/AuthContext.tsx`
- Test: `src/context/AuthContext.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/context/AuthContext.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { resetStore } from '../data/store';
import { AuthProvider, useAuth } from './AuthContext';

function Probe() {
  const { user, signIn } = useAuth();
  return (
    <div>
      <span data-testid="who">{user ? user.username : 'none'}</span>
      <button onClick={() => signIn('officer01', 'Passw0rd!')}>login</button>
    </div>
  );
}

describe('AuthContext', () => {
  it('signIn sets the current user', async () => {
    resetStore();
    render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByTestId('who').textContent).toBe('none');
    await act(async () => { screen.getByText('login').click(); });
    expect(screen.getByTestId('who').textContent).toBe('officer01');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/context/AuthContext.test.tsx`
Expected: FAIL — cannot find module `./AuthContext`.

- [ ] **Step 3: Write the implementation**

```tsx
// src/context/AuthContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, type LoginResult } from '../api/authApi';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  signIn: (username: string, password: string) => Promise<LoginResult>;
  signOut: () => Promise<void>;
  switchRole: (user: User) => void;   // demo helper
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function signIn(username: string, password: string): Promise<LoginResult> {
    const result = await apiLogin(username, password);
    if (result.ok) setUser(result.user);
    return result;
  }
  async function signOut(): Promise<void> {
    if (user) await apiLogout(user);
    setUser(null);
  }
  function switchRole(next: User): void { setUser(next); }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/context/AuthContext.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/context/AuthContext.tsx src/context/AuthContext.test.tsx
git commit -m "feat: add AuthContext"
```

---

## Task 16: Shared UI components

**Files:**
- Create: `src/components/Button.tsx`, `Badge.tsx`, `TextInput.tsx`, `PasswordInput.tsx`,
  `Dropdown.tsx`, `Toggle.tsx`, `Modal.tsx`, `ConfirmDialog.tsx`, `Alert.tsx`,
  `Toast.tsx`, `EmptyState.tsx`, `Spinner.tsx`, `DataTable.tsx`, `Pagination.tsx`,
  `DateRangePicker.tsx`
- Test: `src/components/components.test.tsx`

Each component is presentational and Tailwind-styled. Follow these contracts:

- `Button` — props `variant: 'primary'|'secondary'|'danger'`, `loading?`, `disabled?`,
  standard button props. Primary = navy bg, danger = red bg, secondary = gray border.
- `Badge` — props `text`, `tone: 'green'|'red'|'amber'|'gray'|'navy'|'blue'|'teal'`.
- `TextInput` — props `label`, `value`, `onChange(v:string)`, `error?`, `required?`,
  `placeholder?`, `readOnly?`. Shows red `error` text below when present.
- `PasswordInput` — like `TextInput` plus a show/hide eye toggle.
- `Dropdown` — props `label`, `value`, `onChange(v:string)`, `options: {value,label}[]`,
  `error?`, `required?`.
- `Toggle` — props `checked`, `onChange(b:boolean)`, `label?`.
- `Modal` — props `open`, `title`, `onClose`, `children`, `footer?`. Renders a centered
  card over a dark overlay; closes on overlay click.
- `ConfirmDialog` — props `open`, `title`, `message`, `confirmLabel`, `danger?`,
  `onConfirm`, `onCancel`. Built on `Modal`.
- `Alert` — props `tone: 'error'|'warning'|'info'|'success'`, `children`,
  `variant: 'inline'|'banner'`, `onRetry?` (renders a retry button when provided).
- `Toast` — props `message`, `visible`. Fixed bottom-right.
- `EmptyState` — props `message`. Centered muted text + icon.
- `Spinner` — small animated loading indicator.
- `DataTable<T>` — props `columns: {key,header,render?(row:T):ReactNode,className?}[]`,
  `rows: T[]`, `rowKey(row:T):string`, `onRowClick?(row:T)`. Renders `<table>` with a
  navy header row. When `rows` is empty renders nothing (page supplies `EmptyState`).
- `Pagination` — props `page`, `pageSize`, `total`, `pageSizeOptions:number[]`,
  `onPageChange(p:number)`, `onPageSizeChange(s:number)`. Shows "X-Y of Z".
- `DateRangePicker` — props `from`, `to`, `onChange(from:string,to:string)`. Two
  native `<input type="date">` fields.

- [ ] **Step 1: Write a smoke test covering the core components**

```tsx
// src/components/components.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';
import { Badge } from './Badge';
import { DataTable } from './DataTable';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';

describe('shared components', () => {
  it('Button renders its label', () => {
    render(<Button variant="primary">บันทึก</Button>);
    expect(screen.getByText('บันทึก')).toBeInTheDocument();
  });
  it('Badge renders its text', () => {
    render(<Badge text="Active" tone="green" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
  it('DataTable renders rows', () => {
    render(
      <DataTable
        columns={[{ key: 'name', header: 'ชื่อ' }]}
        rows={[{ name: 'ทดสอบ' }]}
        rowKey={(r) => r.name}
      />,
    );
    expect(screen.getByText('ทดสอบ')).toBeInTheDocument();
  });
  it('EmptyState renders its message', () => {
    render(<EmptyState message="ไม่มีข้อมูล" />);
    expect(screen.getByText('ไม่มีข้อมูล')).toBeInTheDocument();
  });
  it('Pagination shows the range summary', () => {
    render(
      <Pagination page={1} pageSize={20} total={45} pageSizeOptions={[20, 50, 100]}
        onPageChange={() => {}} onPageSizeChange={() => {}} />,
    );
    expect(screen.getByText(/1-20 of 45/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/components.test.tsx`
Expected: FAIL — cannot find component modules.

- [ ] **Step 3: Implement all 15 components per the contracts above**

Each component is one file with a named export. Keep them small and Tailwind-styled.
Use the `navy`/`brand`/`teal` theme colors. `DataTable` and `Pagination` must satisfy
the test assertions (`DataTable` renders `columns[].header` and per-row `columns[].key`
or `render`; `Pagination` renders the literal text `${start}-${end} of ${total}`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/components.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/
git commit -m "feat: add shared UI component library"
```

---

## Task 17: Layouts, routing & RBAC guard

**Files:**
- Create: `src/layouts/AuthLayout.tsx`, `src/layouts/AppLayout.tsx`,
  `src/routes/ProtectedRoute.tsx`, `src/routes/AppRoutes.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`
- Test: `src/routes/ProtectedRoute.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/routes/ProtectedRoute.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

describe('ProtectedRoute', () => {
  it('redirects to /login when no user is signed in', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/users']}>
          <Routes>
            <Route path="/login" element={<div>LOGIN PAGE</div>} />
            <Route element={<ProtectedRoute module="users" />}>
              <Route path="/users" element={<div>USERS PAGE</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/routes/ProtectedRoute.test.tsx`
Expected: FAIL — cannot find module `./ProtectedRoute`.

- [ ] **Step 3: Write `ProtectedRoute.tsx`**

```tsx
// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccess, type ModuleKey } from '../utils/permissions';

export function ProtectedRoute({ module }: { module: ModuleKey }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!canAccess(user.role, module)) return <Navigate to="/login" replace />;
  return <Outlet />;
}
```

- [ ] **Step 4: Write the layouts and route table**

`AuthLayout.tsx` — centered card on a navy gradient background; renders `<Outlet />`.

`AppLayout.tsx` — left sidebar + top header + `<main>` with `<Outlet />`:
- Sidebar lists only modules from `accessibleModules(user.role)` mapped to nav links:
  `verify`→"ตรวจสอบใบขน" `/verify`, `history`→"รายงานประวัติการค้นหา"
  `/reports/search-history`, `users`→"จัดการผู้ใช้งาน" `/users`,
  `borrowers`→"จัดการข้อมูลผู้กู้" `/borrowers`, `activityLog`→"Activity Log"
  `/activity-log`.
- Header shows system name, current user name + role badge, a **role switcher**
  `<select>` (calls `switchRole` with a seed user of the chosen role from `store.users`),
  and a Logout button (`signOut()` then navigate to `/login`).

`AppRoutes.tsx`:
```tsx
// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { landingRoute } from '../utils/permissions';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthLayout } from '../layouts/AuthLayout';
import { AppLayout } from '../layouts/AppLayout';
import { LoginPage } from '../pages/login/LoginPage';
import { VerifyPage } from '../pages/verify/VerifyPage';
import { SearchHistoryPage } from '../pages/reports/SearchHistoryPage';
import { UsersPage } from '../pages/users/UsersPage';
import { BorrowersPage } from '../pages/borrowers/BorrowersPage';
import { BorrowerDetailPage } from '../pages/borrowers/BorrowerDetailPage';
import { ActivityLogPage } from '../pages/activity-log/ActivityLogPage';

export function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route element={<ProtectedRoute module="verify" />}>
          <Route path="/verify" element={<VerifyPage />} />
        </Route>
        <Route element={<ProtectedRoute module="history" />}>
          <Route path="/reports/search-history" element={<SearchHistoryPage />} />
        </Route>
        <Route element={<ProtectedRoute module="users" />}>
          <Route path="/users" element={<UsersPage />} />
        </Route>
        <Route element={<ProtectedRoute module="borrowers" />}>
          <Route path="/borrowers" element={<BorrowersPage />} />
          <Route path="/borrowers/:id" element={<BorrowerDetailPage />} />
        </Route>
        <Route element={<ProtectedRoute module="activityLog" />}>
          <Route path="/activity-log" element={<ActivityLogPage />} />
        </Route>
      </Route>
      <Route path="*" element={
        <Navigate to={user ? landingRoute(user.role) : '/login'} replace />
      } />
    </Routes>
  );
}
```
Note: the Data & Linkage view (Task 22) lives inside `BorrowerDetailPage`, so no
separate `/declarations` route is needed.

`App.tsx`:
```tsx
// src/App.tsx
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
```
Ensure `src/main.tsx` renders `<App />` and imports `./index.css`.

To make pages importable before they exist, create temporary stub files for each page
component that export a named component returning `<div>{name}</div>`. Tasks 18-24
replace these stubs.

- [ ] **Step 5: Run test + typecheck**

Run: `npx vitest run src/routes/ProtectedRoute.test.tsx`
Expected: PASS (1 test).
Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/ src/routes/ src/App.tsx src/main.tsx src/pages/
git commit -m "feat: add layouts, routing and RBAC route guard"
```

---

## Task 18: Login page

**Files:**
- Modify: `src/pages/login/LoginPage.tsx` (replace stub)
- Test: `src/pages/login/LoginPage.test.tsx`

UI fields from FieldSpec Feature 01: Username, Password (show/hide), Login button
(disabled when a field is empty, loading while verifying), inline error message, lock
warning counter ("เหลือ X ครั้ง"), Forgot Password link (disabled — Pending), system
logo/name, version number.

- [ ] **Step 1: Write the failing test**

```tsx
// src/pages/login/LoginPage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { resetStore } from '../../data/store';
import { AuthProvider } from '../../context/AuthContext';
import { LoginPage } from './LoginPage';

function setup() {
  return render(
    <AuthProvider><MemoryRouter><LoginPage /></MemoryRouter></AuthProvider>,
  );
}

describe('LoginPage', () => {
  it('shows an error on wrong credentials', async () => {
    resetStore();
    setup();
    await userEvent.type(screen.getByLabelText(/Username/i), 'officer01');
    await userEvent.type(screen.getByLabelText(/Password/i), 'wrongpass');
    await act(async () => { await userEvent.click(screen.getByRole('button', { name: /เข้าสู่ระบบ/ })); });
    expect(await screen.findByText(/ไม่ถูกต้อง|เหลือ/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/login/LoginPage.test.tsx`
Expected: FAIL — stub has no inputs / no error text.

- [ ] **Step 3: Implement `LoginPage`**

Build the form with `TextInput`, `PasswordInput`, `Button`, `Alert`. On submit call
`useAuth().signIn`. On `result.ok` navigate to `landingRoute(result.user.role)`. On
failure show `Alert` (tone error) and, when `result.reason === 'INVALID'` and
`attemptsLeft < 5`, render "เหลือ {attemptsLeft} ครั้ง ก่อนบัญชีจะถูกล็อก"; when
`reason === 'LOCKED'` show "บัญชีถูกล็อก กรุณาติดต่อผู้ดูแลระบบ". Forgot Password link
is disabled with title "ฟังก์ชันนี้ยังไม่เปิดใช้งาน". Use accessible labels so
`getByLabelText(/Username/i)` and `/Password/i` resolve. The submit button label
contains "เข้าสู่ระบบ".

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/login/LoginPage.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/pages/login/
git commit -m "feat: add login page"
```

---

## Task 19: Verify page — search form & summary card

**Files:**
- Modify: `src/pages/verify/VerifyPage.tsx` (replace stub)
- Create: `src/pages/verify/SearchForm.tsx`, `src/pages/verify/SummaryCard.tsx`
- Test: `src/pages/verify/VerifyPage.test.tsx`

Behavior (FieldSpec Feature 05A/05B): both Reference Number and เลขที่ใบขน are
required; Reference Number validated by `validateReferenceNumber`; Search button
disabled when either field empty, spinner during the API call. On
`searchDeclaration` success render `SummaryCard` and call `recordSearch`. On
`error: 'NOT_FOUND'` show banner "ไม่พบข้อมูลใบขนนี้ในระบบ"; on `error: 'TIMEOUT'`
show banner "ไม่สามารถเชื่อมต่อระบบศุลกากรได้ กรุณาลองใหม่" with a retry button.
After a successful search, if `hasHistory(declarationNo)` is true show the Search
History info banner with a link to `/reports/search-history`. `SummaryCard` shows
เลขที่ใบขน, วันที่, สถานะ badge (RELEASED green / HOLD red / IN_PROCESS amber),
มูลค่า FOB & CIF + currency, ผู้ส่งออก, ประเทศปลายทาง, วันที่ส่งออก, the Reference
Number used, a Hold warning banner when status is HOLD, a "Preview เอกสาร" button
and a "ดูประวัติค้นหา" button.

- [ ] **Step 1: Write the failing test**

```tsx
// src/pages/verify/VerifyPage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { resetStore, store } from '../../data/store';
import { AuthProvider } from '../../context/AuthContext';
import { VerifyPage } from './VerifyPage';

describe('VerifyPage', () => {
  it('shows summary after a successful search', async () => {
    resetStore();
    const known = store.declarations[0].declarationNo;
    render(
      <AuthProvider><MemoryRouter><VerifyPage /></MemoryRouter></AuthProvider>,
    );
    await userEvent.type(screen.getByLabelText(/Reference Number/i), 'REF999');
    await userEvent.type(screen.getByLabelText(/เลขที่ใบขน/), known);
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /ค้นหา/ }));
    });
    expect(await screen.findByText(known)).toBeInTheDocument();
  });

  it('shows a not-found banner for an unknown declaration', async () => {
    resetStore();
    render(
      <AuthProvider><MemoryRouter><VerifyPage /></MemoryRouter></AuthProvider>,
    );
    await userEvent.type(screen.getByLabelText(/Reference Number/i), 'REF999');
    await userEvent.type(screen.getByLabelText(/เลขที่ใบขน/), 'ZZZ-000000000000');
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /ค้นหา/ }));
    });
    expect(await screen.findByText(/ไม่พบข้อมูลใบขน/)).toBeInTheDocument();
  });
});
```

Note: `VerifyPage` test renders without `AppLayout`, so it must not depend on layout
context. It does use `useAuth()` for the actor — seed a default user: if `useAuth().user`
is null, fall back to `store.users.find(u => u.role === 'CREDIT_OFFICER')`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/verify/VerifyPage.test.tsx`
Expected: FAIL — stub renders nothing useful.

- [ ] **Step 3: Implement `SearchForm`, `SummaryCard`, and `VerifyPage`**

`VerifyPage` holds state: `declaration: Declaration | null`, `error`, `loading`,
`referenceUsed`, `historyExists`. Wire to `customsApi.searchDeclaration`,
`historyApi.recordSearch`, `historyApi.hasHistory`. Keep the Preview button wired to
local state `previewOpen` (the preview component arrives in Task 20).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/verify/VerifyPage.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/pages/verify/
git commit -m "feat: add verify page search form and summary card"
```

---

## Task 20: Verify page — transaction detail & document preview

**Files:**
- Create: `src/pages/verify/TransactionTable.tsx`, `src/pages/verify/DocumentPreview.tsx`
- Modify: `src/pages/verify/VerifyPage.tsx`
- Test: `src/pages/verify/TransactionTable.test.tsx`

`TransactionTable` (FieldSpec 05C) — `DataTable` of `declaration.lineItems` with
columns ชื่อสินค้า, HS Code, จำนวน+หน่วย, น้ำหนัก, ราคาต่อหน่วย, มูลค่ารวม,
ประเทศกำเนิดสินค้า; below it แสดง "แสดง X รายการ", เลขที่ตู้คอนเทนเนอร์, ชื่อเรือ/
เที่ยวบิน, and the linked borrower name (look up `store.declarationLinks` +
`store.borrowers` by `declarationNo`).

`DocumentPreview` (FieldSpec 05D — Pending in spec, rendered as HTML here) — a `Modal`
showing a simulated customs declaration document laid out in HTML/CSS: header with
เลขที่ใบขน + วันที่ + สถานะ, exporter/destination block, the full line-item table,
totals. Includes Zoom In/Out buttons (scale the document container via a `transform`
state) and a Print button (`window.print()`). Logs `DECLARATION_PREVIEWED` via
`logActivity` when opened.

- [ ] **Step 1: Write the failing test**

```tsx
// src/pages/verify/TransactionTable.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { resetStore, store } from '../../data/store';
import { TransactionTable } from './TransactionTable';

describe('TransactionTable', () => {
  it('renders one row per line item and the row count', () => {
    resetStore();
    const decl = store.declarations[0];
    render(<TransactionTable declaration={decl} />);
    expect(screen.getByText(decl.lineItems[0].productName)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`แสดง ${decl.lineItems.length} รายการ`)))
      .toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/verify/TransactionTable.test.tsx`
Expected: FAIL — cannot find module `./TransactionTable`.

- [ ] **Step 3: Implement `TransactionTable`, `DocumentPreview`, and wire into `VerifyPage`**

`VerifyPage` renders `TransactionTable` below `SummaryCard`, and `DocumentPreview`
controlled by `previewOpen`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/verify/TransactionTable.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/pages/verify/
git commit -m "feat: add transaction detail table and document preview"
```

---

## Task 21: Search History Report & Excel export

**Files:**
- Modify: `src/pages/reports/SearchHistoryPage.tsx` (replace stub)
- Create: `src/pages/reports/exportExcel.ts`
- Test: `src/pages/reports/exportExcel.test.ts`, `src/pages/reports/SearchHistoryPage.test.tsx`

`exportExcel.ts` — `buildHistoryWorkbook(rows: SearchHistoryRecord[])` returns an
`xlsx` workbook with a header row (วันเวลาที่ค้นหา, ชื่อผู้ค้นหา, Role, เลขที่ใบขน,
Reference Number, สถานะใบขน, มูลค่า FOB) and `downloadHistoryExcel(rows)` triggers
`XLSX.writeFile`. Keep `buildHistoryWorkbook` pure for testing.

`SearchHistoryPage` (FieldSpec Feature 06) — Filter panel (date range, ผู้ค้นหา,
เลขที่ใบขน, Reference Number) + Apply + Reset + Export Excel buttons; `DataTable` with
columns #, วันเวลา, ผู้ค้นหา (full name + username), Role badge, เลขที่ใบขน (link to
`/verify`), Reference Number, สถานะใบขน badge, มูลค่า FOB; `Pagination`
(20/50/100); `EmptyState` when no rows; total count badge. Calls
`historyApi.listHistory` and logs `REPORT_VIEWED` on mount, `REPORT_EXPORTED` on export.

- [ ] **Step 1: Write the failing tests**

```ts
// src/pages/reports/exportExcel.test.ts
import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { buildHistoryWorkbook } from './exportExcel';
import type { SearchHistoryRecord } from '../../types';

const row: SearchHistoryRecord = {
  id: '1', declarationNo: 'A012-650518000001', referenceNumber: 'REF001',
  searchedByUserId: 'U-001', searchedByUsername: 'officer01',
  searchedByFullName: 'สมชาย ใจดี', searchedByRole: 'CREDIT_OFFICER',
  declarationStatus: 'RELEASED', fobValue: 1000, currency: 'USD',
  searchedAt: '2026-05-18T03:00:00.000Z',
};

describe('buildHistoryWorkbook', () => {
  it('produces a sheet with a header and one data row', () => {
    const wb = buildHistoryWorkbook([row]);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    expect(json.length).toBe(2);
    expect((json[1] as string[]).includes('A012-650518000001')).toBe(true);
  });
});
```

```tsx
// src/pages/reports/SearchHistoryPage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetStore } from '../../data/store';
import { AuthProvider } from '../../context/AuthContext';
import { SearchHistoryPage } from './SearchHistoryPage';

describe('SearchHistoryPage', () => {
  it('renders the report table with seeded history', async () => {
    resetStore();
    render(
      <AuthProvider><MemoryRouter><SearchHistoryPage /></MemoryRouter></AuthProvider>,
    );
    expect(await screen.findByText(/Reference Number/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/pages/reports/`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `exportExcel.ts` and `SearchHistoryPage`**

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/pages/reports/`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/pages/reports/
git commit -m "feat: add search history report with Excel export"
```

---

## Task 22: User Management page

**Files:**
- Modify: `src/pages/users/UsersPage.tsx` (replace stub)
- Create: `src/pages/users/UserFormModal.tsx`
- Test: `src/pages/users/UsersPage.test.tsx`

`UsersPage` (FieldSpec Feature 02A) — search box, role filter, status filter, Add User
button; `DataTable` columns #, Username (link to detail — for the prototype the row is
clickable to open the edit modal), Full Name, Role badge, Status badge, Last Login,
Created Date, Action (Edit / Deactivate icons; hide Deactivate on the current user);
`Pagination`. `UserFormModal` (02B) — create/edit form with Username, First Name,
Last Name, Email, Role dropdown (all 6 roles), Password + Confirm Password (create
only), Status toggle (edit only); validates with `validators`; calls
`userApi.createUser` / `userApi.updateUser`; shows an error `Alert` on rejection
(e.g. duplicate username). Deactivate uses `ConfirmDialog` → `userApi.deactivateUser`;
self-deactivation is blocked (button hidden) and the API rejection is surfaced if hit.

- [ ] **Step 1: Write the failing test**

```tsx
// src/pages/users/UsersPage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { resetStore } from '../../data/store';
import { AuthProvider } from '../../context/AuthContext';
import { UsersPage } from './UsersPage';

describe('UsersPage', () => {
  it('lists seeded users and opens the create modal', async () => {
    resetStore();
    render(
      <AuthProvider><MemoryRouter><UsersPage /></MemoryRouter></AuthProvider>,
    );
    expect(await screen.findByText('officer01')).toBeInTheDocument();
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /เพิ่มผู้ใช้/ }));
    });
    expect(screen.getByText(/สร้างผู้ใช้งาน|สร้าง User/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/users/UsersPage.test.tsx`
Expected: FAIL — stub renders nothing.

- [ ] **Step 3: Implement `UsersPage` and `UserFormModal`**

The actor for API calls comes from `useAuth().user`; if null in isolated tests, fall
back to `store.users.find(u => u.role === 'SUPER_ADMIN')`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/users/UsersPage.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/pages/users/
git commit -m "feat: add user management page"
```

---

## Task 23: Borrower Management — list, detail & form

**Files:**
- Modify: `src/pages/borrowers/BorrowersPage.tsx`, `src/pages/borrowers/BorrowerDetailPage.tsx`
- Create: `src/pages/borrowers/BorrowerFormModal.tsx`
- Test: `src/pages/borrowers/BorrowersPage.test.tsx`

`BorrowersPage` (FieldSpec Feature 03A) — search box, status filter, type filter, Add
Borrower button; `DataTable` columns รหัสผู้กู้ (link to `/borrowers/:id`), ชื่อบริษัท,
เลขนิติบุคคล, ประเภท badge, วงเงินสินเชื่อ (formatted), Status badge, วันที่สร้าง,
Action (View/Edit/Deactivate — Deactivate visible to Super Admin only); `Pagination`.

`BorrowerFormModal` (03C) — ชื่อบริษัท TH (required), ชื่อบริษัท EN (optional),
เลขนิติบุคคล (13 digits, duplicate check via `borrowerApi.isTaxIdDuplicate` showing an
inline Duplicate Warning), ประเภทผู้กู้, ชื่อผู้ติดต่อหลัก, เบอร์โทรศัพท์, อีเมล,
วงเงินสินเชื่อ, การยินยอมให้ข้อมูล checkbox; calls `createBorrower`/`updateBorrower`.

`BorrowerDetailPage` (03B) — reads `:id`, calls `getBorrower`; shows read-only borrower
fields, status & consent badges, Edit button (opens `BorrowerFormModal`), Deactivate
button (Super Admin only, `ConfirmDialog`). Renders a tab area with two tabs:
"ข้อมูลผู้กู้" and "ใบขนที่เชื่อมโยง" — the second tab is filled in Task 24.

- [ ] **Step 1: Write the failing test**

```tsx
// src/pages/borrowers/BorrowersPage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetStore, store } from '../../data/store';
import { AuthProvider } from '../../context/AuthContext';
import { BorrowersPage } from './BorrowersPage';

describe('BorrowersPage', () => {
  it('lists seeded borrowers', async () => {
    resetStore();
    render(
      <AuthProvider><MemoryRouter><BorrowersPage /></MemoryRouter></AuthProvider>,
    );
    expect(await screen.findByText(store.borrowers[0].nameTh)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/borrowers/BorrowersPage.test.tsx`
Expected: FAIL — stub renders nothing.

- [ ] **Step 3: Implement the three components**

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/borrowers/BorrowersPage.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/pages/borrowers/
git commit -m "feat: add borrower management list, detail and form"
```

---

## Task 24: Data & Linkage tab

**Files:**
- Create: `src/pages/borrowers/DeclarationLinkTab.tsx`, `src/pages/borrowers/LinkDeclarationModal.tsx`
- Modify: `src/pages/borrowers/BorrowerDetailPage.tsx` (render the tab)
- Test: `src/pages/borrowers/DeclarationLinkTab.test.tsx`

`DeclarationLinkTab` (FieldSpec Feature 04) — receives `borrowerId`; calls
`declarationApi.listLinksByBorrower`; `DataTable` columns เลขที่ใบขน (link to
`/verify`), วันที่เชื่อมโยง, เชื่อมโยงโดย, เอกสาร, Action (Unlink — Super Admin only,
`ConfirmDialog` → `unlinkDeclaration`); a "เชื่อมโยงใบขน" button opens
`LinkDeclarationModal`.

`LinkDeclarationModal` (04B) — เลขที่ใบขน text input, mock file upload (a file input;
store only the file name), an info card preview, Confirm Link button → `linkDeclaration`;
shows an inline error when the API rejects a duplicate link.

- [ ] **Step 1: Write the failing test**

```tsx
// src/pages/borrowers/DeclarationLinkTab.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetStore, store } from '../../data/store';
import { AuthProvider } from '../../context/AuthContext';
import { DeclarationLinkTab } from './DeclarationLinkTab';

describe('DeclarationLinkTab', () => {
  it('lists existing links for a borrower', async () => {
    resetStore();
    const link = store.declarationLinks[0];
    render(
      <AuthProvider>
        <MemoryRouter>
          <DeclarationLinkTab borrowerId={link.borrowerId} />
        </MemoryRouter>
      </AuthProvider>,
    );
    expect(await screen.findByText(link.declarationNo)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/borrowers/DeclarationLinkTab.test.tsx`
Expected: FAIL — cannot find module `./DeclarationLinkTab`.

- [ ] **Step 3: Implement the tab and modal, render the tab in `BorrowerDetailPage`**

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/borrowers/DeclarationLinkTab.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/pages/borrowers/
git commit -m "feat: add declaration linkage tab"
```

---

## Task 25: Activity Log page

**Files:**
- Modify: `src/pages/activity-log/ActivityLogPage.tsx` (replace stub)
- Test: `src/pages/activity-log/ActivityLogPage.test.tsx`

`ActivityLogPage` (FieldSpec Feature 07) — Filter panel (date range default last 7
days, Username, Action Type multi-select, Module dropdown) + Apply + Reset;
`DataTable` columns #, Timestamp, Username, Full Name, Role badge, Action Type badge,
Module, รายละเอียด, IP Address; an expandable row showing Before/After values;
`Pagination` (50/100/200); total count badge; `EmptyState`. Read-only — no edit/delete
controls anywhere. Calls `activityLogApi.listActivityLog`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/pages/activity-log/ActivityLogPage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetStore } from '../../data/store';
import { AuthProvider } from '../../context/AuthContext';
import { ActivityLogPage } from './ActivityLogPage';

describe('ActivityLogPage', () => {
  it('renders seeded log entries', async () => {
    resetStore();
    render(
      <AuthProvider><MemoryRouter><ActivityLogPage /></MemoryRouter></AuthProvider>,
    );
    expect(await screen.findByText(/IP Address/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/activity-log/ActivityLogPage.test.tsx`
Expected: FAIL — stub renders nothing.

- [ ] **Step 3: Implement `ActivityLogPage`**

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/activity-log/ActivityLogPage.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/pages/activity-log/
git commit -m "feat: add activity log page"
```

---

## Task 26: Final integration & polish

**Files:**
- Modify: any page needing fixes; `src/index.css` for print styles

- [ ] **Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: ALL tests pass. Fix any failures before continuing.

- [ ] **Step 2: Typecheck and build**

Run: `npx tsc --noEmit && npm run build`
Expected: no type errors, build succeeds.

- [ ] **Step 3: Manual smoke walkthrough**

Run `npm run dev` and verify in the browser:
- Login as `officer01` / `Passw0rd!` → lands on `/verify`.
- Search a seeded declaration → summary + transaction table + preview document + zoom/print.
- Search `ZZZ-000000000000` → not-found banner; search `TIMEOUT000000` → timeout banner + retry.
- Open `/reports/search-history` → table, filters, Export Excel downloads a real `.xlsx`.
- Use the header role switcher to become `admin01` → sidebar shows only User Management;
  create/edit/deactivate a user; confirm self-deactivate is not offered.
- Become `superadmin` → borrowers: create (duplicate taxId warning), detail, link/unlink declaration.
- Become `auditor01` → Activity Log loads, filters work, no edit/delete controls, expand row shows before/after.
- Refresh the page → data resets to seed (expected).

- [ ] **Step 4: Add print CSS for the document preview**

In `src/index.css` add an `@media print` block that hides everything except the
`.document-preview` container so the Print button in `DocumentPreview` produces a
clean page.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: final integration polish and print styles"
```

---

## Self-Review — Spec Coverage

| Spec section | Covered by |
|---|---|
| Tech stack (React/TS/Vite/Tailwind/Router) | Task 1 |
| Types / data model | Task 2 |
| Validation Rules | Task 3 |
| Date/currency formatting | Task 4 |
| RBAC Permissions Matrix | Task 5, 17 |
| Mock data & in-memory store | Task 6 |
| Activity Log writer (auto-logging) | Task 7, + all API tasks |
| Authentication + account lock | Task 8, 15, 18 |
| Mock Customs API + edge cases | Task 9, 19 |
| Search History (record/query) | Task 10, 21 |
| User Management CRUD | Task 11, 22 |
| Borrower Management CRUD | Task 12, 23 |
| Data & Linkage | Task 13, 24 |
| Activity Log query/view | Task 14, 25 |
| AuthContext + role switcher | Task 15, 17 |
| Shared components | Task 16 |
| Layouts, routing, route guard | Task 17 |
| Login page | Task 18 |
| Verify: search/summary/transaction/preview | Task 19, 20 |
| Search History Report + Excel export | Task 21 |
| Activity Log page | Task 25 |
| Out of scope: Dashboard, real backend, mobile, real Customs API | not built (by design) |
| Forgot Password (Pending) | Task 18 — disabled link |

All 7 in-scope modules and every SRS Functional Requirement group (FR-01..FR-07) map
to at least one task. No placeholders remain; types and signatures are consistent
across tasks.
