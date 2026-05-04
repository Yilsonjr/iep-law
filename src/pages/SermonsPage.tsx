import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, Filter, Plus, Edit2, Trash2, X, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useSermons } from '../hooks/useSermons';
import { useAuth } from '../contexts/AuthContext';
import { ImageUpload } from '../components/ImageUpload';
import { RichTextEditor } from '../components/RichTextEditor';
import type { Sermon, SermonCategory } from '../types';
import { cn } from '../utils';

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
  const { sermons, addSermon, updateSermon, deleteSermon } = useSermons(publishedOnly);

  const [filterCat, setFilterCat] = useState<string>('Todos');
  const [filterSeries, setFilterSeries] = useState<string>('');
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const allSeries = Array.from(new Set(sermons.map(s => s.series).filter(Boolean))) as string[];

  const filtered = sermons.filter(s => {
    const matchCat = filterCat === 'Todos' || s.category === filterCat;
    const matchSeries = !filterSeries || s.series === filterSeries;
    return matchCat && matchSeries;
  });

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

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-center md:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-serif text-4xl md:text-5xl font-bold mb-4"
              >
                Galería de Prédicas
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-stone-300 text-lg"
              >
                Revive los mensajes de esperanza y fe
              </motion.p>
            </div>
            {canCreateContent && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={openCreate}
                className="flex items-center gap-2 bg-gold text-primary font-semibold px-6 py-3 rounded-xl hover:bg-gold/90 transition-colors shadow-lg self-start md:self-auto"
              >
                <Plus size={20} />
                Nueva Prédica
              </motion.button>
            )}
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-stone-600">
              <Filter size={18} />
              <span className="font-medium text-sm">Categoría:</span>
            </div>
            {['Todos', ...categories].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  filterCat === cat
                    ? 'bg-primary text-white shadow-md'
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
                  !filterSeries ? 'bg-gold text-primary shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                )}>Todas</button>
              {allSeries.map(s => (
                <button key={s} onClick={() => setFilterSeries(s === filterSeries ? '' : s)}
                  className={cn('px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                    filterSeries === s ? 'bg-gold text-primary shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  )}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <Play size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">No hay prédicas disponibles</p>
              {canCreateContent && (
                <button onClick={openCreate} className="mt-4 btn-primary">
                  Agregar primera prédica
                </button>
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
                  className={cn('card group relative', !sermon.published && 'opacity-75 ring-2 ring-stone-300')}
                >
                  {!sermon.published && (
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-stone-700 text-white text-xs px-2 py-1 rounded-full">
                      <EyeOff size={12} />
                      Borrador
                    </div>
                  )}
                  <div
                    className="relative aspect-video bg-stone-200 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedSermon(sermon)}
                  >
                    <img
                      src={sermon.thumbnail || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=400'}
                      alt={sermon.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Play size={24} className="text-primary ml-1" />
                      </div>
                    </div>
                    <span className="absolute top-4 right-4 bg-gold text-primary text-xs font-bold px-3 py-1 rounded-full">
                      {categoryLabels[sermon.category]}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3
                      className="font-serif text-xl text-primary mb-2 line-clamp-2 cursor-pointer hover:text-gold transition-colors"
                      onClick={() => setSelectedSermon(sermon)}
                    >
                      {sermon.title}
                    </h3>
                    <p className="text-stone-500 text-sm mb-4 line-clamp-2">{sermon.description}</p>
                    <div className="flex items-center justify-between text-sm text-stone-500">
                      <span>{sermon.speaker}</span>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {sermon.duration}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-stone-400">
                      {new Date(sermon.date).toLocaleDateString('es-ES', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </div>
                    {sermon.series && (
                      <div className="mt-2">
                        <span className="text-xs bg-gold/10 text-gold font-medium px-2 py-0.5 rounded-full">
                          📚 {sermon.series}
                        </span>
                      </div>
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
            onClick={() => setSelectedSermon(null)}
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
                ) : (
                  <>
                    <img
                      src={selectedSermon.thumbnail || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=400'}
                      alt={selectedSermon.title}
                      className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
                        <Play size={40} className="text-primary ml-2" />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="p-8">
                <span className="text-gold text-sm font-medium">
                  {categoryLabels[selectedSermon.category]}
                </span>
                <h2 className="font-serif text-3xl text-primary mt-2 mb-4">{selectedSermon.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-stone-500 mb-6 text-sm">
                  <span>{selectedSermon.speaker}</span>
                  <span>•</span>
                  <span>{new Date(selectedSermon.date).toLocaleDateString('es-ES')}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock size={14} />{selectedSermon.duration}</span>
                </div>
                <p className="text-stone-600 leading-relaxed mb-6">{selectedSermon.description}</p>
                {selectedSermon.notes && (
                  <div className="bg-stone-50 rounded-xl p-6 border-l-4 border-gold">
                    <h4 className="font-serif text-lg text-primary mb-2">Notas del Sermón</h4>
                    <p className="text-stone-600 italic">{selectedSermon.notes}</p>
                  </div>
                )}
                <button onClick={() => setSelectedSermon(null)} className="mt-6 btn-primary w-full">
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
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-lg">
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
