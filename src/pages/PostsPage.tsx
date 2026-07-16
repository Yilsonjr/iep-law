import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Plus, X, Edit2, Trash2, Check,
  Filter, ChevronDown, CheckCircle, AlertCircle,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../contexts/AuthContext';
import { ImageUpload } from '../components/ImageUpload';
import { RichTextEditor } from '../components/RichTextEditor';
import type { Post, PostCategory } from '../types';
import { cn } from '../utils';

const categoryConfig: Record<PostCategory, { label: string; color: string; bg: string }> = {
  reflection: { label: 'Reflexión Bíblica', color: 'text-primary', bg: 'bg-primary/10' },
  testimony:  { label: 'Testimonio',        color: 'text-purple-700', bg: 'bg-purple-100' },
  devotional: { label: 'Devocional',        color: 'text-gold',       bg: 'bg-gold/10'   },
  announcement:{ label: 'Anuncio',          color: 'text-green-700',  bg: 'bg-green-100' },
  prayer:     { label: 'Petición de Oración', color: 'text-blue-700', bg: 'bg-blue-100'  },
};

const emptyForm = (): Omit<Post, 'id' | 'created_at' | 'updated_at'> => ({
  title: '',
  content: '',
  category: 'reflection',
  author_id: '',
  author_name: '',
  published: false,
  image_url: '',
  published_at: undefined,
});

export function PostsPage() {
  const navigate = useNavigate();
  const { profile, user, canCreateContent, canEditAnyContent, canEditContent } = useAuth();

  // Líderes/pastores ven todos los posts (incluyendo pendientes)
  const showAll = !!(profile && (profile.role === 'admin' || profile.role === 'pastor' || profile.role === 'leader'));
  const { posts, loading, addPost, updatePost, deletePost, approvePost } = usePosts(showAll);

  const [filterCat, setFilterCat] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    return () => { setToast(null); };
  }, []);

  // Los miembros también pueden crear posts (quedan pendientes)
  const canPost = !!user;

  const filtered = filterCat === 'all'
    ? posts
    : posts.filter(p => p.category === filterCat);

  // Separar pendientes de publicados
  const pending  = filtered.filter(p => !p.published);
  const published = filtered.filter(p => p.published);

  const openCreate = () => {
    setEditingPost(null);
    setForm({
      ...emptyForm(),
      author_id: profile!.id,
      author_name: profile!.display_name,
      // Líderes+ publican directo; miembros quedan en revisión
      published: canCreateContent,
    });
    setModalOpen(true);
  };

  const openEdit = (post: Post) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      content: post.content,
      category: post.category,
      author_id: post.author_id,
      author_name: post.author_name,
      published: post.published,
      image_url: post.image_url ?? '',
      published_at: post.published_at,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPost) {
        await updatePost(editingPost.id, form);
        setModalOpen(false);
        showToast('¡Publicación actualizada exitosamente!');
      } else {
        const created = await addPost(form);
        setModalOpen(false);
        showToast(form.published ? '¡Publicación creada y publicada!' : '¡Enviada para revisión por un líder!');
        if (form.published) navigate(`/posts/${created.id}`);
      }
    } catch {
      showToast('Error al guardar. Intenta nuevamente.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este post?')) return;
    await deletePost(id);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Page header */}
      <section className="bg-[#F8F5F0] border-b border-stone-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-8 h-0.5 bg-gold mb-4" />
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1A1014] mb-2">
                Comunidad
              </h1>
              <p className="text-stone-500 text-base">
                Reflexiones bíblicas, testimonios y devocionales de nuestra comunidad
              </p>
            </motion.div>
            {canPost && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                onClick={openCreate}
                className="flex items-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-sm self-start md:self-auto text-sm"
              >
                <Plus size={18} />
                Publicar
              </motion.button>
            )}
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-stone-600">
              <Filter size={18} />
              <span className="font-medium text-sm">Filtrar:</span>
            </div>
            <button
              onClick={() => setFilterCat('all')}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                filterCat === 'all' ? 'bg-primary text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              )}
            >
              Todos
            </button>
            {(Object.entries(categoryConfig) as [PostCategory, typeof categoryConfig[PostCategory]][]).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setFilterCat(key)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  filterCat === key ? 'bg-primary text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Posts pendientes de aprobación */}
          {showAll && pending.length > 0 && (
            <div className="mb-12">
              <h2 className="font-serif text-2xl text-stone-700 mb-6 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                Pendientes de aprobación ({pending.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pending.map((post, i) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    index={i}
                    onEdit={() => openEdit(post)}
                    onDelete={() => handleDelete(post.id)}
                    onApprove={() => approvePost(post.id)}
                    canEdit={canEditContent(post.author_id)}
                    canApprove={canCreateContent}
                    showPending
                  />
                ))}
              </div>
            </div>
          )}

          {/* Posts publicados */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
            </div>
          ) : published.length === 0 ? (
            <div className="text-center py-24 text-stone-400">
              <BookOpen size={56} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg mb-2">No hay publicaciones aún</p>
              {canPost && (
                <button onClick={openCreate} className="mt-4 btn-primary">
                  Sé el primero en publicar
                </button>
              )}
              {!user && (
                <p className="text-sm mt-2">
                  <a href="/login" className="text-primary hover:underline">Inicia sesión</a> para compartir una reflexión
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {published.map((post, i) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={i}
                  onEdit={() => openEdit(post)}
                  onDelete={() => handleDelete(post.id)}
                  canEdit={canEditContent(post.author_id)}
                  canApprove={false}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-60 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-medium ${
              toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {toast.type === 'success'
              ? <CheckCircle size={18} />
              : <AlertCircle size={18} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal crear/editar */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl text-primary">
                  {editingPost ? 'Editar Publicación' : 'Nueva Publicación'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-lg">
                  <X size={24} className="text-stone-500" />
                </button>
              </div>

              {!canCreateContent && !editingPost && (
                <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm">
                  Tu publicación quedará <strong>pendiente de aprobación</strong> hasta que un líder o pastor la revise.
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Título *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Ej: La paz que sobrepasa todo entendimiento"
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Categoría *</label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value as PostCategory })}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold appearance-none bg-white"
                    >
                      {(Object.entries(categoryConfig) as [PostCategory, typeof categoryConfig[PostCategory]][]).map(([key, cat]) => (
                        <option key={key} value={key}>{cat.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Contenido *</label>
                  <RichTextEditor
                    value={form.content}
                    onChange={v => setForm({ ...form, content: v })}
                    placeholder="Escribe tu reflexión, testimonio o devocional aquí..."
                  />
                </div>

                <ImageUpload
                  value={form.image_url ?? ''}
                  onChange={v => setForm({ ...form, image_url: v })}
                  folder="posts"
                  label="Imagen de portada (opcional)"
                />

                {canEditAnyContent && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.published}
                          onChange={e => setForm({ ...form, published: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-stone-200 rounded-full peer peer-checked:bg-primary transition-colors" />
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                      </label>
                      <span className="text-sm text-stone-600">
                        {form.published ? 'Publicado' : 'Borrador / Pendiente'}
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
                )}

                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-60">
                    {saving ? 'Guardando...' : (editingPost ? 'Actualizar' : 'Publicar')}
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

interface PostCardProps {
  post: Post;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onApprove?: () => void;
  canEdit: boolean;
  canApprove: boolean;
  showPending?: boolean;
}

function PostCard({ post, index, onEdit, onDelete, onApprove, canEdit, canApprove, showPending }: PostCardProps) {
  const cat = categoryConfig[post.category];
  const initials = post.author_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className={cn(
        'bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col',
        showPending && 'ring-2 ring-amber-300'
      )}
    >
      {post.image_url && (
        <Link to={`/posts/${post.id}`} className="aspect-video overflow-hidden block">
          <img src={post.image_url} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </Link>
      )}

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className={cn('text-xs font-semibold px-3 py-1 rounded-full', cat.bg, cat.color)}>
            {cat.label}
          </span>
          {showPending && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
              Pendiente
            </span>
          )}
        </div>

        <Link to={`/posts/${post.id}`} className="font-serif text-xl text-primary mb-3 line-clamp-2 hover:text-gold transition-colors">
          {post.title}
        </Link>

        <p className="text-stone-500 text-sm leading-relaxed line-clamp-3 flex-1 mb-4">
          {post.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}
        </p>

        <div className="flex items-center gap-2 text-sm text-stone-400 mb-4">
          <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-semibold">
            {initials}
          </div>
          <span>{post.author_name}</span>
          <span>•</span>
          <span>{new Date(post.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
          <Link
            to={`/posts/${post.id}`}
            className="flex-1 text-sm text-center text-primary font-medium py-2 rounded-lg hover:bg-primary/5 transition-colors"
          >
            Leer más
          </Link>
          {canApprove && onApprove && (
            <button
              onClick={onApprove}
              className="flex items-center gap-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-2 rounded-lg transition-colors font-medium"
            >
              <Check size={14} />
              Aprobar
            </button>
          )}
          {canEdit && (
            <>
              <button onClick={onEdit} className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
                <Edit2 size={15} className="text-stone-500" />
              </button>
              <button onClick={onDelete} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={15} className="text-red-500" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
