import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import company from '../data/company.json';
import hero from '../data/hero.json';
import process from '../data/process.json';
import services from '../data/services.json';
import team from '../data/team.json';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export const DEFAULT_SITE_CONTENT = {
  company,
  hero,
  process,
  services,
  team,
  pages: {
    home: {
      title: 'Zenggrix Digital Solutions | Build, Digitize & Grow',
      description: 'Zenggrix helps businesses build, digitize, and grow with software development, websites, ERP and POS systems, automation, and digital marketing.',
    },
    services: {
      eyebrow: 'What We Do',
      title: 'Digital services built around your business',
      description: 'From your first digital presence to custom systems and workflow automation, we build practical solutions around how your business works.',
      metaTitle: 'Digital Services for Businesses in Sukkur | Zenggrix',
      metaDescription: 'Explore Zenggrix services: custom software, websites and web apps, ERP and POS systems, business automation, digital setup, and marketing.',
    },
    about: {
      eyebrow: 'About Zenggrix',
      title: 'A practical partner for your digital growth',
      description: 'We help businesses improve everyday work with thoughtful software, reliable digital systems, and solutions designed around real needs.',
      metaTitle: 'About Zenggrix | Digital Solutions in Sukkur',
      metaDescription: 'Meet the Zenggrix leadership team and learn how we understand, plan, build, and support practical digital solutions.',
    },
    contact: {
      eyebrow: 'Contact',
      title: 'Let’s talk about what your business needs',
      description: 'Get in touch with our team in Sukkur. We’ll listen to your goals and help you find a practical next step.',
      metaTitle: 'Contact Zenggrix | Visit Our Sukkur Office',
      metaDescription: 'Contact Zenggrix by phone, email, or WhatsApp, and find our office in Barrage Colony, Sukkur, Sindh.',
    },
  },
};

const SiteContentContext = createContext({
  content: DEFAULT_SITE_CONTENT,
  refresh: async () => {},
});

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_SITE_CONTENT);

  const refresh = useCallback(async () => {
    if (!API_URL) return;
    const response = await fetch(`${API_URL}/api/cms/content`);
    if (!response.ok) throw new Error('Unable to load website content from the CMS.');
    const result = await response.json();
    setContent(result.content);
  }, []);

  useEffect(() => {
    refresh().catch((error) => {
      console.error('CMS content is unavailable; using the bundled website content.', error);
    });
  }, [refresh]);

  const value = useMemo(() => ({ content, refresh }), [content, refresh]);
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export default function useSiteContent() {
  return useContext(SiteContentContext);
}
