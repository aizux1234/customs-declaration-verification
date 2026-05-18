// src/layouts/AppLayout.tsx
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accessibleModules, type ModuleKey } from '../utils/permissions';
import { store } from '../data/store';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import type { Role } from '../types';

const NAV: Record<ModuleKey, { label: string; path: string } | null> = {
  verify: { label: 'ตรวจสอบใบขน', path: '/verify' },
  history: { label: 'รายงานประวัติการค้นหา', path: '/reports/search-history' },
  users: { label: 'จัดการผู้ใช้งาน', path: '/users' },
  borrowers: { label: 'จัดการข้อมูลผู้กู้', path: '/borrowers' },
  activityLog: { label: 'Activity Log', path: '/activity-log' },
  declarations: null,
};

const ROLES: { value: Role; label: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'CREDIT_OFFICER', label: 'Credit Officer' },
  { value: 'BORROWER_DATA_ENTRY', label: 'Borrower Data Entry' },
  { value: 'CUSTOMS_DATA_ENTRY', label: 'Customs Data Entry' },
  { value: 'AUDITOR', label: 'Auditor' },
];

export function AppLayout() {
  const { user, signOut, switchRole } = useAuth();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;

  const navItems = accessibleModules(user.role)
    .map((m) => NAV[m])
    .filter((item): item is { label: string; path: string } => item !== null);

  function handleRoleChange(nextRole: Role) {
    const seedUser = store.users.find((u) => u.role === nextRole);
    if (seedUser) switchRole(seedUser);
  }

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="flex w-64 flex-col bg-navy text-white">
        <div className="border-b border-white/10 px-5 py-5">
          <p className="text-sm font-bold leading-tight">Verify Export</p>
          <p className="text-xs text-white/60">Risk Intelligent</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3">
          <h1 className="text-sm font-semibold text-navy">
            ระบบตรวจสอบข้อมูลใบขน (Verify Export Risk Intelligent)
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">
                {user.firstName} {user.lastName}
              </span>
              <Badge text={user.role} tone="navy" />
            </div>
            <select
              aria-label="สลับบทบาท"
              value={user.role}
              onChange={(e) => handleRoleChange(e.target.value as Role)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-700"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <Button variant="secondary" onClick={handleLogout}>
              ออกจากระบบ
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
