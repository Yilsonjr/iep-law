import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Video, Calendar, Users, Menu, X, LogIn, LogOut, ChevronDown, ChevronRight, Radio, BookOpen, Search, FileText,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSiteConfigContext } from '../contexts/SiteConfigContext';
import { usePages } from '../hooks/usePages';
import { cn } from '../utils';

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  pastor: 'Pastor',
  leader: 'Líder',
  member: 'Miembro',
};

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  pastor: 'bg-gold/20 text-gold-700',
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
  const [scrolled, setScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, canViewDashboard } = useAuth();
  const { config } = useSiteConfigContext();
  const branding = config.branding;
  const { navPages } = usePages(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    ...publicNavItems,
    ...navPages.map(p => ({ path: `/p/${p.slug}`, label: p.title, icon: FileText })),
    ...(canViewDashboard ? [{ path: '/dashboard', label: 'Dashboard', icon: Users }] : []),
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    <nav
      aria-label="Principal"
      className={cn(
        'sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200 transition-shadow',
        scrolled ? 'shadow-lg shadow-stone-900/10' : 'shadow-sm'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 md:h-[4.5rem] gap-3">
          {/* Logo */}
          <Link to="/" aria-label={`${branding.site_name} — ir al inicio`} className="flex items-center gap-2.5 shrink-0">
            <span className="w-10 h-10 rounded-full ring-2 ring-gold/50 ring-offset-1 overflow-hidden shrink-0 bg-primary flex items-center justify-center">
              {!logoError ? (
                <img
                  src={branding.logo_url || '/android-chrome-192x192.png'}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span aria-hidden="true" className="font-serif text-white text-xs font-bold select-none">
                  {branding.site_name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              )}
            </span>
            <span className="hidden md:block leading-none text-left">
              <span className="block font-serif text-lg font-semibold text-primary tracking-tight">{branding.site_name}</span>
              {branding.tagline && (
                <span className="block eyebrow text-gold mt-0.5">{branding.tagline}</span>
              )}
            </span>
            <span className="md:hidden font-serif text-lg font-semibold text-primary tracking-tight">
              {branding.site_name.split(' ')[0]}
            </span>
          </Link>

          {/* Nav links — centered */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-1 min-w-0">
            {navItems.map(({ path, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200',
                    isActive ? 'text-primary' : 'text-stone-600 hover:text-primary'
                  )}
                >
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute inset-x-3 bottom-0 h-px rounded-full bg-gold"
                      transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: search + auth — desktop only */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              onClick={onSearch}
              aria-label="Abrir buscador"
              title="Buscar (Ctrl+K)"
              className="flex items-center gap-2 rounded-full border border-stone-200 bg-transparent px-3.5 py-2 text-sm text-stone-500 hover:text-primary hover:border-stone-300 transition-colors"
            >
              <Search size={15} />
              <span className="hidden lg:inline">Buscar</span>
              <kbd className="hidden lg:inline-flex text-[10px] bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded-md border border-stone-200">Ctrl K</kbd>
            </button>

            {user && profile ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  aria-haspopup="menu"
                  aria-expanded={dropdownOpen}
                  className="flex items-center gap-2 rounded-full border border-stone-200 px-2.5 py-1.5 hover:border-stone-300 transition-colors"
                >
                  <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    {initials}
                  </span>
                  <span className="hidden lg:block text-left leading-tight">
                    <span className="block text-sm font-medium text-stone-800">{profile.display_name}</span>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold', roleColors[profile.role])}>
                      {roleLabels[profile.role]}
                    </span>
                  </span>
                  <ChevronDown size={14} className={cn('text-stone-400 transition-transform', dropdownOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-stone-200">
                        <p className="text-sm font-medium text-stone-800 truncate">{profile.display_name}</p>
                        <p className="text-xs text-stone-500 truncate">{profile.email}</p>
                      </div>
                      {canViewDashboard && (
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          role="menuitem"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-100 transition-colors"
                        >
                          <Users size={16} className="text-stone-400" />
                          Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        role="menuitem"
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} />
                        Cerrar sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm">
                <LogIn size={16} />
                Iniciar sesión
              </Link>
            )}
          </div>

          {/* Mobile: search + hamburger */}
          <div className="md:hidden flex items-center gap-2 ml-auto">
            <button onClick={onSearch} aria-label="Abrir buscador" className="p-2 text-stone-500 hover:text-primary rounded-lg hover:bg-stone-100">
              <Search size={20} />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className="p-2 text-stone-700 hover:text-primary rounded-lg hover:bg-stone-100"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        id="mobile-nav"
        initial={false}
        animate={{ height: mobileOpen ? 'auto' : 0, opacity: mobileOpen ? 1 : 0 }}
        className="md:hidden overflow-hidden bg-white/95 backdrop-blur-sm border-t border-stone-200"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <div className="px-4 py-2 space-y-0.5">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                tabIndex={mobileOpen ? 0 : -1}
                className={cn(
                  'flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive ? 'bg-primary/10 text-primary' : 'text-stone-600 hover:bg-stone-100'
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon size={19} className={cn(isActive && 'text-primary')} />
                  {label}
                </span>
                <ChevronRight size={15} className="text-stone-300 flex-shrink-0" />
              </Link>
            );
          })}

          <div className="pt-1 border-t border-stone-200">
            {user && profile ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    {initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-stone-800 truncate">{profile.display_name}</p>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold', roleColors[profile.role])}>
                      {roleLabels[profile.role]}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={19} />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-primary font-medium hover:bg-primary/10 rounded-lg transition-colors"
              >
                <LogIn size={19} />
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </nav>
  );
}