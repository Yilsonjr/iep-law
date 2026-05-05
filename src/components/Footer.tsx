import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Heart, Clock, ChevronRight, MessageCircle } from 'lucide-react';
import { useSiteConfigContext } from '../contexts/SiteConfigContext';

interface FooterProps {
  onContact: () => void;
}

// ── Inline SVG social icons ────────────────────────────────────
function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconYouTube({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
  );
}
function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function whatsappUrl(raw: string) {
  const digits = raw.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

const QUICK_LINKS = [
  { label: 'Inicio', to: '/' },
  { label: 'Prédicas', to: '/sermons' },
  { label: 'Eventos', to: '/events' },
  { label: 'En Vivo', to: '/live' },
  { label: 'Comunidad', to: '/posts' },
];

export function Footer({ onContact }: FooterProps) {
  const { config } = useSiteConfigContext();
  const { branding, footer } = config;

  // Visibility
  const ctaEnabled = footer.cta?.enabled ?? true;
  const schedulesEnabled = footer.schedules?.enabled ?? true;
  const scheduleItems = footer.schedules?.items ?? [];
  const sections = footer.sections ?? { show_contact: true, show_links: true, show_social: true };

  // Colors
  const C = footer.colors ?? { bg: '#8D000A', heading: '#F5C842', body: '#d6d3d1', link: '#e7e5e4' };

  // Data
  const waUrl = whatsappUrl(footer.contact.whatsapp ?? footer.contact.phone ?? '');
  const ctaTitle = footer.cta?.title || '¿Tienes preguntas?';
  const ctaSubtitle = footer.cta?.subtitle || 'Estamos aquí para acompañarte. No estás solo/a.';

  const socialLinks = [
    { url: footer.social.facebook, label: 'Facebook', Icon: IconFacebook, hover: 'hover:bg-blue-600' },
    { url: footer.social.instagram, label: 'Instagram', Icon: IconInstagram, hover: 'hover:bg-pink-600' },
    { url: footer.social.youtube, label: 'YouTube', Icon: IconYouTube, hover: 'hover:bg-red-600' },
  ].filter(s => s.url);

  // How many visible columns
  const activeCols = [true, sections.show_contact, sections.show_links, sections.show_social].filter(Boolean).length;
  const gridCols = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' }[activeCols] ?? 'lg:grid-cols-4';

  return (
    <footer style={{ backgroundColor: C.bg }}>

      {/* ── CTA Band ──────────────────────────────────────────── */}
      {ctaEnabled && (
        <div className="border-b border-white/10 bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-white">{ctaTitle}</h3>
              <p className="text-white/70 mt-1 text-sm md:text-base">{ctaSubtitle}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={onContact}
                className="flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg text-sm"
                style={{ backgroundColor: C.heading, color: C.bg }}>
                <Mail size={16} />Escribirnos
              </motion.button>
              {waUrl && (
                <motion.a
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  href={waUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg text-sm">
                  <IconWhatsApp className="w-4 h-4" />WhatsApp
                </motion.a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Horarios Band ─────────────────────────────────────── */}
      {schedulesEnabled && scheduleItems.length > 0 && (
        <div className="border-b border-white/10 bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: C.heading }}>
                <Clock size={14} />Horarios de servicio
              </span>
              {scheduleItems.map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="font-medium" style={{ color: C.heading }}>{s.day}</span>
                  <span style={{ color: C.body }}>{s.time}</span>
                  {s.label && <span className="hidden sm:inline" style={{ color: `${C.body}99` }}>· {s.label}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Main columns ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-10`}>

          {/* Col 1 — Logo + descripción + dirección (always visible) */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/20">
                <img src={branding.logo_url || '/android-chrome-192x192.png'} alt={branding.site_name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-serif text-lg font-bold text-white leading-tight">{branding.site_name}</p>
                {branding.tagline && <p className="text-xs font-medium tracking-wider" style={{ color: C.heading }}>{branding.tagline}</p>}
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: C.body }}>{footer.text}</p>
            {footer.contact.address && (
              <div className="flex items-start gap-2 text-sm" style={{ color: C.body }}>
                <MapPin size={15} className="mt-0.5 flex-shrink-0" style={{ color: C.heading }} />
                <span>{footer.contact.address}</span>
              </div>
            )}
          </div>

          {/* Col 2 — Contacto */}
          {sections.show_contact && (
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-5" style={{ color: C.heading }}>Contacto</h4>
              <ul className="space-y-4">
                {footer.contact.phone && (
                  <li>
                    <a href={`tel:${footer.contact.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-3 text-sm group transition-colors"
                      style={{ color: C.body }}>
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                        <Phone size={14} style={{ color: C.heading }} />
                      </span>
                      {footer.contact.phone}
                    </a>
                  </li>
                )}
                {footer.contact.email && (
                  <li>
                    <a href={`mailto:${footer.contact.email}`}
                      className="flex items-center gap-3 text-sm transition-colors"
                      style={{ color: C.body }}>
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                        <Mail size={14} style={{ color: C.heading }} />
                      </span>
                      {footer.contact.email}
                    </a>
                  </li>
                )}
                {waUrl && (
                  <li>
                    <a href={waUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm transition-colors"
                      style={{ color: C.body }}>
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                        <IconWhatsApp className="w-3.5 h-3.5 text-green-400" />
                      </span>
                      WhatsApp
                    </a>
                  </li>
                )}
                {!footer.contact.phone && !footer.contact.email && !waUrl && (
                  <li className="text-sm italic" style={{ color: `${C.body}80` }}>Sin información aún</li>
                )}
              </ul>
              <div className="mt-6 pt-5 border-t border-white/10">
                <a href="/live" className="flex items-center gap-2 text-sm transition-colors" style={{ color: C.body }}>
                  <MessageCircle size={14} style={{ color: C.heading }} />
                  Transmisiones en vivo
                </a>
              </div>
            </div>
          )}

          {/* Col 3 — Enlaces rápidos */}
          {sections.show_links && (
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-5" style={{ color: C.heading }}>Explorar</h4>
              <ul className="space-y-2">
                {QUICK_LINKS.map(({ label, to }) => (
                  <li key={to}>
                    <Link to={to}
                      className="flex items-center gap-2 text-sm py-1 group transition-colors"
                      style={{ color: C.link }}>
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all flex-shrink-0" style={{ color: C.heading }} />
                      {label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button onClick={onContact}
                    className="flex items-center gap-2 text-sm py-1 group transition-colors"
                    style={{ color: C.link }}>
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all flex-shrink-0" style={{ color: C.heading }} />
                    Contacto
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* Col 4 — Redes sociales */}
          {sections.show_social && (
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-5" style={{ color: C.heading }}>Comunidad</h4>
              <p className="text-sm mb-5 leading-relaxed" style={{ color: `${C.body}cc` }}>
                Síguenos y sé parte de nuestra comunidad digital.
              </p>
              <div className="flex gap-3 mb-7">
                {socialLinks.length > 0 ? socialLinks.map(({ url, label, Icon, hover }) => (
                  <motion.a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label}
                    whileHover={{ scale: 1.12, y: -2 }} whileTap={{ scale: 0.95 }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${hover}`}
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <Icon className="w-4 h-4 text-white" />
                  </motion.a>
                )) : (
                  <p className="text-xs italic" style={{ color: `${C.body}80` }}>Redes no configuradas aún</p>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={onContact}
                className="w-full font-semibold text-sm px-5 py-3 rounded-xl transition-all border"
                style={{ backgroundColor: `${C.heading}22`, borderColor: `${C.heading}60`, color: C.heading }}>
                Únete a la iglesia
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────── */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs" style={{ color: `${C.body}99` }}>
            <p className="flex items-center gap-1.5">
              <Heart size={11} style={{ color: C.heading, fill: C.heading }} />
              {footer.copyright || `© ${new Date().getFullYear()} ${branding.site_name}. Todos los derechos reservados.`}
            </p>
            <div className="flex items-center gap-4">
              <Link to="/p/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
              <span style={{ color: `${C.body}40` }}>·</span>
              <Link to="/p/terminos" className="hover:text-white transition-colors">Términos</Link>
            </div>
            <p style={{ fontSize: '11px' }}>
              Desarrollado por{' '}
              <a href="https://portafolio-yilson.vercel.app/iglesias" target="_blank" rel="noopener noreferrer"
                className="hover:text-white transition-colors" style={{ color: `${C.body}80` }}>
                YilsonDev
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
