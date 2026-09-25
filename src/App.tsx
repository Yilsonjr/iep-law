import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Component, lazy, Suspense, useState, useEffect, type ReactNode, type ErrorInfo } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { SiteConfigProvider } from './contexts/SiteConfigContext';
import { PublicLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SearchModal } from './components/SearchModal';
import { ContactModal } from './components/ContactModal';
import { useSeoMeta } from './hooks/useSeoMeta';

const HomePage      = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const SermonsPage   = lazy(() => import('./pages/SermonsPage').then(m => ({ default: m.SermonsPage })));
const LivePage      = lazy(() => import('./pages/LivePage').then(m => ({ default: m.LivePage })));
const EventsPage    = lazy(() => import('./pages/EventsPage').then(m => ({ default: m.EventsPage })));
const PostsPage     = lazy(() => import('./pages/PostsPage').then(m => ({ default: m.PostsPage })));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage').then(m => ({ default: m.PostDetailPage })));
const DynamicPage   = lazy(() => import('./pages/DynamicPage').then(m => ({ default: m.DynamicPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const LoginPage     = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));

function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
    </div>
  );
}

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(err: Error) { return { error: err.message }; }
  componentDidCatch(err: Error, info: ErrorInfo) { console.error('[AppErrorBoundary]', err, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-50 text-stone-700 p-8">
          <p className="text-4xl">⚠️</p>
          <h1 className="text-xl font-semibold">Algo salió mal</h1>
          <p className="text-sm text-stone-400 max-w-md text-center">{this.state.error}</p>
          <button onClick={() => window.location.reload()}
            className="mt-2 px-5 py-2 rounded-xl bg-primary text-white text-sm hover:bg-primary/90 transition-colors">
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppInner() {
  useSeoMeta();
  const [searchOpen, setSearchOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <Routes>
        {/* ── Rutas públicas — con Navbar + Footer ── */}
        <Route path="/login" element={<Suspense fallback={<FullPageLoader />}><LoginPage /></Suspense>} />
        <Route path="/" element={<PublicLayout onSearch={() => setSearchOpen(true)} onContact={() => setContactOpen(true)} />}>
          <Route index element={<HomePage onContact={() => setContactOpen(true)} />} />
          <Route path="sermons" element={<SermonsPage />} />
          <Route path="live" element={<LivePage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="posts/:id" element={<PostDetailPage />} />
          <Route path="p/:slug" element={<DynamicPage />} />
          <Route path="*" element={
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
              <h1 className="font-serif text-6xl text-primary mb-4">404</h1>
              <p className="text-stone-500 text-lg mb-8">Esta página no existe o no está disponible.</p>
              <Link to="/" className="btn-primary">Volver al inicio</Link>
            </div>
          } />
        </Route>

        {/* ── Rutas de admin — sin Navbar ni Footer ── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireDashboard>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
        </Route>
      </Routes>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppErrorBoundary>
        <AuthProvider>
          <SiteConfigProvider>
            <AppInner />
          </SiteConfigProvider>
        </AuthProvider>
      </AppErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
