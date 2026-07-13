import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSiteConfigContext } from '../contexts/SiteConfigContext';
import { cn } from '../utils';

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
    return <div className="h-screen bg-stone-900 animate-pulse" />;
  }

  // ── SLIDER MODE ───────────────────────────────────────────────
  if (hero.mode === 'slider' && hero.slides.length > 0) {
    return (
      <section className="relative h-screen min-h-[600px] overflow-hidden bg-stone-900">
        {hero.slides.map((src, i) => (
          <AnimatePresence key={i}>
            {i === slide && (
              <motion.img
                key={src}
                src={src}
                alt=""
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </AnimatePresence>
        ))}

        {/* Gradient overlay — heavier at top and bottom for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, rgba(0,0,0,${hero.overlay * 0.5}) 0%, rgba(0,0,0,${hero.overlay}) 50%, rgba(0,0,0,${hero.overlay * 0.8}) 100%)`,
          }}
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
      <section className="relative h-screen min-h-[600px] overflow-hidden bg-stone-900">
        <img
          src={hero.bg_url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scale(1.02)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, rgba(0,0,0,${hero.overlay * 0.4}) 0%, rgba(0,0,0,${hero.overlay}) 55%, rgba(0,0,0,${hero.overlay * 0.7}) 100%)`,
          }}
        />
        <HeroContent hero={hero} />
      </section>
    );
  }

  // ── TEXT MODE (default — gradient bg) ─────────────────────────
  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden flex items-center">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-primary" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)',
          backgroundSize: '36px 36px',
        }}
      />
      {/* Gold accent shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <HeroContent hero={hero} textMode />
    </section>
  );
}

// ── Shared content ─────────────────────────────────────────────
function HeroContent({ hero, textMode = false }: { hero: ReturnType<typeof useSiteConfigContext>['config']['hero']; textMode?: boolean }) {
  const item = {
    hidden: { opacity: 0, y: 28 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.18, duration: 0.7, ease: 'easeOut' as const } }),
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 z-10">
      {hero.prefix && (
        <motion.p
          custom={0} variants={item} initial="hidden" animate="visible"
          className="text-base md:text-lg text-white/80 font-light tracking-[0.25em] uppercase mb-2"
        >
          {hero.prefix}
        </motion.p>
      )}

      <motion.h1
        custom={1} variants={item} initial="hidden" animate="visible"
        className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-4"
        style={{ textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
      >
        {textMode ? (
          hero.title
        ) : (
          <>
            {/* Split last word and give it a gold color for visual impact */}
            {(() => {
              const words = hero.title.split(' ');
              const lastWord = words.pop();
              return (
                <>
                  {words.join(' ')}{words.length > 0 ? ' ' : ''}
                  <span className="text-gold">{lastWord}</span>
                </>
              );
            })()}
          </>
        )}
      </motion.h1>

      {hero.subtitle && (
        <motion.p
          custom={2} variants={item} initial="hidden" animate="visible"
          className="text-lg md:text-xl text-white/75 mb-10 max-w-xl tracking-wide font-light"
        >
          {hero.subtitle}
        </motion.p>
      )}

      {hero.buttons.length > 0 && (
        <motion.div
          custom={3} variants={item} initial="hidden" animate="visible"
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {hero.buttons.map((btn, i) => (
            <Link
              key={i}
              to={btn.href}
              className={cn(
                'px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide transition-all duration-300',
                btn.variant === 'primary'
                  ? 'bg-gold text-stone-900 hover:bg-gold/90 shadow-lg hover:shadow-gold/30 hover:shadow-xl hover:-translate-y-0.5'
                  : 'border-2 border-white/70 text-white hover:bg-white/10 hover:border-white backdrop-blur-sm'
              )}
            >
              {btn.label}
            </Link>
          ))}
        </motion.div>
      )}

      {/* Scroll indicator */}
      <motion.div
        custom={4} variants={item} initial="hidden" animate="visible"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50"
      >
        <div className="w-px h-10 bg-white/30" />
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
      <button onClick={onPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full text-white flex items-center justify-center transition-all hover:scale-110 z-20">
        <ChevronLeft size={20} />
      </button>
      <button onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full text-white flex items-center justify-center transition-all hover:scale-110 z-20">
        <ChevronRight size={20} />
      </button>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {Array.from({ length: count }).map((_, i) => (
          <button key={i} onClick={() => onDot(i)}
            className={cn('h-1.5 rounded-full transition-all duration-400', i === current ? 'bg-gold w-8' : 'bg-white/40 w-1.5 hover:bg-white/60')} />
        ))}
      </div>
    </>
  );
}
