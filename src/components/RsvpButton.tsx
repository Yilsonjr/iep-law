import { CheckCircle, UserPlus, Loader } from 'lucide-react';
import { useEventRsvp } from '../hooks/useEventRsvp';
import { cn } from '../utils';

interface RsvpButtonProps {
  eventId: string;
  userId?: string;
  className?: string;
}

export function RsvpButton({ eventId, userId, className }: RsvpButtonProps) {
  const { count, hasRsvp, loading, toggleRsvp } = useEventRsvp(eventId, userId);

  if (!userId) {
    return (
      <a href="/login" className={cn('flex items-center gap-1.5 text-xs text-stone-400 hover:text-primary transition-colors', className)}>
        <UserPlus size={14} />
        {count > 0 && <span>{count} asistirán</span>}
        {count === 0 && <span>Asistir</span>}
      </a>
    );
  }

  return (
    <button
      onClick={toggleRsvp}
      disabled={loading}
      className={cn(
        'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all',
        hasRsvp
          ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600'
          : 'bg-stone-100 text-stone-600 hover:bg-primary/10 hover:text-primary',
        className
      )}
    >
      {loading ? (
        <Loader size={14} className="animate-spin" />
      ) : hasRsvp ? (
        <CheckCircle size={14} />
      ) : (
        <UserPlus size={14} />
      )}
      {hasRsvp ? `Asistiré (${count})` : count > 0 ? `Asistir (${count})` : 'Asistir'}
    </button>
  );
}
