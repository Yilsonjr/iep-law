import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Video, Calendar, BookOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { cn } from '../utils';

interface SearchResult {
  id: string;
  type: 'sermon' | 'event' | 'post';
  title: string;
  subtitle: string;
  href: string;
}

const typeConfig = {
  sermon: { icon: Video, label: 'Prédica', color: 'text-primary bg-primary/10' },
  event:  { icon: Calendar, label: 'Evento', color: 'text-gold bg-gold/10' },
  post:   { icon: BookOpen, label: 'Post', color: 'text-purple-600 bg-purple-50' },
};

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelected(0);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(doSearch, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const doSearch = async () => {
    setSearching(true);
    const q = `%${query}%`;
    const [sermonsRes, eventsRes, postsRes] = await Promise.all([
      supabase.from('sermons').select('id,title,speaker,category').ilike('title', q).eq('published', true).limit(4),
      supabase.from('church_events').select('id,title,type,date').ilike('title', q).limit(4),
      supabase.from('posts').select('id,title,category,author_name').ilike('title', q).eq('published', true).limit(4),
    ]);

    const out: SearchResult[] = [
      ...(sermonsRes.data ?? []).map(s => ({
        id: s.id, type: 'sermon' as const,
        title: s.title, subtitle: s.speaker,
        href: '/sermons',
      })),
      ...(eventsRes.data ?? []).map(e => ({
        id: e.id, type: 'event' as const,
        title: e.title,
        subtitle: new Date(e.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }),
        href: '/events',
      })),
      ...(postsRes.data ?? []).map(p => ({
        id: p.id, type: 'post' as const,
        title: p.title, subtitle: p.author_name,
        href: '/posts',
      })),
    ];
    setResults(out);
    setSelected(0);
    setSearching(false);
  };

  const goTo = (href: string) => {
    navigate(href);
    onClose();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && results[selected]) { goTo(results[selected].href); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-20 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-stone-100">
              <Search size={20} className="text-stone-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Buscar prédicas, eventos, posts..."
                className="flex-1 text-stone-800 placeholder-stone-400 focus:outline-none text-base"
              />
              {query && (
                <button onClick={() => setQuery('')} className="p-1 hover:bg-stone-100 rounded-lg">
                  <X size={16} className="text-stone-400" />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-2 py-1 text-xs bg-stone-100 text-stone-500 rounded border border-stone-200">Esc</kbd>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {searching && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                </div>
              )}

              {!searching && query && results.length === 0 && (
                <div className="text-center py-10 text-stone-400">
                  <Search size={32} className="mx-auto mb-3 opacity-30" />
                  <p>Sin resultados para <span className="text-stone-600 font-medium">"{query}"</span></p>
                </div>
              )}

              {!searching && results.length > 0 && (
                <div className="py-2">
                  {results.map((r, i) => {
                    const { icon: Icon, label, color } = typeConfig[r.type];
                    return (
                      <button
                        key={r.id}
                        onClick={() => goTo(r.href)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors text-left',
                          i === selected && 'bg-stone-50'
                        )}
                      >
                        <span className={cn('flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center', color)}>
                          <Icon size={15} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-stone-800 truncate">{r.title}</p>
                          <p className="text-xs text-stone-400 truncate">{label} · {r.subtitle}</p>
                        </div>
                        <ChevronRight size={16} className="text-stone-300 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}

              {!query && (
                <div className="px-4 py-6 text-center text-stone-400 text-sm">
                  <p>Escribe para buscar en prédicas, eventos y comunidad</p>
                  <p className="mt-2 text-xs">↑↓ navegar · Enter seleccionar · Esc cerrar</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
