import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { usePages } from '../hooks/usePages';
import { useSiteConfigContext } from '../contexts/SiteConfigContext';
import { cn } from '../utils';
import type { Page } from '../types';

export function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getBySlug } = usePages();
  const { config } = useSiteConfigContext();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const timer = window.setTimeout(() => setLoading(true), 0);
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
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="min-h-screen bg-paper">
      {/* Cover image — full bleed with gradient fade at bottom */}
      {page.cover_image && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}
          className="relative w-full h-72 sm:h-96 md:h-[480px] overflow-hidden"
        >
          <img
            src={page.cover_image}
            alt={page.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-paper" />
        </motion.div>
      )}

      {/* Page title */}
      <section className={page.cover_image ? '-mt-16 relative z-10 pb-10' : 'border-b border-stone-100 py-16 bg-paper'}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <p className={cn('eyebrow mb-4', page.cover_image ? 'text-primary/55' : 'text-gold')}>
              {config.branding.site_name}
            </p>
            <div aria-hidden="true" className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent w-24 mx-auto mb-5" />
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-ink mb-4 leading-tight text-balance">
              {page.title}
            </h1>
            {page.subtitle && (
              <p className="text-lg max-w-2xl mx-auto text-stone-600 leading-relaxed">
                {page.subtitle}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pt-4 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:gap-5 items-start">

            {/* Decorative sidebar — desktop only */}
            <aside aria-hidden="true" className="hidden md:flex flex-col items-center pt-12 shrink-0 w-4">
              <div className="w-1.5 h-1.5 rounded-full bg-gold/55 mb-2.5 shrink-0" />
              <div className="w-px h-48 bg-gradient-to-b from-gold/40 to-transparent" />
            </aside>

            {/* Article */}
            <motion.article
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
              className="relative bg-[#FDFCF9] rounded-2xl overflow-hidden flex-1
                border border-stone-200/60
                shadow-[0_4px_24px_rgba(34,26,20,0.07),0_1px_3px_rgba(34,26,20,0.05)]
                px-8 py-12 md:px-14 md:py-14"
            >
              {/* Gold hairline at the top of the card */}
              <div aria-hidden="true" className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/72 to-transparent" />

              <div
                className="prose prose-stone prose-base md:prose-lg max-w-none
                  prose-headings:font-serif prose-headings:font-bold
                  prose-h1:text-3xl prose-h1:text-ink prose-h1:mb-4
                  prose-h2:text-2xl prose-h2:text-primary prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-gold/20
                  prose-h3:text-[17px] prose-h3:text-stone-800 prose-h3:mt-7 prose-h3:mb-2
                  prose-p:text-stone-600 prose-p:leading-[1.85] prose-p:mb-5
                  prose-strong:text-stone-800 prose-strong:font-semibold
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-ul:pl-5 prose-ul:my-5 prose-ul:space-y-2
                  prose-ol:pl-5 prose-ol:my-5
                  prose-li:text-stone-600 prose-li:leading-relaxed
                  [&_ul>li]:marker:text-gold/80
                  prose-blockquote:not-italic prose-blockquote:border-l-2 prose-blockquote:border-gold prose-blockquote:pl-5 prose-blockquote:py-2 prose-blockquote:pr-4 prose-blockquote:text-stone-500 prose-blockquote:font-medium prose-blockquote:bg-gold/[0.04] prose-blockquote:rounded-r-lg
                  prose-hr:border-stone-100 prose-hr:my-10"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </motion.article>
          </div>

          <div className="mt-10 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-stone-400 hover:text-ink transition-colors duration-200 text-sm font-medium group">
              <ArrowLeft size={15} />
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
