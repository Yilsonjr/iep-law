import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import type { Page } from '../types';

export function usePages(publishedOnly = false) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    let q = supabase.from('pages').select('*').order('nav_order', { ascending: true });
    if (publishedOnly) q = q.eq('published', true);
    const { data } = await q;
    setPages(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel('pages-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pages' }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [publishedOnly]);

  const addPage = async (page: Omit<Page, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase.from('pages').insert(page);
    if (error) throw error;
  };

  const updatePage = async (id: string, data: Partial<Omit<Page, 'id' | 'created_at'>>) => {
    const { error } = await supabase
      .from('pages')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  };

  const deletePage = async (id: string) => {
    const { error } = await supabase.from('pages').delete().eq('id', id);
    if (error) throw error;
  };

  const getBySlug = async (slug: string): Promise<Page | null> => {
    const { data } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();
    return data as Page | null;
  };

  const navPages = pages.filter(p => p.published && p.show_in_nav);

  return { pages, navPages, loading, addPage, updatePage, deletePage, getBySlug };
}
