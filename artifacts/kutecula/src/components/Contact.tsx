import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { MapPin, Send } from 'lucide-react';

export function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [formData, setFormData] = useState({ name: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Static form - no backend submission
    console.log('Form submitted:', formData);
    alert('Obrigado pela sua mensagem! Entraremos em contacto em breve.');
    setFormData({ name: '', message: '' });
  };

  return (
    <section id="contacto" className="py-24 lg:py-32 bg-[#111111]" ref={ref}>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Vamos Criar Juntos
          </h2>
          <p className="text-[#999999] text-lg">Let's Create Together</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.9 }}
            className="space-y-8"
          >
            {/* WhatsApp */}
            <div className="group">
              <a
                href="https://wa.me/244923456789"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-6 bg-[#1a1a1a] border border-white/[0.07] rounded-sm hover:border-[#25D366]/50 transition-all duration-300"
                data-testid="link-whatsapp"
              >
                <div className="w-12 h-12 rounded-sm bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
                  <FaWhatsapp className="text-[#25D366]" size={24} />
                </div>
                <div>
                  <p className="text-[#999999] text-sm mb-1">WhatsApp</p>
                  <p className="text-white text-lg font-medium">+244 923 456 789</p>
                </div>
              </a>
            </div>

            {/* Instagram */}
            <div className="group">
              <a
                href="https://instagram.com/kutecula"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-6 bg-[#1a1a1a] border border-white/[0.07] rounded-sm hover:border-[#E4405F]/50 transition-all duration-300"
                data-testid="link-instagram"
              >
                <div className="w-12 h-12 rounded-sm bg-[#E4405F]/10 flex items-center justify-center group-hover:bg-[#E4405F]/20 transition-colors">
                  <FaInstagram className="text-[#E4405F]" size={24} />
                </div>
                <div>
                  <p className="text-[#999999] text-sm mb-1">Instagram</p>
                  <p className="text-white text-lg font-medium">@kutecula</p>
                </div>
              </a>
            </div>

            {/* Location */}
            <div className="flex items-center gap-4 p-6 bg-[#1a1a1a] border border-white/[0.07] rounded-sm">
              <div className="w-12 h-12 rounded-sm bg-[#7B2D8E]/10 flex items-center justify-center">
                <MapPin className="text-[#7B2D8E]" size={24} />
              </div>
              <div>
                <p className="text-[#999999] text-sm mb-1">Localização</p>
                <p className="text-white text-lg font-medium">Talatona, Luanda, Angola</p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.9 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-[#999999] text-sm mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/[0.07] rounded-sm text-white focus:outline-none focus:border-[#7B2D8E] transition-colors"
                  placeholder="O seu nome"
                  data-testid="input-name"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-[#999999] text-sm mb-2">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/[0.07] rounded-sm text-white focus:outline-none focus:border-[#7B2D8E] transition-colors resize-none"
                  placeholder="Conte-nos sobre o seu projeto"
                  data-testid="input-message"
                />
              </div>

              <button
                type="submit"
                className="w-full px-8 py-4 bg-[#7B2D8E] text-white font-medium rounded-sm hover:bg-[#8f3aa3] transition-all duration-300 flex items-center justify-center gap-2"
                data-testid="button-send"
              >
                <Send size={18} />
                Enviar mensagem
              </button>
            </form>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24 pt-8 border-t border-white/10 text-center"
        >
          <p className="text-[#999999] text-sm mb-2">
            © 2024 Kutecula · All rights reserved
          </p>
          <p className="text-[#7B2D8E] text-xs tracking-[0.3em] uppercase font-medium">
            A Voz da Criatividade
          </p>
        </motion.div>
      </div>
    </section>
  );
}
