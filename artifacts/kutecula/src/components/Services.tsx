import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Film, Camera, Layers } from 'lucide-react';

const services = [
  {
    id: 'audiovisual',
    icon: Film,
    title: 'Produção Audiovisual',
    subtitle: 'Contamos histórias que ficam.',
    deliverables: ['Publicidade', 'Videoclipes', 'Documentários', 'Showreels'],
  },
  {
    id: 'fotografia',
    icon: Camera,
    title: 'Fotografia',
    subtitle: 'Cada frame, uma obra.',
    deliverables: ['Casamentos', 'Retratos', 'Eventos', 'Produto'],
  },
  {
    id: 'conteudo',
    icon: Layers,
    title: 'Criação de Conteúdo',
    subtitle: 'Conteúdo que move audiências.',
    deliverables: ['Redes Sociais', 'Motion Graphics', 'Branding Visual', 'Campanhas'],
  },
];

export function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="servicos" className="py-24 lg:py-32 bg-[#111111]" ref={ref}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            O Que Fazemos
          </h2>
          <p className="text-[#999999] text-lg">What We Do</p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="group relative bg-[#1a1a1a] border border-white/[0.07] rounded-sm p-8 lg:p-10 hover:border-[#7B2D8E]/50 transition-all duration-500"
              data-testid={`service-${service.id}`}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#7B2D8E] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

              {/* Icon */}
              <div className="mb-6">
                <div className="w-14 h-14 rounded-sm bg-[#7B2D8E]/10 flex items-center justify-center group-hover:bg-[#7B2D8E]/20 transition-colors duration-500">
                  <service.icon className="text-[#7B2D8E]" size={28} />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-3">{service.title}</h3>
              <p className="text-[#999999] text-base mb-6 italic">{service.subtitle}</p>

              {/* Deliverables */}
              <div className="space-y-2">
                {service.deliverables.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7B2D8E]" />
                    <p className="text-[#f0f0f0] text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
