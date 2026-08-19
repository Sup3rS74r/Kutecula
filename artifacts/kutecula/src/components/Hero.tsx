import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

export function Hero() {
  const { t } = useLang();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offsetPosition = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/hero-luanda.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-[#0d0d0d]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0d1e]/40 to-transparent" />
      </div>
      <div className="grain absolute inset-0 z-10" />

      {/* Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-6 lg:px-12 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[#7B2D8E] text-xs md:text-sm tracking-[0.3em] uppercase font-medium mb-6"
        >
          {t.hero.location}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white mb-8 leading-[1.1]"
        >
          {t.hero.tagline.includes('\n')
            ? t.hero.tagline.split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))
            : t.hero.tagline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-[#999999] text-lg md:text-xl mb-12 max-w-2xl mx-auto"
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => scrollToSection('trabalhos')}
            className="px-8 py-4 bg-[#7B2D8E] text-white font-medium rounded-sm hover:bg-[#8f3aa3] transition-all duration-300 hover:scale-105 min-w-[200px]"
          >
            {t.hero.cta1}
          </button>
          <button
            onClick={() => scrollToSection('contacto')}
            className="px-8 py-4 bg-transparent border-2 border-white text-white font-medium rounded-sm hover:bg-white hover:text-black transition-all duration-300 hover:scale-105 min-w-[200px]"
          >
            {t.hero.cta2}
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20"
      >
        <button
          onClick={() => scrollToSection('trabalhos')}
          className="flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ChevronDown size={32} className="animate-bounce" />
        </button>
      </motion.div>
    </section>
  );
}
