import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="sobre" className="py-24 lg:py-32 bg-[#0d0d0d]" ref={ref}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.9 }}
            className="relative aspect-[4/5] rounded-sm overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url(/about-team.jpg)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.9 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Sobre Nós
              </h2>
              <p className="text-[#999999] text-lg mb-2">About Us</p>
            </div>

            <div className="space-y-6 text-[#f0f0f0] text-lg leading-relaxed">
              <p>
                Somos uma produtora audiovisual baseada em Talatona, Luanda.
                Criamos conteúdo que traduz a essência das marcas e dos momentos
                em imagens que se sentem.
              </p>
              <p>
                Com anos de experiência no mercado angolano e africano, elevamos
                cada projeto ao nível do cinema.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-[#7B2D8E] mb-2">
                  150+
                </div>
                <div className="text-sm text-[#999999] tracking-wide">Projetos</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-[#7B2D8E] mb-2">
                  8
                </div>
                <div className="text-sm text-[#999999] tracking-wide">Anos</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-[#7B2D8E] mb-2">
                  África
                </div>
                <div className="text-sm text-[#999999] tracking-wide">Luanda</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
