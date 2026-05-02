import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Church, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-stone-50 flex">
      {/* Panel izquierdo — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-700 flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width: `${(i + 1) * 180}px`,
                height: `${(i + 1) * 180}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center relative z-10"
        >
          <div className="w-24 h-24 bg-gold rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Church size={48} className="text-primary" />
          </div>
          <h1 className="font-serif text-5xl text-white font-bold mb-3">Ebenezer M.I.</h1>
          <p className="text-stone-300 text-xl mb-10 italic">"Hasta aquí nos ayudó el Señor"</p>
          <div className="space-y-3 text-left bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
            {[
              'Accede a prédicas y sermones',
              'Participa en cultos en vivo',
              'Mantente al día con los eventos',
              'Comparte contenido con la iglesia',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-stone-200">
                <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Church size={32} className="text-white" />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="font-serif text-3xl text-primary mb-1">
              {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <p className="text-stone-500 mb-8 text-sm">
              {mode === 'login'
                ? 'Bienvenido de vuelta a la comunidad'
                : 'Únete a la comunidad de Ebenezer M.I.'}
            </p>

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

            <div className="mt-6 text-center">
              <span className="text-stone-500 text-sm">
                {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              </span>
              <button
                onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
                className="text-primary font-semibold text-sm hover:text-gold transition-colors"
              >
                {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <Link to="/" className="text-stone-400 text-sm hover:text-stone-600 transition-colors">
                ← Volver al sitio
              </Link>
            </div>
          </div>

          <p className="text-center text-stone-400 text-xs mt-6">
            Al registrarte, serás asignado como miembro. Un pastor puede actualizar tu rol.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
