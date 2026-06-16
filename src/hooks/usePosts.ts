import { useState, useEffect } from 'react';
import {
  supabase
} from '../config/supabase';
import type { Post } from '../types';

export function usePosts(showAll = false) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    let q = supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!showAll) q = q.eq('published', true);
    const { data } = await q;
    setPosts(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetch();

    const channel = supabase
      .channel('posts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetch)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [showAll]);

  const addPost = async (post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post> => {
    const { data, error } = await supabase.from('posts').insert(post).select().single();
    if (error) throw error;
    await fetch();
    return data as Post;
  };

  const updatePost = async (id: string, data: Partial<Omit<Post, 'id' | 'created_at'>>) => {
    const { error } = await supabase
      .from('posts')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    await fetch();
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
    await fetch();
  };

  const approvePost = async (id: string) => {
    await updatePost(id, { published: true });
  };

  return { posts, loading, addPost, updatePost, deletePost, approvePost, refetch: fetch };
}
