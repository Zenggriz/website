import { useState, useEffect } from 'react';
import services from '../data/services.json';
import company from '../data/company.json';
import Reveal from './Reveal';
import { ServiceIcon, ArrowRightIcon, CheckIcon, CloseIcon, WhatsAppIcon } from './icons';

export default function ServicesGrid() {
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedService(null);
    };
    if (selectedService) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedService]);

  return (
    <section id="services" className="section relative border-t border-brand-border/70 bg-white/30">
      <div className="container-x relative">
        <div className="max-w-2xl">
          <Reveal>
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
              Core Capabilities
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="section-title mt-4">Everything your business needs to go digital</h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="lead mt-3">
              Six focused capabilities that take you from first online presence to fully automated,
              scalable operations — one partner at a time.
            </p>
          </Reveal>
        </div>

        {/* Services 6-Card Grid */}
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal as="li" key={service.id} delay={i * 60} className="h-full">
              <article
                id={service.id}
                className="card card-hover group flex h-full scroll-mt-28 flex-col justify-between p-6 transition-all"
              >
                <div>
                  <header className="flex items-center justify-between gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-xl border border-brand-border bg-brand-dark text-brand-accent transition duration-300 group-hover:border-brand-teal/60/60 group-hover:bg-brand-accent-soft">
                      <ServiceIcon id={service.id} className="h-6 w-6" />
                    </span>
                    <span className="code-chip">{service.code}</span>
                  </header>

                  <h3 className="mt-5 text-lg font-bold text-brand-teal transition group-hover:text-brand-accent">
                    {service.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                    {service.description}
                  </p>

                  {/* Highlights Pill */}
                  {service.timeline && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="rounded bg-brand-dark/80 px-2 py-0.5 font-mono text-[11px] text-slate-500 border border-brand-border/60">
                        ⏱️ {service.timeline}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-brand-border/60 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedService(service)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-accent transition hover:text-brand-teal"
                  >
                    View Deliverables
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <a
                    href={`${company.socials.whatsapp}?text=${encodeURIComponent(
                      `Hi Zenggrix! I am interested in discussing your "${service.title}" service.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-brand-teal font-mono"
                  >
                    Quick Chat ↗
                  </a>
                </div>

                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-6 bottom-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-brand-accent to-transparent transition-transform duration-500 group-hover:scale-x-100"
                />
              </article>
            </Reveal>
          ))}
        </ul>
      </div>

      {/* Service Deep-Dive Specification Modal */}
      {selectedService && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-brand-dark/85 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedService(null)}
          />

          {/* Modal Content */}
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-brand-teal/60/30 bg-white p-6 shadow-2xl sm:p-8 animate-fade-up">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedService(null)}
              aria-label="Close service details"
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-xl border border-brand-border bg-brand-dark text-slate-500 transition hover:border-brand-teal/60 hover:text-brand-teal"
            >
              <CloseIcon className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-brand-teal/60/40 bg-brand-accent-soft text-brand-accent">
                <ServiceIcon id={selectedService.id} className="h-7 w-7" />
              </span>
              <div>
                <span className="code-chip">{selectedService.code}</span>
                <h3 className="mt-1 text-2xl font-bold text-brand-teal sm:text-3xl">
                  {selectedService.title}
                </h3>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {selectedService.description}
            </p>

            {/* Ideal For & Timeline Badges */}
            <div className="mt-6 grid gap-3 rounded-xl border border-brand-border bg-brand-dark/60 p-4 sm:grid-cols-2">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block">
                  Best Suited For:
                </span>
                <span className="mt-1 text-xs font-semibold text-slate-700 block">
                  {selectedService.idealFor}
                </span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block">
                  Typical Delivery Sprints:
                </span>
                <span className="mt-1 text-xs font-semibold text-brand-accent block">
                  ⏱️ {selectedService.timeline}
                </span>
              </div>
            </div>

            {/* Deliverables Checklist */}
            <div className="mt-6">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500">
                Key Deliverables & Specifications:
              </h4>
              <ul className="mt-3 space-y-2.5">
                {selectedService.deliverables?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-accent text-white">
                      <CheckIcon className="h-3 w-3" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technology Stack */}
            <div className="mt-6">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block mb-2">
                Core Technologies & Frameworks:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedService.techStack?.map((tech) => (
                  <span
                    key={tech}
                    className="rounded bg-brand-border/70 px-2.5 py-1 font-mono text-xs text-slate-600"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Footer CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-brand-border pt-6">
              <a
                href={`${company.socials.whatsapp}?text=${encodeURIComponent(
                  `Hi Zenggrix! I would like to book or discuss requirements for "${selectedService.title}".`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Book Consultation on WhatsApp
              </a>

              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="btn-outline text-xs"
              >
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
