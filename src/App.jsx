import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ServicesGrid from './components/ServicesGrid';
import Process from './components/Process';
import TeamSection from './components/TeamSection';
import Contact, { Footer } from './components/Footer';
import GoogleAnalytics from './components/GoogleAnalytics';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ServicesPage from './pages/ServicesPage';
import usePageMetadata from './hooks/usePageMetadata';

/**
 * App — lightweight path-based pages, with shared navigation and footer.
 */
export default function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';

  useEffect(() => {
    const preventContextMenu = (e) => e.preventDefault();
    const preventDrag = (e) => e.preventDefault();

    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("dragstart", preventDrag);

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("dragstart", preventDrag);
    };
  }, []);

  const pages = {
    '/': {
      title: 'Zenggrix Digital Solutions | Build, Digitize & Grow',
      description:
        'Zenggrix helps businesses build, digitize, and grow with software development, websites, ERP and POS systems, automation, and digital marketing.',
    },
    '/services': {
      title: 'Digital Services for Businesses in Sukkur | Zenggrix',
      description:
        'Explore Zenggrix services: custom software, websites and web apps, ERP and POS systems, business automation, digital setup, and marketing.',
    },
    '/about': {
      title: 'About Zenggrix | Digital Solutions in Sukkur',
      description:
        'Meet the Zenggrix leadership team and learn how we understand, plan, build, and support practical digital solutions for businesses.',
    },
    '/contact': {
      title: 'Contact Zenggrix | Visit Our Sukkur Office',
      description:
        'Contact Zenggrix by phone, email, or WhatsApp, and find our office in Barrage Colony, Sukkur, Sindh.',
    },
  };
  const currentPage = pages[pathname] || pages['/'];
  usePageMetadata(pathname in pages ? pathname : '/', currentPage);

  let pageContent;
  if (pathname === '/services') {
    pageContent = <ServicesPage />;
  } else if (pathname === '/about') {
    pageContent = <AboutPage />;
  } else if (pathname === '/contact') {
    pageContent = <ContactPage />;
  } else {
    pageContent = (
      <>
        <Hero />
        <ServicesGrid />
        <Process />
        <TeamSection />
        <Contact />
      </>
    );
  }

  return (
    <>
      <GoogleAnalytics />
      <a
        href="/#home"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-dark"
      >
        Skip to content
      </a>

      <Navbar />

      <main>{pageContent}</main>

      <Footer />
    </>
  );
}
