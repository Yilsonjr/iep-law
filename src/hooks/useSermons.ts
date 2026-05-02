import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import type { Sermon } from '../types';

export function useSermons(publishedOnly = true) {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    let q = supabase.from('sermons').select('*').order('date', { ascending: false });
    if (publishedOnly) q = q.eq('published', true);
    const { data } = await q;
    setSermons(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetch();

    const channel = supabase
      .channel('sermons-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sermons' }, fetch)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [publishedOnly]);

  const addSermon = async (sermon: Omit<Sermon, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('sermons').insert(sermon);
    if (error) throw error;
  };

  const updateSermon = async (id: string, data: Partial<Omit<Sermon, 'id' | 'created_at'>>) => {
    const { error } = await supabase.from('sermons').update(data).eq('id', id);
    if (error) throw error;
  };

  const deleteSermon = async (id: string) => {
    const { error } = await supabase.from('sermons').delete().eq('id', id);
    if (error) throw error;
  };

  return { sermons, loading, addSermon, updateSermon, deleteSermon, refetch: fetch };
}
