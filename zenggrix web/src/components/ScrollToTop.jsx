import { useState, useEffect } from 'react';
import { ArrowRightIcon } from './icons';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      className="fixed bottom-6 left-6 z-40 grid h-11 w-11 place-items-center rounded-xl border border-brand-border bg-brand-card/90 text-slate-300 shadow-card backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-accent hover:text-brand-accent"
    >
      <ArrowRightIcon className="h-4 w-4 -rotate-90" />
    </button>
  );
}
