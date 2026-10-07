import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TechStack from './components/TechStack';
import ServicesGrid from './components/ServicesGrid';
import Portfolio from './components/Portfolio';
import Process from './components/Process';
import Comparison from './components/Comparison';
import CostEstimator from './components/CostEstimator';
import Testimonials from './components/Testimonials';
import TeamSection from './components/TeamSection';
import FaqSection from './components/FaqSection';
import Contact, { Footer } from './components/Footer';
import WhatsAppWidget from './components/WhatsAppWidget';
import ScrollToTop from './components/ScrollToTop';

/**
 * App — static single-page composition. Every section reads its content from
 * JSON in src/data/, so copy changes never touch component code.
 */
export default function App() {
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
        <TechStack />
        <ServicesGrid />
        <Portfolio />
        <Process />
        <Comparison />
        <CostEstimator />
        <Testimonials />
        <TeamSection />
        <FaqSection />
        <Contact />
      </main>

      <Footer />
      <WhatsAppWidget />
      <ScrollToTop />
    </>
  );
}
