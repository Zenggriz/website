import { useEffect, useState } from 'react';
import company from '../data/company.json';
import Logo from './Logo';
import { WhatsAppIcon, MenuIcon, CloseIcon } from './icons';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Estimator', href: '#estimator' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-brand-border bg-white/95 backdrop-blur-md shadow-sm'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="container-x flex h-[72px] items-center justify-between" aria-label="Main navigation">
        <Logo />

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="group relative text-sm font-medium text-slate-600 transition hover:text-brand-teal"
              >
                {link.label}
                <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 rounded-full bg-brand-accent transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href={company.socials.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary hidden animate-pulseRing sm:inline-flex"
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp Us
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="grid h-11 w-11 place-items-center rounded-xl border border-brand-border bg-white text-brand-teal shadow-sm transition hover:border-brand-teal lg:hidden"
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        id="mobile-menu"
        className={`overflow-hidden border-t border-brand-border bg-white/98 backdrop-blur-md transition-[max-height,opacity] duration-300 lg:hidden ${
          open ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="container-x flex flex-col gap-1 py-4">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-base font-medium text-slate-700 transition hover:bg-brand-dark hover:text-brand-teal"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="mt-2">
            <a
              href={company.socials.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="btn-primary w-full"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
