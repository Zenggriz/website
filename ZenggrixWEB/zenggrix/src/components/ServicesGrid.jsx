import services from '../data/services.json';
import company from '../data/company.json';
import Reveal from './Reveal';
import { ServiceIcon, ArrowRightIcon } from './icons';

/**
 * ServicesGrid — full service detail cards rendered straight from services.json.
 */
export default function ServicesGrid() {
  return (
    <section id="services" className="section relative border-t border-brand-border/70 bg-brand-card/30">
      <div className="container-x relative">
        <div className="max-w-2xl">
          <Reveal>
            <span className="eyebrow">Core Services</span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="section-title mt-5">Everything your business needs to go digital</h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="lead mt-4">
              Six focused capabilities that take you from first online presence to fully automated,
              scalable operations — one partner at a time.
            </p>
          </Reveal>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal as="li" key={service.id} delay={i * 70} className="h-full">
              <article
                id={service.id}
                className="card card-hover group flex h-full scroll-mt-28 flex-col p-6"
              >
                <header className="flex items-center justify-between gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-xl border border-brand-border bg-brand-dark text-brand-accent transition duration-300 group-hover:border-brand-accent/60 group-hover:bg-brand-accent-soft">
                    <ServiceIcon id={service.id} className="h-6 w-6" />
                  </span>
                  <span className="code-chip">{service.code}</span>
                </header>

                <h3 className="mt-5 text-lg font-semibold text-white">{service.title}</h3>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-300">
                  {service.description}
                </p>

                <a
                  href={company.socials.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-accent transition hover:gap-3"
                >
                  Discuss this service
                  <ArrowRightIcon className="h-4 w-4" />
                </a>

                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-6 bottom-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-brand-accent to-transparent transition-transform duration-500 group-hover:scale-x-100"
                />
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
