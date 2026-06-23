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
    const { data, error } = await supabase
      .from('profiles').update({ role }).eq('id', id).select('id');
    if (error) throw error;
    if (!data || data.length === 0)
      throw new Error('RLS_BLOCKED');
  };

  const updateUserStatus = async (id: string, status: 'active' | 'inactive') => {
    const { data, error } = await supabase
      .from('profiles').update({ status }).eq('id', id).select('id');
    if (error) throw error;
    if (!data || data.length === 0)
      throw new Error('RLS_BLOCKED');
  };

  const createUser = async (input: {
    email: string;
    password: string;
    display_name: string;
    role: UserRole;
    status?: 'active' | 'inactive';
    phone?: string;
    address?: string;
  }) => {
    const { email, password, display_name, role, status = 'active', phone, address } = input;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name } },
    });
    if (error) throw error;
    if (!data.user) throw new Error('No se pudo crear el usuario.');

    const updates: Record<string, string> = { role, status };
    if (phone?.trim()) updates.phone = phone.trim();
    if (address?.trim()) updates.address = address.trim();

    const { error: profileError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', data.user.id);
    if (profileError) throw profileError;

    await fetch();
  };

  return { users, loading, updateUserRole, updateUserStatus, createUser, refetch: fetch };
}
