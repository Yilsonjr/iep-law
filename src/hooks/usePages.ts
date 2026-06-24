import { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import type { Page } from '../types';

export function usePages(publishedOnly = false) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  // Unique channel name per hook instance to avoid Supabase "already subscribed" error
  const channelId = useRef(`pages-${Math.random().toString(36).slice(2)}`);

  const fetch = async () => {
    let q = supabase.from('pages').select('*').order('nav_order', { ascending: true });
    if (publishedOnly) q = q.eq('published', true);
    const { data, error } = await q;
    if (error) {
      setDbError(error.message);
    } else {
      setPages(data ?? []);
      setDbError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel(channelId.current)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pages' }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [publishedOnly]);

  const addPage = async (page: Omit<Page, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase.from('pages').insert(page);
    if (error) throw error;
    await fetch();
  };

  const updatePage = async (id: string, data: Partial<Omit<Page, 'id' | 'created_at'>>) => {
    const { error } = await supabase
      .from('pages')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    await fetch();
  };

  const deletePage = async (id: string) => {
    const { error } = await supabase.from('pages').delete().eq('id', id);
    if (error) throw error;
    await fetch();
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

  return { pages, navPages, loading, dbError, addPage, updatePage, deletePage, getBySlug };
}
