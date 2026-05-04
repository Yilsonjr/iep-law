import { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { supabase } from '../config/supabase';
import { cn } from '../utils';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
  variant?: 'banner' | 'logo';
}

export function ImageUpload({ value, onChange, folder = 'general', label = 'Imagen', className, variant = 'banner' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5 MB.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${folder}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('media').getPublicUrl(path);
      onChange(data.publicUrl);
    } catch {
      setError('Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-stone-600 mb-2">{label}</label>

      {value ? (
        variant === 'logo' ? (
          <div className="flex items-center gap-4">
            <div className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-stone-200 flex-shrink-0">
              <img src={value} alt="logo preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="bg-white text-stone-800 p-1.5 rounded-lg hover:bg-stone-100"
                  title="Cambiar"
                >
                  <Upload size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600"
                  title="Quitar"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
            <p className="text-xs text-stone-400">Pasa el cursor sobre el logo para cambiar o quitar</p>
          </div>
        ) : (
          <div className="relative group rounded-xl overflow-hidden border border-stone-200">
            <img src={value} alt="preview" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="bg-white text-stone-800 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-stone-100"
              >
                Cambiar
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed border-stone-300 rounded-xl p-8 text-center cursor-pointer transition-colors',
            uploading ? 'opacity-60 pointer-events-none' : 'hover:border-gold hover:bg-gold/5'
          )}
        >
          {uploading ? (
            <Loader size={32} className="mx-auto text-stone-400 animate-spin mb-2" />
          ) : (
            <Upload size={32} className="mx-auto text-stone-400 mb-2" />
          )}
          <p className="text-sm text-stone-500">
            {uploading ? 'Subiendo...' : 'Arrastra una imagen o haz clic para seleccionar'}
          </p>
          <p className="text-xs text-stone-400 mt-1">PNG, JPG, WEBP · máx 5 MB</p>
        </div>
      )}

      {/* También acepta URL manualmente */}
      <div className="mt-2 flex items-center gap-2">
        <ImageIcon size={14} className="text-stone-400 flex-shrink-0" />
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="O pega una URL de imagen..."
          className="flex-1 text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}
