import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Church, Home, Video, Calendar, Users, Menu, X, LogIn, LogOut, ChevronDown, Radio, BookOpen, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSiteConfigContext } from '../contexts/SiteConfigContext';
import { cn } from '../utils';

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  pastor: 'Pastor',
  leader: 'Líder',
  member: 'Miembro',
};

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  pastor: 'bg-gold/20 text-gold',
  leader: 'bg-primary/20 text-primary',
  member: 'bg-stone-100 text-stone-600',
};

const publicNavItems = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/sermons', label: 'Prédicas', icon: Video },
  { path: '/live', label: 'En Vivo', icon: Radio },
  { path: '/events', label: 'Eventos', icon: Calendar },
  { path: '/posts', label: 'Comunidad', icon: BookOpen },
];

interface NavbarProps {
  onSearch: () => void;
}

export function Navbar({ onSearch }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, canViewDashboard } = useAuth();
  const { config } = useSiteConfigContext();
  const branding = config.branding;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    ...publicNavItems,
    ...(canViewDashboard ? [{ path: '/dashboard', label: 'Dashboard', icon: Users }] : []),
  ];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    navigate('/');
  };

  const initials = profile?.display_name
    ? profile.display_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-md sticky top-0 z-50 border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center overflow-hidden">
              {branding.logo_url ? (
                <img src={branding.logo_url} alt={branding.site_name} className="w-full h-full object-cover" />
              ) : (
                <Church className="w-7 h-7 text-white" />
              )}
            </div>
            <div>
              <span className="font-serif text-2xl text-primary font-semibold">{branding.site_name}</span>
              {branding.tagline && (
                <span className="block text-xs text-gold font-medium tracking-wider">{branding.tagline}</span>
              )}
            </div>
          </Link>

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map(({ path, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    'relative text-sm font-medium transition-colors duration-200',
                    isActive ? 'text-primary' : 'text-stone-600 hover:text-primary'
                  )}
                >
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold"
                      transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Search — desktop */}
          <button
            onClick={onSearch}
            className="hidden md:flex items-center gap-2 px-3 py-2 text-stone-400 hover:text-primary bg-stone-50 hover:bg-stone-100 rounded-xl transition-colors text-sm"
            title="Buscar (Ctrl+K)"
          >
            <Search size={16} />
            <span className="text-stone-400">Buscar...</span>
            <kbd className="text-xs bg-stone-200 text-stone-500 px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>

          {/* Auth — desktop */}
          <div className="hidden md:flex items-center gap-4">
            {user && profile ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  className="flex items-center gap-2 hover:bg-stone-50 rounded-xl px-3 py-2 transition-colors"
                >
                  <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {initials}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-stone-800 leading-tight">
                      {profile.display_name}
                    </p>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      roleColors[profile.role]
                    )}>
                      {roleLabels[profile.role]}
                    </span>
                  </div>
                  <ChevronDown size={16} className={cn(
                    'text-stone-400 transition-transform',
                    dropdownOpen && 'rotate-180'
                  )} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-stone-100">
                        <p className="text-sm font-medium text-stone-800">{profile.display_name}</p>
                        <p className="text-xs text-stone-500 truncate">{profile.email}</p>
                      </div>
                      {canViewDashboard && (
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          <Users size={16} className="text-stone-400" />
                          Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} />
                        Cerrar Sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 btn-primary text-sm"
              >
                <LogIn size={18} />
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Search mobile icon */}
          <button onClick={onSearch} className="md:hidden p-2 text-stone-500 hover:text-primary">
            <Search size={22} />
          </button>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-stone-600"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={{ height: mobileOpen ? 'auto' : 0 }}
        className="md:hidden overflow-hidden bg-white border-t border-stone-100"
      >
        <div className="px-4 py-4 space-y-2">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive ? 'bg-primary/10 text-primary' : 'text-stone-600 hover:bg-stone-50'
                )}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-stone-100">
            {user && profile ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-800">{profile.display_name}</p>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      roleColors[profile.role]
                    )}>
                      {roleLabels[profile.role]}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={20} />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-primary font-medium hover:bg-primary/10 rounded-lg transition-colors"
              >
                <LogIn size={20} />
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </nav>
  );
}
