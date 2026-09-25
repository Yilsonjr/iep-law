import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useSiteConfigContext } from '../contexts/SiteConfigContext';
import { cn } from '../utils';

const heroSizes = 'h-[56vw] sm:h-[100svh] min-h-[300px] sm:min-h-[560px]';

export function HeroSection() {
  const { config, loading } = useSiteConfigContext();
  const hero = config.hero;
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (loading || hero.mode !== 'slider' || hero.slides.length < 2) return;
    const interval = setInterval(() => setSlide(s => (s + 1) % hero.slides.length), 6000);
    return () => clearInterval(interval);
  }, [loading, hero.mode, hero.slides.length]);

  if (loading) {
    return <div aria-hidden="true" className={cn(heroSizes, 'bg-stone-800 animate-pulse')} />;
  }

  // ── SLIDER MODE ───────────────────────────────────────────────
  if (hero.mode === 'slider' && hero.slides.length > 0) {
    return (
      <section aria-label="Portada" className={cn('relative overflow-hidden bg-stone-900', heroSizes)}>
        <AnimatePresence>
          <motion.div
            key={slide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <img
              src={hero.slides[slide]}
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover sm:hidden"
              style={{ filter: 'blur(24px) brightness(0.35) saturate(0.4)', transform: 'scale(1.15)' }}
            />
            <img
              src={hero.slides[slide]}
              alt=""
              className="absolute inset-0 w-full h-full object-contain sm:object-cover hero-zoom"
            />
          </motion.div>
        </AnimatePresence>

        {/* Cinematic overlay — clear top, dramatic bottom */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, rgba(24,14,9,0.04) 0%, rgba(24,14,9,${(hero.overlay * 0.55).toFixed(2)}) 32%, rgba(24,14,9,${hero.overlay.toFixed(2)}) 60%, rgba(24,14,9,${Math.min(hero.overlay + 0.4, 0.96).toFixed(2)}) 100%)`,
          }}
        />
        {/* Subtle gold glow at bottom center */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 inset-x-0 h-60 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 100% at 50% 100%, rgba(212,175,55,0.07) 0%, transparent 70%)' }}
        />

        <HeroContent hero={hero} />
        <SliderControls
          count={hero.slides.length}
          current={slide}
          onPrev={() => setSlide(s => (s - 1 + hero.slides.length) % hero.slides.length)}
          onNext={() => setSlide(s => (s + 1) % hero.slides.length)}
          onDot={setSlide}
        />
      </section>
    );
  }

  // ── IMAGE MODE ────────────────────────────────────────────────
  if (hero.mode === 'image' && hero.bg_url) {
    return (
      <section aria-label="Portada" className={cn('relative overflow-hidden bg-stone-900', heroSizes)}>
        <img
          src={hero.bg_url}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover sm:hidden"
          style={{ filter: 'blur(24px) brightness(0.35) saturate(0.4)', transform: 'scale(1.15)' }}
        />
        <img
          src={hero.bg_url}
          alt=""
          className="absolute inset-0 w-full h-full object-contain sm:object-cover hero-zoom"
        />
        {/* Cinematic overlay — clear top, dramatic bottom */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, rgba(24,14,9,0.04) 0%, rgba(24,14,9,${(hero.overlay * 0.55).toFixed(2)}) 32%, rgba(24,14,9,${hero.overlay.toFixed(2)}) 60%, rgba(24,14,9,${Math.min(hero.overlay + 0.4, 0.96).toFixed(2)}) 100%)`,
          }}
        />
        {/* Subtle gold glow at bottom center */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 inset-x-0 h-60 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 100% at 50% 100%, rgba(212,175,55,0.07) 0%, transparent 70%)' }}
        />
        <HeroContent hero={hero} />
      </section>
    );
  }

  // ── TEXT MODE (default — gradient bg) ─────────────────────────
  return (
    <section aria-label="Portada" className={cn('relative overflow-hidden flex items-center justify-center', heroSizes)}>
      <div aria-hidden="true" className="absolute inset-0 bg-primary" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)',
          backgroundSize: '36px 36px',
        }}
      />
      <div aria-hidden="true" className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <HeroContent hero={hero} textMode />
    </section>
  );
}

// ── Shared content ─────────────────────────────────────────────
function HeroContent({ hero, textMode = false }: { hero: ReturnType<typeof useSiteConfigContext>['config']['hero']; textMode?: boolean }) {
  const { config } = useSiteConfigContext();
  const address = config.footer.contact.address;

  const item = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.16, duration: 0.7, ease: 'easeOut' as const } }),
  };

  const words = hero.title.split(' ');
  const lastWord = words.pop();

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div
        className="text-white text-center"
        style={{
          width: '100%',
          maxWidth: '52rem',
          paddingLeft: 'clamp(1rem, 6vw, 3rem)',
          paddingRight: 'clamp(1rem, 6vw, 3rem)',
          boxSizing: 'border-box',
        }}
      >
        {/* Location badge */}
        {address && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
            className="flex items-center justify-center gap-2 mb-5"
          >
            <span aria-hidden="true" className="w-5 h-px bg-gold/40" />
            <MapPin size={10} className="text-gold/65 shrink-0" aria-hidden="true" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/50">{address}</span>
            <span aria-hidden="true" className="w-5 h-px bg-gold/40" />
          </motion.div>
        )}

        {hero.prefix && (
          <motion.div
            custom={0} variants={item} initial="hidden" animate="visible"
            className="flex items-center gap-4"
          >
            <span aria-hidden="true" className="w-12 h-px bg-gold/60" />
            <span className="eyebrow text-gold">{hero.prefix}</span>
            <span aria-hidden="true" className="w-12 h-px bg-gold/60" />
          </motion.div>
        )}

        <motion.h1
          custom={1} variants={item} initial="hidden" animate="visible"
          className="font-serif font-semibold leading-tight mb-5"
          style={{
            fontSize: 'clamp(2rem, 6.5vw, 4.75rem)',
            letterSpacing: '-0.01em',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
          }}
        >
          {textMode || words.length === 0 ? (
            hero.title
          ) : (
            <>
              {words.join(' ')}{' '}
              <span className="text-gold">{lastWord}</span>
            </>
          )}
        </motion.h1>

        {hero.subtitle && (
          <motion.p
            custom={2} variants={item} initial="hidden" animate="visible"
            className="text-white/80 font-light mb-9"
            style={{ fontSize: 'clamp(0.95rem, 2.6vw, 1.25rem)' }}
          >
            {hero.subtitle}
          </motion.p>
        )}

        {hero.buttons.length > 0 && (
          <motion.div
            custom={3} variants={item} initial="hidden" animate="visible"
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
          >
            {hero.buttons.map((btn, i) => (
              <Link
                key={i}
                to={btn.href}
                className={cn(
                  'block sm:inline-flex items-center justify-center px-7 py-3 sm:px-8 sm:py-3.5 rounded-full font-semibold text-sm tracking-wide transition-all duration-300 text-center',
                  btn.variant === 'primary'
                    ? 'bg-gold text-[#241B0B] hover:bg-gold-600 shadow-lg hover:shadow-gold/30 hover:shadow-xl hover:-translate-y-0.5'
                    : 'border border-white/70 text-white hover:bg-white/10 hover:border-white backdrop-blur-sm'
                )}
              >
                {btn.label}
              </Link>
            ))}
          </motion.div>
        )}
      </div>

      {/* Scroll indicator */}
      <motion.div
        custom={4} variants={item} initial="hidden" animate="visible"
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50"
      >
        <div className="w-px h-9 bg-white/30" />
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="w-1 h-1 rounded-full bg-white/50"
        />
      </motion.div>
    </div>
  );
}

function SliderControls({ count, current, onPrev, onNext, onDot }: {
  count: number; current: number;
  onPrev: () => void; onNext: () => void; onDot: (i: number) => void;
}) {
  if (count <= 1) return null;
  return (
    <>
      <button
        onClick={onPrev}
        aria-label="Diapositiva anterior"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-110 z-20 backdrop-blur-sm"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={onNext}
        aria-label="Diapositiva siguiente"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-110 z-20 backdrop-blur-sm"
      >
        <ChevronRight size={20} />
      </button>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20" role="group" aria-label="Selección de diapositivas">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            onClick={() => onDot(i)}
            aria-label={`Ir a la diapositiva ${i + 1}`}
            aria-current={i === current ? 'true' : undefined}
            className={cn('h-1.5 rounded-full transition-all duration-400', i === current ? 'bg-gold w-8' : 'bg-white/40 w-1.5 hover:bg-white/60')}
          />
        ))}
      </div>
    </>
  );
}