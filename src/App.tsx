import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import { useSeoMeta } from './hooks/useSeoMeta';

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
      <AuthProvider>
        <SiteConfigProvider>
          <AppInner />
        </SiteConfigProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
