import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import type { SiteConfigMap, HomeBlock } from '../types';

const defaultBlocks: HomeBlock[] = [
  {
    id: 'default-1',
    type: 'cards',
    title: 'Nuestra Misión',
    subtitle: 'Hacer discípulos de Cristo, formando comunidades de fe donde cada persona pueda crecer espiritualmente.',
    visible: true,
    order: 0,
    bg: 'white',
    card_cols: 3,
    cards: [
      { emoji: '❤️', title: 'Comunidad', description: 'Un lugar donde cada persona es bienvenida y valorada.' },
      { emoji: '✝️', title: 'Adoración', description: 'Celebramos a Dios con alegría y reverencia en cada servicio.' },
      { emoji: '👥', title: 'Discipulado', description: 'Crecemos juntos en la Palabra para transformar vidas.' },
    ],
    col_items: [],
    cta_btn1_label: '',
    cta_btn1_href: '/',
    cta_btn2_label: '',
    cta_btn2_href: '/',
    stats: [],
    html: '',
    text_align: 'center',
  },
  {
    id: 'default-2',
    type: 'stats',
    title: 'Nuestra Comunidad',
    subtitle: '',
    visible: true,
    order: 1,
    bg: 'light',
    card_cols: 3,
    cards: [],
    col_items: [],
    cta_btn1_label: '',
    cta_btn1_href: '/',
    cta_btn2_label: '',
    cta_btn2_href: '/',
    stats: [
      { emoji: '🙏', value: '15+', label: 'Años de ministerio' },
      { emoji: '👨‍👩‍👧‍👦', value: '200+', label: 'Familias' },
      { emoji: '🎙️', value: '500+', label: 'Prédicas' },
      { emoji: '🌍', value: '3', label: 'Países' },
    ],
    html: '',
    text_align: 'center',
  },
  {
    id: 'default-3',
    type: 'cta_banner',
    title: '¿Tienes preguntas?',
    subtitle: 'Nos encantaría saber de ti. Contáctanos para más información sobre nuestra iglesia.',
    visible: true,
    order: 2,
    bg: 'primary',
    card_cols: 3,
    cards: [],
    col_items: [],
    cta_btn1_label: 'Contactar',
    cta_btn1_href: '#contact',
    cta_btn2_label: 'Ver en Vivo',
    cta_btn2_href: '/live',
    stats: [],
    html: '',
    text_align: 'center',
  },
];

const defaults: SiteConfigMap = {
  branding: { site_name: 'Ebenezer M.I.', logo_url: '', tagline: 'M.I.' },
  hero: {
    mode: 'text',
    title: 'Iglesia Ebenezer M.I.',
    subtitle: 'Hasta aquí nos ha ayudado el Señor',
    bg_url: '',
    overlay: 0.5,
    buttons: [
      { label: 'Ver en Vivo', href: '/live', variant: 'primary' },
      { label: 'Prédicas', href: '/sermons', variant: 'secondary' },
    ],
    slides: [],
  },
  footer: {
    text: 'Una iglesia comprometida con la Palabra de Dios.',
    copyright: '© 2026 Iglesia Ebenezer M.I. Todos los derechos reservados.',
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
    sections: { show_contact: true, show_links: true, show_social: true },
    colors: { bg: '#8D000A', heading: '#F5C842', body: '#d6d3d1', link: '#e7e5e4' },
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
          const deepMerged: Record<string, unknown> = { ...existing, ...(incoming as object) };
          for (const [k, v] of Object.entries(incoming as Record<string, unknown>)) {
            if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
              deepMerged[k] = { ...(existing?.[k] as object ?? {}), ...(v as object) };
            }
          }
          merged[row.key] = deepMerged;
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

  const updateSection = async <K extends keyof SiteConfigMap>(
    key: K,
    value: SiteConfigMap[K]
  ) => {
    const { error } = await supabase
      .from('site_config')
      .upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) throw error;
  };

  return { config, loading, updateSection };
}
