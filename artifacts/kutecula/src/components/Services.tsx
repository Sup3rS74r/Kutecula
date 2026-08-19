import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Film, Camera, Layers } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

const icons = [Film, Camera, Layers];

export function Services() {
  const { t } = useLang();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="servicos" className="py-24 lg:py-32 bg-[#111111]" ref={ref}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
            {t.services.heading}
          </h2>
          <p className="text-[#999999] text-sm tracking-widest uppercase">
            {t.services.subheading}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {t.services.items.map((service, index) => {
            const Icon = icons[index];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                className="group relative bg-[#1a1a1a] border border-white/[0.07] rounded-sm p-8 lg:p-10 hover:border-[#7B2D8E]/50 transition-all duration-500"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#7B2D8E] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                <div className="mb-6">
                  <div className="w-14 h-14 rounded-sm bg-[#7B2D8E]/10 flex items-center justify-center group-hover:bg-[#7B2D8E]/20 transition-colors duration-500">
                    <Icon className="text-[#7B2D8E]" size={28} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-[#999999] text-base mb-6 italic">{service.subtitle}</p>
                <div className="space-y-2">
                  {service.deliverables.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7B2D8E] flex-shrink-0" />
                      <p className="text-[#f0f0f0] text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
