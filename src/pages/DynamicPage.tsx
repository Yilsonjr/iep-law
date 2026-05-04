import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { usePages } from '../hooks/usePages';
import type { Page } from '../types';

export function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getBySlug } = usePages();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getBySlug(slug).then(data => {
      if (data) {
        setPage(data);
        // Meta title
        document.title = data.meta_title || data.title;
        // Meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.setAttribute('name', 'description');
          document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', data.meta_description || data.subtitle || '');
        // OG tags
        const ogTitle = document.querySelector('meta[property="og:title"]') || (() => {
          const el = document.createElement('meta');
          el.setAttribute('property', 'og:title');
          document.head.appendChild(el);
          return el;
        })();
        ogTitle.setAttribute('content', data.meta_title || data.title);
        if (data.og_image || data.cover_image) {
          const ogImg = document.querySelector('meta[property="og:image"]') || (() => {
            const el = document.createElement('meta');
            el.setAttribute('property', 'og:image');
            document.head.appendChild(el);
            return el;
          })();
          ogImg.setAttribute('content', (data.og_image || data.cover_image) ?? '');
        }
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-serif text-5xl text-primary mb-4">404</h1>
        <p className="text-stone-500 text-lg mb-8">Esta página no existe o no está disponible.</p>
        <Link to="/" className="btn-primary flex items-center gap-2">
          <ArrowLeft size={18} />
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      {page.cover_image ? (
        <section
          className="relative py-32 overflow-hidden"
          style={{ backgroundImage: `url(${page.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="font-serif text-5xl md:text-6xl font-bold mb-4"
            >
              {page.title}
            </motion.h1>
            {page.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-xl text-stone-200 max-w-2xl mx-auto"
              >
                {page.subtitle}
              </motion.p>
            )}
          </div>
        </section>
      ) : (
        <section className="bg-gradient-to-br from-primary to-primary-700 text-white py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="font-serif text-5xl md:text-6xl font-bold mb-4"
            >
              {page.title}
            </motion.h1>
            {page.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-xl text-stone-300 max-w-2xl mx-auto"
              >
                {page.subtitle}
              </motion.p>
            )}
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.article
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl shadow-md p-8 md:p-12"
          >
            <div
              className="prose prose-stone prose-lg max-w-none
                prose-headings:font-serif prose-headings:text-primary
                prose-a:text-gold prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-gold prose-blockquote:text-stone-600
                prose-strong:text-stone-800"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </motion.article>

          <div className="mt-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-primary transition-colors text-sm">
              <ArrowLeft size={16} />
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
