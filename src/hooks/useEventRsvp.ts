import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export function useEventRsvp(eventId: string, userId?: string) {
  const [count, setCount] = useState(0);
  const [hasRsvp, setHasRsvp] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    const { count: total } = await supabase
      .from('event_rsvp')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);
    setCount(total ?? 0);

    if (userId) {
      const { data } = await supabase
        .from('event_rsvp')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();
      setHasRsvp(!!data);
    }
  };

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel(`rsvp-${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_rsvp', filter: `event_id=eq.${eventId}` }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [eventId, userId]);

  const toggleRsvp = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      if (hasRsvp) {
        await supabase.from('event_rsvp').delete().eq('event_id', eventId).eq('user_id', userId);
      } else {
        await supabase.from('event_rsvp').insert({ event_id: eventId, user_id: userId });
      }
      await fetch();
    } finally {
      setLoading(false);
    }
  };

  return { count, hasRsvp, loading, toggleRsvp };
}
