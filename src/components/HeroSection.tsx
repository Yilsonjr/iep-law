import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cross, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSiteConfigContext } from '../contexts/SiteConfigContext';
import { cn } from '../utils';

export function HeroSection() {
  const { config, loading } = useSiteConfigContext();
  const hero = config.hero;
  const [slide, setSlide] = useState(0);

  // All hooks must come before any conditional returns (Rules of Hooks)
  useEffect(() => {
    if (loading || hero.mode !== 'slider' || hero.slides.length < 2) return;
    const interval = setInterval(() => setSlide(s => (s + 1) % hero.slides.length), 5000);
    return () => clearInterval(interval);
  }, [loading, hero.mode, hero.slides.length]);

  if (loading) {
    return <div className="h-screen bg-black animate-pulse" />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  // ── SLIDER MODE ────────────────────────────────────────────
  if (hero.mode === 'slider' && hero.slides.length > 0) {
    return (
      <section className="relative h-screen overflow-hidden bg-black">
        {/* Preload first slide so it appears instantly */}
        {hero.slides[0] && (
          <link rel="preload" as="image" href={hero.slides[0]} />
        )}
        {hero.slides.map((src, i) => (
          <div
            key={i}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000',
              i === slide ? 'opacity-100' : 'opacity-0'
            )}
            style={{ backgroundImage: `url(${src})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
          />
        ))}
        <div className="absolute inset-0 bg-black" style={{ opacity: hero.overlay }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <motion.h1 variants={itemVariants} initial="hidden" animate="visible"
            className="font-serif text-5xl md:text-7xl font-bold mb-6"
          >
            {hero.title}
          </motion.h1>
          <motion.p variants={itemVariants} initial="hidden" animate="visible"
            className="text-xl md:text-2xl text-stone-200 mb-10 max-w-2xl"
          >
            {hero.subtitle}
          </motion.p>
          <HeroButtons buttons={hero.buttons} />
        </div>
        {hero.slides.length > 1 && (
          <>
            <button onClick={() => setSlide(s => (s - 1 + hero.slides.length) % hero.slides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors">
              <ChevronLeft size={24} />
            </button>
            <button onClick={() => setSlide(s => (s + 1) % hero.slides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors">
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {hero.slides.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)}
                  className={cn('w-2 h-2 rounded-full transition-all', i === slide ? 'bg-gold w-6' : 'bg-white/50')} />
              ))}
            </div>
          </>
        )}
      </section>
    );
  }

  // ── IMAGE MODE ─────────────────────────────────────────────
  if (hero.mode === 'image' && hero.bg_url) {
    return (
      <section
        className="relative py-32 overflow-hidden"
        style={{ backgroundImage: `url(${hero.bg_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black" style={{ opacity: hero.overlay }} />
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
          variants={containerVariants} initial="hidden" animate="visible"
        >
          <motion.h1 variants={itemVariants} className="font-serif text-5xl md:text-7xl font-bold text-white mb-6">
            {hero.title}
          </motion.h1>
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-stone-200 mb-10 max-w-2xl mx-auto">
            {hero.subtitle}
          </motion.p>
          <motion.div variants={itemVariants}><HeroButtons buttons={hero.buttons} /></motion.div>
        </motion.div>
      </section>
    );
  }

  // ── TEXT MODE (default) ────────────────────────────────────
  return (
    <section className="relative bg-linear-to-br from-primary via-primary-700 to-primary-800 text-white py-32 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
      </div>
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
        variants={containerVariants} initial="hidden" animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <Cross size={48} className="mx-auto text-gold" />
        </motion.div>
        <motion.h1 variants={itemVariants} className="font-serif text-5xl md:text-7xl font-bold mb-6">
          {hero.title}
        </motion.h1>
        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-stone-300 mb-10 max-w-2xl mx-auto">
          {hero.subtitle}
        </motion.p>
        <motion.div variants={itemVariants}><HeroButtons buttons={hero.buttons} /></motion.div>
      </motion.div>
    </section>
  );
}

function HeroButtons({ buttons }: { buttons: { label: string; href: string; variant: string }[] }) {
  if (!buttons.length) return null;
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      {buttons.map((btn, i) => (
        <Link
          key={i}
          to={btn.href}
          className={btn.variant === 'primary' ? 'btn-primary' : 'btn-secondary'}
        >
          {btn.label}
        </Link>
      ))}
    </div>
  );
}
