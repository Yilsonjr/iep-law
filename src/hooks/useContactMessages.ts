import { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import type { ContactMessage } from '../types';

export const CREATE_CONTACT_MESSAGES_SQL = `-- Ejecuta esto en Supabase → SQL Editor
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
-- Cualquier visitante puede enviar mensajes
CREATE POLICY "public_insert_contact_messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);
-- Solo admins/pastores pueden leer y gestionar mensajes
CREATE POLICY "admins_read_contact_messages" ON public.contact_messages
  FOR SELECT TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin','pastor','leader'));
CREATE POLICY "admins_manage_contact_messages" ON public.contact_messages
  FOR ALL TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin','pastor'));`;

export function useContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const channelName = useRef(`contact-messages-${Math.random().toString(36).slice(2)}`);

  const fetch = async () => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setDbError(error.message);
    } else {
      if (data) setMessages(data as ContactMessage[]);
      setDbError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel(channelName.current)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendMessage = async (data: Omit<ContactMessage, 'id' | 'read' | 'created_at'>) => {
    const { error } = await supabase.from('contact_messages').insert({ ...data, read: false });
    if (error) throw error;
    await fetch();
  };

  const markRead = async (id: string) => {
    await supabase.from('contact_messages').update({ read: true }).eq('id', id);
    await fetch();
  };

  const deleteMessage = async (id: string) => {
    await supabase.from('contact_messages').delete().eq('id', id);
    await fetch();
  };

  const unread = messages.filter(m => !m.read).length;

  return { messages, loading, dbError, sendMessage, markRead, deleteMessage, unread };
}
