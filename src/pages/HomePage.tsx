import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeroSection } from '../components/HeroSection';
import { useSiteConfigContext } from '../contexts/SiteConfigContext';
import type { HomeBlock } from '../types';
import { cn } from '../utils';

interface HomePageProps {
  onContact: () => void;
}

// ── Background helper ──────────────────────────────────────────
function sectionBgClass(bg: HomeBlock['bg']) {
  return {
    white: 'bg-white',
    light: 'bg-stone-100',
    primary: 'bg-primary text-white',
    gradient: 'bg-gradient-to-br from-primary to-primary/80 text-white',
  }[bg] ?? 'bg-white';
}

const isDarkBg = (bg: HomeBlock['bg']) => bg === 'primary' || bg === 'gradient';

// ── Individual block renderers ─────────────────────────────────
function CardsBlock({ block }: { block: HomeBlock }) {
  const dark = isDarkBg(block.bg);
  const cols = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-2 lg:grid-cols-4' };
  return (
    <section className={cn('py-20', sectionBgClass(block.bg))}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(block.title || block.subtitle) && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            {block.title && <h2 className={cn('font-serif text-4xl font-bold mb-3', dark ? 'text-white' : 'text-primary')}>{block.title}</h2>}
            <div className="w-16 h-0.5 bg-gold mx-auto my-4" />
            {block.subtitle && <p className={cn('text-lg max-w-3xl mx-auto leading-relaxed', dark ? 'text-stone-200' : 'text-stone-600')}>{block.subtitle}</p>}
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
              <h3 className={cn('font-serif text-xl mb-3', dark ? 'text-white' : 'text-primary')}>{card.title}</h3>
              <p className={dark ? 'text-stone-200' : 'text-stone-600'}>{card.description}</p>
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
  return (
    <section className={cn('py-20', sectionBgClass(block.bg))}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(block.title || block.subtitle) && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            {block.title && <h2 className={cn('font-serif text-4xl font-bold mb-3', dark ? 'text-white' : 'text-primary')}>{block.title}</h2>}
            <div className="w-16 h-0.5 bg-gold mx-auto my-4" />
            {block.subtitle && <p className={cn('text-lg max-w-3xl mx-auto leading-relaxed', dark ? 'text-stone-200' : 'text-stone-600')}>{block.subtitle}</p>}
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
              {col.title && <h3 className={cn('font-serif text-2xl mb-4', dark ? 'text-white' : 'text-stone-800')}>{col.title}</h3>}
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
  return (
    <section className={cn('py-20', sectionBgClass(block.bg))}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          {block.title && (
            <h2 className={cn('font-serif text-4xl md:text-5xl font-bold mb-4', dark ? 'text-white' : 'text-primary')}>{block.title}</h2>
          )}
          {block.subtitle && (
            <p className={cn('text-lg mb-8 max-w-2xl mx-auto leading-relaxed', dark ? 'text-stone-300' : 'text-stone-600')}>{block.subtitle}</p>
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
  return (
    <section className={cn('py-20', sectionBgClass(block.bg))}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(block.title || block.subtitle) && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            {block.title && <h2 className={cn('font-serif text-4xl font-bold mb-3', dark ? 'text-white' : 'text-primary')}>{block.title}</h2>}
            <div className="w-16 h-0.5 bg-gold mx-auto my-4" />
          </motion.div>
        )}
        <div className={cn('grid grid-cols-2 gap-8', block.stats.length >= 4 ? 'md:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3')}>
          {block.stats.map((stat, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center">
              {stat.emoji && <span className="text-4xl block mb-3">{stat.emoji}</span>}
              <p className={cn('text-4xl font-bold font-serif mb-1', dark ? 'text-gold' : 'text-primary')}>{stat.value}</p>
              <p className={dark ? 'text-stone-300' : 'text-stone-500'}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RichTextBlock({ block }: { block: HomeBlock }) {
  const dark = isDarkBg(block.bg);
  return (
    <section className={cn('py-20', sectionBgClass(block.bg))}>
      <div className={cn('max-w-4xl mx-auto px-4 sm:px-6 lg:px-8', block.text_align === 'center' && 'text-center')}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          {block.title && (
            <>
              <h2 className={cn('font-serif text-4xl font-bold mb-3', dark ? 'text-white' : 'text-primary')}>{block.title}</h2>
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

// ── Main HomePage ──────────────────────────────────────────────
export function HomePage({ onContact }: HomePageProps) {
  const { config } = useSiteConfigContext();
  const location = useLocation();
  const ctaRef = useRef<HTMLDivElement>(null);

  // Scroll to #contact anchor when needed
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
          default:
            return null;
        }
      })}
      <div ref={ctaRef} />
    </div>
  );
}
