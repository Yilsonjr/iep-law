import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, Quote, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { HeroSection } from '../components/HeroSection';
import { useSiteConfigContext } from '../contexts/SiteConfigContext';
import { useContactMessages } from '../hooks/useContactMessages';
import type { HomeBlock } from '../types';
import { cn } from '../utils';

interface HomePageProps {
  onContact: () => void;
}

// ── Background helpers ─────────────────────────────────────────
function sectionBgClass(bg: HomeBlock['bg']) {
  return ({
    white: 'bg-white',
    light: 'bg-stone-100',
    primary: 'bg-primary text-white',
    gradient: 'bg-gradient-to-br from-primary to-primary/80 text-white',
    custom: '',
  } as Record<string, string>)[bg] ?? 'bg-white';
}

const isDarkBg = (bg: HomeBlock['bg']) => bg === 'primary' || bg === 'gradient';

// Returns inline style overrides per block (empty string = no override)
function bc(block: HomeBlock) {
  return {
    section: block.color_bg ? { backgroundColor: block.color_bg } : undefined,
    heading: block.color_heading ? { color: block.color_heading } : undefined,
    text: block.color_text ? { color: block.color_text } : undefined,
  };
}

// ── Individual block renderers ─────────────────────────────────
function CardsBlock({ block }: { block: HomeBlock }) {
  const dark = isDarkBg(block.bg);
  const cols = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-2 lg:grid-cols-4' };
  const s = bc(block);
  return (
    <section className={cn('py-20', !block.color_bg && sectionBgClass(block.bg))} style={s.section}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(block.title || block.subtitle) && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            {block.title && (
              <h2
                className={cn('font-serif text-4xl font-bold mb-3', !block.color_heading && (dark ? 'text-white' : 'text-primary'))}
                style={s.heading}>
                {block.title}
              </h2>
            )}
            <div className="w-16 h-0.5 bg-gold mx-auto my-4" />
            {block.subtitle && (
              <p
                className={cn('text-lg max-w-3xl mx-auto leading-relaxed', !block.color_text && (dark ? 'text-stone-200' : 'text-stone-600'))}
                style={s.text}>
                {block.subtitle}
              </p>
            )}
          </motion.div>
        )}
        <div className={cn('grid grid-cols-1 gap-8', cols[block.card_cols])}>
          {block.cards.map((card, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={cn('rounded-2xl p-8 text-center shadow-md', dark ? 'bg-white/10 backdrop-blur-sm' : 'bg-white')}>
              <div className={cn('w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6', dark ? 'bg-white/20' : 'bg-primary/10')}>
                <span className="text-3xl">{card.emoji}</span>
              </div>
              <h3
                className={cn('font-serif text-xl mb-3', !block.color_heading && (dark ? 'text-white' : 'text-primary'))}
                style={s.heading}>
                {card.title}
              </h3>
              <p
                className={!block.color_text ? (dark ? 'text-stone-200' : 'text-stone-600') : ''}
                style={s.text}>
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ColumnsBlock({ block, onContact }: { block: HomeBlock; onContact: () => void }) {
  const dark = isDarkBg(block.bg);
  const colClass = block.col_items.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3';
  const s = bc(block);
  return (
    <section className={cn('py-20', !block.color_bg && sectionBgClass(block.bg))} style={s.section}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(block.title || block.subtitle) && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            {block.title && (
              <h2 className={cn('font-serif text-4xl font-bold mb-3', !block.color_heading && (dark ? 'text-white' : 'text-primary'))} style={s.heading}>
                {block.title}
              </h2>
            )}
            <div className="w-16 h-0.5 bg-gold mx-auto my-4" />
            {block.subtitle && (
              <p className={cn('text-lg max-w-3xl mx-auto leading-relaxed', !block.color_text && (dark ? 'text-stone-200' : 'text-stone-600'))} style={s.text}>
                {block.subtitle}
              </p>
            )}
          </motion.div>
        )}
        <div className={cn('grid grid-cols-1 gap-10 items-center', colClass)}>
          {block.col_items.map((col, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              {col.image_url && (
                <div className="mb-6 rounded-2xl overflow-hidden shadow-lg aspect-video">
                  <img src={col.image_url} alt={col.title} className="w-full h-full object-cover" />
                </div>
              )}
              {col.title && (
                <h3 className={cn('font-serif text-2xl mb-4', !block.color_heading && (dark ? 'text-white' : 'text-stone-800'))} style={s.heading}>
                  {col.title}
                </h3>
              )}
              {col.body && (
                <div className={cn('prose prose-lg max-w-none mb-6', dark ? 'prose-invert' : 'prose-stone')}
                  dangerouslySetInnerHTML={{ __html: col.body }} />
              )}
              {col.btn_label && (
                col.btn_href === '#contact' ? (
                  <button onClick={onContact} className={dark ? 'btn-secondary' : 'btn-primary'}>{col.btn_label}</button>
                ) : (
                  <Link to={col.btn_href} className={dark ? 'btn-secondary' : 'btn-primary'}>{col.btn_label}</Link>
                )
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBannerBlock({ block, onContact }: { block: HomeBlock; onContact: () => void }) {
  const dark = isDarkBg(block.bg);
  const s = bc(block);
  return (
    <section className={cn('py-20', !block.color_bg && sectionBgClass(block.bg))} style={s.section}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          {block.title && (
            <h2 className={cn('font-serif text-4xl md:text-5xl font-bold mb-4', !block.color_heading && (dark ? 'text-white' : 'text-primary'))} style={s.heading}>
              {block.title}
            </h2>
          )}
          {block.subtitle && (
            <p className={cn('text-lg mb-8 max-w-2xl mx-auto leading-relaxed', !block.color_text && (dark ? 'text-stone-300' : 'text-stone-600'))} style={s.text}>
              {block.subtitle}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {block.cta_btn1_label && (
              block.cta_btn1_href === '#contact' ? (
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={onContact} className={dark ? 'btn-secondary' : 'btn-primary'}>
                  {block.cta_btn1_label}
                </motion.button>
              ) : (
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link to={block.cta_btn1_href} className={dark ? 'btn-secondary' : 'btn-primary'}>{block.cta_btn1_label}</Link>
                </motion.div>
              )
            )}
            {block.cta_btn2_label && (
              block.cta_btn2_href === '#contact' ? (
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={onContact} className={dark ? 'btn-primary' : 'btn-secondary'}>
                  {block.cta_btn2_label}
                </motion.button>
              ) : (
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link to={block.cta_btn2_href} className={dark ? 'btn-primary' : 'btn-secondary'}>{block.cta_btn2_label}</Link>
                </motion.div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatsBlock({ block }: { block: HomeBlock }) {
  const dark = isDarkBg(block.bg);
  const s = bc(block);
  return (
    <section className={cn('py-20', !block.color_bg && sectionBgClass(block.bg))} style={s.section}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(block.title || block.subtitle) && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            {block.title && (
              <h2 className={cn('font-serif text-4xl font-bold mb-3', !block.color_heading && (dark ? 'text-white' : 'text-primary'))} style={s.heading}>
                {block.title}
              </h2>
            )}
            <div className="w-16 h-0.5 bg-gold mx-auto my-4" />
          </motion.div>
        )}
        <div className={cn('grid grid-cols-2 gap-8', block.stats.length >= 4 ? 'md:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3')}>
          {block.stats.map((stat, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center">
              {stat.emoji && <span className="text-4xl block mb-3">{stat.emoji}</span>}
              <p className={cn('text-4xl font-bold font-serif mb-1', !block.color_heading && (dark ? 'text-gold' : 'text-primary'))} style={s.heading}>
                {stat.value}
              </p>
              <p className={!block.color_text ? (dark ? 'text-stone-300' : 'text-stone-500') : ''} style={s.text}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RichTextBlock({ block }: { block: HomeBlock }) {
  const dark = isDarkBg(block.bg);
  const s = bc(block);
  return (
    <section className={cn('py-20', !block.color_bg && sectionBgClass(block.bg))} style={s.section}>
      <div className={cn('max-w-4xl mx-auto px-4 sm:px-6 lg:px-8', block.text_align === 'center' && 'text-center')}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          {block.title && (
            <>
              <h2 className={cn('font-serif text-4xl font-bold mb-3', !block.color_heading && (dark ? 'text-white' : 'text-primary'))} style={s.heading}>
                {block.title}
              </h2>
              <div className={cn('w-16 h-0.5 bg-gold my-4', block.text_align === 'center' ? 'mx-auto' : '')} />
            </>
          )}
          {block.html && (
            <div className={cn('prose prose-lg max-w-none', dark ? 'prose-invert' : 'prose-stone')}
              dangerouslySetInnerHTML={{ __html: block.html }} />
          )}
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialsBlock({ block }: { block: HomeBlock }) {
  const dark = isDarkBg(block.bg);
  const s = bc(block);
  const items = block.testimonials;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setIndex(i => (i + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;
  const t = items[index % items.length];

  return (
    <section className={cn('py-20', !block.color_bg && sectionBgClass(block.bg))} style={s.section}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {(block.title || block.subtitle) && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            {block.title && (
              <h2 className={cn('font-serif text-4xl font-bold mb-3', !block.color_heading && (dark ? 'text-white' : 'text-primary'))} style={s.heading}>
                {block.title}
              </h2>
            )}
            <div className="w-16 h-0.5 bg-gold mx-auto my-4" />
            {block.subtitle && (
              <p className={cn('text-lg max-w-3xl mx-auto leading-relaxed', !block.color_text && (dark ? 'text-stone-200' : 'text-stone-600'))} style={s.text}>
                {block.subtitle}
              </p>
            )}
          </motion.div>
        )}

        <div className="relative text-center min-h-[220px] flex flex-col items-center justify-center">
          <Quote size={36} className={cn('mx-auto mb-4', dark ? 'text-white/30' : 'text-primary/20')} />
          <AnimatePresence mode="wait">
            <motion.div key={index}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }}>
              <p className={cn('text-xl md:text-2xl font-serif italic leading-relaxed mb-6', !block.color_text && (dark ? 'text-white' : 'text-stone-700'))} style={s.text}>
                "{t.quote}"
              </p>
              <div className="flex items-center justify-center gap-3">
                {t.avatar_url && (
                  <img src={t.avatar_url} alt={t.author} className="w-12 h-12 rounded-full object-cover border-2 border-gold" />
                )}
                <div className="text-left">
                  {t.author && (
                    <p className={cn('font-semibold', !block.color_heading && (dark ? 'text-white' : 'text-primary'))} style={s.heading}>{t.author}</p>
                  )}
                  {t.role && (
                    <p className={cn('text-sm', !block.color_text && (dark ? 'text-stone-300' : 'text-stone-500'))} style={s.text}>{t.role}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {items.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {items.map((_, i) => (
                <button key={i} onClick={() => setIndex(i)}
                  aria-label={`Testimonio ${i + 1}`}
                  className={cn('w-2.5 h-2.5 rounded-full transition-all', i === index ? 'bg-gold w-6' : (dark ? 'bg-white/30' : 'bg-stone-300'))} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function GalleryBlock({ block }: { block: HomeBlock }) {
  const dark = isDarkBg(block.bg);
  const s = bc(block);
  const cols = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 md:grid-cols-3', 4: 'sm:grid-cols-2 md:grid-cols-4' };
  const [lightbox, setLightbox] = useState<number | null>(null);
  const items = block.gallery;

  if (items.length === 0) return null;

  return (
    <section className={cn('py-20', !block.color_bg && sectionBgClass(block.bg))} style={s.section}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(block.title || block.subtitle) && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            {block.title && (
              <h2 className={cn('font-serif text-4xl font-bold mb-3', !block.color_heading && (dark ? 'text-white' : 'text-primary'))} style={s.heading}>
                {block.title}
              </h2>
            )}
            <div className="w-16 h-0.5 bg-gold mx-auto my-4" />
            {block.subtitle && (
              <p className={cn('text-lg max-w-3xl mx-auto leading-relaxed', !block.color_text && (dark ? 'text-stone-200' : 'text-stone-600'))} style={s.text}>
                {block.subtitle}
              </p>
            )}
          </motion.div>
        )}

        <div className={cn('grid grid-cols-1 gap-4', cols[block.card_cols])}>
          {items.map((item, i) => (
            <motion.button key={i} type="button" onClick={() => setLightbox(i)}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="relative group rounded-2xl overflow-hidden shadow-md aspect-square">
              <img src={item.image_url} alt={item.caption || ''} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              {item.caption && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end opacity-0 group-hover:opacity-100">
                  <p className="text-white text-sm p-3 text-left">{item.caption}</p>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 bg-black/90 z-100 flex items-center justify-center p-4 cursor-zoom-out">
            <button onClick={() => setLightbox(null)} className="absolute top-5 right-5 text-white/70 hover:text-white">
              <X size={28} />
            </button>
            {lightbox > 0 && (
              <button onClick={e => { e.stopPropagation(); setLightbox(l => (l ?? 0) - 1); }}
                className="absolute left-4 text-white/70 hover:text-white">
                <ChevronLeft size={32} />
              </button>
            )}
            {lightbox < items.length - 1 && (
              <button onClick={e => { e.stopPropagation(); setLightbox(l => (l ?? 0) + 1); }}
                className="absolute right-4 text-white/70 hover:text-white">
                <ChevronRight size={32} />
              </button>
            )}
            <motion.div onClick={e => e.stopPropagation()} initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="max-w-4xl max-h-[85vh]">
              <img src={items[lightbox].image_url} alt={items[lightbox].caption || ''} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
              {items[lightbox].caption && (
                <p className="text-white/80 text-center mt-3 text-sm">{items[lightbox].caption}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ContactFormBlock({ block }: { block: HomeBlock }) {
  const dark = isDarkBg(block.bg);
  const s = bc(block);
  const { sendMessage } = useContactMessages();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await sendMessage(form);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setError('No se pudo enviar. Intenta nuevamente.');
    } finally {
      setSending(false);
    }
  };

  const inputClass = cn(
    'w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-gold transition-colors',
    dark ? 'bg-white/10 border-white/20 text-white placeholder:text-white/50' : 'bg-white border-stone-200 text-stone-800 placeholder:text-stone-400'
  );

  return (
    <section className={cn('py-20', !block.color_bg && sectionBgClass(block.bg))} style={s.section}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          {(block.title || block.subtitle) && (
            <div className="text-center mb-10">
              {block.title && (
                <h2 className={cn('font-serif text-4xl font-bold mb-3', !block.color_heading && (dark ? 'text-white' : 'text-primary'))} style={s.heading}>
                  {block.title}
                </h2>
              )}
              <div className="w-16 h-0.5 bg-gold mx-auto my-4" />
              {block.subtitle && (
                <p className={cn('text-lg leading-relaxed', !block.color_text && (dark ? 'text-stone-200' : 'text-stone-600'))} style={s.text}>
                  {block.subtitle}
                </p>
              )}
            </div>
          )}

          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className={cn('rounded-2xl p-10 text-center', dark ? 'bg-white/10' : 'bg-white shadow-md')}>
              <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
              <h3 className={cn('font-serif text-2xl mb-2', dark ? 'text-white' : 'text-primary')}>¡Mensaje enviado!</h3>
              <p className={dark ? 'text-stone-200' : 'text-stone-600'}>Nos pondremos en contacto contigo pronto.</p>
              <button onClick={() => setSent(false)} className="mt-6 btn-secondary text-sm">Enviar otro mensaje</button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className={cn('rounded-2xl p-8 space-y-5', dark ? 'bg-white/10 backdrop-blur-sm' : 'bg-white shadow-md')}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={cn('block text-xs font-medium mb-1.5', dark ? 'text-white/70' : 'text-stone-500')}>Nombre *</label>
                  <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Tu nombre" className={inputClass} />
                </div>
                <div>
                  <label className={cn('block text-xs font-medium mb-1.5', dark ? 'text-white/70' : 'text-stone-500')}>Email *</label>
                  <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="tu@email.com" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={cn('block text-xs font-medium mb-1.5', dark ? 'text-white/70' : 'text-stone-500')}>Asunto</label>
                <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="¿En qué podemos ayudarte?" className={inputClass} />
              </div>
              <div>
                <label className={cn('block text-xs font-medium mb-1.5', dark ? 'text-white/70' : 'text-stone-500')}>Mensaje *</label>
                <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Escribe tu mensaje aquí..." className={inputClass + ' resize-none'} />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <motion.button type="submit" disabled={sending}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 btn-primary disabled:opacity-60 py-3">
                <Send size={16} />
                {sending ? 'Enviando...' : 'Enviar mensaje'}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ── Main HomePage ──────────────────────────────────────────────
export function HomePage({ onContact }: HomePageProps) {
  const { config } = useSiteConfigContext();
  const location = useLocation();
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.hash === '#contact') onContact();
  }, [location.hash, onContact]);

  const visibleBlocks = [...config.home_blocks]
    .filter(b => b.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div>
      <HeroSection />
      {visibleBlocks.map(block => {
        switch (block.type) {
          case 'cards':
            return <CardsBlock key={block.id} block={block} />;
          case 'columns':
            return <ColumnsBlock key={block.id} block={block} onContact={onContact} />;
          case 'cta_banner':
            return <CtaBannerBlock key={block.id} block={block} onContact={onContact} />;
          case 'stats':
            return <StatsBlock key={block.id} block={block} />;
          case 'rich_text':
            return <RichTextBlock key={block.id} block={block} />;
          case 'contact_form':
            return <ContactFormBlock key={block.id} block={block} />;
          case 'testimonials':
            return <TestimonialsBlock key={block.id} block={block} />;
          case 'gallery':
            return <GalleryBlock key={block.id} block={block} />;
          default:
            return null;
        }
      })}
      <div ref={ctaRef} />
    </div>
  );
}
