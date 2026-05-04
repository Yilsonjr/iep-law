import { useEffect } from 'react';
import { useSiteConfigContext } from '../contexts/SiteConfigContext';

export function useSeoMeta() {
  const { config } = useSiteConfigContext();
  const { seo, branding } = config;

  useEffect(() => {
    const title = seo.title || branding.site_name;
    document.title = title;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (seo.description) setMeta('description', seo.description);
    setMeta('og:title', title, true);
    if (seo.description) setMeta('og:description', seo.description, true);
    if (seo.og_image) setMeta('og:image', seo.og_image, true);
    setMeta('og:type', 'website', true);
  }, [seo, branding.site_name]);
}
