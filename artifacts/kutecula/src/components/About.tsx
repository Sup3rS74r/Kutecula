import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLang } from '@/context/LanguageContext';

export function About() {
  const { t } = useLang();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="sobre" className="py-24 lg:py-32 bg-[#0d0d0d]" ref={ref}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9 }}
            className="relative aspect-[4/5] rounded-sm overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: 'url(/about-team.jpg)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
                {t.about.heading}
              </h2>
              <p className="text-[#999999] text-sm tracking-widest uppercase">
                {t.about.subheading}
              </p>
            </div>

            <div className="space-y-5 text-[#f0f0f0] text-lg leading-relaxed">
              <p>{t.about.bio1}</p>
              <p>{t.about.bio2}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-[#7B2D8E] mb-2">150+</div>
                <div className="text-sm text-[#999999] tracking-wide">{t.about.stats.projects}</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-[#7B2D8E] mb-2">8</div>
                <div className="text-sm text-[#999999] tracking-wide">{t.about.stats.years}</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-[#7B2D8E] mb-2">África</div>
                <div className="text-sm text-[#999999] tracking-wide">{t.about.stats.market}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
