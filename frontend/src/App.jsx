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
import LicensingPage from './license-frontend/pages/LicensingPage';
import CMSContentPage from './xencrix-cms/ContentAdminPage';
import usePageMetadata from './hooks/usePageMetadata';
import useSiteContent from './site-content/SiteContentContext';

/**
 * App — lightweight path-based pages, with shared navigation and footer.
 */
export default function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const { content } = useSiteContent();

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
    '/': { title: content.pages.home.title, description: content.pages.home.description },
    '/services': { title: content.pages.services.metaTitle, description: content.pages.services.metaDescription },
    '/about': { title: content.pages.about.metaTitle, description: content.pages.about.metaDescription },
    '/contact': { title: content.pages.contact.metaTitle, description: content.pages.contact.metaDescription },
    '/licenses': { title: 'License Console | Zenggrix', description: 'Manage client software licenses and subscription periods.' },
    '/admin/content': { title: 'Website Content | Zenggrix', description: 'Manage the live Zenggrix website content.' },
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
  } else if (pathname === '/licenses') {
    pageContent = <LicensingPage />;
  } else if (pathname === '/admin/content') {
    pageContent = <CMSContentPage />;
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
