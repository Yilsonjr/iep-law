import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import type { GalleryImage } from '../types';

interface UseGalleryImagesOptions {
  albumId?: string | null;
  featuredOnly?: boolean;
  activeOnly?: boolean;
  limit?: number;
}

export function useGalleryImages(options: UseGalleryImagesOptions = {}) {
  const { albumId, featuredOnly = false, activeOnly = true, limit } = options;

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    let q = supabase
      .from('gallery_images')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (albumId) q = q.eq('album_id', albumId);
    if (activeOnly) q = q.eq('is_active', true);
    if (featuredOnly) q = q.eq('is_featured', true);
    if (limit) q = q.limit(limit);
    const { data } = await q;
    setImages(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
    const channelKey = `gallery-images-${albumId ?? 'all'}-${featuredOnly ? 'feat' : 'all'}`;
    const channel = supabase
      .channel(channelKey)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_images' }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [albumId, featuredOnly, activeOnly, limit]);

  const addImage = async (image: Omit<GalleryImage, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase.from('gallery_images').insert(image);
    if (error) throw error;
    await fetch();
  };

  const updateImage = async (id: string, data: Partial<Omit<GalleryImage, 'id' | 'created_at'>>) => {
    const { error } = await supabase
      .from('gallery_images')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    await fetch();
  };

  const deleteImage = async (id: string) => {
    const { error } = await supabase.from('gallery_images').delete().eq('id', id);
    if (error) throw error;
    await fetch();
  };

  return { images, loading, addImage, updateImage, deleteImage, refetch: fetch };
}
