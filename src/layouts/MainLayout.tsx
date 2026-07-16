import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

interface PublicLayoutProps {
  onSearch: () => void;
  onContact: () => void;
}

export function PublicLayout({ onSearch, onContact }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onSearch={onSearch} />
      <main className="flex-grow">
        <Outlet context={{ onContact }} />
      </main>
      <Footer onContact={onContact} />
    </div>
  );
}

// Keep backward-compatible alias
export { PublicLayout as Layout };
