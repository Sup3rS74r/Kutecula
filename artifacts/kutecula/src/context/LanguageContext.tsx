import { createContext, useContext, useState, ReactNode } from 'react';

export type Lang = 'pt' | 'en';

const translations = {
  pt: {
    nav: {
      trabalhos: 'Trabalhos',
      servicos: 'Serviços',
      sobre: 'Sobre',
      contacto: 'Contacto',
    },
    hero: {
      location: 'Luanda · Angola',
      tagline: 'Histórias que se sentem.',
      subtitle: 'Produção audiovisual e fotografia em Luanda.',
      cta1: 'Ver trabalhos',
      cta2: 'Contactar',
    },
    portfolio: {
      heading: 'O Nosso Trabalho',
      subheading: 'Our Work',
      categories: {
        todos: 'Todos',
        casamentos: 'Casamentos',
        eventos: 'Eventos',
        corporativo: 'Corporativo',
        estudio: 'Estúdio',
        audiovisual: 'Audiovisual',
      },
      close: 'Fechar',
      of: 'de',
    },
    services: {
      heading: 'O Que Fazemos',
      subheading: 'What We Do',
      items: [
        {
          title: 'Produção Audiovisual',
          subtitle: 'Contamos histórias que ficam.',
          deliverables: ['Publicidade', 'Videoclipes', 'Documentários', 'Showreels'],
        },
        {
          title: 'Fotografia',
          subtitle: 'Cada frame, uma obra.',
          deliverables: ['Casamentos', 'Retratos', 'Eventos', 'Produto'],
        },
        {
          title: 'Criação de Conteúdo',
          subtitle: 'Conteúdo que move audiências.',
          deliverables: ['Redes Sociais', 'Motion Graphics', 'Branding Visual', 'Campanhas'],
        },
      ],
    },
    about: {
      heading: 'Sobre Nós',
      subheading: 'About Us',
      bio1: 'Somos uma produtora audiovisual baseada em Benfica, Luanda. Criamos conteúdo que traduz a essência das marcas e dos momentos em imagens que se sentem.',
      bio2: 'Com anos de experiência no mercado angolano e africano, elevamos cada projeto ao nível do cinema.',
      stats: { projects: 'Projetos', years: 'Anos', market: 'Luanda' },
    },
    contact: {
      heading: 'Vamos Criar Juntos',
      subheading: "Let's Create Together",
      whatsappLabel: 'WhatsApp',
      instagramLabel: 'Instagram',
      emailLabel: 'Email',
      locationLabel: 'Localização',
      locationValue: 'Condomínio Hipicus, Casa 2, Benfica – Luanda',
      form: {
        nameLabel: 'Nome',
        namePlaceholder: 'O seu nome',
        emailLabel: 'Email',
        emailPlaceholder: 'o.seu@email.com',
        messageLabel: 'Mensagem',
        messagePlaceholder: 'Conte-nos sobre o seu projeto',
        send: 'Enviar mensagem',
        success: 'Obrigado pela sua mensagem! Entraremos em contacto em breve.',
      },
      footer: '© 2025 Kutecula · Todos os direitos reservados',
      tagline: 'A Voz da Criatividade',
    },
  },
  en: {
    nav: {
      trabalhos: 'Work',
      servicos: 'Services',
      sobre: 'About',
      contacto: 'Contact',
    },
    hero: {
      location: 'Luanda · Angola',
      tagline: 'Stories you can feel.',
      subtitle: 'Audiovisual production and photography in Luanda.',
      cta1: 'View our work',
      cta2: 'Contact us',
    },
    portfolio: {
      heading: 'Our Work',
      subheading: 'O Nosso Trabalho',
      categories: {
        todos: 'All',
        casamentos: 'Weddings',
        eventos: 'Events',
        corporativo: 'Corporate',
        estudio: 'Studio',
        audiovisual: 'Audiovisual',
      },
      close: 'Close',
      of: 'of',
    },
    services: {
      heading: 'What We Do',
      subheading: 'O Que Fazemos',
      items: [
        {
          title: 'Audiovisual Production',
          subtitle: 'We tell stories that stay.',
          deliverables: ['Advertising', 'Music Videos', 'Documentaries', 'Showreels'],
        },
        {
          title: 'Photography',
          subtitle: 'Every frame, a work of art.',
          deliverables: ['Weddings', 'Portraits', 'Events', 'Product'],
        },
        {
          title: 'Content Creation',
          subtitle: 'Content that moves audiences.',
          deliverables: ['Social Media', 'Motion Graphics', 'Visual Branding', 'Campaigns'],
        },
      ],
    },
    about: {
      heading: 'About Us',
      subheading: 'Sobre Nós',
      bio1: 'We are an audiovisual production company based in Benfica, Luanda. We create content that translates the essence of brands and moments into images you can feel.',
      bio2: 'With years of experience in the Angolan and African market, we elevate every project to cinematic level.',
      stats: { projects: 'Projects', years: 'Years', market: 'Luanda' },
    },
    contact: {
      heading: "Let's Create Together",
      subheading: 'Vamos Criar Juntos',
      whatsappLabel: 'WhatsApp',
      instagramLabel: 'Instagram',
      emailLabel: 'Email',
      locationLabel: 'Location',
      locationValue: 'Condomínio Hipicus, House 2, Benfica – Luanda',
      form: {
        nameLabel: 'Name',
        namePlaceholder: 'Your name',
        emailLabel: 'Email',
        emailPlaceholder: 'your@email.com',
        messageLabel: 'Message',
        messagePlaceholder: 'Tell us about your project',
        send: 'Send message',
        success: 'Thank you for your message! We will get back to you soon.',
      },
      footer: '© 2025 Kutecula · All rights reserved',
      tagline: 'The Voice of Creativity',
    },
  },
} as const;

type Translations = typeof translations.pt;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('pt');
  const t = translations[lang] as Translations;
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
