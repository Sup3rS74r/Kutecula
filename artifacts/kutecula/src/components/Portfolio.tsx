import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

type Category = 'todos' | 'casamentos' | 'eventos' | 'corporativo' | 'estudio' | 'audiovisual';

interface PortfolioItem {
  id: number;
  image: string;
  category: Category[];
  label: string;
}

const portfolioItems: PortfolioItem[] = [
  { id: 1, image: '/portfolio-wedding-1.jpg', category: ['casamentos'], label: 'Casamentos' },
  { id: 2, image: '/portfolio-corporate-1.jpg', category: ['corporativo', 'eventos'], label: 'Corporativo' },
  { id: 3, image: '/portfolio-music-1.jpg', category: ['audiovisual'], label: 'Audiovisual' },
  { id: 4, image: '/portfolio-wedding-2.jpg', category: ['casamentos'], label: 'Casamentos' },
  { id: 5, image: '/portfolio-studio-1.jpg', category: ['estudio'], label: 'Estúdio' },
  { id: 6, image: '/portfolio-music-2.jpg', category: ['audiovisual'], label: 'Audiovisual' },
  { id: 7, image: '/portfolio-wedding-3.jpg', category: ['casamentos'], label: 'Casamentos' },
  { id: 8, image: '/portfolio-corporate-2.jpg', category: ['corporativo'], label: 'Corporativo' },
  { id: 9, image: '/portfolio-studio-2.jpg', category: ['estudio'], label: 'Estúdio' },
];

const categories: { id: Category; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'casamentos', label: 'Casamentos' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'corporativo', label: 'Corporativo' },
  { id: 'estudio', label: 'Estúdio' },
  { id: 'audiovisual', label: 'Audiovisual' },
];

export function Portfolio() {
  const [activeCategory, setActiveCategory] = useState<Category>('todos');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const filteredItems =
    activeCategory === 'todos'
      ? portfolioItems
      : portfolioItems.filter((item) => item.category.includes(activeCategory));

  return (
    <section id="trabalhos" className="py-24 lg:py-32 bg-[#0d0d0d]" ref={ref}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            O Nosso Trabalho
          </h2>
          <p className="text-[#999999] text-lg">Our Work</p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 text-sm font-medium tracking-wide rounded-sm transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-[#7B2D8E] text-white'
                  : 'bg-white/5 text-[#999999] hover:bg-white/10 hover:text-white'
              }`}
              data-testid={`filter-${category.id}`}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* Portfolio Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative aspect-[4/5] overflow-hidden rounded-sm cursor-pointer"
                data-testid={`portfolio-item-${item.id}`}
              >
                {/* Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${item.image})`,
                  }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-all duration-500 group-hover:from-black/90" />

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#7B2D8E] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white/80 text-xs tracking-[0.2em] uppercase font-medium">
                    {item.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
