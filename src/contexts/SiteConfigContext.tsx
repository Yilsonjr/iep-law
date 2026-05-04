import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useSiteConfig } from '../hooks/useSiteConfig';
import type { SiteConfigMap } from '../types';

interface SiteConfigContextType {
  config: SiteConfigMap;
  loading: boolean;
  updateSection: <K extends keyof SiteConfigMap>(key: K, value: SiteConfigMap[K]) => Promise<void>;
}

const SiteConfigContext = createContext<SiteConfigContextType | null>(null);

function useDynamicFavicon(logoUrl: string) {
  useEffect(() => {
    if (!logoUrl) return;
    const selectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
    ];
    selectors.forEach(sel => {
      const el = document.querySelector<HTMLLinkElement>(sel);
      if (el) el.href = logoUrl;
    });
  }, [logoUrl]);
}

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const value = useSiteConfig();
  useDynamicFavicon(value.config.branding.logo_url);
  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfigContext() {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) throw new Error('useSiteConfigContext must be used within SiteConfigProvider');
  return ctx;
}
