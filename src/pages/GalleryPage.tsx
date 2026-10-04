import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { useGalleryAlbums } from '../hooks/useGalleryAlbums';
import { useGalleryImages } from '../hooks/useGalleryImages';
import { cn } from '../utils';

const chipBase = 'px-4 py-2 rounded-full text-sm font-medium transition-colors border';
const chipActive = 'bg-primary text-white border-primary';
const chipInactive = 'bg-white text-stone-600 border-stone-200 hover:border-primary hover:text-primary';

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-xl bg-stone-100 animate-pulse" />
      ))}
    </div>
  );
}

export function GalleryPage() {
  const { albums, loading: albLoading } = useGalleryAlbums(true);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const { images, loading: imgLoading } = useGalleryImages({
    albumId: selectedAlbumId,
    activeOnly: true,
  });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const prevImage = useCallback(() => {
    setLightboxIndex(i => (i !== null && i > 0 ? i - 1 : i));
  }, []);

  const nextImage = useCallback(() => {
    setLightboxIndex(i => (i !== null && i < images.length - 1 ? i + 1 : i));
  }, [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex, closeLightbox, prevImage, nextImage]);

  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIndex]);

  const currentImage = lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <div className="min-h-screen bg-paper">
      {/* Hero */}
      <div className="bg-primary py-16 md:py-20 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-3">Iglesia Ebenezer M.I.</p>
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-4">Galería</h1>
          <p className="text-white/70 text-lg max-w-md mx-auto">
            Momentos de adoración, comunidad y servicio en Iglesia Ebenezer.
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Album filter chips */}
        {!albLoading && albums.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedAlbumId(null)}
              className={cn(chipBase, selectedAlbumId === null ? chipActive : chipInactive)}
            >
              Todos
            </button>
            {albums.map(album => (
              <button
                key={album.id}
                onClick={() => setSelectedAlbumId(album.id)}
                className={cn(chipBase, selectedAlbumId === album.id ? chipActive : chipInactive)}
              >
                {album.title}
              </button>
            ))}
          </div>
        )}

        {/* Image grid */}
        {imgLoading ? (
          <SkeletonGrid />
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Images size={48} className="text-stone-300 mb-4" />
            <p className="font-serif text-xl text-stone-500 mb-2">
              {selectedAlbumId ? 'Este álbum no tiene imágenes aún' : 'No hay galerías disponibles aún'}
            </p>
            <p className="text-stone-400 text-sm">Vuelve pronto para ver nuestros momentos.</p>
            <Link to="/" className="mt-6 text-primary hover:text-gold transition-colors text-sm font-medium">
              ← Volver al inicio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <motion.button
                key={image.id}
                onClick={() => setLightboxIndex(index)}
                className="group relative aspect-square overflow-hidden rounded-xl bg-stone-100 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                aria-label={image.alt_text ?? image.title ?? `Imagen ${index + 1}`}
              >
                <img
                  src={image.image_url}
                  alt={image.alt_text ?? ''}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {(image.title || image.description) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    {image.title && (
                      <p className="text-white text-xs font-semibold leading-snug">{image.title}</p>
                    )}
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && currentImage && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Imagen ampliada"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={lightboxIndex}
                src={currentImage.image_url}
                alt={currentImage.alt_text ?? ''}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                onClick={e => e.stopPropagation()}
              />
            </AnimatePresence>

            {(currentImage.title || currentImage.description) && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm text-center bg-black/60 backdrop-blur-sm px-5 py-2.5 rounded-full max-w-sm pointer-events-none">
                {currentImage.title && <p className="font-semibold">{currentImage.title}</p>}
                {currentImage.description && <p className="text-white/80 text-xs mt-0.5">{currentImage.description}</p>}
              </div>
            )}

            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-xs pointer-events-none">
              {lightboxIndex + 1} / {images.length}
            </div>

            <button
              onClick={closeLightbox}
              aria-label="Cerrar imagen"
              className="absolute top-4 right-4 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-colors"
            >
              <X size={20} />
            </button>

            {lightboxIndex > 0 && (
              <button
                onClick={e => { e.stopPropagation(); prevImage(); }}
                aria-label="Imagen anterior"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
              >
                <ChevronLeft size={22} />
              </button>
            )}

            {lightboxIndex < images.length - 1 && (
              <button
                onClick={e => { e.stopPropagation(); nextImage(); }}
                aria-label="Imagen siguiente"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
              >
                <ChevronRight size={22} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
