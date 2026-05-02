import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import type { LiveStreamConfig } from '../types';

const defaultConfig: LiveStreamConfig = {
  is_live: false,
  stream_url: '',
  title: '',
  speaker: '',
  description: '',
  viewer_count: 0,
};

export function useLiveStream() {
  const [config, setConfig] = useState<LiveStreamConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase
      .from('live_stream')
      .select('*')
      .eq('id', 1)
      .single();
    setConfig(data ?? defaultConfig);
    setLoading(false);
  };

  useEffect(() => {
    fetch();

    const channel = supabase
      .channel('live-stream-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_stream' }, fetch)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateConfig = async (data: Partial<LiveStreamConfig>) => {
    const { error } = await supabase
      .from('live_stream')
      .upsert({ id: 1, ...config, ...data, updated_at: new Date().toISOString() });
    if (error) throw error;
  };

  return { config, loading, updateConfig };
}
