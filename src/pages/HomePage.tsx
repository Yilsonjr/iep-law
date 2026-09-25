import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, CheckCircle, Quote, ChevronLeft, ChevronRight, X,
  Clock, MapPin, Play, Radio, Calendar,
} from 'lucide-react';
import { HeroSection } from '../components/HeroSection';
import { useSiteConfigContext } from '../contexts/SiteConfigContext';
import { useContactMessages } from '../hooks/useContactMessages';
import { useSermons } from '../hooks/useSermons';
import { useEvents } from '../hooks/useEvents';
import { useLiveStream } from '../hooks/useLiveStream';
import type { HomeBlock } from '../types';
import { cn } from '../utils';

interface HomePageProps {
  onContact: () => void;
}

// ── Animation presets ──────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const focusIn = {
  hidden: { opacity: 0, filter: 'blur(6px)' },
  visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.65, ease: 'easeOut' as const } },
};

// ── Utilities ─────────────────────────────────────────────────
function ytThumb(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/maxresdefault.jpg` : null;
}

function ytEmbed(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}?rel=0` : null;
}

function fmtDateShort(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function fmtDay(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').getDate();
}

function fmtMonth(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-US', { month: 'short' }).toUpperCase();
}

const eventTypeMeta: Record<string, { label: string; cls: string }> = {
  service:      { label: 'Culto',          cls: 'bg-gold/20 text-gold' },
  'bible-study':{ label: 'Estudio Bíblico',cls: 'bg-blue-500/20 text-blue-300' },
  youth:        { label: 'Jóvenes',        cls: 'bg-purple-500/20 text-purple-300' },
  outreach:     { label: 'Alcance',        cls: 'bg-emerald-500/20 text-emerald-300' },
  celebration:  { label: 'Celebración',    cls: 'bg-amber-500/20 text-amber-300' },
  encounter:    { label: 'Encuentro',      cls: 'bg-rose-500/20 text-rose-300' },
};

// ── Background helpers ─────────────────────────────────────────
function sectionBgClass(bg: HomeBlock['bg']) {
  return ({
    white: 'bg-white',
    light: 'bg-paper',
    primary: 'bg-primary text-white',
    gradient: 'bg-linear-to-br from-primary to-primary/80 text-white',
    custom: '',
  } as Record<string, string>)[bg] ?? 'bg-white';
}

const isDarkBg = (bg: HomeBlock['bg']) => bg === 'primary' || bg === 'gradient';

function bc(block: HomeBlock) {
  return {
    section: block.color_bg ? { backgroundColor: block.color_bg } : undefined,
    heading: block.color_heading ? { color: block.color_heading } : undefined,
    text: block.color_text ? { color: block.color_text } : undefined,
  };
}

// ── Section header ─────────────────────────────────────────────
function SectionHeader({ block, dark, s, verse }: {
  block: HomeBlock;
  dark: boolean;
  s: ReturnType<typeof bc>;
  verse?: string;
}) {
  if (!block.title && !block.subtitle) return null;
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
      {block.title && (
        <motion.h2
          variants={focusIn}
          className={cn('font-serif text-3xl md:text-4xl font-bold leading-tight text-balance', !block.color_heading && (dark ? 'text-white' : 'text-primary'))}
          style={s.heading}
        >
          {block.title}
        </motion.h2>
      )}
      <div aria-hidden="true" className={cn('h-px bg-gradient-to-r from-transparent via-gold/65 to-transparent mx-auto w-24', block.title ? 'mt-4' : 'mt-2')} />
      {block.subtitle && (
        <p
          className={cn('mt-3 text-base md:text-lg leading-relaxed max-w-2xl mx-auto', !block.color_text && (dark ? 'text-stone-200' : 'text-stone-800'))}
          style={s.text}
        >
          {block.subtitle}
        </p>
      )}
      {verse && (
        <p className="mt-4 text-xs font-semibold tracking-[0.18em] uppercase text-gold">{verse}</p>
      )}
    </motion.div>
  );
}

// ── Schedule Bar ───────────────────────────────────────────────
function ScheduleBar() {
  const { config } = useSiteConfigContext();
  const { schedules } = config.footer;
  if (!schedules?.enabled || !schedules.items.length) return null;

  return (
    <div className="bg-ink text-white relative overflow-hidden">
      <div aria-hidden="true" className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/45 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center gap-0">
          <div className="flex items-center gap-2.5 shrink-0 pr-5 sm:pr-7 border-r border-white/10">
            <Clock size={14} className="text-gold shrink-0" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gold/80">Servicios</span>
          </div>
          <div className="flex-1 pl-5 sm:pl-7 overflow-x-auto scrollbar-none">
            <div className="flex gap-7 sm:gap-10 min-w-max sm:min-w-0 sm:flex-wrap sm:justify-center">
              {schedules.items.map((item, i) => (
                <div key={i} className="flex flex-col shrink-0">
                  <span className="font-serif text-[15px] font-medium text-white/90 leading-none tracking-tight">
                    {item.time}
                  </span>
                  <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.13em] text-stone-400">
                    {item.day}{item.label ? ` · ${item.label}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FLOATING SERVICE CARD ─────────────────────────────────────
function ServiceCard() {
  const { config } = useSiteConfigContext();
  const { schedules, contact } = config.footer;
  const first = schedules?.enabled && schedules.items.length > 0 ? schedules.items[0] : null;
  if (!first && !contact.address) return null;

  const mapsUrl = contact.address
    ? `https://maps.google.com/?q=${encodeURIComponent(contact.address)}`
    : null;

  return (
    <section className="bg-paper py-7">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.55, ease: 'easeOut' }}
          className="relative bg-white rounded-2xl
            border border-stone-200/70
            shadow-[0_8px_32px_rgba(34,26,20,0.09),0_2px_6px_rgba(34,26,20,0.05)]
            px-5 py-5 sm:px-8 sm:py-6
            flex flex-col sm:flex-row sm:items-center gap-5"
        >
          <div aria-hidden="true" className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent rounded-t-2xl" />

          {first && (
            <div className="flex items-center gap-4 flex-1 sm:pr-7 sm:border-r sm:border-stone-200">
              <span className="w-10 h-10 rounded-xl bg-primary/[0.06] flex items-center justify-center shrink-0">
                <Clock size={17} className="text-primary" />
              </span>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gold mb-0.5">Próximo servicio</p>
                <p className="font-serif text-[17px] font-semibold text-ink leading-none">{first.time}</p>
                <p className="text-[11px] text-stone-500 mt-0.5">{first.day}{first.label ? ` · ${first.label}` : ''}</p>
              </div>
            </div>
          )}

          {contact.address && (
            <div className={cn('flex items-center gap-4 flex-1', first && 'sm:pl-7')}>
              <span className="w-10 h-10 rounded-xl bg-primary/[0.06] flex items-center justify-center shrink-0">
                <MapPin size={17} className="text-primary" />
              </span>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gold mb-0.5">Nos encontramos en</p>
                <p className="text-sm font-medium text-ink leading-snug">{contact.address}</p>
              </div>
            </div>
          )}

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 sm:ml-4 flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-white text-[11px] font-semibold tracking-[0.06em] hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              <MapPin size={12} />
              Cómo llegar
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ── SCROLL STORY SECTION ───────────────────────────────────────
const storyWords = ['Una', 'casa', 'para', 'encontrar', 'a', 'Dios,', 'crecer', 'en', 'fe', 'y', 'servir', 'a', 'la', 'comunidad.'];

function ScrollStorySection() {
  const { config } = useSiteConfigContext();
  const { branding, hero } = config;
  const imgSrc = hero.slides[0] || hero.bg_url || '';

  return (
    <section className="py-24 bg-paper overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Text */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.045 } } }}
          >
            <motion.p
              variants={fadeUp}
              className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold mb-5"
            >
              {branding.tagline || 'Lawrence, Massachusetts'}
            </motion.p>

            <h2 className="font-serif text-4xl md:text-5xl font-bold text-ink leading-tight mb-6" aria-label={storyWords.join(' ')}>
              {storyWords.map((word, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
                  }}
                  className="inline-block mr-[0.22em]"
                >
                  {word}
                </motion.span>
              ))}
            </h2>

            <motion.div variants={fadeUp} aria-hidden="true" className="w-14 h-px bg-gold mb-6" />

            <motion.p variants={fadeUp} className="text-base text-stone-600 leading-relaxed max-w-sm">
              Desde Lawrence, Massachusetts, somos una comunidad que celebra la vida, honra la fe y abre sus puertas a todos.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8">
              <Link
                to="/p/quienes-somos"
                className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] uppercase text-primary hover:text-primary/70 transition-colors"
              >
                Conócenos
                <span aria-hidden="true" className="inline-block w-8 h-px bg-primary/60" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Image */}
          {imgSrc ? (
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
              className="relative rounded-3xl overflow-hidden aspect-[4/5] max-h-[520px] shadow-[0_24px_64px_rgba(34,26,20,0.14)]"
            >
              <img
                src={imgSrc}
                alt="Iglesia Ebenezer M.I."
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent pointer-events-none" />
              {/* Gold corner accent */}
              <div aria-hidden="true" className="absolute top-0 left-0 w-16 h-16 border-t-[1.5px] border-l-[1.5px] border-gold/55 rounded-tl-3xl pointer-events-none" />
              <div aria-hidden="true" className="absolute bottom-0 right-0 w-16 h-16 border-b-[1.5px] border-r-[1.5px] border-gold/30 rounded-br-3xl pointer-events-none" />
            </motion.div>
          ) : (
            // Placeholder when no image configured
            <div className="rounded-3xl aspect-[4/5] max-h-[520px] bg-stone-200 flex items-center justify-center">
              <span className="text-stone-400 text-sm">Sin imagen configurada</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── SERMON FEATURE SECTION ─────────────────────────────────────
function SermonFeatureSection() {
  const { config: live, loading: liveLoading } = useLiveStream();
  const { sermons, loading: sermonsLoading } = useSermons(true);

  if (liveLoading && sermonsLoading) return null;

  const latest = sermons[0];
  const embedUrl = ytEmbed(live.stream_url);
  const thumbUrl = ytThumb(live.stream_url) || ytThumb(latest?.video_url) || latest?.thumbnail || null;

  if (!live.is_live && !latest) return null;

  return (
    <section className="py-20 bg-ink relative overflow-hidden">
      {/* Gold glow top */}
      <div
        aria-hidden="true"
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full opacity-[0.08] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #D4AF37 0%, transparent 70%)' }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              {live.is_live ? (
                <>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-400">En vivo ahora</span>
                </>
              ) : (
                <>
                  <Radio size={12} className="text-gold" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">Última prédica</span>
                </>
              )}
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
              {live.is_live ? (live.title || 'Transmisión en vivo') : 'La Palabra'}
            </h2>
          </div>
          {!live.is_live && (
            <Link
              to="/sermons"
              className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-white/40 hover:text-gold transition-colors mt-1"
            >
              Ver todas
              <ChevronRight size={13} />
            </Link>
          )}
        </div>

        {/* Live — embed */}
        {live.is_live && embedUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden aspect-video shadow-[0_16px_48px_rgba(0,0,0,0.5)] mb-8"
          >
            <iframe
              src={embedUrl}
              title={live.title || 'Transmisión en vivo'}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        )}

        {/* Live — info */}
        {live.is_live && (
          <div className="text-center max-w-xl mx-auto">
            {live.speaker && <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-2">{live.speaker}</p>}
            {live.description && <p className="text-stone-300 text-sm leading-relaxed">{live.description}</p>}
            {live.viewer_count > 0 && (
              <p className="text-stone-500 text-xs mt-3">{live.viewer_count} viendo ahora</p>
            )}
          </div>
        )}

        {/* Not live — feature card */}
        {!live.is_live && latest && (
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 items-center"
          >
            {/* Thumbnail */}
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-stone-900 shadow-[0_12px_40px_rgba(0,0,0,0.45)] group">
              {thumbUrl ? (
                <img
                  src={thumbUrl}
                  alt={latest.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-900">
                  <Play size={40} className="text-stone-700" />
                </div>
              )}
              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                <Link
                  to="/sermons"
                  className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg"
                  aria-label={`Ver prédica: ${latest.title}`}
                >
                  <Play size={22} className="text-primary ml-0.5" fill="currentColor" />
                </Link>
              </div>
              {/* Duration badge */}
              {latest.duration && (
                <span className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                  {latest.duration}
                </span>
              )}
            </div>

            {/* Info */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold mb-3">
                {latest.category} · {fmtDateShort(latest.date)}
              </p>
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2 leading-snug text-balance">
                {latest.title}
              </h3>
              <p className="text-stone-400 text-sm mb-4 font-medium">{latest.speaker}</p>
              {latest.series && (
                <p className="text-[10px] uppercase tracking-widest text-stone-500 mb-4">
                  Serie: {latest.series}
                </p>
              )}
              {latest.description && (
                <p className="text-stone-300 text-sm leading-relaxed line-clamp-3 mb-6">
                  {latest.description}
                </p>
              )}
              <Link
                to="/sermons"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/25 text-white text-[11px] font-semibold tracking-wide hover:bg-white/10 transition-colors"
              >
                <Play size={12} />
                Ver prédica completa
              </Link>
            </div>
          </motion.div>
        )}

        {!live.is_live && (
          <div className="mt-8 text-center sm:hidden">
            <Link to="/sermons" className="text-[11px] font-semibold uppercase tracking-widest text-gold/70 hover:text-gold transition-colors">
              Ver todas las prédicas →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

// ── EVENTS STRIP SECTION ───────────────────────────────────────
function EventsStripSection() {
  const { events, loading } = useEvents();

  if (loading) return null;

  const today = new Date().toISOString().split('T')[0];
  const upcoming = events.filter(e => e.date >= today).slice(0, 7);

  if (upcoming.length === 0) return null;

  return (
    <section className="py-16 bg-ink border-t border-white/[0.05]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={12} className="text-gold" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">Próximos eventos</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-white">Calendario</h2>
          </div>
          <Link
            to="/events"
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-white/40 hover:text-gold transition-colors"
          >
            Ver todos
            <ChevronRight size={13} />
          </Link>
        </div>

        {/* Horizontal scroll */}
        <div
          className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
          role="list"
          aria-label="Próximos eventos"
        >
          {upcoming.map((event, i) => {
            const meta = eventTypeMeta[event.type] ?? { label: event.type, cls: 'bg-white/10 text-white/60' };
            return (
              <motion.div
                key={event.id}
                role="listitem"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex-shrink-0 w-56 sm:w-60 bg-stone-900 border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3
                  hover:border-gold/30 hover:bg-stone-800/80 transition-all duration-300"
              >
                {/* Type badge */}
                <span className={cn('self-start text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full', meta.cls)}>
                  {meta.label}
                </span>

                {/* Date block */}
                <div className="flex items-end gap-2">
                  <span className="font-serif text-4xl font-bold text-white leading-none tabular-nums">
                    {fmtDay(event.date)}
                  </span>
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                    {fmtMonth(event.date)}
                  </span>
                </div>

                {/* Title */}
                <p className="font-semibold text-sm text-white leading-snug line-clamp-2">{event.title}</p>

                {/* Time + location */}
                <div className="mt-auto flex flex-col gap-1">
                  {event.time && (
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                      <Clock size={10} className="shrink-0" />
                      {event.time}
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 truncate">
                      <MapPin size={10} className="shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* "Ver todos" card */}
          <Link
            to="/events"
            className="flex-shrink-0 w-40 sm:w-44 border border-dashed border-white/15 rounded-2xl flex flex-col items-center justify-center gap-3 text-white/30 hover:border-gold/30 hover:text-gold/60 transition-all duration-300 min-h-[180px]"
            aria-label="Ver todos los eventos"
          >
            <ChevronRight size={22} />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-center px-4">
              Ver todos
            </span>
          </Link>
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link to="/events" className="text-[11px] font-semibold uppercase tracking-widest text-gold/70 hover:text-gold transition-colors">
            Ver todos los eventos →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── CARDS BLOCK ────────────────────────────────────────────────
function CardsBlock({ block }: { block: HomeBlock }) {
  const dark = isDarkBg(block.bg);
  const cols = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-2 lg:grid-cols-4' };
  const s = bc(block);

  return (
    <section className={cn('py-20', !block.color_bg && sectionBgClass(block.bg), !dark && !block.color_bg && 'border-t border-stone-100')} style={s.section}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader block={block} dark={dark} s={s} />
        <div className={cn('grid grid-cols-1 gap-6 lg:gap-8', cols[block.card_cols])}>
          {block.cards.map((card, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={cn(
                'relative flex flex-col items-center text-center group',
                !block.color_bg && !dark && 'rounded-2xl border border-stone-200/70 bg-white p-8 sm:p-10 transition-all duration-300 hover:border-gold/50 hover:shadow-[0_10px_40px_rgba(212,175,55,0.16),0_0_0_1px_rgba(212,175,55,0.18)] motion-safe:hover:-translate-y-1.5'
              )}
            >
              {!block.color_bg && !dark && (
                <div aria-hidden="true" className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent rounded-t-2xl" />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  'w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300',
                  dark ? 'bg-white/10' : 'bg-primary/[0.11] group-hover:bg-gold/[0.15] group-hover:scale-[1.07]'
                )}
              >
                {card.emoji || '✦'}
              </span>
              <h3
                className={cn('mt-5 text-sm font-bold tracking-[0.12em] uppercase', !block.color_heading && (dark ? 'text-white' : 'text-ink'))}
                style={s.heading}
              >
                {card.title}
              </h3>
              <div aria-hidden="true" className="w-10 h-px bg-gold/60 my-3" />
              <p
                className={cn('text-sm leading-relaxed max-w-xs mx-auto', !block.color_text && (dark ? 'text-stone-300' : 'text-stone-700'))}
                style={s.text}
              >
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── COLUMNS BLOCK ──────────────────────────────────────────────
function ColumnsBlock({ block, onContact }: { block: HomeBlock; onContact: () => void }) {
  const dark = isDarkBg(block.bg);
  const colClass = block.col_items.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3';
  const s = bc(block);

  return (
    <section className={cn('py-20', !block.color_bg && sectionBgClass(block.bg), !dark && !block.color_bg && 'border-t border-stone-100')} style={s.section}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {(block.title || block.subtitle) && (
          <SectionHeader block={block} dark={dark} s={s} />
        )}
        <div className={cn('grid grid-cols-1 gap-10 items-stretch', colClass)}>
          {block.col_items.map((col, i) => {
            const isPhotoOnly = col.image_url && !col.title && !col.body && !col.btn_label;
            return (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                {isPhotoOnly ? (
                  <div className="relative rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(34,26,20,0.12)] h-full min-h-[320px]">
                    <img src={col.image_url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/15 to-transparent pointer-events-none" />
                  </div>
                ) : (
                  <>
                    {col.image_url && (
                      <div className="mb-6 rounded-2xl overflow-hidden shadow-lg aspect-video">
                        <img src={col.image_url} alt={col.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    {col.title && (
                      <h3
                        className={cn('font-serif text-3xl font-bold mb-4', !block.color_heading && (dark ? 'text-white' : 'text-primary'))}
                        style={s.heading}
                      >
                        {col.title}
                      </h3>
                    )}
                    {col.body && (
                      <div
                        className={cn('prose prose-base max-w-none mb-6', dark ? 'prose-invert prose-p:text-stone-200' : 'prose-stone prose-p:text-stone-700')}
                        dangerouslySetInnerHTML={{ __html: col.body }}
                      />
                    )}
                    {col.btn_label && (
                      col.btn_href === '#contact' ? (
                        <button onClick={onContact} className={dark ? 'btn-secondary' : 'btn-primary'}>
                          {col.btn_label}
                        </button>
                      ) : (
                        <Link to={col.btn_href} className={dark ? 'btn-secondary' : 'btn-primary'}>
                          {col.btn_label}
                        </Link>
                      )
                    )}
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── CTA BANNER BLOCK ───────────────────────────────────────────
function CtaBannerBlock({ block, onContact }: { block: HomeBlock; onContact: () => void }) {
  const dark = isDarkBg(block.bg);
  const s = bc(block);

  const ctaBtn1Class = dark
    ? 'px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide bg-white/[0.08] border-2 border-white/85 text-white hover:bg-white/20 transition-colors'
    : 'btn-primary';
  const ctaBtn2Class = dark
    ? 'px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide bg-white/[0.12] border border-white/55 text-white hover:bg-white/25 transition-colors'
    : 'btn-secondary';

  return (
    <section
      className={cn('py-24 relative overflow-hidden', !block.color_bg && sectionBgClass(block.bg))}
      style={dark && !block.color_bg
        ? { background: 'linear-gradient(150deg, #580007 0%, #8D000A 38%, #3D0004 70%, #1E0002 100%)' }
        : s.section}
    >
      {dark && (
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.7) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
      )}
      {dark && (
        <div
          aria-hidden="true"
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[320px] rounded-full opacity-[0.20] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #D4AF37 0%, transparent 70%)' }}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="flex flex-col lg:flex-row lg:items-center lg:gap-16 text-center lg:text-left"
        >
          <div className="flex-1 min-w-0">
            {block.title && (
              <>
                {dark && (
                  <div className="flex items-center gap-2.5 mb-5 justify-center lg:justify-start">
                    <span aria-hidden="true" className="w-8 h-px bg-gold/50" />
                    <span aria-hidden="true" className="text-gold/55 text-[9px] tracking-[0.2em]">✦ ✦ ✦</span>
                    <span aria-hidden="true" className="w-8 h-px bg-gold/50" />
                  </div>
                )}
                <h2
                  className={cn('font-serif text-4xl md:text-5xl font-bold mb-4 text-balance leading-snug', !block.color_heading && (dark ? 'text-white' : 'text-primary'))}
                  style={s.heading}
                >
                  {block.title}
                </h2>
              </>
            )}
            {block.subtitle && (
              <p
                className={cn('text-lg leading-relaxed', !block.color_text && (dark ? 'text-white/90' : 'text-stone-600'))}
                style={s.text}
              >
                {block.subtitle}
              </p>
            )}
          </div>

          {(block.cta_btn1_label || block.cta_btn2_label) && (
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 mt-10 lg:mt-0 lg:shrink-0 items-center lg:items-stretch">
              {block.cta_btn1_label && (
                block.cta_btn1_href === '#contact' ? (
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onContact} className={ctaBtn1Class}>
                    {block.cta_btn1_label}
                  </motion.button>
                ) : (
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link to={block.cta_btn1_href} className={cn('inline-block text-center', ctaBtn1Class)}>
                      {block.cta_btn1_label}
                    </Link>
                  </motion.div>
                )
              )}
              {block.cta_btn2_label && (
                block.cta_btn2_href === '#contact' ? (
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onContact} className={ctaBtn2Class}>
                    {block.cta_btn2_label}
                  </motion.button>
                ) : (
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link to={block.cta_btn2_href} className={cn('inline-block text-center', ctaBtn2Class)}>
                      {block.cta_btn2_label}
                    </Link>
                  </motion.div>
                )
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ── STATS BLOCK ────────────────────────────────────────────────
function StatsBlock({ block }: { block: HomeBlock }) {
  const dark = isDarkBg(block.bg);
  const s = bc(block);

  return (
    <section className={cn('py-20', !block.color_bg && sectionBgClass(block.bg), !dark && !block.color_bg && 'border-t border-stone-100')} style={s.section}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(block.title || block.subtitle) && <SectionHeader block={block} dark={dark} s={s} />}
        <div className={cn('grid grid-cols-2 gap-8', block.stats.length >= 4 ? 'md:grid-cols-4' : 'md:grid-cols-3')}>
          {block.stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              {stat.emoji && <span aria-hidden="true" className="text-2xl">{stat.emoji}</span>}
              <div aria-hidden="true" className="mt-3 w-8 h-px bg-gold/70 mx-auto" />
              <p className={cn('mt-2 font-serif text-4xl md:text-5xl font-semibold', !block.color_heading && (dark ? 'text-gold' : 'text-primary'))} style={s.heading}>
                {stat.value}
              </p>
              <p className={cn('mt-2 text-xs font-semibold tracking-[0.14em] uppercase', !block.color_text && (dark ? 'text-stone-300' : 'text-stone-500'))} style={s.text}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── RICH TEXT BLOCK ────────────────────────────────────────────
function RichTextBlock({ block }: { block: HomeBlock }) {
  const dark = isDarkBg(block.bg);
  const s = bc(block);

  return (
    <section className={cn('py-20', !block.color_bg && sectionBgClass(block.bg), !dark && !block.color_bg && 'border-t border-stone-100')} style={s.section}>
      <div className={cn('max-w-4xl mx-auto px-4 sm:px-6 lg:px-8', block.text_align === 'center' && 'text-center')}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {block.title && (
            <>
              <h2 className={cn('font-serif text-4xl font-bold mb-3', !block.color_heading && (dark ? 'text-white' : 'text-primary'))} style={s.heading}>
                {block.title}
              </h2>
              <div className={cn('w-16 h-0.5 bg-gold my-4', block.text_align === 'center' ? 'mx-auto' : '')} />
            </>
          )}
          {block.html && (
            <div
              className={cn('prose prose-lg max-w-none', dark ? 'prose-invert' : 'prose-stone')}
              dangerouslySetInnerHTML={{ __html: block.html }}
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ── TESTIMONIALS BLOCK ─────────────────────────────────────────
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
    <section className={cn('py-20', !block.color_bg && sectionBgClass(block.bg), !dark && !block.color_bg && 'border-t border-stone-100')} style={s.section}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {(block.title || block.subtitle) && <SectionHeader block={block} dark={dark} s={s} />}
        <div className="relative text-center min-h-[220px] flex flex-col items-center justify-center">
          <Quote size={36} className={cn('mx-auto mb-4', dark ? 'text-white/20' : 'text-primary/15')} />
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45 }}
            >
              <p className={cn('text-xl md:text-2xl font-serif italic leading-relaxed mb-6', !block.color_text && (dark ? 'text-white' : 'text-stone-700'))} style={s.text}>
                "{t.quote}"
              </p>
              <div className="flex items-center justify-center gap-3">
                {t.avatar_url && (
                  <img src={t.avatar_url} alt={t.author} className="w-12 h-12 rounded-full object-cover border-2 border-gold" />
                )}
                <div className="text-left">
                  {t.author && <p className={cn('font-semibold', !block.color_heading && (dark ? 'text-white' : 'text-primary'))} style={s.heading}>{t.author}</p>}
                  {t.role && <p className={cn('text-sm', dark ? 'text-stone-300' : 'text-stone-500')}>{t.role}</p>}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          {items.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {items.map((_, i) => (
                <button key={i} onClick={() => setIndex(i)}
                  className={cn('h-1.5 rounded-full transition-all', i === index ? 'bg-gold w-6' : (dark ? 'bg-white/30 w-1.5' : 'bg-stone-300 w-1.5'))} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── GALLERY BLOCK ──────────────────────────────────────────────
function GalleryBlock({ block }: { block: HomeBlock }) {
  const dark = isDarkBg(block.bg);
  const s = bc(block);
  const cols = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 md:grid-cols-3', 4: 'sm:grid-cols-2 md:grid-cols-4' };
  const [lightbox, setLightbox] = useState<number | null>(null);
  const items = block.gallery;
  if (items.length === 0) return null;

  return (
    <section className={cn('py-20', !block.color_bg && sectionBgClass(block.bg), !dark && !block.color_bg && 'border-t border-stone-100')} style={s.section}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(block.title || block.subtitle) && <SectionHeader block={block} dark={dark} s={s} />}
        <div className={cn('grid grid-cols-1 gap-4', cols[block.card_cols])}>
          {items.map((item, i) => (
            <motion.button
              key={i} type="button" onClick={() => setLightbox(i)}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="relative group rounded-2xl overflow-hidden shadow-md aspect-square"
            >
              <img src={item.image_url} alt={item.caption || ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              {item.caption && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end opacity-0 group-hover:opacity-100">
                  <p className="text-white text-sm p-4 text-left font-medium">{item.caption}</p>
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
            className="fixed inset-0 bg-black/92 z-100 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button onClick={() => setLightbox(null)} aria-label="Cerrar visor de imágenes" className="absolute top-5 right-5 text-white/60 hover:text-white"><X size={28} /></button>
            {lightbox > 0 && (
              <button onClick={e => { e.stopPropagation(); setLightbox(l => (l ?? 0) - 1); }} aria-label="Imagen anterior" className="absolute left-4 text-white/60 hover:text-white">
                <ChevronLeft size={32} />
              </button>
            )}
            {lightbox < items.length - 1 && (
              <button onClick={e => { e.stopPropagation(); setLightbox(l => (l ?? 0) + 1); }} aria-label="Imagen siguiente" className="absolute right-4 text-white/60 hover:text-white">
                <ChevronRight size={32} />
              </button>
            )}
            <motion.div onClick={e => e.stopPropagation()} initial={{ scale: 0.94 }} animate={{ scale: 1 }} className="max-w-4xl max-h-[85vh]">
              <img src={items[lightbox].image_url} alt={items[lightbox].caption || ''} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
              {items[lightbox].caption && <p className="text-white/70 text-center mt-3 text-sm">{items[lightbox].caption}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ── MEMBER PHOTO ───────────────────────────────────────────────
function MemberPhoto({ src, name, single }: { src: string; name: string; single: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-100 text-6xl font-serif font-semibold text-stone-400">
        {name ? name.charAt(0).toUpperCase() : '?'}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      decoding="async"
      className={cn(
        'w-full h-full object-cover transition-all duration-500 group-hover:scale-105',
        single ? 'object-top' : 'object-center',
        loaded ? 'opacity-100' : 'opacity-0'
      )}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
    />
  );
}

// ── TEAM BLOCK ────────────────────────────────────────────────
function TeamBlock({ block }: { block: HomeBlock }) {
  const dark = isDarkBg(block.bg);
  const s = bc(block);
  const members = block.team_members;
  if (members.length === 0) return null;

  const single = members.length === 1;
  const colClass = single
    ? ''
    : members.length === 2
      ? 'sm:grid-cols-2'
      : members.length === 4
        ? 'sm:grid-cols-2 lg:grid-cols-4'
        : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <section className={cn('py-20', !block.color_bg && sectionBgClass(block.bg), !dark && !block.color_bg && 'border-t border-stone-100')} style={s.section}>
      <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', single ? 'max-w-4xl' : 'max-w-7xl')}>
        <SectionHeader block={block} dark={false} s={s} />
        <div className={cn('grid grid-cols-1 items-stretch gap-10', colClass)}>
          {members.map((member, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                'group relative rounded-2xl overflow-hidden bg-white border flex flex-col',
                single
                  ? 'md:flex-row border-stone-200/80 shadow-[0_8px_32px_rgba(34,26,20,0.08)] hover:shadow-[0_16px_48px_rgba(34,26,20,0.12)] transition-shadow duration-300'
                  : 'border-stone-200 transition-all duration-300 hover:shadow-md hover:border-gold/30 motion-safe:hover:-translate-y-0.5'
              )}
            >
              <div aria-hidden="true" className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/45 to-transparent z-10 pointer-events-none" />
              <div className={cn('relative overflow-hidden shrink-0 bg-stone-100', single ? 'aspect-[4/5] md:aspect-auto md:w-[42%] max-h-72 md:max-h-[460px]' : 'aspect-[4/5]')}>
                {member.photo_url ? (
                  <MemberPhoto src={member.photo_url} name={member.name} single={single} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-stone-100 text-6xl font-serif font-semibold text-stone-400">
                    {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
              </div>
              <div className={cn('flex-1 text-left flex flex-col justify-center', single ? 'p-10 md:p-12' : 'p-8')}>
                {member.role && <p className="eyebrow text-gold mb-3">{member.role}</p>}
                <h3
                  className={cn('font-serif font-semibold leading-tight', !block.color_heading && 'text-ink', single ? 'text-3xl md:text-4xl' : 'text-2xl')}
                  style={s.heading}
                >
                  {member.name}
                </h3>
                <div aria-hidden="true" className={cn('h-px bg-gold/60 my-4', single ? 'w-16' : 'w-12')} />
                {member.bio && (
                  <p className={cn('leading-relaxed', !block.color_text && 'text-stone-600', single ? 'text-[15px] md:text-base' : 'text-sm md:text-base')} style={s.text}>
                    {member.bio}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CONTACT FORM BLOCK ─────────────────────────────────────────
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
    dark ? 'bg-white/10 border-white/20 text-white placeholder:text-white/50' : 'bg-stone-50 border-stone-200 text-stone-800 placeholder:text-stone-400 focus:bg-white'
  );

  return (
    <section className={cn('py-20', !block.color_bg && sectionBgClass(block.bg), !dark && !block.color_bg && 'border-t border-stone-100')} style={s.section}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {(block.title || block.subtitle) && <SectionHeader block={block} dark={dark} s={s} />}
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className={cn('rounded-2xl p-10 text-center', dark ? 'bg-white/10' : 'bg-white shadow-md')}
            >
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
                  <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Tu nombre" className={inputClass} />
                </div>
                <div>
                  <label className={cn('block text-xs font-medium mb-1.5', dark ? 'text-white/70' : 'text-stone-500')}>Email *</label>
                  <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="tu@email.com" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={cn('block text-xs font-medium mb-1.5', dark ? 'text-white/70' : 'text-stone-500')}>Asunto</label>
                <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="¿En qué podemos ayudarte?" className={inputClass} />
              </div>
              <div>
                <label className={cn('block text-xs font-medium mb-1.5', dark ? 'text-white/70' : 'text-stone-500')}>Mensaje *</label>
                <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Escribe tu mensaje aquí..." className={inputClass + ' resize-none'} />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <motion.button type="submit" disabled={sending}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white px-6 py-3.5 rounded-xl font-semibold text-sm disabled:opacity-60 transition-colors hover:bg-primary/90"
              >
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

// ── Block renderer helper ──────────────────────────────────────
function renderBlock(block: HomeBlock, onContact: () => void) {
  switch (block.type) {
    case 'cards':        return <CardsBlock key={block.id} block={block} />;
    case 'columns':      return <ColumnsBlock key={block.id} block={block} onContact={onContact} />;
    case 'cta_banner':   return <CtaBannerBlock key={block.id} block={block} onContact={onContact} />;
    case 'stats':        return <StatsBlock key={block.id} block={block} />;
    case 'rich_text':    return <RichTextBlock key={block.id} block={block} />;
    case 'contact_form': return <ContactFormBlock key={block.id} block={block} />;
    case 'testimonials': return <TestimonialsBlock key={block.id} block={block} />;
    case 'gallery':      return <GalleryBlock key={block.id} block={block} />;
    case 'team':         return <TeamBlock key={block.id} block={block} />;
    default:             return null;
  }
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

  // Split blocks by type to render in spec order:
  // 4→cards  5→sermon(new)  6→events(new)  7→team  8→testimonials  9→cta_banner  ∞→other
  const cardsBlocks        = visibleBlocks.filter(b => b.type === 'cards');
  const teamBlocks         = visibleBlocks.filter(b => b.type === 'team');
  const testimonialsBlocks = visibleBlocks.filter(b => b.type === 'testimonials');
  const ctaBlocks          = visibleBlocks.filter(b => b.type === 'cta_banner');
  const otherBlocks        = visibleBlocks.filter(b =>
    !['cards', 'team', 'testimonials', 'cta_banner'].includes(b.type)
  );

  return (
    <div>
      {/* 1 — Cinematic Hero */}
      <HeroSection />

      {/* 2 — Floating Visit Card */}
      <ServiceCard />
      <ScheduleBar />

      {/* 3 — Scroll Story */}
      <ScrollStorySection />

      {/* 4 — Service Bento (cards blocks from dashboard) */}
      {cardsBlocks.map(b => renderBlock(b, onContact))}

      {/* 5 — Live / Última Prédica */}
      <SermonFeatureSection />

      {/* 6 — Events Strip */}
      <EventsStripSection />

      {/* 7 — Pastoral Leadership (team blocks from dashboard) */}
      {teamBlocks.map(b => renderBlock(b, onContact))}

      {/* 8 — Testimonio / Versículo (testimonials blocks from dashboard) */}
      {testimonialsBlocks.map(b => renderBlock(b, onContact))}

      {/* 9 — CTA Final (cta_banner blocks from dashboard) */}
      {ctaBlocks.map(b => renderBlock(b, onContact))}

      {/* Other block types (columns, stats, rich_text, gallery, contact_form) */}
      {otherBlocks.map(b => renderBlock(b, onContact))}

      <div ref={ctaRef} />
    </div>
  );
}
