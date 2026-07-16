import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import type { SiteConfigMap, HomeBlock, FooterWidget } from '../types';

// ── Default footer widgets ─────────────────────────────────────
const defaultFooterWidgets: FooterWidget[] = [
  {
    id: 'fw-logo', type: 'logo_info', title: '', visible: true, order: 0,
    color_heading: '', color_text: '', color_accent: '', links: [], html: '',
  },
  {
    id: 'fw-contact', type: 'contact', title: 'Contacto', visible: true, order: 1,
    color_heading: '', color_text: '', color_accent: '', links: [], html: '',
  },
  {
    id: 'fw-links', type: 'nav_links', title: 'Explorar', visible: true, order: 2,
    color_heading: '', color_text: '', color_accent: '',
    links: [
      { label: 'Inicio', href: '/' },
      { label: 'Prédicas', href: '/sermons' },
      { label: 'Eventos', href: '/events' },
      { label: 'En Vivo', href: '/live' },
      { label: 'Comunidad', href: '/posts' },
    ],
    html: '',
  },
  {
    id: 'fw-social', type: 'social', title: 'Comunidad', visible: true, order: 3,
    color_heading: '', color_text: '', color_accent: '', links: [], html: '',
  },
];

// ── Default home blocks ────────────────────────────────────────
const defaultBlocks: HomeBlock[] = [
  {
    id: 'default-1', type: 'cards',
    title: 'Nuestra Misión',
    subtitle: 'Ir y hacer discípulos de todas las naciones, bautizándolos en el nombre del Padre, del Hijo y del Espíritu Santo.',
    visible: true, order: 0, bg: 'light',
    color_bg: '', color_heading: '', color_text: '', color_accent: '',
    card_cols: 4,
    cards: [
      { emoji: '❤️', title: 'Adoración a Dios', description: 'Adoración a Dios en tiempos de gran adoración que transforman corazones.' },
      { emoji: '📖', title: 'Enseñanza de Su Palabra', description: 'Enseñanza de su palabra para que cada creyente sea un discípulo fiel.' },
      { emoji: '👥', title: 'Discipulado de los Creyentes', description: 'Discipulado de los creyentes para que sigan el llamado de Dios.' },
      { emoji: '🌍', title: 'Evangelización del Mundo', description: 'Evangelización del mundo para que todos conozcan a Cristo Jesús.' },
    ],
    col_items: [], cta_btn1_label: '', cta_btn1_href: '/', cta_btn2_label: '', cta_btn2_href: '/',
    stats: [], html: '', text_align: 'center',
    testimonials: [], gallery: [], team_members: [],
  },
  {
    id: 'default-2', type: 'columns',
    title: 'Quiénes Somos',
    subtitle: '',
    visible: true, order: 1, bg: 'white',
    color_bg: '', color_heading: '', color_text: '', color_accent: '',
    card_cols: 2, cards: [],
    col_items: [
      { title: '', body: '', image_url: '', btn_label: '', btn_href: '/' },
      {
        title: 'Quiénes Somos',
        body: '<p>Somos una iglesia comprometida con la Palabra de Dios, dedicada a formar discípulos de Cristo y a transformar vidas a través del poder del Espíritu Santo.</p><p>Creemos en una comunidad donde cada persona es bienvenida, amada y equipada para cumplir su llamado.</p>',
        image_url: '',
        btn_label: 'Conoce más',
        btn_href: '/p/quienes-somos',
      },
    ],
    cta_btn1_label: '', cta_btn1_href: '/', cta_btn2_label: '', cta_btn2_href: '/',
    stats: [], html: '', text_align: 'left',
    testimonials: [], gallery: [], team_members: [],
  },
  {
    id: 'default-3', type: 'stats',
    title: 'Nuestra Comunidad', subtitle: '',
    visible: true, order: 2, bg: 'light',
    color_bg: '', color_heading: '', color_text: '', color_accent: '',
    card_cols: 4, cards: [], col_items: [],
    cta_btn1_label: '', cta_btn1_href: '/', cta_btn2_label: '', cta_btn2_href: '/',
    stats: [
      { emoji: '🙏', value: '15+', label: 'Años de ministerio' },
      { emoji: '👨‍👩‍👧‍👦', value: '200+', label: 'Familias' },
      { emoji: '🎙️', value: '500+', label: 'Prédicas' },
      { emoji: '🌍', value: '3', label: 'Países' },
    ],
    html: '', text_align: 'center',
    testimonials: [], gallery: [], team_members: [],
  },
  {
    id: 'default-4', type: 'cta_banner',
    title: '¿Tienes preguntas?',
    subtitle: 'Nos encantaría saber de ti. Contáctanos para más información sobre nuestra iglesia y cómo puedes ser parte.',
    visible: true, order: 3, bg: 'primary',
    color_bg: '', color_heading: '', color_text: '', color_accent: '',
    card_cols: 3, cards: [], col_items: [],
    cta_btn1_label: 'Contactar', cta_btn1_href: '#contact',
    cta_btn2_label: 'Ver en Vivo', cta_btn2_href: '/live',
    stats: [], html: '', text_align: 'center',
    testimonials: [], gallery: [], team_members: [],
  },
];

const defaults: SiteConfigMap = {
  branding: { site_name: 'Ebenezer M.I.', logo_url: '', tagline: 'M.I.' },
  hero: {
    mode: 'text',
    prefix: 'Bienvenidos a',
    title: 'Iglesia Ebenezer M.I.',
    subtitle: 'Hasta aquí nos ha ayudado el Señor',
    bg_url: '', overlay: 0.55,
    buttons: [
      { label: 'Ver en Vivo', href: '/live', variant: 'primary' },
      { label: 'Prédicas', href: '/sermons', variant: 'secondary' },
    ],
    slides: [],
  },
  footer: {
    text: 'Una iglesia comprometida con la Palabra de Dios.',
    copyright: '© 2026 Iglesia Ebenezer M.I. Todos los derechos reservados.',
    colors: { bg: '#8D000A', heading: '#F5C842', body: '#d6d3d1', link: '#e7e5e4' },
    social: { facebook: '', youtube: '', instagram: '' },
    contact: { address: '', phone: '', email: '', whatsapp: '' },
    cta: { enabled: true, title: '¿Tienes preguntas?', subtitle: 'Estamos aquí para acompañarte. No estás solo/a.' },
    schedules: {
      enabled: true,
      items: [
        { day: 'Domingo', time: '9:00 AM', label: 'Culto Principal' },
        { day: 'Miércoles', time: '7:00 PM', label: 'Estudio Bíblico' },
        { day: 'Viernes', time: '7:30 PM', label: 'Culto de Jóvenes' },
      ],
    },
    widgets: defaultFooterWidgets,
  },
  seo: { title: 'Iglesia Ebenezer M.I.', description: '', og_image: '' },
  home_blocks: defaultBlocks,
};

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfigMap>(defaults);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    const { data } = await supabase.from('site_config').select('key, value');
    if (data) {
      const merged = structuredClone(defaults) as unknown as Record<string, unknown>;
      for (const row of data) {
        if (!(row.key in merged)) continue;
        const incoming = row.value as unknown;
        if (Array.isArray(incoming)) {
          merged[row.key] = incoming;
        } else if (typeof incoming === 'object' && incoming !== null) {
          const existing = merged[row.key] as Record<string, unknown>;
          const result: Record<string, unknown> = { ...existing, ...(incoming as object) };
          // deep-merge one level (objects only, not arrays)
          for (const [k, v] of Object.entries(incoming as Record<string, unknown>)) {
            if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
              result[k] = { ...(existing?.[k] as object ?? {}), ...(v as object) };
            } else if (Array.isArray(v)) {
              result[k] = v; // arrays replace entirely
            }
          }
          merged[row.key] = result;
        }
      }
      setConfig(merged as unknown as SiteConfigMap);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConfig();
    const channel = supabase
      .channel('site-config-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_config' }, fetchConfig)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateSection = async <K extends keyof SiteConfigMap>(key: K, value: SiteConfigMap[K]) => {
    const { error } = await supabase
      .from('site_config')
      .upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) throw error;
    await fetchConfig();
  };

  return { config, loading, updateSection };
}
