import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

export function AdminLayout() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    }>
      <Outlet />
    </Suspense>
  );
}
