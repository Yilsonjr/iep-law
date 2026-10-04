import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import type { GalleryAlbum } from '../types';

export const CREATE_GALLERY_SQL = `
-- Run once in Supabase SQL Editor to create the gallery tables

create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_image_url text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references public.gallery_albums(id) on delete set null,
  image_url text not null,
  title text,
  description text,
  alt_text text,
  sort_order integer default 0,
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.gallery_albums enable row level security;
alter table public.gallery_images enable row level security;

-- Public: read active albums
create policy "gallery_albums_public_read"
  on public.gallery_albums for select
  using (is_active = true);

-- Admin: full access to albums
create policy "gallery_albums_admin_all"
  on public.gallery_albums for all
  to authenticated
  using (true)
  with check (true);

-- Public: read active images of active albums
create policy "gallery_images_public_read"
  on public.gallery_images for select
  using (
    is_active = true
    and (
      album_id is null
      or exists (
        select 1 from public.gallery_albums a
        where a.id = gallery_images.album_id and a.is_active = true
      )
    )
  );

-- Admin: full access to images
create policy "gallery_images_admin_all"
  on public.gallery_images for all
  to authenticated
  using (true)
  with check (true);
`;

export function useGalleryAlbums(activeOnly = true) {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    let q = supabase
      .from('gallery_albums')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (activeOnly) q = q.eq('is_active', true);
    const { data } = await q;
    setAlbums(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel('gallery-albums-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_albums' }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeOnly]);

  const addAlbum = async (album: Omit<GalleryAlbum, 'id' | 'created_at' | 'updated_at'>): Promise<GalleryAlbum> => {
    const { data, error } = await supabase
      .from('gallery_albums')
      .insert(album)
      .select()
      .single();
    if (error) throw error;
    await fetch();
    return data;
  };

  const updateAlbum = async (id: string, data: Partial<Omit<GalleryAlbum, 'id' | 'created_at'>>) => {
    const { error } = await supabase
      .from('gallery_albums')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    await fetch();
  };

  const deleteAlbum = async (id: string) => {
    const { error } = await supabase.from('gallery_albums').delete().eq('id', id);
    if (error) throw error;
    await fetch();
  };

  return { albums, loading, addAlbum, updateAlbum, deleteAlbum, refetch: fetch };
}
