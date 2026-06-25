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
      {/* Cover image — full width banner, no text on top */}
      {page.cover_image && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
          className="w-full h-64 sm:h-80 md:h-[420px] overflow-hidden"
        >
          <img
            src={page.cover_image}
            alt={page.title}
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
      )}

      {/* Page title section — always below the image */}
      <section className={page.cover_image ? 'bg-white border-b border-stone-100 py-10' : 'bg-linear-to-br from-primary to-primary/80 text-white py-20'}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className={`font-serif text-4xl md:text-5xl font-bold mb-3 ${page.cover_image ? 'text-primary' : 'text-white'}`}
          >
            {page.title}
          </motion.h1>
          {page.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className={`text-lg max-w-2xl mx-auto ${page.cover_image ? 'text-stone-500' : 'text-white/80'}`}
            >
              {page.subtitle}
            </motion.p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.article
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md p-8 md:p-12"
          >
            <div
              className="prose prose-stone prose-lg max-w-none
                prose-headings:font-serif prose-headings:text-primary prose-headings:font-semibold
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2
                prose-p:text-stone-700 prose-p:leading-relaxed prose-p:mb-4
                prose-strong:text-stone-800 prose-strong:font-semibold
                prose-a:text-gold prose-a:no-underline hover:prose-a:underline
                prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
                prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4
                prose-li:my-1 prose-li:text-stone-700
                prose-blockquote:border-l-4 prose-blockquote:border-gold prose-blockquote:pl-4 prose-blockquote:text-stone-600 prose-blockquote:italic
                prose-hr:border-stone-200 prose-hr:my-8"
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
