import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

export function Navigation() {
  const { lang, setLang, t } = useLang();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const navLinks = [
    { id: 'trabalhos', label: t.nav.trabalhos },
    { id: 'servicos',  label: t.nav.servicos  },
    { id: 'sobre',     label: t.nav.sobre     },
    { id: 'contacto',  label: t.nav.contacto  },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      const ids = ['trabalhos', 'servicos', 'sobre', 'contacto'];
      const scrollPos = window.scrollY + 200;
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(ids[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offsetPosition = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-white font-bold text-lg tracking-[0.3em] hover:text-[#7B2D8E] transition-colors duration-300"
            >
              KUTECULA
            </button>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`text-sm font-medium tracking-wide transition-colors duration-300 relative group ${
                    activeSection === link.id ? 'text-[#7B2D8E]' : 'text-[#f0f0f0] hover:text-[#7B2D8E]'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-[2px] bg-[#7B2D8E] transition-all duration-300 ${
                      activeSection === link.id ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </button>
              ))}

              {/* Language switcher */}
              <div className="flex items-center gap-2 ml-4 text-xs border border-white/10 rounded-sm overflow-hidden">
                <button
                  onClick={() => setLang('pt')}
                  className={`px-3 py-1.5 font-medium tracking-widest transition-all duration-200 ${
                    lang === 'pt'
                      ? 'bg-[#7B2D8E] text-white'
                      : 'text-[#999999] hover:text-white'
                  }`}
                >
                  PT
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`px-3 py-1.5 font-medium tracking-widest transition-all duration-200 ${
                    lang === 'en'
                      ? 'bg-[#7B2D8E] text-white'
                      : 'text-[#999999] hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-40 md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {navLinks.map((link, index) => (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  onClick={() => scrollToSection(link.id)}
                  className="text-2xl font-medium text-white hover:text-[#7B2D8E] transition-colors"
                >
                  {link.label}
                </motion.button>
              ))}

              {/* Mobile language switcher */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-0 mt-6 border border-white/10 rounded-sm overflow-hidden text-sm"
              >
                <button
                  onClick={() => { setLang('pt'); setMobileMenuOpen(false); }}
                  className={`px-5 py-2.5 font-medium tracking-widest transition-all duration-200 ${
                    lang === 'pt' ? 'bg-[#7B2D8E] text-white' : 'text-[#999999]'
                  }`}
                >
                  PT
                </button>
                <button
                  onClick={() => { setLang('en'); setMobileMenuOpen(false); }}
                  className={`px-5 py-2.5 font-medium tracking-widest transition-all duration-200 ${
                    lang === 'en' ? 'bg-[#7B2D8E] text-white' : 'text-[#999999]'
                  }`}
                >
                  EN
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
