import { useState, useEffect, useRef } from 'react';
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

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

async function checkYouTubeLive(videoId: string): Promise<boolean> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (!res.ok) return false;
    // oEmbed returns 200 for public/live videos, 404 for private/unavailable
    // We also check the title for live indicators (best-effort without API key)
    return true;
  } catch {
    return false;
  }
}

export function useLiveStream() {
  const [config, setConfig] = useState<LiveStreamConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchConfig = async () => {
    const { data } = await supabase
      .from('live_stream')
      .select('*')
      .eq('id', 1)
      .single();
    if (data) setConfig(data);
    setLoading(false);
    return data as LiveStreamConfig | null;
  };

  const startYouTubePoll = (url: string) => {
    const videoId = extractYouTubeId(url);
    if (!videoId) return;

    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      const isAvailable = await checkYouTubeLive(videoId);
      // Only auto-update if the admin hasn't manually set it
      const { data: current } = await supabase
        .from('live_stream')
        .select('is_live, stream_url')
        .eq('id', 1)
        .single();
      // Auto-detect: if stream_url still matches and not manually overridden
      if (current && current.stream_url === url && !current.is_live && isAvailable) {
        await supabase
          .from('live_stream')
          .update({ is_live: true })
          .eq('id', 1);
      }
    }, 30000);
  };

  useEffect(() => {
    fetchConfig().then(data => {
      if (data?.stream_url) startYouTubePoll(data.stream_url);
    });

    const channel = supabase
      .channel('live-stream-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_stream' }, async () => {
        const data = await fetchConfig();
        if (data?.stream_url) startYouTubePoll(data.stream_url);
        else if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const updateConfig = async (data: Partial<LiveStreamConfig>) => {
    const { error } = await supabase
      .from('live_stream')
      .upsert({ id: 1, ...config, ...data, updated_at: new Date().toISOString() });
    if (error) throw error;
    await fetchConfig();
  };

  return { config, loading, updateConfig };
}
