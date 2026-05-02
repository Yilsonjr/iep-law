import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import type { UserProfile, UserRole } from '../types';

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('display_name', { ascending: true });
    setUsers(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetch();

    const channel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetch)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateUserRole = async (id: string, role: UserRole) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) throw error;
  };

  const updateUserStatus = async (id: string, status: 'active' | 'inactive') => {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
    if (error) throw error;
  };

  return { users, loading, updateUserRole, updateUserStatus, refetch: fetch };
}
