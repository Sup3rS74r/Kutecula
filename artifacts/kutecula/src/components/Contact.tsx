import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { MapPin, Send, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

export function Contact() {
  const { t } = useLang();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json() as { error?: string; success?: boolean };

      if (!res.ok) {
        throw new Error(data.error ?? 'Erro ao enviar mensagem');
      }

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Erro desconhecido. Tente novamente.');
    }
  };

  return (
    <section id="contacto" className="py-24 lg:py-32 bg-[#111111]" ref={ref}>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
            {t.contact.heading}
          </h2>
          <p className="text-[#999999] text-sm tracking-widest uppercase">
            {t.contact.subheading}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9 }}
            className="space-y-5"
          >
            {/* WhatsApp */}
            <a
              href="https://wa.me/244923456789"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-5 bg-[#1a1a1a] border border-white/[0.07] rounded-sm hover:border-[#25D366]/50 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-sm bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors flex-shrink-0">
                <FaWhatsapp className="text-[#25D366]" size={22} />
              </div>
              <div>
                <p className="text-[#999999] text-xs mb-0.5 uppercase tracking-widest">{t.contact.whatsappLabel}</p>
                <p className="text-white font-medium">+244 923 456 789</p>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:geral@kutecula.com"
              className="group flex items-center gap-4 p-5 bg-[#1a1a1a] border border-white/[0.07] rounded-sm hover:border-[#7B2D8E]/50 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-sm bg-[#7B2D8E]/10 flex items-center justify-center group-hover:bg-[#7B2D8E]/20 transition-colors flex-shrink-0">
                <Mail className="text-[#7B2D8E]" size={22} />
              </div>
              <div>
                <p className="text-[#999999] text-xs mb-0.5 uppercase tracking-widest">{t.contact.emailLabel}</p>
                <p className="text-white font-medium">geral@kutecula.com</p>
              </div>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/kutecula"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-5 bg-[#1a1a1a] border border-white/[0.07] rounded-sm hover:border-[#E4405F]/50 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-sm bg-[#E4405F]/10 flex items-center justify-center group-hover:bg-[#E4405F]/20 transition-colors flex-shrink-0">
                <FaInstagram className="text-[#E4405F]" size={22} />
              </div>
              <div>
                <p className="text-[#999999] text-xs mb-0.5 uppercase tracking-widest">{t.contact.instagramLabel}</p>
                <p className="text-white font-medium">@kutecula</p>
              </div>
            </a>

            {/* Location */}
            <div className="flex items-center gap-4 p-5 bg-[#1a1a1a] border border-white/[0.07] rounded-sm">
              <div className="w-11 h-11 rounded-sm bg-[#7B2D8E]/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="text-[#7B2D8E]" size={22} />
              </div>
              <div>
                <p className="text-[#999999] text-xs mb-0.5 uppercase tracking-widest">{t.contact.locationLabel}</p>
                <p className="text-white font-medium">{t.contact.locationValue}</p>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9 }}
          >
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex items-center justify-center p-10 bg-[#1a1a1a] border border-[#7B2D8E]/30 rounded-sm text-center"
              >
                <div>
                  <div className="w-14 h-14 rounded-full bg-[#7B2D8E]/20 flex items-center justify-center mx-auto mb-4">
                    <Send className="text-[#7B2D8E]" size={22} />
                  </div>
                  <p className="text-white text-lg font-medium">{t.contact.form.success}</p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[#999999] text-xs uppercase tracking-widest mb-2">
                    {t.contact.form.nameLabel}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={status === 'loading'}
                    placeholder={t.contact.form.namePlaceholder}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/[0.07] rounded-sm text-white placeholder-[#555] focus:outline-none focus:border-[#7B2D8E] transition-colors disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[#999999] text-xs uppercase tracking-widest mb-2">
                    {t.contact.form.emailLabel}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={status === 'loading'}
                    placeholder={t.contact.form.emailPlaceholder}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/[0.07] rounded-sm text-white placeholder-[#555] focus:outline-none focus:border-[#7B2D8E] transition-colors disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[#999999] text-xs uppercase tracking-widest mb-2">
                    {t.contact.form.messageLabel}
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    disabled={status === 'loading'}
                    rows={6}
                    placeholder={t.contact.form.messagePlaceholder}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/[0.07] rounded-sm text-white placeholder-[#555] focus:outline-none focus:border-[#7B2D8E] transition-colors resize-none disabled:opacity-50"
                  />
                </div>

                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-sm"
                  >
                    <AlertCircle className="text-red-400 flex-shrink-0" size={18} />
                    <p className="text-red-400 text-sm">{errorMessage}</p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full px-8 py-4 bg-[#7B2D8E] text-white font-medium rounded-sm hover:bg-[#8f3aa3] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      A enviar...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      {t.contact.form.send}
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24 pt-8 border-t border-white/10 text-center"
        >
          <p className="text-[#999999] text-sm mb-2">{t.contact.footer}</p>
          <p className="text-[#7B2D8E] text-xs tracking-[0.3em] uppercase font-medium">
            {t.contact.tagline}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
