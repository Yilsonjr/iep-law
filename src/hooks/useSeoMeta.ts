import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteConfigContext } from '../contexts/SiteConfigContext';
import { setDocMeta } from '../utils';

export function useSeoMeta() {
  const { config } = useSiteConfigContext();
  const { seo, branding } = config;
  const location = useLocation();

  useEffect(() => {
    const title = seo.title || branding.site_name;
    const description = seo.description || '';
    const image = seo.og_image || `${window.location.origin}/android-chrome-512x512.png`;

    document.title = title;

    if (description) setDocMeta('description', description);
    setDocMeta('og:title', title, true);
    if (description) setDocMeta('og:description', description, true);
    setDocMeta('og:image', image, true);
    setDocMeta('og:type', 'website', true);
    setDocMeta('og:url', window.location.href, true);
    setDocMeta('og:site_name', branding.site_name, true);
    setDocMeta('twitter:card', 'summary_large_image');
    setDocMeta('twitter:title', title);
    if (description) setDocMeta('twitter:description', description);
    setDocMeta('twitter:image', image);
  }, [seo, branding.site_name, location.pathname]);
}
