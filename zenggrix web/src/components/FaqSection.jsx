import { useState } from 'react';
import faqs from '../data/faqs.json';
import company from '../data/company.json';
import Reveal from './Reveal';
import { WhatsAppIcon, ArrowRightIcon } from './icons';

export default function FaqSection() {
  const [openId, setOpenId] = useState(faqs[0].id);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Process', 'Ownership', 'Technology', 'Pricing', 'Support'];

  const filteredFaqs =
    activeCategory === 'All'
      ? faqs
      : faqs.filter((f) => f.category === activeCategory);

  const toggleFaq = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="section relative overflow-hidden">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/4 bottom-10 h-80 w-80 rounded-full bg-brand-accent/5 blur-3xl"
      />

      <div className="container-x relative">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="eyebrow mx-auto">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
              Frequently Asked Questions
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-teal sm:text-4xl">
              Everything You Need to Know
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="lead mt-3">
              Clear answers regarding our contracts, intellectual property ownership, delivery timelines, and post-launch support.
            </p>
          </Reveal>

          {/* Category Filter Pills */}
          <Reveal delay={160}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition ${
                    activeCategory === cat
                      ? 'border border-brand-teal/60 bg-brand-accent text-white shadow-sm'
                      : 'border border-brand-border bg-white/80 text-slate-500 hover:text-brand-teal hover:border-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Accordion List */}
        <div className="mx-auto mt-12 max-w-3xl space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openId === faq.id;
            return (
              <Reveal key={faq.id} delay={40 * idx}>
                <div
                  className={`rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? 'border-brand-teal/60/60 bg-white shadow-[0_0_20px_rgba(0,196,204,0.12)]'
                      : 'border-brand-border bg-white/70 hover:border-slate-600'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded bg-brand-border/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-brand-accent">
                        {faq.category}
                      </span>
                      <h3 className="text-base font-bold text-brand-teal sm:text-lg">
                        {faq.question}
                      </h3>
                    </div>
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-brand-border bg-brand-dark text-brand-accent transition-transform duration-300 ${
                        isOpen ? 'rotate-90 bg-brand-accent text-white border-brand-teal/60' : ''
                      }`}
                    >
                      <ArrowRightIcon className="h-4 w-4" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-brand-border/60 px-5 pb-6 pt-4 sm:px-6">
                      <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Bottom WhatsApp FAQ Prompt */}
        <Reveal delay={180}>
          <div className="card mx-auto mt-12 flex max-w-2xl flex-col items-center justify-between gap-4 border-brand-border bg-brand-dark/80 p-6 text-center sm:flex-row sm:text-left">
            <div>
              <h4 className="text-base font-bold text-brand-teal">Have an unlisted question?</h4>
              <p className="mt-1 text-xs text-slate-500">
                Our engineering team is directly reachable via WhatsApp for technical queries.
              </p>
            </div>
            <a
              href={`${company.socials.whatsapp}?text=${encodeURIComponent(
                'Hi Zenggrix! I have a question regarding your services that was not on the website FAQ.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary shrink-0 text-xs"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Chat Directly
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
