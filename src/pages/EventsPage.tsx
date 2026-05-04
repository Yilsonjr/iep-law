import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight, Filter, Plus, Edit2, Trash2, X, ChevronDown } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../contexts/AuthContext';
import { RsvpButton } from '../components/RsvpButton';
import type { ChurchEvent, EventType } from '../types';
import { cn } from '../utils';

const eventTypes: { id: EventType | 'all'; label: string; color: string }[] = [
  { id: 'all', label: 'Todos', color: 'bg-stone-500' },
  { id: 'service', label: 'Servicios', color: 'bg-primary' },
  { id: 'bible-study', label: 'Estudio Bíblico', color: 'bg-gold' },
  { id: 'youth', label: 'Juventud', color: 'bg-blue-500' },
  { id: 'outreach', label: 'Evangelismo', color: 'bg-green-500' },
  { id: 'celebration', label: 'Celebración', color: 'bg-purple-500' },
  { id: 'encounter', label: 'Encuentro', color: 'bg-orange-500' },
];

const typeColors: Record<string, string> = {
  service: 'bg-primary',
  'bible-study': 'bg-gold',
  youth: 'bg-blue-500',
  outreach: 'bg-green-500',
  celebration: 'bg-purple-500',
  encounter: 'bg-orange-500',
};

const typeLabels: Record<string, string> = {
  service: 'Servicio',
  'bible-study': 'Estudio',
  youth: 'Juventud',
  outreach: 'Evangelismo',
  celebration: 'Celebración',
  encounter: 'Encuentro',
};

const emptyForm = (): Omit<ChurchEvent, 'id' | 'created_at'> => ({
  title: '',
  date: new Date().toISOString().split('T')[0],
  time: '10:00 AM',
  location: '',
  description: '',
  type: 'service',
  author_id: '',
  published_at: undefined,
});

export function EventsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const { profile, canCreateContent, canEditContent } = useAuth();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lastDay = new Date(year, month + 1, 0).getDay();
  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const filtered = selectedType === 'all' ? events : events.filter(e => e.type === selectedType);
  const upcoming = filtered
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const openCreate = () => {
    setEditingEvent(null);
    setForm({ ...emptyForm(), author_id: profile!.id });
    setModalOpen(true);
  };

  const openEdit = (ev: ChurchEvent) => {
    setEditingEvent(ev);
    setForm({
      title: ev.title,
      date: ev.date,
      time: ev.time,
      location: ev.location,
      description: ev.description,
      type: ev.type,
      author_id: ev.author_id,
      published_at: ev.published_at,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, form);
      } else {
        await addEvent(form);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este evento?')) return;
    await deleteEvent(id);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-center md:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-serif text-4xl md:text-5xl font-bold mb-4"
              >
                Calendario de Eventos
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-stone-300 text-lg"
              >
                Mantente informado sobre las actividades de la iglesia
              </motion.p>
            </div>
            {canCreateContent && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={openCreate}
                className="flex items-center gap-2 bg-gold text-primary font-semibold px-6 py-3 rounded-xl hover:bg-gold/90 transition-colors shadow-lg self-start md:self-auto"
              >
                <Plus size={20} />
                Nuevo Evento
              </motion.button>
            )}
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-stone-600">
              <Filter size={18} />
              <span className="font-medium text-sm">Filtrar:</span>
            </div>
            {eventTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                  selectedType === type.id ? 'bg-primary text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                )}
              >
                <span className={cn('w-2 h-2 rounded-full', selectedType === type.id ? 'bg-white' : type.color)} />
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendario */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-stone-100 rounded-lg">
                    <ChevronLeft size={24} className="text-stone-600" />
                  </button>
                  <h3 className="font-serif text-2xl text-primary capitalize">{monthName}</h3>
                  <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-stone-100 rounded-lg">
                    <ChevronRight size={24} className="text-stone-600" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                    <div key={d} className="text-center text-sm font-medium text-stone-500 py-2">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayEvents = getEventsForDay(day);
                    const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                    return (
                      <div
                        key={day}
                        className={cn('aspect-square p-1 rounded-lg', dayEvents.length > 0 ? 'bg-stone-50' : '', isToday ? 'ring-2 ring-gold' : '')}
                      >
                        <div className={cn('text-sm font-medium mb-1', isToday ? 'text-gold' : 'text-stone-600')}>{day}</div>
                        {dayEvents.slice(0, 2).map(ev => (
                          <div
                            key={ev.id}
                            className={cn('text-xs text-white rounded px-1 py-0.5 truncate cursor-pointer', typeColors[ev.type])}
                            onClick={() => setSelectedEvent(ev)}
                          >
                            {ev.time.split(' ')[0]}
                          </div>
                        ))}
                        {dayEvents.length > 2 && <div className="text-xs text-stone-400 px-1">+{dayEvents.length - 2}</div>}
                      </div>
                    );
                  })}
                  {Array.from({ length: 6 - lastDay }).map((_, i) => <div key={`ee${i}`} className="aspect-square" />)}
                </div>
              </motion.div>
            </div>

            {/* Próximos eventos */}
            <div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex items-center gap-2 mb-6">
                  <Calendar size={24} className="text-gold" />
                  <h3 className="font-serif text-2xl text-primary">Próximos Eventos</h3>
                </div>
                {upcoming.length === 0 ? (
                  <div className="text-center py-10 text-stone-400">
                    <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No hay eventos próximos</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcoming.map((ev, index) => (
                      <motion.div
                        key={ev.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.07 }}
                        className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className={cn('text-xs font-bold text-white px-2 py-1 rounded', typeColors[ev.type])}>
                            {typeLabels[ev.type]}
                          </span>
                          <div className="flex items-center gap-1 ml-2">
                            {canEditContent(ev.author_id) && (
                              <>
                                <button onClick={() => openEdit(ev)} className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors">
                                  <Edit2 size={14} className="text-stone-500" />
                                </button>
                                <button onClick={() => handleDelete(ev.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 size={14} className="text-red-500" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <h4
                          className="font-serif text-lg text-primary mb-2 cursor-pointer hover:text-gold transition-colors"
                          onClick={() => setSelectedEvent(ev)}
                        >
                          {ev.title}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-stone-500">
                          <span className="flex items-center gap-1"><Clock size={14} />{ev.time}</span>
                          <span className="flex items-center gap-1"><MapPin size={14} />{ev.location}</span>
                        </div>
                        <div className="text-xs text-stone-400 mt-2">
                          {new Date(ev.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                        <div className="mt-3 flex justify-end">
                          <RsvpButton eventId={ev.id} userId={profile?.id} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal detalle */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full p-8"
              onClick={e => e.stopPropagation()}
            >
              <span className={cn('text-sm font-bold text-white px-3 py-1 rounded-full', typeColors[selectedEvent.type])}>
                {typeLabels[selectedEvent.type]}
              </span>
              <h2 className="font-serif text-3xl text-primary mt-4 mb-4">{selectedEvent.title}</h2>
              <div className="space-y-3 text-stone-600">
                <p className="flex items-center gap-3">
                  <Calendar size={20} className="text-gold" />
                  {new Date(selectedEvent.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="flex items-center gap-3"><Clock size={20} className="text-gold" />{selectedEvent.time}</p>
                <p className="flex items-center gap-3"><MapPin size={20} className="text-gold" />{selectedEvent.location}</p>
              </div>
              <p className="mt-6 text-stone-600 leading-relaxed">{selectedEvent.description}</p>
              <div className="mt-6 flex items-center gap-3">
                <RsvpButton eventId={selectedEvent.id} userId={profile?.id} className="text-sm px-4 py-2" />
              </div>
              <button onClick={() => setSelectedEvent(null)} className="mt-4 btn-primary w-full">Cerrar</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal crear/editar */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl text-primary">
                  {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-lg">
                  <X size={24} className="text-stone-500" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Título *</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Fecha *</label>
                    <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Hora *</label>
                    <input type="text" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
                      placeholder="10:00 AM" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Lugar *</label>
                  <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                    placeholder="Sanctuario Principal" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Tipo *</label>
                  <div className="relative">
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as EventType })}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold appearance-none bg-white">
                      {eventTypes.filter(t => t.id !== 'all').map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Descripción *</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold resize-none" required />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Publicar en fecha específica (opcional)</label>
                  <input
                    type="datetime-local"
                    value={form.published_at ? form.published_at.slice(0, 16) : ''}
                    onChange={e => setForm({ ...form, published_at: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold text-sm"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-secondary">Cancelar</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-60">
                    {saving ? 'Guardando...' : (editingEvent ? 'Actualizar' : 'Crear Evento')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
