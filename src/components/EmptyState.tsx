import type { ComponentType, ReactNode } from 'react';

interface EmptyStateProps {
  icon: ComponentType<{ size?: number | string; className?: string }>;
  title: string;
  description: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  hint?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  hint,
}: EmptyStateProps) {
  return (
    <div className="mx-auto max-w-md text-center">
      <div aria-hidden="true" className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center">
        <Icon size={26} className="text-stone-400" />
      </div>
      <h3 className="mt-4 font-serif text-xl font-semibold text-ink leading-tight">{title}</h3>
      <p className="mt-2 text-sm text-stone-500 leading-relaxed max-w-sm mx-auto">{description}</p>
      <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
        {actionLabel && onAction && (
          <button type="button" onClick={onAction} className="btn-primary text-sm">
            {actionLabel}
          </button>
        )}
        {secondaryLabel && onSecondary && (
          <button type="button" onClick={onSecondary} className="btn-secondary text-sm">
            {secondaryLabel}
          </button>
        )}
      </div>
      {hint && <div className="mt-4 text-xs text-stone-400">{hint}</div>}
    </div>
  );
}