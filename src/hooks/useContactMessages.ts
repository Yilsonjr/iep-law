import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import type { ContactMessage } from '../types';

export function useContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setMessages(data as ContactMessage[]);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel('contact-messages-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendMessage = async (data: Omit<ContactMessage, 'id' | 'read' | 'created_at'>) => {
    const { error } = await supabase.from('contact_messages').insert({ ...data, read: false });
    if (error) throw error;
  };

  const markRead = async (id: string) => {
    await supabase.from('contact_messages').update({ read: true }).eq('id', id);
  };

  const deleteMessage = async (id: string) => {
    await supabase.from('contact_messages').delete().eq('id', id);
  };

  const unread = messages.filter(m => !m.read).length;

  return { messages, loading, sendMessage, markRead, deleteMessage, unread };
}
