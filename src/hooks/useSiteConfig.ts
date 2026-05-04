import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import type { SiteConfigMap } from '../types';

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
    contact: { address: '', phone: '', email: '' },
  },
  seo: { title: 'Iglesia Ebenezer M.I.', description: '', og_image: '' },
};

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfigMap>(defaults);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase.from('site_config').select('key, value');
    if (data) {
      const merged = { ...defaults };
      for (const row of data) {
        if (row.key in merged) {
          (merged as Record<string, unknown>)[row.key] = {
            ...(merged as Record<string, unknown>)[row.key] as object,
            ...row.value as object,
          };
        }
      }
      setConfig(merged);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel('site-config-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_config' }, fetch)
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
