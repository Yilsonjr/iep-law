import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, Calendar, User, Filter, Plus, Edit2, Trash2, X, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useSermons } from '../hooks/useSermons';
import { useAuth } from '../contexts/AuthContext';
import { EmptyState } from '../components/EmptyState';
import { ShareActions } from '../components/ShareActions';
import { ImageUpload } from '../components/ImageUpload';
import { RichTextEditor } from '../components/RichTextEditor';
import type { Sermon, SermonCategory } from '../types';
import { cn, setDocMeta } from '../utils';

const categoryLabels: Record<SermonCategory, string> = {
  Sunday: 'Domingo',
  Wednesday: 'Miércoles',
  Special: 'Especial',
  Youth: 'Juventud',
  Devotional: 'Devocional',
};

const categories: SermonCategory[] = ['Sunday', 'Wednesday', 'Special', 'Youth', 'Devotional'];

const emptyForm = (): Omit<Sermon, 'id' | 'created_at'> => ({
  title: '',
  speaker: '',
  date: new Date().toISOString().split('T')[0],
  description: '',
  video_url: '',
  duration: '',
  category: 'Sunday',
  thumbnail: '',
  notes: '',
  series: '',
  author_id: '',
  author_name: '',
  published: true,
  published_at: undefined,
});

export function SermonsPage() {
  const { profile, canCreateContent, canEditContent } = useAuth();

  // Admins/pastors see all (including unpublished); others only see published
  const publishedOnly = !profile || (profile.role !== 'admin' && profile.role !== 'pastor');
  const { sermons, loading, addSermon, updateSermon, deleteSermon } = useSermons(publishedOnly);

  const [searchParams] = useSearchParams();
  const [filterCat, setFilterCat] = useState<string>('Todos');
  const [filterSeries, setFilterSeries] = useState<string>('');
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  // Auto-open modal when URL contains ?id=<uuid>
  const didAutoOpen = useRef(false);
  useEffect(() => {
    if (loading || didAutoOpen.current) return;
    const id = searchParams.get('id');
    if (!id) return;
    const target = sermons.find(s => s.id === id && s.published);
    if (!target) return;
    didAutoOpen.current = true;
    // Defer to satisfy react-hooks/set-state-in-effect: setState called in callback, not synchronously
    const timer = window.setTimeout(() => setSelectedSermon(target), 0);
    return () => window.clearTimeout(timer);
  }, [loading, sermons, searchParams]);

  // Close modal and clean URL param without triggering navigation
  const handleCloseModal = () => {
    setSelectedSermon(null);
    if (new URLSearchParams(window.location.search).has('id')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  useEffect(() => {
    if (!selectedSermon) return;
    const pageTitle = `${selectedSermon.title} | Prédicas | Iglesia Ebenezer M.I.`;
    document.title = pageTitle;
    setDocMeta('og:title', pageTitle, true);
    setDocMeta('og:url', `${window.location.origin}/sermons?id=${selectedSermon.id}`, true);
  }, [selectedSermon]);

  const allSeries = Array.from(new Set(sermons.map(s => s.series).filter(Boolean))) as string[];

  const filtered = sermons.filter(s => {
    const matchCat = filterCat === 'Todos' || s.category === filterCat;
    const matchSeries = !filterSeries || s.series === filterSeries;
    return matchCat && matchSeries;
  });

  const clearFilters = () => {
    setFilterCat('Todos');
    setFilterSeries('');
  };

  const openCreate = () => {
    setEditingSermon(null);
    setForm({ ...emptyForm(), author_id: profile!.id, author_name: profile!.display_name });
    setModalOpen(true);
  };

  const openEdit = (sermon: Sermon) => {
    setEditingSermon(sermon);
    setForm({
      title: sermon.title,
      speaker: sermon.speaker,
      date: sermon.date,
      description: sermon.description,
      video_url: sermon.video_url ?? '',
      duration: sermon.duration,
      category: sermon.category,
      thumbnail: sermon.thumbnail,
      notes: sermon.notes ?? '',
      series: sermon.series ?? '',
      author_id: sermon.author_id,
      author_name: sermon.author_name,
      published: sermon.published,
      published_at: sermon.published_at,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingSermon) {
        await updateSermon(editingSermon.id, form);
      } else {
        await addSermon(form);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta prédica?')) return;
    await deleteSermon(id);
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-paper">
      {/* Page header */}
      <section className="bg-paper border-b border-stone-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div aria-hidden="true" className="w-10 h-px bg-gold/60 mb-5" />
              <h1 className="font-serif text-4xl md:text-5xl font-semibold text-ink leading-tight">
                Prédicas
              </h1>
              <p className="text-stone-500 text-base mt-3">
                Revive los mensajes de esperanza y fe
              </p>
            </motion.div>
            {canCreateContent && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                onClick={openCreate}
                className="btn-primary text-sm self-start md:self-auto"
              >
                <Plus size={16} />
                Nueva Prédica
              </motion.button>
            )}
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="py-5 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-stone-600">
              <Filter size={16} />
              <span className="font-medium text-sm">Categoría:</span>
            </div>
            {['Todos', ...categories].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  filterCat === cat
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                )}
              >
                {cat === 'Todos' ? 'Todos' : categoryLabels[cat as SermonCategory]}
              </button>
            ))}
          </div>
          {allSeries.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium text-sm text-stone-600">Serie:</span>
              <button
                onClick={() => setFilterSeries('')}
                className={cn('px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                  !filterSeries ? 'bg-gold text-primary shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                )}>Todas</button>
              {allSeries.map(s => (
                <button key={s} onClick={() => setFilterSeries(s === filterSeries ? '' : s)}
                  className={cn('px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                    filterSeries === s ? 'bg-gold text-primary shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  )}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-16" role="status" aria-label="Cargando prédicas">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12">
              {filterCat === 'Todos' && !filterSeries ? (
                <EmptyState
                  icon={Play}
                  title="Todavía no hay prédicas"
                  description={canCreateContent
                    ? 'Sube la primera prédica con su video o audio para que la comunidad pueda revivir los mensajes.'
                    : 'Cuando el equipo de la iglesia publique prédicas, aparecerán aquí.'}
                  actionLabel={canCreateContent ? 'Agregar primera prédica' : undefined}
                  onAction={openCreate}
                />
              ) : (
                <EmptyState
                  icon={Play}
                  title="Sin resultados en este filtro"
                  description="No hay prédicas que coincidan con la categoría y serie seleccionadas."
                  secondaryLabel="Restablecer filtros"
                  onSecondary={clearFilters}
                />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((sermon, index) => (
                <motion.div
                  key={sermon.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.07 }}
                  className={cn(
                    'group bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col relative',
                    !sermon.published && 'ring-2 ring-stone-300'
                  )}
                >
                  {!sermon.published && (
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-stone-800/90 text-white text-[11px] px-2 py-1 rounded-full">
                      <EyeOff size={12} />
                      Borrador
                    </div>
                  )}
                  <div
                    className="relative aspect-video bg-stone-200 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedSermon(sermon)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Ver prédica: ${sermon.title}`}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedSermon(sermon);
                      }
                    }}
                  >
                    {sermon.thumbnail ? (
                      <img
                        src={sermon.thumbnail}
                        alt={sermon.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="w-full h-full bg-gradient-to-br from-primary-900 to-primary flex items-center justify-center"
                      >
                        <Play size={46} strokeWidth={1.6} className="text-white/85 ml-1" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Play size={24} className="text-primary ml-1" />
                      </div>
                    </div>
                    <span className="absolute top-3 right-3 bg-gold/90 text-[#241B0B] text-[11px] font-semibold px-2.5 py-1 rounded-full">
                      {categoryLabels[sermon.category]}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3
                      className="font-serif text-xl text-primary mb-2 line-clamp-2 cursor-pointer hover:text-gold transition-colors"
                      onClick={() => setSelectedSermon(sermon)}
                    >
                      {sermon.title}
                    </h3>
                    <p className="text-stone-500 text-sm mb-3 line-clamp-2">{sermon.description}</p>
                    <div className="flex items-center gap-3 text-sm text-stone-500">
                      <span className="flex items-center gap-1.5 min-w-0 truncate">
                        <User size={14} />
                        <span className="truncate">{sermon.speaker}</span>
                      </span>
                      {sermon.duration && (
                        <span className="flex items-center gap-1.5 shrink-0">
                          <Clock size={13} />
                          {sermon.duration}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-stone-400">
                      <Calendar size={13} />
                      {formatDate(sermon.date)}
                    </div>
                    {sermon.series && (
                      <div className="mt-2">
                        <span className="text-xs bg-gold/10 text-gold font-medium px-2 py-0.5 rounded-full">
                          <span aria-hidden="true">📚</span> {sermon.series}
                        </span>
                      </div>
                    )}
                    {sermon.published && (
                      <ShareActions
                        title={sermon.title}
                        description={
                          sermon.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)
                          || `${sermon.speaker} · ${formatDate(sermon.date)}`
                        }
                        url={`${window.location.origin}/sermons?id=${sermon.id}`}
                        className="mt-3"
                      />
                    )}
                    {canEditContent(sermon.author_id) && (
                      <div className="mt-4 flex items-center gap-2 pt-4 border-t border-stone-100">
                        <button
                          onClick={() => openEdit(sermon)}
                          className="flex items-center gap-1 text-xs text-stone-500 hover:text-primary px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                        >
                          <Edit2 size={14} />
                          Editar
                        </button>
                        <button
                          onClick={() => updateSermon(sermon.id, { published: !sermon.published })}
                          className="flex items-center gap-1 text-xs text-stone-500 hover:text-primary px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                        >
                          {sermon.published ? <EyeOff size={14} /> : <Eye size={14} />}
                          {sermon.published ? 'Ocultar' : 'Publicar'}
                        </button>
                        <button
                          onClick={() => handleDelete(sermon.id)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors ml-auto"
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal detalle */}
      <AnimatePresence>
        {selectedSermon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="aspect-video bg-stone-900 relative">
                {selectedSermon.video_url ? (
                  <iframe
                    src={selectedSermon.video_url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                    title={selectedSermon.title}
                  />
                ) : selectedSermon.thumbnail ? (
                  <>
                    <img
                      src={selectedSermon.thumbnail}
                      alt={selectedSermon.title}
                      className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
                        <Play size={40} className="text-primary ml-2" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    aria-hidden="true"
                    className="w-full h-full bg-gradient-to-br from-primary-900 to-primary flex items-center justify-center"
                  >
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
                      <Play size={40} className="text-primary ml-2" />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-8">
                <span className="text-gold text-sm font-medium">
                  {categoryLabels[selectedSermon.category]}
                </span>
                <h2 className="font-serif text-3xl text-primary mt-2 mb-4">{selectedSermon.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-stone-500 mb-6 text-sm">
                  <span className="flex items-center gap-1.5"><User size={14} />{selectedSermon.speaker}</span>
                  <span aria-hidden="true">•</span>
                  <span>{formatDate(selectedSermon.date)}</span>
                  {selectedSermon.duration && (
                    <>
                      <span aria-hidden="true">•</span>
                      <span className="flex items-center gap-1"><Clock size={14} />{selectedSermon.duration}</span>
                    </>
                  )}
                </div>
                <div
                  className="text-stone-600 leading-relaxed mb-6 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                  dangerouslySetInnerHTML={{ __html: selectedSermon.description }}
                />
                {selectedSermon.notes && (
                  <div className="bg-paper rounded-xl p-6 border-l-4 border-gold">
                    <h4 className="font-serif text-lg text-primary mb-2">Notas del Sermón</h4>
                    <p className="text-stone-600 italic">{selectedSermon.notes}</p>
                  </div>
                )}
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-400 font-medium uppercase tracking-wide">Compartir</span>
                  <ShareActions
                    title={selectedSermon.title}
                    description={`${selectedSermon.speaker} · ${formatDate(selectedSermon.date)}`}
                    url={`${window.location.origin}/sermons?id=${selectedSermon.id}`}
                  />
                </div>
                <button onClick={handleCloseModal} className="mt-4 btn-primary w-full">
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal crear/editar */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl text-primary">
                  {editingSermon ? 'Editar Prédica' : 'Nueva Prédica'}
                </h2>
                <button onClick={() => setModalOpen(false)} aria-label="Cerrar" className="p-2 hover:bg-stone-100 rounded-lg">
                  <X size={24} className="text-stone-500" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Título *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Predicador *</label>
                    <input
                      type="text"
                      value={form.speaker}
                      onChange={e => setForm({ ...form, speaker: e.target.value })}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Duración</label>
                    <input
                      type="text"
                      value={form.duration}
                      onChange={e => setForm({ ...form, duration: e.target.value })}
                      placeholder="45 min"
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Serie (opcional)</label>
                  <input
                    type="text"
                    value={form.series ?? ''}
                    onChange={e => setForm({ ...form, series: e.target.value })}
                    placeholder="Ej: La Fe que Transforma, Frutos del Espíritu..."
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
                    list="series-suggestions"
                  />
                  <datalist id="series-suggestions">
                    {allSeries.map(s => <option key={s} value={s} />)}
                  </datalist>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Fecha *</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={e => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Categoría *</label>
                    <div className="relative">
                      <select
                        value={form.category}
                        onChange={e => setForm({ ...form, category: e.target.value as SermonCategory })}
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold appearance-none bg-white"
                      >
                        {categories.map(c => (
                          <option key={c} value={c}>{categoryLabels[c]}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Descripción *</label>
                  <RichTextEditor
                    value={form.description}
                    onChange={v => setForm({ ...form, description: v })}
                    placeholder="Descripción de la prédica..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">URL del Video (YouTube)</label>
                  <input
                    type="url"
                    value={form.video_url}
                    onChange={e => setForm({ ...form, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>

                <ImageUpload
                  value={form.thumbnail}
                  onChange={v => setForm({ ...form, thumbnail: v })}
                  folder="sermons"
                  label="Miniatura"
                />

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Notas del Sermón</label>
                  <RichTextEditor
                    value={form.notes ?? ''}
                    onChange={v => setForm({ ...form, notes: v })}
                    placeholder="Notas adicionales (opcional)..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.published}
                        onChange={e => setForm({ ...form, published: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:ring-2 peer-focus:ring-gold rounded-full peer peer-checked:bg-primary transition-colors" />
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                    </label>
                    <span className="text-sm text-stone-600">
                      {form.published ? 'Publicado' : 'Borrador'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Publicar en fecha (opcional)</label>
                    <input
                      type="datetime-local"
                      value={form.published_at ? form.published_at.slice(0, 16) : ''}
                      onChange={e => setForm({ ...form, published_at: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-60">
                    {saving ? 'Guardando...' : (editingSermon ? 'Actualizar' : 'Publicar')}
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