// src/layouts/AppLayout.tsx
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Search,
  FileBarChart,
  Users,
  Building2,
  ScrollText,
  ShieldCheck,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { accessibleModules, type ModuleKey } from '../utils/permissions';
import { store } from '../data/store';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import type { Role } from '../types';

const NAV: Record<ModuleKey, { label: string; path: string; icon: LucideIcon } | null> = {
  verify: { label: 'ตรวจสอบใบขน', path: '/verify', icon: Search },
  history: { label: 'รายงานประวัติการค้นหา', path: '/reports/search-history', icon: FileBarChart },
  users: { label: 'จัดการผู้ใช้งาน', path: '/users', icon: Users },
  borrowers: { label: 'จัดการข้อมูลผู้กู้', path: '/borrowers', icon: Building2 },
  activityLog: { label: 'Activity Log', path: '/activity-log', icon: ScrollText },
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
    .filter(
      (item): item is { label: string; path: string; icon: LucideIcon } => item !== null,
    );

  function handleRoleChange(nextRole: Role) {
    const seedUser = store.users.find((u) => u.role === nextRole);
    if (seedUser) switchRole(seedUser);
  }

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-navy-50">
      <aside className="flex w-64 flex-shrink-0 flex-col bg-navy-800 text-navy-100">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">Verify Export</p>
            <p className="text-xs text-navy-300">Risk Intelligent</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-brand bg-navy-700 text-white'
                      : 'border-transparent text-navy-200 hover:bg-navy-700/50'
                  }`
                }
              >
                <Icon size={18} className="flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-navy-100 bg-white px-6 py-3 shadow-card">
          <h1 className="text-sm font-semibold text-navy-800">
            ระบบตรวจสอบข้อมูลใบขน
            <span className="ml-2 font-normal text-navy-400">
              Verify Export Risk Intelligent
            </span>
          </h1>
          <div className="flex items-center gap-3">
            <select
              aria-label="สลับบทบาท"
              value={user.role}
              onChange={(e) => handleRoleChange(e.target.value as Role)}
              className="rounded-md border border-navy-200 px-2 py-1.5 text-sm text-navy-700"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-100 text-sm font-medium text-navy-700">
                {user.firstName.charAt(0)}
              </span>
              <span className="text-sm text-navy-700">
                {user.firstName} {user.lastName}
              </span>
              <Badge text={user.role} tone="navy" />
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              <LogOut size={16} />
              ออกจากระบบ
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-navy-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
