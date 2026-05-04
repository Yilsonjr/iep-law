import { createContext, useContext, type ReactNode } from 'react';
import { useSiteConfig } from '../hooks/useSiteConfig';
import type { SiteConfigMap } from '../types';

interface SiteConfigContextType {
  config: SiteConfigMap;
  loading: boolean;
  updateSection: <K extends keyof SiteConfigMap>(key: K, value: SiteConfigMap[K]) => Promise<void>;
}

const SiteConfigContext = createContext<SiteConfigContextType | null>(null);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const value = useSiteConfig();
  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfigContext() {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) throw new Error('useSiteConfigContext must be used within SiteConfigProvider');
  return ctx;
}
