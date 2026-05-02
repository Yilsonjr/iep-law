import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { SermonsPage } from './pages/SermonsPage';
import { LivePage } from './pages/LivePage';
import { EventsPage } from './pages/EventsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { PostsPage } from './pages/PostsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
