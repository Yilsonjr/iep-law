import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Component, useState, useEffect, type ReactNode, type ErrorInfo } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { SiteConfigProvider } from './contexts/SiteConfigContext';
import { Layout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SearchModal } from './components/SearchModal';
import { ContactModal } from './components/ContactModal';
import { HomePage } from './pages/HomePage';
import { SermonsPage } from './pages/SermonsPage';
import { LivePage } from './pages/LivePage';
import { EventsPage } from './pages/EventsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { PostsPage } from './pages/PostsPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { DynamicPage } from './pages/DynamicPage';
import { useSeoMeta } from './hooks/useSeoMeta';

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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout onSearch={() => setSearchOpen(true)} onContact={() => setContactOpen(true)} />}>
          <Route index element={<HomePage onContact={() => setContactOpen(true)} />} />
          <Route path="sermons" element={<SermonsPage />} />
          <Route path="live" element={<LivePage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="posts/:id" element={<PostDetailPage />} />
          <Route path="p/:slug" element={<DynamicPage />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute requireDashboard>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
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
