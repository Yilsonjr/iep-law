import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Edit2, Trash2, BookOpen } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ShareActions } from '../components/ShareActions';
import type { Post, PostCategory } from '../types';
import { cn, setDocMeta } from '../utils';

const categoryConfig: Record<PostCategory, { label: string; color: string; bg: string }> = {
  reflection:   { label: 'Reflexión Bíblica',    color: 'text-primary',    bg: 'bg-primary/10'  },
  testimony:    { label: 'Testimonio',            color: 'text-purple-700', bg: 'bg-purple-100'  },
  devotional:   { label: 'Devocional',            color: 'text-gold',       bg: 'bg-gold/10'     },
  announcement: { label: 'Anuncio',               color: 'text-green-700',  bg: 'bg-green-100'   },
  prayer:       { label: 'Petición de Oración',   color: 'text-blue-700',   bg: 'bg-blue-100'    },
};

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, canEditContent } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!post) return;
    const pageTitle = `${post.title} | Iglesia Ebenezer M.I.`;
    const excerpt = post.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
    const pageUrl = `${window.location.origin}/posts/${post.id}`;
    document.title = pageTitle;
    setDocMeta('description', excerpt);
    setDocMeta('og:title', pageTitle, true);
    setDocMeta('og:description', excerpt, true);
    setDocMeta('og:url', pageUrl, true);
    setDocMeta('og:type', 'article', true);
    if (post.image_url) setDocMeta('og:image', post.image_url, true);
    setDocMeta('twitter:title', pageTitle);
    setDocMeta('twitter:description', excerpt);
    if (post.image_url) setDocMeta('twitter:image', post.image_url);
  }, [post]);

  // Los borradores/pendientes solo son visibles para su autor o un admin/pastor
  useEffect(() => {
    if (!id) return;
    supabase.from('posts').select('*').eq('id', id).maybeSingle().then(({ data }) => {
      const row = data as Post | null;
      if (!row) {
        setNotFound(true);
      } else if (!row.published && !canEditContent(row.author_id)) {
        setNotFound(true);
      } else {
        setPost(row);
      }
      setLoading(false);
    });
  }, [id, profile, canEditContent]);

  const handleDelete = async () => {
    if (!post || !confirm('¿Eliminar esta publicación?')) return;
    await supabase.from('posts').delete().eq('id', post.id);
    navigate('/posts');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center" role="status" aria-label="Cargando publicación">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center gap-4 text-stone-500 py-20 text-center">
        <BookOpen size={44} className="text-stone-300" aria-hidden="true" />
        <p className="text-lg font-medium">Publicación no encontrada</p>
        <p className="text-sm text-stone-400">Es posible que el enlace no exista o que la publicación aún no esté aprobada.</p>
        <Link to="/posts" className="btn-primary text-sm">Volver a Comunidad</Link>
      </div>
    );
  }

  const cat = categoryConfig[post.category];
  const initials = post.author_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const canEdit = canEditContent(post.author_id);

  return (
    <div className="min-h-screen bg-paper">
      {/* Imagen de portada hero */}
      {post.image_url && (
        <div className="w-full h-72 md:h-[420px] overflow-hidden">
          <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Navegación */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <Link
            to="/posts"
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Volver a Comunidad
          </Link>
        </motion.div>

        {/* Contenido */}
        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {/* Categoría */}
          <span className={cn('inline-block text-xs font-semibold px-3 py-1 rounded-full mb-5', cat.bg, cat.color)}>
            {cat.label}
          </span>

          {/* Título */}
<h1 className="font-serif text-4xl md:text-5xl text-primary font-semibold leading-tight mb-6">
          {post.title}
        </h1>

          {/* Meta */}
          <div className="flex items-center gap-3 text-stone-500 text-sm mb-8 pb-8 border-b border-stone-200">
            <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div>
              <p className="font-medium text-stone-700">{post.author_name}</p>
              <p className="flex items-center gap-1 text-xs text-stone-400">
                <Clock size={12} />
                {new Date(post.created_at).toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>

            {canEdit && (
              <div className="ml-auto flex items-center gap-2">
                <Link
                  to={`/posts?edit=${post.id}`}
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-primary px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <Edit2 size={13} /> Editar
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} /> Eliminar
                </button>
              </div>
            )}
          </div>

          {/* Cuerpo del post */}
          <div
            className="prose prose-lg prose-stone max-w-none
              prose-headings:font-serif prose-headings:text-primary
              prose-a:text-primary prose-a:underline
              prose-blockquote:border-l-4 prose-blockquote:border-gold
              prose-blockquote:bg-gold/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl
              prose-img:rounded-2xl leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Footer del post */}
          <div className="mt-12 pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <ShareActions
              title={post.title}
              description={post.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) || undefined}
              url={`${window.location.origin}/posts/${id}`}
            />
            <Link
              to="/posts"
              className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-primary transition-colors ml-auto"
            >
              <ArrowLeft size={16} />
              Ver más publicaciones
            </Link>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
