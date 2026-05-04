import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Filter, Mail, Phone, Calendar,
  UserCheck, Shield, ChevronDown, BarChart3, Settings,
  Save, Plus, Trash2, Globe, Layout, FileText,
  Inbox, Eye, CheckCheck, Trash, ImageIcon,
} from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../contexts/AuthContext';
import { useSiteConfigContext } from '../contexts/SiteConfigContext';
import { useContactMessages } from '../hooks/useContactMessages';
import { ImageUpload } from '../components/ImageUpload';
import type { UserProfile, UserRole } from '../types';
import type { HeroConfig, BrandingConfig, FooterConfig, SeoConfig } from '../types';
import { cn } from '../utils';

const roleColors: Record<UserRole, { bg: string; text: string }> = {
  admin: { bg: 'bg-red-100', text: 'text-red-700' },
  pastor: { bg: 'bg-gold/20', text: 'text-gold' },
  leader: { bg: 'bg-primary/20', text: 'text-primary' },
  member: { bg: 'bg-stone-100', text: 'text-stone-600' },
};
const roleLabels: Record<UserRole, string> = {
  admin: 'Admin', pastor: 'Pastor', leader: 'Líder', member: 'Miembro',
};
const statusColors = {
  active: { bg: 'bg-green-100', text: 'text-green-700' },
  inactive: { bg: 'bg-stone-100', text: 'text-stone-500' },
};

type TabId = 'resumen' | 'sitio' | 'usuarios';

// ── RESUMEN TAB ────────────────────────────────────────────────
function ResumenTab() {
  const { users } = useUsers();
  const { messages, loading: msgsLoading, markRead, deleteMessage, unread } = useContactMessages();
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null);

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pastors: users.filter(u => u.role === 'pastor' || u.role === 'admin').length,
    leaders: users.filter(u => u.role === 'leader').length,
  };

  const handleExpand = (id: string) => {
    setExpandedMsg(expandedMsg === id ? null : id);
    const msg = messages.find(m => m.id === id);
    if (msg && !msg.read) markRead(id);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Miembros', value: stats.total, color: 'bg-primary' },
          { label: 'Activos', value: stats.active, color: 'bg-green-500' },
          { label: 'Pastores/Admin', value: stats.pastors, color: 'bg-gold' },
          { label: 'Líderes', value: stats.leaders, color: 'bg-blue-500' },
        ].map(({ label, value, color }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl shadow-md p-5"
          >
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', color)}>
                <Users size={20} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-800">{value}</p>
                <p className="text-xs text-stone-500">{label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="font-serif text-xl text-primary mb-4">Accesos Rápidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/sermons', label: 'Prédicas', icon: '🎙️' },
            { href: '/live', label: 'En Vivo', icon: '📡' },
            { href: '/events', label: 'Eventos', icon: '📅' },
            { href: '/posts', label: 'Comunidad', icon: '✍️' },
          ].map(({ href, label, icon }) => (
            <a key={href} href={href}
              className="flex flex-col items-center gap-2 p-4 bg-stone-50 hover:bg-stone-100 rounded-xl transition-colors text-center">
              <span className="text-2xl">{icon}</span>
              <span className="text-sm font-medium text-stone-700">{label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Contact Messages Inbox */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-5">
          <Inbox size={22} className="text-primary" />
          <h3 className="font-serif text-xl text-primary">Mensajes de Contacto</h3>
          {unread > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread} nuevos</span>
          )}
        </div>

        {msgsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-stone-400">
            <Inbox size={40} className="mx-auto mb-3 opacity-30" />
            <p>No hay mensajes aún</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map(msg => (
              <motion.div key={msg.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={cn('rounded-xl border transition-colors', msg.read ? 'border-stone-100 bg-stone-50' : 'border-primary/20 bg-primary/5')}
              >
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  onClick={() => handleExpand(msg.id)}
                >
                  {!msg.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-stone-800 text-sm">{msg.name}</span>
                      <span className="text-xs text-stone-400">{msg.email}</span>
                      {msg.subject && <span className="text-xs text-stone-500">· {msg.subject}</span>}
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {new Date(msg.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {msg.read ? <CheckCheck size={14} className="text-stone-300" /> : <Eye size={14} className="text-primary" />}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedMsg === msg.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-stone-100 pt-3">
                        <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        <div className="flex justify-end mt-3">
                          <button onClick={() => deleteMessage(msg.id)}
                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                            <Trash size={13} />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── SITIO TAB ──────────────────────────────────────────────────
function SitioTab() {
  const { config, updateSection } = useSiteConfigContext();
  const [activeSection, setActiveSection] = useState<'branding' | 'hero' | 'footer' | 'seo'>('branding');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [branding, setBranding] = useState<BrandingConfig>(config.branding);
  const [hero, setHero] = useState<HeroConfig>(config.hero);
  const [footer, setFooter] = useState<FooterConfig>(config.footer);
  const [seo, setSeo] = useState<SeoConfig>(config.seo);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeSection === 'branding') await updateSection('branding', branding);
      if (activeSection === 'hero') await updateSection('hero', hero);
      if (activeSection === 'footer') await updateSection('footer', footer);
      if (activeSection === 'seo') await updateSection('seo', seo);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'branding' as const, label: 'Identidad', icon: ImageIcon },
    { id: 'hero' as const, label: 'Portada', icon: Layout },
    { id: 'footer' as const, label: 'Pie de página', icon: FileText },
    { id: 'seo' as const, label: 'SEO', icon: Globe },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Section tabs */}
      <div className="flex border-b border-stone-200 overflow-x-auto">
        {sections.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveSection(id)}
            className={cn(
              'flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
              activeSection === id
                ? 'border-gold text-primary'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            )}>
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-6">
        {/* BRANDING */}
        {activeSection === 'branding' && (
          <div className="space-y-5">
            <h3 className="font-serif text-lg text-primary">Identidad del Sitio</h3>
            <ImageUpload
              value={branding.logo_url}
              onChange={v => setBranding({ ...branding, logo_url: v })}
              folder="branding"
              label="Logo de la Iglesia"
            />
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Nombre del Sitio</label>
              <input type="text" value={branding.site_name}
                onChange={e => setBranding({ ...branding, site_name: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Tagline / Subtítulo</label>
              <input type="text" value={branding.tagline}
                onChange={e => setBranding({ ...branding, tagline: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          </div>
        )}

        {/* HERO */}
        {activeSection === 'hero' && (
          <div className="space-y-5">
            <h3 className="font-serif text-lg text-primary">Sección Portada (Hero)</h3>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Modo</label>
              <div className="flex gap-3">
                {(['text', 'image', 'slider'] as const).map(mode => (
                  <button key={mode} type="button"
                    onClick={() => setHero({ ...hero, mode })}
                    className={cn(
                      'flex-1 py-2 px-4 rounded-xl text-sm font-medium border-2 transition-all',
                      hero.mode === mode
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-stone-200 text-stone-500 hover:border-stone-300'
                    )}>
                    {mode === 'text' ? 'Texto' : mode === 'image' ? 'Imagen' : 'Carrusel'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Título principal</label>
              <input type="text" value={hero.title}
                onChange={e => setHero({ ...hero, title: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Subtítulo</label>
              <textarea value={hero.subtitle} rows={2}
                onChange={e => setHero({ ...hero, subtitle: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold resize-none"
              />
            </div>
            {hero.mode === 'image' && (
              <ImageUpload
                value={hero.bg_url}
                onChange={v => setHero({ ...hero, bg_url: v })}
                folder="hero"
                label="Imagen de fondo"
              />
            )}
            {(hero.mode === 'image' || hero.mode === 'slider') && (
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">
                  Opacidad del overlay ({Math.round(hero.overlay * 100)}%)
                </label>
                <input type="range" min={0} max={1} step={0.05}
                  value={hero.overlay}
                  onChange={e => setHero({ ...hero, overlay: parseFloat(e.target.value) })}
                  className="w-full accent-gold"
                />
              </div>
            )}
            {hero.mode === 'slider' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-stone-600">Imágenes del carrusel</label>
                  <button type="button"
                    onClick={() => setHero({ ...hero, slides: [...hero.slides, ''] })}
                    className="flex items-center gap-1 text-xs text-primary hover:text-gold transition-colors">
                    <Plus size={14} /> Agregar
                  </button>
                </div>
                <div className="space-y-3">
                  {hero.slides.map((url, i) => (
                    <div key={i} className="space-y-2">
                      <ImageUpload
                        value={url}
                        onChange={v => {
                          const slides = [...hero.slides];
                          slides[i] = v;
                          setHero({ ...hero, slides });
                        }}
                        folder="hero/slides"
                        label={`Slide ${i + 1}`}
                      />
                      <button type="button"
                        onClick={() => setHero({ ...hero, slides: hero.slides.filter((_, idx) => idx !== i) })}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                        <Trash2 size={12} /> Eliminar slide
                      </button>
                    </div>
                  ))}
                  {hero.slides.length === 0 && (
                    <p className="text-sm text-stone-400 italic">No hay slides. Agrega al menos uno.</p>
                  )}
                </div>
              </div>
            )}
            {/* Buttons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-stone-600">Botones</label>
                <button type="button"
                  onClick={() => setHero({ ...hero, buttons: [...hero.buttons, { label: '', href: '/', variant: 'primary' }] })}
                  className="flex items-center gap-1 text-xs text-primary hover:text-gold transition-colors">
                  <Plus size={14} /> Agregar botón
                </button>
              </div>
              <div className="space-y-3">
                {hero.buttons.map((btn, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input type="text" placeholder="Texto" value={btn.label}
                      onChange={e => {
                        const buttons = [...hero.buttons];
                        buttons[i] = { ...btn, label: e.target.value };
                        setHero({ ...hero, buttons });
                      }}
                      className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                    <input type="text" placeholder="/ruta" value={btn.href}
                      onChange={e => {
                        const buttons = [...hero.buttons];
                        buttons[i] = { ...btn, href: e.target.value };
                        setHero({ ...hero, buttons });
                      }}
                      className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                    <select value={btn.variant}
                      onChange={e => {
                        const buttons = [...hero.buttons];
                        buttons[i] = { ...btn, variant: e.target.value as 'primary' | 'secondary' };
                        setHero({ ...hero, buttons });
                      }}
                      className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gold bg-white">
                      <option value="primary">Principal</option>
                      <option value="secondary">Secundario</option>
                    </select>
                    <button type="button"
                      onClick={() => setHero({ ...hero, buttons: hero.buttons.filter((_, idx) => idx !== i) })}
                      className="p-2 text-red-500 hover:text-red-700">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        {activeSection === 'footer' && (
          <div className="space-y-5">
            <h3 className="font-serif text-lg text-primary">Pie de Página</h3>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Texto descriptivo</label>
              <textarea value={footer.text} rows={3}
                onChange={e => setFooter({ ...footer, text: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Texto de copyright</label>
              <input type="text" value={footer.copyright}
                onChange={e => setFooter({ ...footer, copyright: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div className="border-t border-stone-100 pt-5">
              <p className="text-sm font-medium text-stone-700 mb-3">Contacto</p>
              <div className="space-y-3">
                <input type="text" placeholder="Dirección" value={footer.contact.address}
                  onChange={e => setFooter({ ...footer, contact: { ...footer.contact, address: e.target.value } })}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
                />
                <input type="text" placeholder="Teléfono" value={footer.contact.phone}
                  onChange={e => setFooter({ ...footer, contact: { ...footer.contact, phone: e.target.value } })}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
                />
                <input type="email" placeholder="Email" value={footer.contact.email}
                  onChange={e => setFooter({ ...footer, contact: { ...footer.contact, email: e.target.value } })}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
            </div>
            <div className="border-t border-stone-100 pt-5">
              <p className="text-sm font-medium text-stone-700 mb-3">Redes Sociales</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-500 w-24">Facebook</span>
                  <input type="url" placeholder="https://facebook.com/..." value={footer.social.facebook}
                    onChange={e => setFooter({ ...footer, social: { ...footer.social, facebook: e.target.value } })}
                    className="flex-1 px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-500 w-24">YouTube</span>
                  <input type="url" placeholder="https://youtube.com/..." value={footer.social.youtube}
                    onChange={e => setFooter({ ...footer, social: { ...footer.social, youtube: e.target.value } })}
                    className="flex-1 px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-500 w-24">Instagram</span>
                  <input type="url" placeholder="https://instagram.com/..." value={footer.social.instagram}
                    onChange={e => setFooter({ ...footer, social: { ...footer.social, instagram: e.target.value } })}
                    className="flex-1 px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEO */}
        {activeSection === 'seo' && (
          <div className="space-y-5">
            <h3 className="font-serif text-lg text-primary">SEO y Metadatos</h3>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Título de la pestaña (title)</label>
              <input type="text" value={seo.title}
                onChange={e => setSeo({ ...seo, title: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Descripción (meta description)</label>
              <textarea value={seo.description} rows={3}
                onChange={e => setSeo({ ...seo, description: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold resize-none"
              />
            </div>
            <ImageUpload
              value={seo.og_image}
              onChange={v => setSeo({ ...seo, og_image: v })}
              folder="seo"
              label="Imagen Open Graph (og:image)"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
          {saved && <span className="text-sm text-green-600 font-medium">¡Guardado!</span>}
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 btn-primary disabled:opacity-60">
            <Save size={16} />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── USUARIOS TAB ───────────────────────────────────────────────
function UsuariosTab() {
  const { users, loading, updateUserRole, updateUserStatus } = useUsers();
  const { profile: currentProfile, canManageUsers } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = users.filter(u => {
    const matchSearch = u.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch
      && (roleFilter === 'all' || u.role === roleFilter)
      && (statusFilter === 'all' || u.status === statusFilter);
  });

  const handleRoleChange = async (user: UserProfile, role: UserRole) => {
    if (!canManageUsers || user.id === currentProfile?.id) return;
    await updateUserRole(user.id, role);
  };
  const handleStatusChange = async (user: UserProfile, status: 'active' | 'inactive') => {
    if (!canManageUsers || user.id === currentProfile?.id) return;
    await updateUserStatus(user.id, status);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="text" placeholder="Buscar por nombre o email..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-stone-400" />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm">
            <option value="all">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="pastor">Pastor</option>
            <option value="leader">Líder</option>
            <option value="member">Miembro</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm">
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left py-4 px-4 text-sm font-semibold text-stone-600">Usuario</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-stone-600">Contacto</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-stone-600">Rol</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-stone-600">Estado</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-stone-600">Ingreso</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => {
                const isSelf = user.id === currentProfile?.id;
                return (
                  <motion.tr key={user.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-stone-100 hover:bg-stone-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {user.display_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-stone-800">
                            {user.display_name}
                            {isSelf && <span className="ml-2 text-xs text-stone-400">(tú)</span>}
                          </p>
                          {user.address && <p className="text-xs text-stone-400">{user.address}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <p className="flex items-center gap-2 text-sm text-stone-600">
                          <Mail size={13} className="text-stone-400" />{user.email}
                        </p>
                        {user.phone && (
                          <p className="flex items-center gap-2 text-sm text-stone-600">
                            <Phone size={13} className="text-stone-400" />{user.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {canManageUsers && !isSelf ? (
                        <div className="relative">
                          <select value={user.role}
                            onChange={e => handleRoleChange(user, e.target.value as UserRole)}
                            className={cn(
                              'pl-3 pr-7 py-1.5 rounded-full text-sm font-medium border-0 appearance-none cursor-pointer focus:ring-2 focus:ring-gold focus:outline-none',
                              roleColors[user.role].bg, roleColors[user.role].text
                            )}>
                            <option value="admin">Admin</option>
                            <option value="pastor">Pastor</option>
                            <option value="leader">Líder</option>
                            <option value="member">Miembro</option>
                          </select>
                          <ChevronDown size={12} className={cn('absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none', roleColors[user.role].text)} />
                        </div>
                      ) : (
                        <span className={cn('px-3 py-1 rounded-full text-sm font-medium', roleColors[user.role].bg, roleColors[user.role].text)}>
                          {roleLabels[user.role]}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {canManageUsers && !isSelf ? (
                        <div className="relative">
                          <select value={user.status}
                            onChange={e => handleStatusChange(user, e.target.value as 'active' | 'inactive')}
                            className={cn(
                              'pl-3 pr-7 py-1.5 rounded-full text-sm font-medium border-0 appearance-none cursor-pointer focus:ring-2 focus:ring-gold focus:outline-none',
                              statusColors[user.status].bg, statusColors[user.status].text
                            )}>
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                          </select>
                          <ChevronDown size={12} className={cn('absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none', statusColors[user.status].text)} />
                        </div>
                      ) : (
                        <span className={cn('px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit', statusColors[user.status].bg, statusColors[user.status].text)}>
                          <UserCheck size={13} />
                          {user.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-stone-500">
                        <Calendar size={13} />
                        {new Date(user.join_date).toLocaleDateString('es-ES', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-stone-300 mb-4" />
              <p className="text-stone-500">No se encontraron usuarios</p>
            </div>
          )}
        </div>
      )}
      {!canManageUsers && (
        <p className="mt-4 text-sm text-stone-400 text-center">
          Solo pastores y administradores pueden cambiar roles y estados.
        </p>
      )}
    </div>
  );
}

// ── MAIN DASHBOARD ─────────────────────────────────────────────
export function DashboardPage() {
  const { profile: currentProfile } = useAuth();
  const { unread } = useContactMessages();
  const [activeTab, setActiveTab] = useState<TabId>('resumen');

  const tabs: { id: TabId; label: string; icon: typeof BarChart3; badge?: number }[] = [
    { id: 'resumen', label: 'Resumen', icon: BarChart3, badge: unread },
    { id: 'sitio', label: 'Sitio Web', icon: Settings },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="bg-gradient-to-br from-primary to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center">
              <Shield size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-4xl font-bold">Dashboard</h1>
              <p className="text-stone-300">
                {currentProfile?.display_name} · {roleLabels[currentProfile?.role ?? 'member']}
              </p>
            </div>
          </motion.div>

          <div className="flex gap-1 mt-8 bg-white/10 rounded-xl p-1 w-fit">
            {tabs.map(({ id, label, icon: Icon, badge }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all relative',
                  activeTab === id
                    ? 'bg-white text-primary shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                )}>
                <Icon size={16} />
                {label}
                {badge && badge > 0 ? (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}>
              {activeTab === 'resumen' && <ResumenTab />}
              {activeTab === 'sitio' && <SitioTab />}
              {activeTab === 'usuarios' && <UsuariosTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
