// src/layouts/AuthLayout.tsx
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy-800 to-navy-900 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-overlay">
        <Outlet />
      </div>
    </div>
  );
}
