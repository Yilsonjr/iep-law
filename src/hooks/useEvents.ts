import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import type { ChurchEvent } from '../types';

export function useEvents() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    setEvents(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetch();

    const channel = supabase
      .channel('events-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, fetch)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const addEvent = async (event: Omit<ChurchEvent, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('events').insert(event);
    if (error) throw error;
    await fetch();
  };

  const updateEvent = async (id: string, data: Partial<Omit<ChurchEvent, 'id' | 'created_at'>>) => {
    const { error } = await supabase.from('events').update(data).eq('id', id);
    if (error) throw error;
    await fetch();
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
    await fetch();
  };

  return { events, loading, addEvent, updateEvent, deleteEvent, refetch: fetch };
}
