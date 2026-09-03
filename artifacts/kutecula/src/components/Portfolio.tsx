import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Play } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { GalleryModal, type GalleryItem } from '@/components/GalleryModal';

type Category = 'todos' | 'casamentos' | 'eventos' | 'corporativo' | 'estudio' | 'audiovisual';

// Static fallback — used when the API is unavailable or KV is not configured
const STATIC_PORTFOLIO: (GalleryItem & { category: string })[] = [
  // Casamentos
  { id: 1,  type: 'image', src: '/portfolio-wedding-1.jpg',     label: { pt: 'Casamentos',  en: 'Weddings'    }, category: 'casamentos' },
  { id: 2,  type: 'image', src: '/portfolio-wedding-2.jpg',     label: { pt: 'Casamentos',  en: 'Weddings'    }, category: 'casamentos' },
  { id: 3,  type: 'image', src: '/portfolio-wedding-3.jpg',     label: { pt: 'Casamentos',  en: 'Weddings'    }, category: 'casamentos' },
  { id: 4,  type: 'image', src: '/portfolio-wedding-4.jpg',     label: { pt: 'Casamentos',  en: 'Weddings'    }, category: 'casamentos' },
  { id: 5,  type: 'video', videoId: 'Dm4lH7mvXfs',              label: { pt: 'Casamentos',  en: 'Weddings'    }, category: 'casamentos' },
  { id: 6,  type: 'video', videoId: 'hT_nvWreIhg',              label: { pt: 'Casamentos',  en: 'Weddings'    }, category: 'casamentos' },
  // Eventos
  { id: 7,  type: 'image', src: '/portfolio-corporate-1.jpg',   label: { pt: 'Eventos',     en: 'Events'      }, category: 'eventos' },
  { id: 8,  type: 'image', src: '/portfolio-events-1.jpg',      label: { pt: 'Eventos',     en: 'Events'      }, category: 'eventos' },
  { id: 9,  type: 'image', src: '/portfolio-events-2.jpg',      label: { pt: 'Eventos',     en: 'Events'      }, category: 'eventos' },
  { id: 10, type: 'video', videoId: 'JGwWNGJdvx8',              label: { pt: 'Eventos',     en: 'Events'      }, category: 'eventos' },
  { id: 11, type: 'video', videoId: 'CevxZvSJLk8',              label: { pt: 'Eventos',     en: 'Events'      }, category: 'eventos' },
  // Corporativo
  { id: 12, type: 'image', src: '/portfolio-corporate-2.jpg',   label: { pt: 'Corporativo', en: 'Corporate'   }, category: 'corporativo' },
  { id: 13, type: 'image', src: '/portfolio-corporate-3.jpg',   label: { pt: 'Corporativo', en: 'Corporate'   }, category: 'corporativo' },
  { id: 14, type: 'image', src: '/portfolio-corporate-4.jpg',   label: { pt: 'Corporativo', en: 'Corporate'   }, category: 'corporativo' },
  { id: 15, type: 'video', videoId: '9bZkp7q19f0',              label: { pt: 'Corporativo', en: 'Corporate'   }, category: 'corporativo' },
  { id: 16, type: 'video', videoId: 'kffacxfA7G4',              label: { pt: 'Corporativo', en: 'Corporate'   }, category: 'corporativo' },
  // Estúdio
  { id: 17, type: 'image', src: '/portfolio-studio-1.jpg',      label: { pt: 'Estúdio',     en: 'Studio'      }, category: 'estudio' },
  { id: 18, type: 'image', src: '/portfolio-studio-2.jpg',      label: { pt: 'Estúdio',     en: 'Studio'      }, category: 'estudio' },
  { id: 19, type: 'image', src: '/portfolio-studio-3.jpg',      label: { pt: 'Estúdio',     en: 'Studio'      }, category: 'estudio' },
  { id: 20, type: 'video', videoId: 'E7wJTI-1dvQ',              label: { pt: 'Estúdio',     en: 'Studio'      }, category: 'estudio' },
  { id: 21, type: 'video', videoId: '3JZ_D3ELwOQ',              label: { pt: 'Estúdio',     en: 'Studio'      }, category: 'estudio' },
  // Audiovisual
  { id: 22, type: 'image', src: '/portfolio-music-1.jpg',       label: { pt: 'Audiovisual', en: 'Audiovisual' }, category: 'audiovisual' },
  { id: 23, type: 'image', src: '/portfolio-music-2.jpg',       label: { pt: 'Audiovisual', en: 'Audiovisual' }, category: 'audiovisual' },
  { id: 24, type: 'image', src: '/portfolio-audiovisual-1.jpg', label: { pt: 'Audiovisual', en: 'Audiovisual' }, category: 'audiovisual' },
  { id: 25, type: 'video', videoId: 'RgKAFK5djSk',              label: { pt: 'Audiovisual', en: 'Audiovisual' }, category: 'audiovisual' },
  { id: 26, type: 'video', videoId: 'dQw4w9WgXcQ',              label: { pt: 'Audiovisual', en: 'Audiovisual' }, category: 'audiovisual' },
];

const categoryMap: Record<Category, string> = {
  todos:       'todos',
  casamentos:  'casamentos',
  eventos:     'eventos',
  corporativo: 'corporativo',
  estudio:     'estudio',
  audiovisual: 'audiovisual',
};

// Preview subset for "todos" (first item from each category)
const previewCategoryOrder = ['casamentos', 'eventos', 'audiovisual', 'corporativo', 'estudio'];

function getVideoThumb(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function Portfolio() {
  const { lang, t } = useLang();
  const [activeCategory, setActiveCategory] = useState<Category>('todos');
  const [portfolioItems, setPortfolioItems] = useState(STATIC_PORTFOLIO);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Load portfolio from API (with fallback to local storage & static)
  useEffect(() => {
    try {
      const cached = localStorage.getItem('kutecula_portfolio_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPortfolioItems(parsed);
        }
      }
    } catch {}

    fetch('/api/admin/portfolio')
      .then((r) => r.json())
      .then((data: { items: typeof STATIC_PORTFOLIO; source?: string }) => {
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          // If server returned default fallback, only use it if localStorage is empty
          const cached = localStorage.getItem('kutecula_portfolio_cache');
          if (data.source === 'default' && cached) {
            try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) {
                return; // Keep user's custom edits from cache!
              }
            } catch {}
          }
          setPortfolioItems(data.items);
          try {
            localStorage.setItem('kutecula_portfolio_cache', JSON.stringify(data.items));
          } catch {}
        }
      })
      .catch(() => {
        // Silently fall back to static or cached data
      });
  }, []);

  const categoryKeys = Object.keys(categoryMap) as Category[];

  // Display items: when 'todos', show all items with newest items first!
  const displayedItems =
    activeCategory === 'todos'
      ? [...portfolioItems].reverse()
      : [...portfolioItems].filter((i) => i.category === activeCategory).reverse();

  const openGallery = (item: GalleryItem & { category: string }, cat: Category) => {
    const catItems =
      cat === 'todos'
        ? displayedItems
        : [...portfolioItems].filter((i) => i.category === cat).reverse();
    const idx = catItems.findIndex((i) => i.id === item.id);
    setGalleryItems(catItems);
    setGalleryIndex(idx >= 0 ? idx : 0);
    setGalleryOpen(true);
  };

  const handleLabelClick = (e: React.MouseEvent, cat: string) => {
    e.stopPropagation();
    if (cat && cat !== 'todos') setActiveCategory(cat as Category);
  };

  return (
    <>
      <section id="trabalhos" className="py-24 lg:py-32 bg-[#0d0d0d]" ref={ref}>
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
              {t.portfolio.heading}
            </h2>
            <p className="text-[#999999] text-base tracking-widest uppercase text-sm">
              {t.portfolio.subheading}
            </p>
          </motion.div>

          {/* Category filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-16"
          >
            {categoryKeys.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 text-sm font-medium tracking-wide rounded-sm transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-[#7B2D8E] text-white'
                    : 'bg-white/5 text-[#999999] hover:bg-white/10 hover:text-white'
                }`}
              >
                {t.portfolio.categories[cat]}
              </button>
            ))}
          </motion.div>

          {/* Grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {displayedItems.map((item, index) => {
                const bgSrc = item.type === 'image' ? item.src! : getVideoThumb(item.videoId!);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    onClick={() => openGallery(item, activeCategory)}
                    className="group relative aspect-[4/5] overflow-hidden rounded-sm cursor-pointer"
                  >
                    {/* Background image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url(${bgSrc})` }}
                    />

                    {/* Video play indicator */}
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:bg-[#7B2D8E]/80 group-hover:scale-110">
                          <Play size={22} className="text-white ml-1" />
                        </div>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-all duration-500 group-hover:from-black/90" />

                    {/* Purple bottom bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#7B2D8E] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                    {/* Label */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <button
                        onClick={(e) => handleLabelClick(e, item.category)}
                        className="text-white/80 text-xs tracking-[0.2em] uppercase font-medium hover:text-[#7B2D8E] transition-colors duration-200"
                      >
                        {item.label[lang]}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Gallery Modal */}
      <AnimatePresence>
        {galleryOpen && (
          <GalleryModal
            items={galleryItems}
            currentIndex={galleryIndex}
            onClose={() => setGalleryOpen(false)}
            onPrev={() => setGalleryIndex((i) => (i - 1 + galleryItems.length) % galleryItems.length)}
            onNext={() => setGalleryIndex((i) => (i + 1) % galleryItems.length)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
