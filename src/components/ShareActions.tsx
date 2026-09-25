import { useEffect, useRef, useState } from 'react';
import { Link2, Check, Share2 } from 'lucide-react';
import { cn } from '../utils';

export interface ShareActionsProps {
  title: string;
  description?: string;
  url?: string;
  className?: string;
}

// ── Inline SVG brand icons ──────────────────────────────────────
function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.837L1.805 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

// ── Helpers ─────────────────────────────────────────────────────
function buildShareLinks(resolvedUrl: string, title: string, description?: string) {
  const text = description ? `${title} — ${description}` : title;
  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${resolvedUrl}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(resolvedUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(resolvedUrl)}`,
  };
}

async function writeToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to execCommand
    }
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

// ── Component ────────────────────────────────────────────────────
export function ShareActions({ title, description, url, className }: ShareActionsProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const timerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  // Resolved URL: prefer explicit prop, fall back to current page
  const resolvedUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');

  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const links = buildShareLinks(resolvedUrl, title, description);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const flashCopy = (status: 'copied' | 'error') => {
    setCopyStatus(status);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopyStatus('idle'), 2600);
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, text: description ?? title, url: resolvedUrl });
    } catch (err) {
      // AbortError = user closed the sheet — not a real error
      if (err instanceof Error && err.name !== 'AbortError') {
        await handleCopyLink();
      }
    }
  };

  const handleCopyLink = async () => {
    const ok = await writeToClipboard(resolvedUrl);
    flashCopy(ok ? 'copied' : 'error');
  };

  const iconBtn =
    'flex items-center justify-center w-8 h-8 rounded-lg text-stone-500 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role="group"
      aria-label="Compartir"
    >
      {/* Web Share API — mobile / supported browsers */}
      {canNativeShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          aria-label={`Compartir: ${title}`}
          className={cn(iconBtn, 'hover:text-primary hover:bg-stone-100')}
        >
          <Share2 size={16} />
        </button>
      )}

      {/* WhatsApp */}
      {!canNativeShare && (
        <a
          href={links.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Compartir en WhatsApp: ${title}`}
          className={cn(iconBtn, 'hover:text-[#128C4A] hover:bg-green-50')}
        >
          <IconWhatsApp className="w-4 h-4" />
        </a>
      )}

      {/* Facebook */}
      {!canNativeShare && (
        <a
          href={links.facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Compartir en Facebook: ${title}`}
          className={cn(iconBtn, 'hover:text-[#1877F2] hover:bg-blue-50')}
        >
          <IconFacebook className="w-4 h-4" />
        </a>
      )}

      {/* X / Twitter */}
      {!canNativeShare && (
        <a
          href={links.twitter}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Compartir en X (Twitter): ${title}`}
          className={cn(iconBtn, 'hover:text-stone-900 hover:bg-stone-100')}
        >
          <IconX className="w-3.5 h-3.5" />
        </a>
      )}

      {/* Copy link — always visible */}
      <button
        type="button"
        onClick={handleCopyLink}
        aria-label={
          copyStatus === 'copied'
            ? 'Enlace copiado'
            : copyStatus === 'error'
              ? 'No se pudo copiar el enlace'
              : `Copiar enlace: ${title}`
        }
        aria-live="polite"
        className={cn(
          iconBtn,
          copyStatus === 'copied'
            ? 'text-green-600 bg-green-50 hover:bg-green-100'
            : copyStatus === 'error'
              ? 'text-red-500 hover:bg-red-50'
              : 'hover:text-primary hover:bg-stone-100',
        )}
      >
        {copyStatus === 'copied' ? <Check size={15} /> : <Link2 size={15} />}
      </button>

      {/* Feedback visible — solo cuando está activo */}
      {copyStatus !== 'idle' && (
        <span
          role="status"
          aria-live="polite"
          className={cn(
            'text-xs font-medium select-none',
            copyStatus === 'copied' ? 'text-green-700' : 'text-red-500',
          )}
        >
          {copyStatus === 'copied' ? 'Enlace copiado' : 'No se pudo copiar'}
        </span>
      )}
    </div>
  );
}
