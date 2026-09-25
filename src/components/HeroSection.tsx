import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useSiteConfigContext } from '../contexts/SiteConfigContext';
import { cn } from '../utils';

const heroSizes = 'h-[56vw] sm:h-[100svh] min-h-[300px] sm:min-h-[560px]';
const heroBg = 'linear-gradient(135deg, #1E0002 0%, #3D0004 45%, #221A14 100%)';

function overlayGradient(overlay: number, loaded: boolean) {
  if (!loaded) return 'linear-gradient(to bottom, rgba(14,7,4,0.45) 0%, rgba(14,7,4,0.30) 40%, rgba(14,7,4,0.65) 100%)';
  const o = Math.max(overlay, 0.5);
  return `linear-gradient(to bottom, rgba(14,7,4,0.42) 0%, rgba(14,7,4,${(o * 0.55).toFixed(2)}) 28%, rgba(14,7,4,${o.toFixed(2)}) 58%, rgba(14,7,4,${Math.min(o + 0.35, 0.97).toFixed(2)}) 100%)`;
}

// ── Luminous Cross — CSS/SVG fallback (no Three.js) ───────────
function LuminousCross({ className = '', opacity = 1 }: { className?: string; opacity?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 280 340"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('cross-breathe cross-parallax pointer-events-none select-none', className)}
      style={{ opacity }}
    >
      <defs>
        <radialGradient id="lc-halo" cx="50%" cy="40%" r="52%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </radialGradient>
        <filter id="lc-arm-blur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="lc-halo-blur" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
        <filter id="lc-spot" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      {/* Ambient sanctuary halo */}
      <ellipse cx="140" cy="138" rx="110" ry="102" fill="url(#lc-halo)" filter="url(#lc-halo-blur)" />
      {/* Blurred vertical arm */}
      <rect x="118" y="12" width="44" height="316" rx="8" fill="#D4AF37" opacity="0.28" filter="url(#lc-arm-blur)" />
      {/* Blurred horizontal arm */}
      <rect x="18" y="92" width="244" height="44" rx="8" fill="#D4AF37" opacity="0.28" filter="url(#lc-arm-blur)" />
      {/* Crisp core vertical */}
      <rect x="132" y="12" width="16" height="316" rx="3" fill="#D4AF37" opacity="0.52" />
      {/* Crisp core horizontal */}
      <rect x="18" y="106" width="244" height="16" rx="3" fill="#D4AF37" opacity="0.52" />
      {/* Intersection light spot */}
      <circle cx="140" cy="114" r="18" fill="#F0E070" opacity="0.62" filter="url(#lc-spot)" />
    </svg>
  );
}

export function HeroSection() {
  const { config, loading } = useSiteConfigContext();
  const hero = config.hero;
  const [slide, setSlide] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (loading || hero.mode !== 'slider' || hero.slides.length < 2) return;
    const interval = setInterval(() => {
      setImgLoaded(false);
      setSlide(s => (s + 1) % hero.slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [loading, hero.mode, hero.slides.length]);

  if (loading) {
    return <div aria-hidden="true" className={heroSizes} style={{ background: heroBg }} />;
  }

  // ── SLIDER MODE ───────────────────────────────────────────────
  if (hero.mode === 'slider' && hero.slides.length > 0) {
    return (
      <section aria-label="Portada" className={cn('relative overflow-hidden', heroSizes)} style={{ background: heroBg }}>
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
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover sm:hidden"
              style={{ filter: 'blur(24px) brightness(0.30) saturate(0.3)', transform: 'scale(1.15)' }}
            />
            <img
              src={hero.slides[slide]}
              alt=""
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgLoaded(true)}
              className={cn(
                'absolute inset-0 w-full h-full object-cover hero-zoom transition-opacity duration-700',
                imgLoaded ? 'opacity-100' : 'opacity-0'
              )}
            />
          </motion.div>
        </AnimatePresence>

        {/* Cinematic overlay — text-safe depth */}
        <div
          aria-hidden="true"
          className="absolute inset-0 transition-opacity duration-700"
          style={{ background: overlayGradient(hero.overlay, imgLoaded) }}
        />
        {/* Perimeter vignette */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 85% 80% at 50% 42%, transparent 40%, rgba(14,7,4,0.50) 100%)' }}
        />
        {/* Warm gold glow */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 inset-x-0 h-72 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(212,175,55,0.13) 0%, transparent 65%)' }}
        />

        {/* Luminous cross — subtle accent */}
        <LuminousCross
          className="absolute right-[8%] top-[12%] w-[22vw] max-w-[260px] min-w-[120px]"
          opacity={0.22}
        />

        <HeroContent hero={hero} />
        <SliderControls
          count={hero.slides.length}
          current={slide}
          onPrev={() => { setImgLoaded(false); setSlide(s => (s - 1 + hero.slides.length) % hero.slides.length); }}
          onNext={() => { setImgLoaded(false); setSlide(s => (s + 1) % hero.slides.length); }}
          onDot={i => { setImgLoaded(false); setSlide(i); }}
        />
      </section>
    );
  }

  // ── IMAGE MODE ────────────────────────────────────────────────
  if (hero.mode === 'image' && hero.bg_url) {
    return (
      <section aria-label="Portada" className={cn('relative overflow-hidden', heroSizes)} style={{ background: heroBg }}>
        <img
          src={hero.bg_url}
          aria-hidden="true"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover sm:hidden"
          style={{ filter: 'blur(24px) brightness(0.30) saturate(0.3)', transform: 'scale(1.15)' }}
        />
        <img
          src={hero.bg_url}
          alt=""
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(true)}
          className={cn(
            'absolute inset-0 w-full h-full object-cover hero-zoom transition-opacity duration-700',
            imgLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
        {/* Cinematic overlay — text-safe depth */}
        <div
          aria-hidden="true"
          className="absolute inset-0 transition-opacity duration-700"
          style={{ background: overlayGradient(hero.overlay, imgLoaded) }}
        />
        {/* Perimeter vignette */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 85% 80% at 50% 42%, transparent 40%, rgba(14,7,4,0.50) 100%)' }}
        />
        {/* Warm gold glow */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 inset-x-0 h-72 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(212,175,55,0.13) 0%, transparent 65%)' }}
        />
        {/* Luminous cross — subtle accent */}
        <LuminousCross
          className="absolute right-[8%] top-[12%] w-[22vw] max-w-[260px] min-w-[120px]"
          opacity={0.22}
        />
        <HeroContent hero={hero} />
      </section>
    );
  }

  // ── TEXT MODE (default — gradient bg) ─────────────────────────
  return (
    <section aria-label="Portada" className={cn('relative overflow-hidden flex items-center justify-center', heroSizes)}
      style={{ background: 'linear-gradient(140deg, #1E0002 0%, #3D0004 40%, #221A14 75%, #0D0A08 100%)' }}>
      {/* Subtle grid texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.6) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Warm atmosphere glows */}
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-gold/[0.07] rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-primary/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

      {/* Luminous cross — prominent in text mode */}
      <LuminousCross
        className="absolute left-1/2 -translate-x-1/2 top-[8%] w-[45vw] max-w-[380px] min-w-[200px]"
        opacity={0.65}
      />

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
                    ? 'bg-gold text-[#241B0B] hover:bg-gold-600 shadow-lg hover:shadow-gold/30 hover:shadow-xl hover:-translate-y-0.5 btn-glow'
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