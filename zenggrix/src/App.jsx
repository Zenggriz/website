import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ServicesGrid from './components/ServicesGrid';
import Process from './components/Process';
import TeamSection from './components/TeamSection';
import Contact, { Footer } from './components/Footer';

/**
 * App — static single-page composition. Every section reads its content from
 * JSON in src/data/, so copy changes never touch component code.
 */
export default function App() {
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
  return (
    <>
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-dark"
      >
        Skip to content
      </a>

      <Navbar />

      <main>
        <Hero />
        <ServicesGrid />
        <Process />
        <TeamSection />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
