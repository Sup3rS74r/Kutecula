import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

export type GalleryItem = {
  id: number;
  type: 'image' | 'video';
  src?: string;
  videoId?: string;
  label: { pt: string; en: string };
};

interface GalleryModalProps {
  items: GalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function GalleryModal({
  items,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: GalleryModalProps) {
  const { lang, t } = useLang();
  const item = items[currentIndex];

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  if (!item) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] bg-black/96 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 p-3 text-white/70 hover:text-white transition-colors"
        aria-label={t.portfolio.close}
      >
        <X size={28} />
      </button>

      {/* Counter */}
      <div className="absolute top-7 left-1/2 -translate-x-1/2 text-white/50 text-sm tracking-widest">
        {currentIndex + 1} {t.portfolio.of} {items.length}
      </div>

      {/* Category label */}
      <div className="absolute top-7 left-6 text-xs text-[#7B2D8E] tracking-[0.25em] uppercase font-medium">
        {item.label[lang]}
      </div>

      {/* Media content */}
      <div
        className="relative w-full max-w-6xl mx-auto px-16 md:px-24 h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="w-full flex items-center justify-center"
          >
            {item.type === 'image' ? (
              <img
                src={item.src}
                alt={item.label[lang]}
                className="max-h-[80vh] max-w-full object-contain rounded-sm shadow-2xl"
                draggable={false}
              />
            ) : (
              <div className="w-full aspect-video max-h-[80vh]">
                <iframe
                  src={`https://www.youtube.com/embed/${item.videoId}?autoplay=1&rel=0&modestbranding=1`}
                  title={item.label[lang]}
                  allow="autoplay; fullscreen; encrypted-media"
                  allowFullScreen
                  className="w-full h-full rounded-sm"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Prev / Next arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-sm"
            aria-label="Previous"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-sm"
            aria-label="Next"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      {/* Thumbnail strip at bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 max-w-[90vw] overflow-x-auto px-4 pb-1">
        {items.map((thumb, i) => (
          <button
            key={thumb.id}
            onClick={(e) => {
              e.stopPropagation();
              // jump to specific index
              const diff = i - currentIndex;
              if (diff > 0) for (let j = 0; j < diff; j++) onNext();
              else if (diff < 0) for (let j = 0; j > diff; j--) onPrev();
            }}
            className={`flex-shrink-0 w-12 h-8 rounded-sm overflow-hidden border transition-all duration-200 ${
              i === currentIndex
                ? 'border-[#7B2D8E] opacity-100'
                : 'border-white/10 opacity-40 hover:opacity-70'
            }`}
          >
            {thumb.type === 'image' ? (
              <img
                src={thumb.src}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                <Play size={10} className="text-white/70" />
              </div>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
