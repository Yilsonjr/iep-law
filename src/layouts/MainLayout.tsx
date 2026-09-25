import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

interface PublicLayoutProps {
  onSearch: () => void;
  onContact: () => void;
}

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
    </div>
  );
}

export function PublicLayout({ onSearch, onContact }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onSearch={onSearch} />
      <main className="flex-grow">
        <Suspense fallback={<PageFallback />}>
          <Outlet context={{ onContact }} />
        </Suspense>
      </main>
      <Footer onContact={onContact} />
    </div>
  );
}

// Keep backward-compatible alias
export { PublicLayout as Layout };
