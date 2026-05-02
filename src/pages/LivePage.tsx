import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Users, Clock, FileText, Radio, Settings, X } from 'lucide-react';
import { useLiveStream } from '../hooks/useLiveStream';
import { useAuth } from '../contexts/AuthContext';

export function LivePage() {
  const { config, loading, updateConfig } = useLiveStream();
  const { profile, canGoLive } = useAuth();
  const [notes, setNotes] = useState('');
  const [adminOpen, setAdminOpen] = useState(false);
  const [draftConfig, setDraftConfig] = useState({ ...config });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sermon-live-notes');
    if (saved) setNotes(saved);
  }, []);

  useEffect(() => {
    setDraftConfig({ ...config });
  }, [config]);

  const saveNotes = () => localStorage.setItem('sermon-live-notes', notes);

  const handleAdminSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateConfig({ ...draftConfig, updated_by: profile?.id, updated_at: new Date().toISOString() });
      setAdminOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleLive = async () => {
    await updateConfig({
      is_live: !config.is_live,
      updated_by: profile?.id,
      updated_at: new Date().toISOString(),
      ...(!config.is_live ? { start_time: new Date().toISOString() } : {}),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <section className={`py-12 text-white transition-colors duration-500 ${config.is_live ? 'bg-gradient-to-br from-primary to-primary-700' : 'bg-stone-700'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {config.is_live ? (
                <>
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500" />
                  </span>
                  <span className="font-semibold text-lg">EN VIVO</span>
                  <span className="text-stone-300">•</span>
                  <span className="flex items-center gap-2">
                    <Users size={18} />
                    {config.viewer_count} espectadores
                  </span>
                </>
              ) : (
                <>
                  <Radio size={20} className="text-stone-400" />
                  <span className="font-semibold text-lg text-stone-300">Sin transmisión activa</span>
                </>
              )}
            </div>

            {canGoLive && (
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleLive}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    config.is_live
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  <Radio size={18} />
                  {config.is_live ? 'Terminar Live' : 'Iniciar Live'}
                </button>
                <button
                  onClick={() => setAdminOpen(true)}
                  className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                  title="Configurar stream"
                >
                  <Settings size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Player */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-stone-900 rounded-2xl overflow-hidden aspect-video relative"
              >
                {config.is_live && config.stream_url ? (
                  <iframe
                    src={config.stream_url.includes('youtube.com/watch')
                      ? config.stream_url.replace('watch?v=', 'embed/') + '?autoplay=1'
                      : config.stream_url}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                    title="Live Stream"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    {config.is_live ? (
                      <>
                        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
                          <Play size={48} className="text-white ml-2" />
                        </div>
                        <h2 className="font-serif text-3xl mb-2">{config.title || 'Culto en Vivo'}</h2>
                        <p className="text-stone-300">{config.speaker}</p>
                      </>
                    ) : (
                      <>
                        <Radio size={64} className="text-stone-600 mb-4" />
                        <h2 className="font-serif text-2xl text-stone-400 mb-2">Sin transmisión activa</h2>
                        <p className="text-stone-500 text-center max-w-sm">
                          La próxima transmisión en vivo aparecerá aquí automáticamente.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </motion.div>

              {config.is_live && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-6 bg-white rounded-2xl shadow-md p-6"
                >
                  <h2 className="font-serif text-2xl text-primary mb-2">{config.title}</h2>
                  <p className="text-stone-500 mb-1">{config.speaker}</p>
                  {config.start_time && (
                    <div className="flex items-center gap-2 text-stone-400 text-sm mb-4">
                      <Clock size={14} />
                      Inició: {new Date(config.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                  {config.description && (
                    <p className="text-stone-600 leading-relaxed">{config.description}</p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-md p-6 sticky top-24"
              >
                <div className="flex items-center gap-3 mb-6">
                  <FileText size={24} className="text-gold" />
                  <h3 className="font-serif text-xl text-primary">Mis Notas</h3>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={saveNotes}
                  placeholder="Escribe tus notas aquí mientras escuchas..."
                  className="w-full h-64 p-4 border border-stone-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-gold text-stone-700 placeholder-stone-400"
                />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-stone-400">{notes.length} caracteres</span>
                  <button onClick={saveNotes} className="text-gold text-sm font-medium hover:underline">
                    Guardar notas
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal admin */}
      {adminOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setAdminOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full p-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-primary">Configurar Stream</h2>
              <button onClick={() => setAdminOpen(false)} className="p-2 hover:bg-stone-100 rounded-lg">
                <X size={24} className="text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleAdminSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Título del Culto</label>
                <input
                  type="text"
                  value={draftConfig.title}
                  onChange={e => setDraftConfig({ ...draftConfig, title: e.target.value })}
                  placeholder="Culto Dominical"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Predicador</label>
                <input
                  type="text"
                  value={draftConfig.speaker}
                  onChange={e => setDraftConfig({ ...draftConfig, speaker: e.target.value })}
                  placeholder="Pastor Roberto Mendoza"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">URL del Stream (YouTube Live, etc.)</label>
                <input
                  type="url"
                  value={draftConfig.stream_url}
                  onChange={e => setDraftConfig({ ...draftConfig, stream_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Descripción</label>
                <textarea
                  value={draftConfig.description}
                  onChange={e => setDraftConfig({ ...draftConfig, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setAdminOpen(false)} className="flex-1 btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-60">
                  {saving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
