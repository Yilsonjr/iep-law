import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Mode = 'login' | 'register';

const supabaseErrors: Record<string, string> = {
  'Invalid login credentials': 'Email o contraseña incorrectos.',
  'Email not confirmed': 'Confirma tu email antes de iniciar sesión.',
  'User already registered': 'Este email ya está registrado.',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
};

function parseError(msg: string): string {
  return supabaseErrors[msg] ?? 'Ocurrió un error. Intenta de nuevo.';
}

export function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'register' && !displayName.trim()) {
      setError('El nombre es requerido.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName.trim());
      }
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? '';
      setError(parseError(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — branding */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-14 relative overflow-hidden"
        style={{ backgroundColor: '#12100E' }}>

        {/* Subtle dot grid background */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Gold gradient glow bottom-right */}
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, #B8931A, transparent)' }}
        />

        {/* Top: logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/10">
            <img src="/android-chrome-192x192.png" alt="Ebenezer" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-serif text-[15px] font-bold text-white leading-tight">Ebenezer M.I.</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/35 mt-0.5">Iglesia Cristiana</p>
          </div>
        </motion.div>

        {/* Center: headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10"
        >
          <div className="w-8 h-0.5 bg-[#B8931A] mb-8" />
          <h1 className="font-serif text-4xl xl:text-5xl text-white font-bold leading-tight mb-4 text-wrap-balance">
            Bienvenido de vuelta
          </h1>
          <p className="text-white/45 text-[15px] leading-relaxed max-w-xs">
            Accede a tu cuenta para gestionar el contenido, ver prédicas y participar de la comunidad.
          </p>

          <div className="mt-10 space-y-3">
            {[
              'Prédicas y sermones en línea',
              'Cultos en vivo cada semana',
              'Eventos y actividades de la iglesia',
              'Comunidad y noticias internas',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#B8931A] flex-shrink-0" />
                <span className="text-[13px] text-white/55">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom: quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 text-[11px] text-white/25 italic"
        >
          "Hasta aquí nos ha ayudado el Señor" — 1 Samuel 7:12
        </motion.p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center bg-[#F8F5F0] p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[380px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-primary">
              <img src="/android-chrome-192x192.png" alt="Ebenezer" className="w-full h-full object-cover" />
            </div>
            <span className="font-serif text-[17px] font-bold text-primary">Ebenezer M.I.</span>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-[28px] font-bold text-[#1A1014] leading-tight mb-1.5">
              {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <p className="text-[13px] text-[#6B626A]">
              {mode === 'login'
                ? 'Ingresa tus credenciales para continuar'
                : 'Únete a la comunidad de Ebenezer M.I.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E2E4] shadow-sm p-7">

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm"
              >
                <AlertCircle size={18} className="flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-2">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Juan Pérez García"
                      className="w-full pl-11 pr-4 py-3.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full pl-11 pr-4 py-3.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? (mode === 'login' ? 'Iniciando sesión...' : 'Creando cuenta...')
                  : (mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta')}
              </button>
            </form>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-[12px] text-[#6B626A]">
              {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            </span>
            <button
              onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-[12px] font-semibold text-primary hover:text-[#6C0008] transition-colors"
            >
              {mode === 'login' ? 'Regístrate' : 'Iniciar sesión'}
            </button>
          </div>

          <div className="mt-5 text-center">
            <Link to="/" className="text-[11px] text-[#6B626A]/60 hover:text-[#6B626A] transition-colors">
              ← Volver al sitio público
            </Link>
          </div>

          {mode === 'register' && (
            <p className="text-center text-[11px] text-[#6B626A]/50 mt-4 leading-relaxed">
              Serás asignado como miembro. Un pastor puede actualizar tu rol.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
