import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Filter, Mail, Phone, Calendar,
  UserCheck, Shield, ChevronDown, BarChart3, Settings,
  Save, Plus, Trash2, Globe, Layout, FileText,
  Inbox, Eye, CheckCheck, Trash, ImageIcon, PanelLeft,
  ExternalLink, GripVertical, MessageSquare, Home,
  Type, Columns, Zap, TrendingUp, AlignCenter, AlignLeft,
  Palette, X, AlertCircle, User, Lock,
} from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../contexts/AuthContext';
import { useSiteConfigContext } from '../contexts/SiteConfigContext';
import { useContactMessages } from '../hooks/useContactMessages';
import { usePages } from '../hooks/usePages';
import { ImageUpload } from '../components/ImageUpload';
import { RichTextEditor } from '../components/RichTextEditor';
import type {
  UserProfile, UserRole, Page,
  HeroConfig, BrandingConfig, FooterConfig, SeoConfig,
  HomeBlock, HomeBlockType, FooterWidget, FooterWidgetType,
} from '../types';
import { cn } from '../utils';

// ── Shared styles ──────────────────────────────────────────────
const INPUT = 'w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold text-sm';
const INPUT_SM = 'px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold text-sm';
const TOGGLE = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
    <div className="w-11 h-6 bg-stone-200 rounded-full peer peer-checked:bg-primary transition-colors" />
    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
  </label>
);

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

type TabId = 'resumen' | 'inicio' | 'mensajes' | 'sitio' | 'paginas' | 'usuarios';

// ── RESUMEN TAB ────────────────────────────────────────────────
function ResumenTab() {
  const { users } = useUsers();
  const { unread } = useContactMessages();
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pastors: users.filter(u => u.role === 'pastor' || u.role === 'admin').length,
    leaders: users.filter(u => u.role === 'leader').length,
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
            className="bg-white rounded-xl shadow-md p-5">
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

      {unread > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Mail size={20} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-red-800">Tienes {unread} mensaje{unread > 1 ? 's' : ''} sin leer</p>
            <p className="text-sm text-red-600">Ve a la pestaña <strong>Mensajes</strong> para revisarlos.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MENSAJES TAB ───────────────────────────────────────────────
function MensajesTab() {
  const { messages, loading, markRead, deleteMessage, unread } = useContactMessages();
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null);

  const handleExpand = (id: string) => {
    setExpandedMsg(expandedMsg === id ? null : id);
    const msg = messages.find(m => m.id === id);
    if (msg && !msg.read) markRead(id);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Inbox size={22} className="text-primary" />
        <h3 className="font-serif text-xl text-primary">Bandeja de Contacto</h3>
        {unread > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread} nuevos</span>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <Inbox size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg">No hay mensajes aún</p>
          <p className="text-sm mt-1">Los mensajes del formulario de contacto aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map(msg => (
            <motion.div key={msg.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={cn('rounded-xl border transition-colors', msg.read ? 'border-stone-100 bg-stone-50' : 'border-primary/20 bg-primary/5')}>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left" onClick={() => handleExpand(msg.id)}>
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
                {msg.read ? <CheckCheck size={14} className="text-stone-300 flex-shrink-0" /> : <Eye size={14} className="text-primary flex-shrink-0" />}
              </button>
              <AnimatePresence>
                {expandedMsg === msg.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                    className="overflow-hidden">
                    <div className="px-4 pb-4 border-t border-stone-100 pt-3">
                      <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      <div className="flex items-center justify-between mt-4">
                        <a href={`mailto:${msg.email}?subject=Re: ${msg.subject ?? ''}`}
                          className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                          <Mail size={13} /> Responder por email
                        </a>
                        <button onClick={() => deleteMessage(msg.id)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash size={13} /> Eliminar
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
  );
}

// ── INICIO TAB (Home CMS) ──────────────────────────────────────
const BLOCK_TYPES: { type: HomeBlockType; label: string; icon: typeof Home; desc: string }[] = [
  { type: 'cards', label: 'Tarjetas', icon: Layout, desc: 'Grid de cards con emoji, título y descripción' },
  { type: 'columns', label: 'Columnas', icon: Columns, desc: 'Secciones en 2 o 3 columnas con imagen y texto' },
  { type: 'cta_banner', label: 'Banner CTA', icon: Zap, desc: 'Llamada a la acción con título y botones' },
  { type: 'stats', label: 'Estadísticas', icon: TrendingUp, desc: 'Fila de números destacados' },
  { type: 'rich_text', label: 'Texto libre', icon: Type, desc: 'Bloque de contenido HTML con editor rico' },
  { type: 'contact_form', label: 'Formulario', icon: MessageSquare, desc: 'Formulario de contacto integrado en la página' },
];

const BG_OPTIONS: { value: HomeBlock['bg']; label: string; preview: string }[] = [
  { value: 'white', label: 'Blanco', preview: 'bg-white' },
  { value: 'light', label: 'Gris claro', preview: 'bg-stone-100' },
  { value: 'primary', label: 'Rojo (primario)', preview: 'bg-primary' },
  { value: 'gradient', label: 'Degradado', preview: 'bg-gradient-to-br from-primary to-primary/70' },
];

function emptyBlock(type: HomeBlockType, order: number): HomeBlock {
  return {
    id: crypto.randomUUID(),
    type,
    title: '',
    subtitle: '',
    visible: true,
    order,
    bg: type === 'cta_banner' ? 'primary' : 'white',
    card_cols: 3,
    cards: type === 'cards' ? [{ emoji: '✝️', title: '', description: '' }] : [],
    col_items: type === 'columns' ? [{ title: '', body: '', image_url: '', btn_label: '', btn_href: '' }, { title: '', body: '', image_url: '', btn_label: '', btn_href: '' }] : [],
    cta_btn1_label: type === 'cta_banner' ? 'Contactar' : '',
    cta_btn1_href: '#contact',
    cta_btn2_label: '',
    cta_btn2_href: '/',
    stats: type === 'stats' ? [{ emoji: '🙏', value: '', label: '' }] : [],
    html: '',
    text_align: 'center',
    color_bg: '', color_heading: '', color_text: '', color_accent: '',
  };
}

function InicioTab() {
  const { config, updateSection } = useSiteConfigContext();
  const [blocks, setBlocks] = useState<HomeBlock[]>(() =>
    [...config.home_blocks].sort((a, b) => a.order - b.order)
  );
  const [editing, setEditing] = useState<HomeBlock | null>(null);
  const [pickingType, setPickingType] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const dragFrom = useRef(-1);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const save = useCallback(async (newBlocks: HomeBlock[]) => {
    setSaving(true);
    try {
      await updateSection('home_blocks', newBlocks);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [updateSection]);

  const toggleVisible = (id: string) => {
    const updated = blocks.map(b => b.id === id ? { ...b, visible: !b.visible } : b);
    setBlocks(updated);
    save(updated);
  };

  const deleteBlock = async (id: string) => {
    if (!confirm('¿Eliminar este bloque?')) return;
    const updated = blocks.filter(b => b.id !== id).map((b, i) => ({ ...b, order: i }));
    setBlocks(updated);
    save(updated);
  };

  const addBlock = (type: HomeBlockType) => {
    const nb = emptyBlock(type, blocks.length);
    setBlocks(prev => [...prev, nb]);
    setPickingType(false);
    setEditing(nb);
  };

  const saveEditing = async () => {
    if (!editing) return;
    const updated = blocks.map(b => b.id === editing.id ? editing : b);
    setBlocks(updated);
    await save(updated);
    setEditing(null);
  };

  const handleDragStart = (i: number) => { dragFrom.current = i; };
  const handleDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOver(i); };
  const handleDrop = async (i: number) => {
    setDragOver(null);
    const from = dragFrom.current;
    if (from === -1 || from === i) return;
    const reordered = [...blocks];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(i, 0, moved);
    const updated = reordered.map((b, idx) => ({ ...b, order: idx }));
    setBlocks(updated);
    save(updated);
  };

  // ── Block editor ─────────────────────────────────────────────
  if (editing) {
    const upd = (patch: Partial<HomeBlock>) => setEditing(e => e ? { ...e, ...patch } : e);
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div>
            <h3 className="font-serif text-xl text-primary">
              Editar bloque — {BLOCK_TYPES.find(t => t.type === editing.type)?.label}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">Los cambios se guardan al presionar "Guardar bloque"</p>
          </div>
          <button onClick={() => setEditing(null)} className="text-sm text-stone-400 hover:text-stone-600 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors">
            Cancelar
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Common fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-stone-500 mb-1">Título del bloque</label>
              <input type="text" value={editing.title} onChange={e => upd({ title: e.target.value })}
                placeholder="Ej: Nuestra Misión" className={INPUT} />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Subtítulo / descripción</label>
              <input type="text" value={editing.subtitle} onChange={e => upd({ subtitle: e.target.value })}
                placeholder="Texto debajo del título" className={INPUT} />
            </div>
          </div>

          {/* Background */}
          <div>
            <label className="block text-xs text-stone-500 mb-2">Fondo de sección</label>
            <div className="flex flex-wrap gap-2">
              {BG_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => upd({ bg: opt.value })}
                  className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm transition-all',
                    editing.bg === opt.value ? 'border-gold' : 'border-stone-200 hover:border-stone-300'
                  )}>
                  <span className={cn('w-4 h-4 rounded-full', opt.preview)} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom color overrides */}
          <div className="border border-stone-100 rounded-xl p-4 space-y-3">
            <p className="text-xs font-medium text-stone-500 flex items-center gap-1.5">
              <Palette size={13} /> Colores personalizados <span className="font-normal text-stone-400">(vacío = usa colores del fondo)</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([
                { key: 'color_bg' as const, label: 'Fondo' },
                { key: 'color_heading' as const, label: 'Títulos' },
                { key: 'color_text' as const, label: 'Texto' },
                { key: 'color_accent' as const, label: 'Acento' },
              ] as const).map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="relative">
                    <input type="color" value={(editing as unknown as Record<string, string>)[key] || '#ffffff'}
                      onChange={e => upd({ [key]: e.target.value })}
                      className="w-9 h-9 rounded-lg border border-stone-200 cursor-pointer p-0.5 bg-white" />
                    {(editing as unknown as Record<string, string>)[key] && (
                      <button type="button"
                        onClick={() => upd({ [key]: '' })}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-stone-400 hover:bg-red-500 rounded-full text-white flex items-center justify-center text-xs leading-none transition-colors">
                        ×
                      </button>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">{label}</p>
                    <p className="text-xs font-mono text-stone-400 truncate max-w-[60px]">
                      {(editing as unknown as Record<string, string>)[key] || 'auto'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TOGGLE checked={editing.visible} onChange={v => upd({ visible: v })} />
            <span className="text-sm text-stone-600">Visible en la página de inicio</span>
          </div>

          {/* ── Cards ── */}
          {editing.type === 'cards' && (
            <div className="space-y-4 border-t border-stone-100 pt-5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-stone-700">Tarjetas</label>
                <div className="flex items-center gap-3">
                  <select value={editing.card_cols}
                    onChange={e => upd({ card_cols: parseInt(e.target.value) as 2 | 3 | 4 })}
                    className="px-3 py-1.5 border border-stone-200 rounded-lg text-sm bg-white">
                    <option value={2}>2 columnas</option>
                    <option value={3}>3 columnas</option>
                    <option value={4}>4 columnas</option>
                  </select>
                  <button type="button" onClick={() => upd({ cards: [...editing.cards, { emoji: '✝️', title: '', description: '' }] })}
                    className="flex items-center gap-1 text-xs text-primary hover:text-gold transition-colors">
                    <Plus size={14} /> Agregar
                  </button>
                </div>
              </div>
              {editing.cards.map((card, i) => (
                <div key={i} className="flex gap-2 items-start bg-stone-50 rounded-xl p-3">
                  <input type="text" placeholder="🙏" value={card.emoji}
                    onChange={e => { const cards = [...editing.cards]; cards[i] = { ...card, emoji: e.target.value }; upd({ cards }); }}
                    className="w-14 px-2 py-2 border border-stone-200 rounded-lg text-center text-lg" />
                  <div className="flex-1 space-y-2">
                    <input type="text" placeholder="Título" value={card.title}
                      onChange={e => { const cards = [...editing.cards]; cards[i] = { ...card, title: e.target.value }; upd({ cards }); }}
                      className={INPUT_SM + ' w-full'} />
                    <input type="text" placeholder="Descripción" value={card.description}
                      onChange={e => { const cards = [...editing.cards]; cards[i] = { ...card, description: e.target.value }; upd({ cards }); }}
                      className={INPUT_SM + ' w-full'} />
                  </div>
                  <button type="button" onClick={() => upd({ cards: editing.cards.filter((_, idx) => idx !== i) })}
                    className="p-1.5 text-red-400 hover:text-red-600 mt-1"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}

          {/* ── Columns ── */}
          {editing.type === 'columns' && (
            <div className="space-y-4 border-t border-stone-100 pt-5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-stone-700">Columnas</label>
                <button type="button" onClick={() => upd({ col_items: [...editing.col_items, { title: '', body: '', image_url: '', btn_label: '', btn_href: '/' }] })}
                  className="flex items-center gap-1 text-xs text-primary hover:text-gold transition-colors">
                  <Plus size={14} /> Agregar columna
                </button>
              </div>
              {editing.col_items.map((col, i) => (
                <div key={i} className="border border-stone-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-stone-500">Columna {i + 1}</span>
                    <button type="button" onClick={() => upd({ col_items: editing.col_items.filter((_, idx) => idx !== i) })}
                      className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                  <ImageUpload value={col.image_url} onChange={v => { const col_items = [...editing.col_items]; col_items[i] = { ...col, image_url: v }; upd({ col_items }); }}
                    folder="home-blocks" label="Imagen (opcional)" />
                  <input type="text" placeholder="Título de columna" value={col.title}
                    onChange={e => { const col_items = [...editing.col_items]; col_items[i] = { ...col, title: e.target.value }; upd({ col_items }); }}
                    className={INPUT} />
                  <RichTextEditor value={col.body} onChange={v => { const col_items = [...editing.col_items]; col_items[i] = { ...col, body: v }; upd({ col_items }); }}
                    placeholder="Contenido de la columna..." />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Texto del botón" value={col.btn_label}
                      onChange={e => { const col_items = [...editing.col_items]; col_items[i] = { ...col, btn_label: e.target.value }; upd({ col_items }); }}
                      className={INPUT_SM} />
                    <input type="text" placeholder="/ruta o URL" value={col.btn_href}
                      onChange={e => { const col_items = [...editing.col_items]; col_items[i] = { ...col, btn_href: e.target.value }; upd({ col_items }); }}
                      className={INPUT_SM} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── CTA Banner ── */}
          {editing.type === 'cta_banner' && (
            <div className="space-y-4 border-t border-stone-100 pt-5">
              <label className="text-sm font-medium text-stone-700">Botones de acción</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Botón principal — Texto</label>
                  <input type="text" value={editing.cta_btn1_label} onChange={e => upd({ cta_btn1_label: e.target.value })}
                    placeholder="Contactar" className={INPUT} />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Botón principal — Enlace</label>
                  <input type="text" value={editing.cta_btn1_href} onChange={e => upd({ cta_btn1_href: e.target.value })}
                    placeholder="#contact o /ruta" className={INPUT} />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Botón secundario — Texto</label>
                  <input type="text" value={editing.cta_btn2_label} onChange={e => upd({ cta_btn2_label: e.target.value })}
                    placeholder="Ver en Vivo (opcional)" className={INPUT} />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Botón secundario — Enlace</label>
                  <input type="text" value={editing.cta_btn2_href} onChange={e => upd({ cta_btn2_href: e.target.value })}
                    placeholder="/live" className={INPUT} />
                </div>
              </div>
              <p className="text-xs text-stone-400">Usa <code className="bg-stone-100 px-1 rounded">#contact</code> para abrir el formulario de contacto.</p>
            </div>
          )}

          {/* ── Stats ── */}
          {editing.type === 'stats' && (
            <div className="space-y-4 border-t border-stone-100 pt-5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-stone-700">Estadísticas</label>
                <button type="button" onClick={() => upd({ stats: [...editing.stats, { emoji: '📊', value: '', label: '' }] })}
                  className="flex items-center gap-1 text-xs text-primary hover:text-gold transition-colors">
                  <Plus size={14} /> Agregar
                </button>
              </div>
              {editing.stats.map((stat, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="text" placeholder="🙏" value={stat.emoji}
                    onChange={e => { const stats = [...editing.stats]; stats[i] = { ...stat, emoji: e.target.value }; upd({ stats }); }}
                    className="w-14 px-2 py-2 border border-stone-200 rounded-lg text-center text-lg" />
                  <input type="text" placeholder="Valor (ej: 200+)" value={stat.value}
                    onChange={e => { const stats = [...editing.stats]; stats[i] = { ...stat, value: e.target.value }; upd({ stats }); }}
                    className={INPUT_SM + ' w-32'} />
                  <input type="text" placeholder="Etiqueta" value={stat.label}
                    onChange={e => { const stats = [...editing.stats]; stats[i] = { ...stat, label: e.target.value }; upd({ stats }); }}
                    className={INPUT_SM + ' flex-1'} />
                  <button type="button" onClick={() => upd({ stats: editing.stats.filter((_, idx) => idx !== i) })}
                    className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}

          {/* ── Rich Text ── */}
          {editing.type === 'rich_text' && (
            <div className="space-y-4 border-t border-stone-100 pt-5">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-stone-700">Alineación</label>
                <div className="flex gap-1">
                  {(['left', 'center'] as const).map(align => (
                    <button key={align} type="button" onClick={() => upd({ text_align: align })}
                      className={cn('p-1.5 rounded-lg border transition-colors',
                        editing.text_align === align ? 'border-gold bg-gold/10 text-gold' : 'border-stone-200 text-stone-400 hover:border-stone-300'
                      )}>
                      {align === 'left' ? <AlignLeft size={16} /> : <AlignCenter size={16} />}
                    </button>
                  ))}
                </div>
              </div>
              <RichTextEditor value={editing.html} onChange={v => upd({ html: v })} placeholder="Escribe el contenido aquí..." />
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-end gap-3">
          {saved && <span className="text-sm text-green-600">¡Guardado!</span>}
          <button onClick={() => setEditing(null)} className="btn-secondary text-sm px-4 py-2">Cancelar</button>
          <button onClick={saveEditing} disabled={saving} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
            <Save size={15} />
            {saving ? 'Guardando...' : 'Guardar bloque'}
          </button>
        </div>
      </div>
    );
  }

  // ── Block type picker ────────────────────────────────────────
  if (pickingType) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-xl text-primary">Elegir tipo de bloque</h3>
          <button onClick={() => setPickingType(false)} className="text-sm text-stone-400 hover:text-stone-600">Cancelar</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BLOCK_TYPES.map(({ type, label, icon: Icon, desc }) => (
            <button key={type} onClick={() => addBlock(type)}
              className="flex flex-col gap-3 p-5 border-2 border-stone-200 hover:border-gold hover:bg-gold/5 rounded-2xl text-left transition-all group">
              <div className="w-10 h-10 bg-primary/10 group-hover:bg-gold/20 rounded-xl flex items-center justify-center transition-colors">
                <Icon size={20} className="text-primary group-hover:text-gold transition-colors" />
              </div>
              <div>
                <p className="font-semibold text-stone-800">{label}</p>
                <p className="text-xs text-stone-500 mt-1">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Block list ───────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl text-primary">Bloques de la página de inicio</h3>
          <p className="text-sm text-stone-500 mt-1">Arrastra para reordenar. Los bloques ocultos no aparecen en el sitio.</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-sm text-green-600">¡Guardado!</span>}
          <button onClick={() => setPickingType(true)} className="flex items-center gap-2 btn-primary">
            <Plus size={18} /> Agregar bloque
          </button>
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-16 text-center">
          <Home size={48} className="mx-auto text-stone-300 mb-4" />
          <p className="text-stone-500 text-lg mb-6">No hay bloques en la página de inicio</p>
          <button onClick={() => setPickingType(true)} className="btn-primary">Crear primer bloque</button>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, i) => {
            const meta = BLOCK_TYPES.find(t => t.type === block.type);
            const Icon = meta?.icon ?? Layout;
            return (
              <motion.div key={block.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={e => handleDragOver(e, i)}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => handleDrop(i)}
                className={cn('bg-white rounded-2xl shadow-md p-4 flex items-center gap-4 transition-all',
                  !block.visible && 'opacity-50',
                  dragOver === i && 'ring-2 ring-gold scale-[1.01]'
                )}>
                <GripVertical size={18} className="text-stone-300 flex-shrink-0 cursor-grab active:cursor-grabbing" />
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">{meta?.label}</span>
                    <span className="font-medium text-stone-800 text-sm truncate">{block.title || '(sin título)'}</span>
                    {!block.visible && <span className="text-xs text-stone-400">· Oculto</span>}
                  </div>
                  {block.subtitle && <p className="text-xs text-stone-400 mt-0.5 truncate">{block.subtitle}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <TOGGLE checked={block.visible} onChange={() => toggleVisible(block.id)} />
                  <button onClick={() => setEditing(block)}
                    className="p-2 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => deleteBlock(block.id)}
                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Footer widget helpers ──────────────────────────────────────
const WIDGET_META: Record<FooterWidgetType, { label: string; emoji: string; desc: string }> = {
  logo_info:   { label: 'Logo e Info',           emoji: '🏛️', desc: 'Logo, nombre y descripción de la iglesia' },
  contact:     { label: 'Contacto',              emoji: '📞', desc: 'Teléfono, email y WhatsApp' },
  nav_links:   { label: 'Links de navegación',   emoji: '🔗', desc: 'Lista de enlaces personalizables' },
  social:      { label: 'Redes Sociales',        emoji: '📱', desc: 'Iconos de Facebook, Instagram, YouTube' },
  schedule:    { label: 'Horarios',              emoji: '🕐', desc: 'Horarios de culto y actividades' },
  custom_html: { label: 'HTML Personalizado',    emoji: '💻', desc: 'Contenido libre en HTML' },
  online_cta:  { label: 'CTA Online',            emoji: '📡', desc: 'Banner "También en línea"' },
};

function emptyWidget(type: FooterWidgetType, order: number): FooterWidget {
  return {
    id: crypto.randomUUID(),
    type,
    title: WIDGET_META[type].label,
    visible: true,
    order,
    color_heading: '',
    color_text: '',
    color_accent: '',
    links: type === 'nav_links' ? [{ label: 'Inicio', href: '/' }] : [],
    html: '',
  };
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

  // Widget editor state (footer)
  const [editingWidget, setEditingWidget] = useState<FooterWidget | null>(null);
  const [addingWidget, setAddingWidget] = useState(false);
  const wDragFrom = useRef<number>(-1);
  const [wDragOver, setWDragOver] = useState<number | null>(null);

  const sortedWidgets = [...(footer.widgets ?? [])].sort((a, b) => a.order - b.order);

  const saveWidget = (w: FooterWidget) => {
    const exists = footer.widgets.some(x => x.id === w.id);
    const list = exists
      ? footer.widgets.map(x => x.id === w.id ? w : x)
      : [...footer.widgets, w];
    setFooter({ ...footer, widgets: list.map((x, i) => ({ ...x, order: i })) });
    setEditingWidget(null);
  };

  const deleteWidget = (id: string) => {
    if (!confirm('¿Eliminar este widget?')) return;
    setFooter({ ...footer, widgets: footer.widgets.filter(w => w.id !== id).map((w, i) => ({ ...w, order: i })) });
  };

  const toggleWidgetVisible = (id: string) => {
    setFooter({ ...footer, widgets: footer.widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w) });
  };

  const handleWDrop = (i: number) => {
    setWDragOver(null);
    const from = wDragFrom.current;
    if (from === -1 || from === i) return;
    const list = [...sortedWidgets];
    const [moved] = list.splice(from, 1);
    list.splice(i, 0, moved);
    setFooter({ ...footer, widgets: list.map((w, idx) => ({ ...w, order: idx })) });
  };

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

  const fColors = footer.colors ?? { bg: '#8D000A', heading: '#F5C842', body: '#d6d3d1', link: '#e7e5e4' };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="flex border-b border-stone-200 overflow-x-auto">
        {sections.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveSection(id)}
            className={cn('flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
              activeSection === id ? 'border-gold text-primary' : 'border-transparent text-stone-500 hover:text-stone-700'
            )}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-6">
        {/* BRANDING */}
        {activeSection === 'branding' && (
          <div className="space-y-5">
            <h3 className="font-serif text-lg text-primary">Identidad del Sitio</h3>
            <ImageUpload value={branding.logo_url} onChange={v => setBranding({ ...branding, logo_url: v })} folder="branding" label="Logo de la Iglesia" variant="logo" />
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Nombre del Sitio</label>
              <input type="text" value={branding.site_name} onChange={e => setBranding({ ...branding, site_name: e.target.value })} className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Tagline / Subtítulo</label>
              <input type="text" value={branding.tagline} onChange={e => setBranding({ ...branding, tagline: e.target.value })} className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-2">Vista previa en el Navbar</label>
              <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-sm">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-stone-100">
                  <img src={branding.logo_url || '/android-chrome-192x192.png'} alt="logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-serif text-base text-primary font-semibold leading-tight">{branding.site_name || 'Nombre del sitio'}</p>
                  {branding.tagline && <p className="text-xs text-amber-600 font-medium tracking-wider">{branding.tagline}</p>}
                </div>
              </div>
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
                  <button key={mode} type="button" onClick={() => setHero({ ...hero, mode })}
                    className={cn('flex-1 py-2 px-4 rounded-xl text-sm font-medium border-2 transition-all',
                      hero.mode === mode ? 'border-primary bg-primary/10 text-primary' : 'border-stone-200 text-stone-500 hover:border-stone-300'
                    )}>
                    {mode === 'text' ? 'Texto' : mode === 'image' ? 'Imagen' : 'Carrusel'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Título principal</label>
              <input type="text" value={hero.title} onChange={e => setHero({ ...hero, title: e.target.value })} className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Subtítulo</label>
              <textarea value={hero.subtitle} rows={2} onChange={e => setHero({ ...hero, subtitle: e.target.value })} className={INPUT + ' resize-none'} />
            </div>
            {hero.mode === 'image' && (
              <ImageUpload value={hero.bg_url} onChange={v => setHero({ ...hero, bg_url: v })} folder="hero" label="Imagen de fondo" />
            )}
            {(hero.mode === 'image' || hero.mode === 'slider') && (
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Opacidad del overlay ({Math.round(hero.overlay * 100)}%)</label>
                <input type="range" min={0} max={1} step={0.05} value={hero.overlay}
                  onChange={e => setHero({ ...hero, overlay: parseFloat(e.target.value) })} className="w-full accent-gold" />
              </div>
            )}
            {hero.mode === 'slider' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-stone-600">Imágenes del carrusel</label>
                  <button type="button" onClick={() => setHero({ ...hero, slides: [...hero.slides, ''] })}
                    className="flex items-center gap-1 text-xs text-primary hover:text-gold transition-colors">
                    <Plus size={14} /> Agregar
                  </button>
                </div>
                <div className="space-y-3">
                  {hero.slides.map((url, i) => (
                    <div key={i} className="space-y-2">
                      <ImageUpload value={url}
                        onChange={v => { const slides = [...hero.slides]; slides[i] = v; setHero({ ...hero, slides }); }}
                        folder="hero/slides" label={`Slide ${i + 1}`} />
                      <button type="button"
                        onClick={() => setHero({ ...hero, slides: hero.slides.filter((_, idx) => idx !== i) })}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                        <Trash2 size={12} /> Eliminar slide
                      </button>
                    </div>
                  ))}
                  {hero.slides.length === 0 && <p className="text-sm text-stone-400 italic">No hay slides. Agrega al menos uno.</p>}
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-stone-600">Botones</label>
                <button type="button" onClick={() => setHero({ ...hero, buttons: [...hero.buttons, { label: '', href: '/', variant: 'primary' }] })}
                  className="flex items-center gap-1 text-xs text-primary hover:text-gold transition-colors">
                  <Plus size={14} /> Agregar botón
                </button>
              </div>
              <div className="space-y-3">
                {hero.buttons.map((btn, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input type="text" placeholder="Texto" value={btn.label}
                      onChange={e => { const buttons = [...hero.buttons]; buttons[i] = { ...btn, label: e.target.value }; setHero({ ...hero, buttons }); }}
                      className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gold" />
                    <input type="text" placeholder="/ruta" value={btn.href}
                      onChange={e => { const buttons = [...hero.buttons]; buttons[i] = { ...btn, href: e.target.value }; setHero({ ...hero, buttons }); }}
                      className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gold" />
                    <select value={btn.variant}
                      onChange={e => { const buttons = [...hero.buttons]; buttons[i] = { ...btn, variant: e.target.value as 'primary' | 'secondary' }; setHero({ ...hero, buttons }); }}
                      className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gold bg-white">
                      <option value="primary">Principal</option>
                      <option value="secondary">Secundario</option>
                    </select>
                    <button type="button" onClick={() => setHero({ ...hero, buttons: hero.buttons.filter((_, idx) => idx !== i) })}
                      className="p-2 text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FOOTER — widget editor overlay */}
        {activeSection === 'footer' && editingWidget && (
          <div className="space-y-0">
            <div className="flex items-center justify-between px-0 py-3 border-b border-stone-100 mb-5">
              <div>
                <h3 className="font-serif text-lg text-primary">
                  {WIDGET_META[editingWidget.type]?.emoji} Editar widget — {WIDGET_META[editingWidget.type]?.label}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">Los cambios se guardan al presionar "Guardar widget"</p>
              </div>
              <button onClick={() => setEditingWidget(null)} className="text-sm text-stone-400 hover:text-stone-600 px-3 py-1.5 rounded-lg hover:bg-stone-100">
                Cancelar
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-xs text-stone-500 mb-1">Título del widget (encabezado de columna)</label>
                <input type="text" value={editingWidget.title}
                  onChange={e => setEditingWidget({ ...editingWidget, title: e.target.value })}
                  className={INPUT} />
              </div>
              <div className="flex items-center gap-3">
                <TOGGLE checked={editingWidget.visible} onChange={v => setEditingWidget({ ...editingWidget, visible: v })} />
                <span className="text-sm text-stone-600">Visible en el footer</span>
              </div>
              {/* Per-widget color overrides */}
              <div className="border border-stone-100 rounded-xl p-4 space-y-3">
                <p className="text-xs font-medium text-stone-500 flex items-center gap-1.5">
                  <Palette size={13} /> Colores <span className="font-normal text-stone-400">(vacío = hereda colores globales del footer)</span>
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { key: 'color_heading' as const, label: 'Títulos' },
                    { key: 'color_text' as const, label: 'Texto' },
                    { key: 'color_accent' as const, label: 'Acento / links' },
                  ] as const).map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className="relative">
                        <input type="color" value={editingWidget[key] || '#ffffff'}
                          onChange={e => setEditingWidget({ ...editingWidget, [key]: e.target.value })}
                          className="w-9 h-9 rounded-lg border border-stone-200 cursor-pointer p-0.5 bg-white" />
                        {editingWidget[key] && (
                          <button type="button"
                            onClick={() => setEditingWidget({ ...editingWidget, [key]: '' })}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-stone-400 hover:bg-red-500 rounded-full text-white flex items-center justify-center text-xs leading-none transition-colors">
                            ×
                          </button>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-stone-500">{label}</p>
                        <p className="text-xs font-mono text-stone-400">{editingWidget[key] || 'auto'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* nav_links: link list editor */}
              {editingWidget.type === 'nav_links' && (
                <div className="border-t border-stone-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-stone-700">Enlaces</label>
                    <button type="button"
                      onClick={() => setEditingWidget({ ...editingWidget, links: [...editingWidget.links, { label: '', href: '/' }] })}
                      className="flex items-center gap-1 text-xs text-primary hover:text-gold">
                      <Plus size={13} /> Agregar enlace
                    </button>
                  </div>
                  {editingWidget.links.map((link, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="text" placeholder="Texto" value={link.label}
                        onChange={e => { const links = [...editingWidget.links]; links[i] = { ...link, label: e.target.value }; setEditingWidget({ ...editingWidget, links }); }}
                        className={INPUT_SM + ' flex-1'} />
                      <input type="text" placeholder="/ruta o URL" value={link.href}
                        onChange={e => { const links = [...editingWidget.links]; links[i] = { ...link, href: e.target.value }; setEditingWidget({ ...editingWidget, links }); }}
                        className={INPUT_SM + ' flex-1'} />
                      <button type="button"
                        onClick={() => setEditingWidget({ ...editingWidget, links: editingWidget.links.filter((_, idx) => idx !== i) })}
                        className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <p className="text-xs text-stone-400">Usa <code className="bg-stone-100 px-1 rounded">#contact</code> para abrir el formulario de contacto.</p>
                </div>
              )}
              {/* custom_html: HTML editor */}
              {editingWidget.type === 'custom_html' && (
                <div className="border-t border-stone-100 pt-4">
                  <label className="block text-sm font-medium text-stone-700 mb-2">Contenido HTML</label>
                  <textarea rows={8} value={editingWidget.html}
                    onChange={e => setEditingWidget({ ...editingWidget, html: e.target.value })}
                    className={INPUT + ' resize-none font-mono text-xs'} placeholder="<p>Tu contenido aquí...</p>" />
                </div>
              )}
              {/* Info widgets that use global footer data */}
              {['logo_info', 'contact', 'social', 'schedule', 'online_cta'].includes(editingWidget.type) && (
                <div className="bg-stone-50 rounded-xl p-4">
                  <p className="text-xs text-stone-500">
                    Este widget usa la información configurada en las secciones de abajo
                    ({editingWidget.type === 'logo_info' ? 'Información + Datos de contacto' :
                      editingWidget.type === 'contact' ? 'Datos de contacto' :
                      editingWidget.type === 'social' ? 'Redes Sociales' :
                      editingWidget.type === 'schedule' ? 'Horarios' : 'Datos de contacto'}).
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-stone-100">
              <button onClick={() => setEditingWidget(null)} className="btn-secondary text-sm px-4 py-2">Cancelar</button>
              <button onClick={() => saveWidget(editingWidget)} className="btn-primary flex items-center gap-2 text-sm">
                <Save size={15} /> Guardar widget
              </button>
            </div>
          </div>
        )}

        {/* FOOTER — widget type picker */}
        {activeSection === 'footer' && !editingWidget && addingWidget && (
          <div className="space-y-0">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
              <h3 className="font-serif text-lg text-primary">Elegir tipo de widget</h3>
              <button onClick={() => setAddingWidget(false)} className="text-sm text-stone-400 hover:text-stone-600">Cancelar</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.entries(WIDGET_META) as [FooterWidgetType, typeof WIDGET_META[FooterWidgetType]][]).map(([type, meta]) => (
                <button key={type}
                  onClick={() => { setAddingWidget(false); setEditingWidget(emptyWidget(type, sortedWidgets.length)); }}
                  className="flex flex-col gap-3 p-5 border-2 border-stone-200 hover:border-gold hover:bg-gold/5 rounded-2xl text-left transition-all group">
                  <div className="text-2xl">{meta.emoji}</div>
                  <div>
                    <p className="font-semibold text-stone-800">{meta.label}</p>
                    <p className="text-xs text-stone-500 mt-1">{meta.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FOOTER */}
        {activeSection === 'footer' && !editingWidget && !addingWidget && (
          <div className="space-y-6">
            <h3 className="font-serif text-lg text-primary">Pie de Página</h3>

            {/* Widget list */}
            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border-b border-stone-200">
                <p className="text-sm font-medium text-stone-700">Columnas / Widgets</p>
                <button onClick={() => setAddingWidget(true)}
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-gold transition-colors">
                  <Plus size={14} /> Agregar widget
                </button>
              </div>
              {sortedWidgets.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-stone-400 text-sm">No hay widgets. Agrega uno para construir el footer.</p>
                  <button onClick={() => setAddingWidget(true)} className="mt-3 btn-primary text-sm">Agregar widget</button>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {sortedWidgets.map((widget, i) => (
                    <div key={widget.id}
                      draggable
                      onDragStart={() => { wDragFrom.current = i; }}
                      onDragOver={e => { e.preventDefault(); setWDragOver(i); }}
                      onDragLeave={() => setWDragOver(null)}
                      onDrop={() => handleWDrop(i)}
                      className={cn('flex items-center gap-3 px-4 py-3 transition-all', !widget.visible && 'opacity-50', wDragOver === i && 'bg-gold/10')}>
                      <GripVertical size={15} className="text-stone-300 cursor-grab flex-shrink-0" />
                      <span className="text-lg">{WIDGET_META[widget.type]?.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-700 truncate">{widget.title || WIDGET_META[widget.type]?.label}</p>
                        <p className="text-xs text-stone-400">{WIDGET_META[widget.type]?.label}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <TOGGLE checked={widget.visible} onChange={() => toggleWidgetVisible(widget.id)} />
                        <button onClick={() => setEditingWidget(widget)}
                          className="p-1.5 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => deleteWidget(widget.id)}
                          className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Texto y copyright */}
            <div className="space-y-4 border-t border-stone-100 pt-5">
              <p className="text-sm font-medium text-stone-700">Información general</p>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Texto descriptivo</label>
                <textarea value={footer.text} rows={3} onChange={e => setFooter({ ...footer, text: e.target.value })} className={INPUT + ' resize-none'} />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Texto de copyright</label>
                <input type="text" value={footer.copyright} onChange={e => setFooter({ ...footer, copyright: e.target.value })} className={INPUT} />
              </div>
            </div>

            {/* CTA Band toggles */}
            <div className="border-t border-stone-100 pt-5">
              <p className="text-sm font-medium text-stone-700 mb-3">Bandas superiores</p>
              <div className="space-y-3">
                {[
                  { key: 'show_cta' as const, label: 'Banda de CTA (¿Tienes preguntas?)' },
                  { key: 'show_schedule' as const, label: 'Banda de horarios de servicio' },
                ].map(({ key, label }) => {
                  const checked = key === 'show_cta' ? (footer.cta?.enabled ?? true) : (footer.schedules?.enabled ?? true);
                  const onChange = (v: boolean) => {
                    if (key === 'show_cta') setFooter({ ...footer, cta: { ...(footer.cta ?? { title: '¿Tienes preguntas?', subtitle: '' }), enabled: v } });
                    else setFooter({ ...footer, schedules: { ...(footer.schedules ?? { items: [] }), enabled: v } });
                  };
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">{label}</span>
                      <TOGGLE checked={checked} onChange={onChange} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Colores */}
            <div className="border-t border-stone-100 pt-5">
              <p className="text-sm font-medium text-stone-700 mb-4 flex items-center gap-2">
                <Palette size={16} className="text-stone-400" /> Colores del footer
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {([
                  { key: 'bg' as const, label: 'Fondo principal' },
                  { key: 'heading' as const, label: 'Títulos / acentos' },
                  { key: 'body' as const, label: 'Texto cuerpo' },
                  { key: 'link' as const, label: 'Color de enlaces' },
                ] as const).map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <input type="color" value={fColors[key]}
                      onChange={e => setFooter({ ...footer, colors: { ...fColors, [key]: e.target.value } })}
                      className="w-10 h-10 rounded-xl border border-stone-200 cursor-pointer p-0.5 bg-white" />
                    <div className="flex-1">
                      <p className="text-xs text-stone-500">{label}</p>
                      <p className="text-xs font-mono text-stone-400">{fColors[key]}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-stone-400 mt-3">Haz clic en el cuadro de color para abrir el selector.</p>
            </div>

            {/* Contacto */}
            <div className="border-t border-stone-100 pt-5">
              <p className="text-sm font-medium text-stone-700 mb-3">Información de contacto</p>
              <div className="space-y-3">
                {[
                  { field: 'address' as const, placeholder: 'Dirección', type: 'text' },
                  { field: 'phone' as const, placeholder: 'Teléfono', type: 'text' },
                  { field: 'email' as const, placeholder: 'Email', type: 'email' },
                  { field: 'whatsapp' as const, placeholder: 'WhatsApp (ej: +57 300 123 4567)', type: 'text' },
                ].map(({ field, placeholder, type }) => (
                  <input key={field} type={type} placeholder={placeholder}
                    value={(footer.contact[field] ?? '') as string}
                    onChange={e => setFooter({ ...footer, contact: { ...footer.contact, [field]: e.target.value } })}
                    className={INPUT} />
                ))}
              </div>
            </div>

            {/* Redes sociales */}
            <div className="border-t border-stone-100 pt-5">
              <p className="text-sm font-medium text-stone-700 mb-3">Redes Sociales</p>
              <div className="space-y-3">
                {[
                  { key: 'facebook' as const, label: 'Facebook', ph: 'https://facebook.com/...' },
                  { key: 'youtube' as const, label: 'YouTube', ph: 'https://youtube.com/...' },
                  { key: 'instagram' as const, label: 'Instagram', ph: 'https://instagram.com/...' },
                ].map(({ key, label, ph }) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-sm text-stone-500 w-24 flex-shrink-0">{label}</span>
                    <input type="url" placeholder={ph} value={footer.social[key]}
                      onChange={e => setFooter({ ...footer, social: { ...footer.social, [key]: e.target.value } })}
                      className="flex-1 px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold text-sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Banner config */}
            <div className="border-t border-stone-100 pt-5">
              <p className="text-sm font-medium text-stone-700 mb-3">Texto de la banda CTA</p>
              <div className="space-y-3">
                <input type="text" value={footer.cta?.title ?? ''} placeholder="¿Tienes preguntas?"
                  onChange={e => setFooter({ ...footer, cta: { ...(footer.cta ?? { enabled: true, subtitle: '' }), title: e.target.value } })}
                  className={INPUT} />
                <input type="text" value={footer.cta?.subtitle ?? ''} placeholder="Subtítulo del CTA"
                  onChange={e => setFooter({ ...footer, cta: { ...(footer.cta ?? { enabled: true, title: '' }), subtitle: e.target.value } })}
                  className={INPUT} />
              </div>
            </div>

            {/* Horarios */}
            <div className="border-t border-stone-100 pt-5">
              <p className="text-sm font-medium text-stone-700 mb-3">Horarios de servicio</p>
              <div className="space-y-3">
                {(footer.schedules?.items ?? []).map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="text" placeholder="Día" value={item.day}
                      onChange={e => { const items = [...(footer.schedules?.items ?? [])]; items[i] = { ...items[i], day: e.target.value }; setFooter({ ...footer, schedules: { ...(footer.schedules ?? { enabled: true }), items } }); }}
                      className="w-28 px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold text-sm" />
                    <input type="text" placeholder="Hora" value={item.time}
                      onChange={e => { const items = [...(footer.schedules?.items ?? [])]; items[i] = { ...items[i], time: e.target.value }; setFooter({ ...footer, schedules: { ...(footer.schedules ?? { enabled: true }), items } }); }}
                      className="w-28 px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold text-sm" />
                    <input type="text" placeholder="Nombre del servicio" value={item.label}
                      onChange={e => { const items = [...(footer.schedules?.items ?? [])]; items[i] = { ...items[i], label: e.target.value }; setFooter({ ...footer, schedules: { ...(footer.schedules ?? { enabled: true }), items } }); }}
                      className="flex-1 px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold text-sm" />
                    <button type="button"
                      onClick={() => { const items = (footer.schedules?.items ?? []).filter((_, idx) => idx !== i); setFooter({ ...footer, schedules: { ...(footer.schedules ?? { enabled: true }), items } }); }}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"><Trash2 size={15} /></button>
                  </div>
                ))}
                <button type="button"
                  onClick={() => { const items = [...(footer.schedules?.items ?? []), { day: '', time: '', label: '' }]; setFooter({ ...footer, schedules: { ...(footer.schedules ?? { enabled: true }), items } }); }}
                  className="flex items-center gap-2 text-sm text-primary hover:text-gold transition-colors">
                  <Plus size={15} /> Agregar horario
                </button>
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
              <input type="text" value={seo.title} onChange={e => setSeo({ ...seo, title: e.target.value })} className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Descripción (meta description)</label>
              <textarea value={seo.description} rows={3} onChange={e => setSeo({ ...seo, description: e.target.value })} className={INPUT + ' resize-none'} />
            </div>
            <ImageUpload value={seo.og_image} onChange={v => setSeo({ ...seo, og_image: v })} folder="seo" label="Imagen Open Graph (og:image)" />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
          {saved && <span className="text-sm text-green-600 font-medium">¡Guardado!</span>}
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 btn-primary disabled:opacity-60">
            <Save size={16} />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PÁGINAS TAB ────────────────────────────────────────────────
function slugify(text: string) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

const emptyPageForm = (): Omit<Page, 'id' | 'created_at' | 'updated_at'> => ({
  slug: '', title: '', subtitle: '', cover_image: '', content: '',
  published: false, show_in_nav: false, nav_order: 0,
  meta_title: '', meta_description: '', og_image: '',
});

function PaginasTab() {
  const { pages, loading, addPage, updatePage, deletePage } = usePages();
  const [editing, setEditing] = useState<Page | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyPageForm());
  const [saving, setSaving] = useState(false);
  const [slugManual, setSlugManual] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const dragFrom = useRef<number>(-1);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyPageForm());
    setSlugManual(false);
    setShowSeo(false);
    setCreating(true);
  };

  const openEdit = (p: Page) => {
    setEditing(p);
    setForm({
      slug: p.slug, title: p.title, subtitle: p.subtitle ?? '',
      cover_image: p.cover_image ?? '', content: p.content,
      published: p.published, show_in_nav: p.show_in_nav, nav_order: p.nav_order,
      meta_title: p.meta_title ?? '', meta_description: p.meta_description ?? '',
      og_image: p.og_image ?? '',
    });
    setSlugManual(true);
    setShowSeo(!!(p.meta_title || p.meta_description));
    setCreating(true);
  };

  const handleDragStart = (i: number) => { dragFrom.current = i; };
  const handleDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOver(i); };
  const handleDrop = async (i: number) => {
    setDragOver(null);
    const from = dragFrom.current;
    if (from === -1 || from === i) return;
    const reordered = [...pages];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(i, 0, moved);
    await Promise.all(reordered.map((p, idx) => updatePage(p.id, { nav_order: idx })));
  };

  const handleTitleChange = (title: string) => {
    setForm(f => ({ ...f, title, ...(slugManual ? {} : { slug: slugify(title) }) }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await updatePage(editing.id, form);
      else await addPage(form);
      setCreating(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta página permanentemente?')) return;
    await deletePage(id);
  };

  if (creating) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h3 className="font-serif text-xl text-primary">{editing ? `Editar: ${editing.title}` : 'Nueva Página'}</h3>
          <button onClick={() => setCreating(false)} className="text-sm text-stone-400 hover:text-stone-600 px-3 py-1.5 rounded-lg hover:bg-stone-100">Cancelar</button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Título de la página *</label>
              <input type="text" value={form.title} onChange={e => handleTitleChange(e.target.value)}
                className={INPUT} required placeholder="Ej: Nosotros, Acerca de, Historia..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">
                Slug (URL) — <span className="text-stone-400 font-normal">/p/<strong>{form.slug || 'mi-pagina'}</strong></span>
              </label>
              <input type="text" value={form.slug}
                onChange={e => { setSlugManual(true); setForm(f => ({ ...f, slug: e.target.value })); }}
                className={INPUT + ' font-mono'} required placeholder="nosotros" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Subtítulo (opcional)</label>
            <input type="text" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
              placeholder="Frase corta que aparece bajo el título" className={INPUT} />
          </div>
          <ImageUpload value={form.cover_image ?? ''} onChange={v => setForm(f => ({ ...f, cover_image: v }))} folder="pages" label="Imagen de portada (opcional)" />
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Contenido *</label>
            <RichTextEditor value={form.content} onChange={v => setForm(f => ({ ...f, content: v }))} placeholder="Escribe el contenido de la página aquí..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {[
              { label: 'Publicada', field: 'published' as const },
              { label: 'Mostrar en menú', field: 'show_in_nav' as const },
            ].map(({ label, field }) => (
              <div key={field} className="flex items-center gap-3">
                <TOGGLE checked={form[field] as boolean} onChange={v => setForm(f => ({ ...f, [field]: v }))} />
                <span className="text-sm text-stone-600">{label}</span>
              </div>
            ))}
            <div>
              <label className="block text-xs text-stone-500 mb-1">Orden en menú</label>
              <input type="number" value={form.nav_order} min={0}
                onChange={e => setForm(f => ({ ...f, nav_order: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold text-sm" />
            </div>
          </div>
          {/* SEO colapsable */}
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <button type="button" onClick={() => setShowSeo(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-stone-50 hover:bg-stone-100 transition-colors text-sm font-medium text-stone-600">
              <span className="flex items-center gap-2"><Globe size={16} className="text-stone-400" />SEO — Meta etiquetas (opcional)</span>
              <ChevronDown size={16} className={cn('transition-transform text-stone-400', showSeo && 'rotate-180')} />
            </button>
            {showSeo && (
              <div className="p-4 space-y-4 border-t border-stone-200">
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Meta título <span className="text-stone-400">(por defecto usa el título)</span></label>
                  <input type="text" value={form.meta_title ?? ''} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))}
                    placeholder={form.title || 'Título para buscadores'} maxLength={60} className={INPUT} />
                  <p className="text-xs text-stone-400 mt-1">{(form.meta_title ?? '').length}/60 caracteres</p>
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Meta descripción</label>
                  <textarea value={form.meta_description ?? ''} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))}
                    placeholder="Descripción breve para Google (155 caracteres aprox.)" maxLength={160} rows={2}
                    className={INPUT + ' resize-none'} />
                  <p className="text-xs text-stone-400 mt-1">{(form.meta_description ?? '').length}/160 caracteres</p>
                </div>
                <ImageUpload value={form.og_image ?? ''} onChange={v => setForm(f => ({ ...f, og_image: v }))} folder="seo" label="Imagen Open Graph" />
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2 border-t border-stone-100">
            <button type="button" onClick={() => setCreating(false)} className="flex-1 btn-secondary">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
              <Save size={16} />{saving ? 'Guardando...' : (editing ? 'Actualizar página' : 'Crear página')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl text-primary">Páginas del sitio</h3>
          <p className="text-sm text-stone-500 mt-1">Crea páginas como "Nosotros", "Historia", "Visión y Misión". Las páginas con <strong>Mostrar en menú</strong> aparecen automáticamente en la navegación.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 btn-primary"><Plus size={18} />Nueva página</button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" /></div>
      ) : pages.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <PanelLeft size={48} className="mx-auto text-stone-300 mb-4" />
          <p className="text-stone-500 text-lg mb-2">No hay páginas creadas</p>
          <p className="text-stone-400 text-sm mb-6">Crea tu primera página para agregar contenido estático al sitio.</p>
          <button onClick={openCreate} className="btn-primary">Crear primera página</button>
        </div>
      ) : (
        <div className="grid gap-3">
          {pages.map((page, i) => (
            <motion.div key={page.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              draggable onDragStart={() => handleDragStart(i)} onDragOver={e => handleDragOver(e, i)}
              onDragLeave={() => setDragOver(null)} onDrop={() => handleDrop(i)}
              className={cn('bg-white rounded-2xl shadow-md p-5 flex items-center gap-4 transition-all', dragOver === i && 'ring-2 ring-gold scale-[1.01]')}>
              <GripVertical size={18} className="text-stone-300 flex-shrink-0 cursor-grab active:cursor-grabbing" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-stone-800">{page.title}</h4>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', page.published ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500')}>
                    {page.published ? 'Publicada' : 'Borrador'}
                  </span>
                  {page.show_in_nav && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">En menú #{page.nav_order}</span>}
                </div>
                <p className="text-sm text-stone-400 font-mono mt-0.5">/p/{page.slug}</p>
                {page.subtitle && <p className="text-sm text-stone-500 mt-1 truncate">{page.subtitle}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer"
                  className="p-2 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors"><ExternalLink size={16} /></a>
                <button onClick={() => openEdit(page)} className="p-2 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors"><Eye size={16} /></button>
                <button onClick={() => handleDelete(page.id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash size={16} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

const userFormErrors: Record<string, string> = {
  'User already registered': 'Este email ya está registrado.',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
  'Unable to validate email address: invalid format': 'El formato del email no es válido.',
};

function parseUserFormError(msg: string): string {
  return userFormErrors[msg] ?? 'Ocurrió un error al crear el usuario. Intenta de nuevo.';
}

const emptyUserForm = () => ({
  display_name: '',
  email: '',
  password: '',
  role: 'member' as UserRole,
  status: 'active' as 'active' | 'inactive',
  phone: '',
  address: '',
});

// ── USUARIOS TAB ───────────────────────────────────────────────
function UsuariosTab() {
  const { users, loading, updateUserRole, updateUserStatus, createUser } = useUsers();
  const { profile: currentProfile, canManageUsers } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyUserForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  // Optimistic local overrides: { [userId]: { role?, status?, saving?, saved?, error? } }
  const [localOverrides, setLocalOverrides] = useState<Record<string, {
    role?: UserRole;
    status?: 'active' | 'inactive';
    saving?: boolean;
    saved?: boolean;
    error?: string;
  }>>({});

  const filtered = users.filter(u => {
    const matchSearch = u.display_name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch && (roleFilter === 'all' || u.role === roleFilter) && (statusFilter === 'all' || u.status === statusFilter);
  });

  const openCreateModal = () => {
    setForm(emptyUserForm());
    setFormError('');
    setModalOpen(true);
  };

  const patchOverride = (id: string, patch: typeof localOverrides[string]) =>
    setLocalOverrides(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const handleRoleChange = async (user: UserProfile, role: UserRole) => {
    if (!canManageUsers || user.id === currentProfile?.id) return;
    patchOverride(user.id, { role, saving: true, saved: false, error: undefined });
    try {
      await updateUserRole(user.id, role);
      patchOverride(user.id, { saving: false, saved: true });
      setTimeout(() => patchOverride(user.id, { saved: false }), 2000);
    } catch {
      patchOverride(user.id, { role: user.role, saving: false, error: 'Error al guardar el rol' });
      setTimeout(() => patchOverride(user.id, { error: undefined }), 3000);
    }
  };

  const handleStatusChange = async (user: UserProfile, status: 'active' | 'inactive') => {
    if (!canManageUsers || user.id === currentProfile?.id) return;
    patchOverride(user.id, { status, saving: true, saved: false, error: undefined });
    try {
      await updateUserStatus(user.id, status);
      patchOverride(user.id, { saving: false, saved: true });
      setTimeout(() => patchOverride(user.id, { saved: false }), 2000);
    } catch {
      patchOverride(user.id, { status: user.status, saving: false, error: 'Error al guardar el estado' });
      setTimeout(() => patchOverride(user.id, { error: undefined }), 3000);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.display_name.trim()) {
      setFormError('El nombre es requerido.');
      return;
    }
    setSaving(true);
    try {
      await createUser({
        email: form.email.trim(),
        password: form.password,
        display_name: form.display_name.trim(),
        role: form.role,
        status: form.status,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
      });
      setModalOpen(false);
      setForm(emptyUserForm());
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? '';
      setFormError(parseUserFormError(msg));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="text" placeholder="Buscar por nombre o email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
          {canManageUsers && (
            <button onClick={openCreateModal} className="flex items-center gap-2 btn-primary whitespace-nowrap ml-auto md:ml-0">
              <Plus size={18} /> Agregar usuario
            </button>
          )}
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
                {['Usuario', 'Contacto', 'Rol', 'Estado', 'Ingreso'].map(h => (
                  <th key={h} className="text-left py-4 px-4 text-sm font-semibold text-stone-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => {
                const isSelf = user.id === currentProfile?.id;
                const ov = localOverrides[user.id] ?? {};
                const displayRole = ov.role ?? user.role;
                const displayStatus = ov.status ?? user.status;
                const isRowSaving = ov.saving;
                const isRowSaved = ov.saved;
                const rowError = ov.error;
                return (
                  <motion.tr key={user.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {user.display_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-stone-800">{user.display_name}{isSelf && <span className="ml-2 text-xs text-stone-400">(tú)</span>}</p>
                          {user.address && <p className="text-xs text-stone-400">{user.address}</p>}
                          {isRowSaving && <p className="text-xs text-stone-400 animate-pulse">Guardando...</p>}
                          {isRowSaved && <p className="text-xs text-green-600">✓ Guardado</p>}
                          {rowError && <p className="text-xs text-red-500">{rowError}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <p className="flex items-center gap-2 text-sm text-stone-600"><Mail size={13} className="text-stone-400" />{user.email}</p>
                        {user.phone && <p className="flex items-center gap-2 text-sm text-stone-600"><Phone size={13} className="text-stone-400" />{user.phone}</p>}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {canManageUsers && !isSelf ? (
                        <div className="relative">
                          <select value={displayRole} onChange={e => handleRoleChange(user, e.target.value as UserRole)}
                            disabled={isRowSaving}
                            className={cn('pl-3 pr-7 py-1.5 rounded-full text-sm font-medium border-0 appearance-none cursor-pointer focus:ring-2 focus:ring-gold focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed', roleColors[displayRole].bg, roleColors[displayRole].text)}>
                            {Object.entries(roleLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                          <ChevronDown size={12} className={cn('absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none', roleColors[displayRole].text)} />
                        </div>
                      ) : (
                        <span className={cn('px-3 py-1 rounded-full text-sm font-medium', roleColors[user.role].bg, roleColors[user.role].text)}>{roleLabels[user.role]}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {canManageUsers && !isSelf ? (
                        <div className="relative">
                          <select value={displayStatus} onChange={e => handleStatusChange(user, e.target.value as 'active' | 'inactive')}
                            disabled={isRowSaving}
                            className={cn('pl-3 pr-7 py-1.5 rounded-full text-sm font-medium border-0 appearance-none cursor-pointer focus:ring-2 focus:ring-gold focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed', statusColors[displayStatus].bg, statusColors[displayStatus].text)}>
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                          </select>
                          <ChevronDown size={12} className={cn('absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none', statusColors[displayStatus].text)} />
                        </div>
                      ) : (
                        <span className={cn('px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit', statusColors[user.status].bg, statusColors[user.status].text)}>
                          <UserCheck size={13} />{user.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-stone-500">
                        <Calendar size={13} />
                        {new Date(user.join_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
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
        <p className="mt-4 text-sm text-stone-400 text-center">Solo pastores y administradores pueden cambiar roles y estados.</p>
      )}

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl text-primary">Registrar usuario</h2>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-lg">
                  <X size={24} className="text-stone-500" />
                </button>
              </div>

              <p className="text-stone-500 text-sm mb-6">
                Crea una cuenta para un nuevo miembro. El usuario podrá iniciar sesión con el email y contraseña que definas.
              </p>

              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm"
                >
                  <AlertCircle size={18} className="flex-shrink-0" />
                  {formError}
                </motion.div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Nombre completo *</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={form.display_name}
                      onChange={e => setForm({ ...form, display_name: e.target.value })}
                      placeholder="Juan Pérez García"
                      className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Correo electrónico *</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="correo@ejemplo.com"
                      className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Contraseña *</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="password"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold text-sm"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Rol</label>
                    <select
                      value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value as UserRole })}
                      className="w-full px-3 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm"
                    >
                      {Object.entries(roleLabels).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Estado</label>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full px-3 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm"
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Teléfono (opcional)</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="809-000-0000"
                      className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Dirección (opcional)</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    placeholder="Ciudad, provincia"
                    className={INPUT}
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-60">
                    {saving ? 'Registrando...' : 'Registrar usuario'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── MAIN DASHBOARD ─────────────────────────────────────────────
export function DashboardPage() {
  const { profile: currentProfile } = useAuth();
  const { unread } = useContactMessages();
  const [activeTab, setActiveTab] = useState<TabId>('resumen');

  const tabs: { id: TabId; label: string; icon: typeof BarChart3; badge?: number }[] = [
    { id: 'resumen', label: 'Resumen', icon: BarChart3 },
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'mensajes', label: 'Mensajes', icon: MessageSquare, badge: unread },
    { id: 'sitio', label: 'Sitio Web', icon: Settings },
    { id: 'paginas', label: 'Páginas', icon: PanelLeft },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center">
              <Shield size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-4xl font-bold">Dashboard</h1>
              <p className="text-stone-300">{currentProfile?.display_name} · {roleLabels[currentProfile?.role ?? 'member']}</p>
            </div>
          </motion.div>

          <div className="flex gap-1 mt-8 bg-white/10 rounded-xl p-1 w-fit overflow-x-auto max-w-full">
            {tabs.map(({ id, label, icon: Icon, badge }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={cn('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all relative whitespace-nowrap flex-shrink-0',
                  activeTab === id ? 'bg-white text-primary shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
                )}>
                <Icon size={15} />
                {label}
                {badge && badge > 0 ? (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">{badge}</span>
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
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
              {activeTab === 'resumen' && <ResumenTab />}
              {activeTab === 'inicio' && <InicioTab />}
              {activeTab === 'mensajes' && <MensajesTab />}
              {activeTab === 'sitio' && <SitioTab />}
              {activeTab === 'paginas' && <PaginasTab />}
              {activeTab === 'usuarios' && <UsuariosTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
