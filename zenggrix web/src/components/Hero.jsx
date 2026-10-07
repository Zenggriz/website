import company from '../data/company.json';
import hero from '../data/hero.json';
import services from '../data/services.json';
import Reveal from './Reveal';
import { ServiceIcon, ArrowRightIcon, CheckIcon } from './icons';

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pt-[72px] bg-brand-dark">
      {/* Subtle grid background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-brand-grid bg-grid opacity-100" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-brand-glow" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-32 h-72 w-72 rounded-full bg-brand-teal/5 blur-3xl"
      />

      <div className="container-x relative grid gap-12 py-14 sm:py-20 lg:grid-cols-12 lg:gap-10 lg:py-24">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 xl:col-span-8">
          <Reveal>
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-teal" />
              {company.name} · {company.subTagline}
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-brand-teal sm:text-6xl lg:text-7xl">
              {company.name}
              <span className="text-brand-accent">.</span>
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-4 font-mono text-base font-semibold uppercase tracking-[0.22em] text-brand-teal/70 sm:text-lg">
              {hero.headline}
            </p>
          </Reveal>

          <Reveal delay={200}>
            <p className="lead mt-6 max-w-2xl">{hero.description}</p>
          </Reveal>

          {/* Services mini-grid */}
          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {services.map((service, i) => (
              <Reveal as="li" key={service.id} delay={60 * i}>
                <a
                  href="#services"
                  className="card card-hover group flex h-full items-start gap-3 p-4"
                  aria-label={`${service.title} — see details`}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-brand-border bg-brand-dark text-brand-teal transition group-hover:border-brand-teal/50 group-hover:bg-brand-accent-soft">
                    <ServiceIcon id={service.id} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-brand-teal">{service.title}</span>
                    </span>
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      {service.code}
                    </span>
                  </span>
                </a>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={120}>
            <p className="mt-8 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              {hero.aboutParagraph}
            </p>
          </Reveal>

          <Reveal delay={160}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href={hero.primaryCta.target} className="btn-primary">
                {hero.primaryCta.label}
                <ArrowRightIcon className="h-4 w-4" />
              </a>
              <a href={hero.secondaryCta.target} className="btn-outline">
                {hero.secondaryCta.label}
              </a>
            </div>
          </Reveal>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Reveal delay={120}>
            <aside className="card animate-float relative overflow-hidden p-6 shadow-card sm:p-8 lg:sticky lg:top-28 border-brand-teal/20">
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-teal/5 blur-2xl"
              />
              <span className="eyebrow relative">{hero.valueBadgeLabel}</span>

              <h2 className="relative mt-5 text-2xl font-bold leading-snug text-brand-teal sm:text-[1.75rem]">
                {hero.mainTagline}
              </h2>

              <ul className="relative mt-7 space-y-4">
                {hero.valuePoints.map((point) => (
                  <li key={point.title} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-accent text-white">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <span>
                      <span className="block text-base font-semibold text-brand-teal">{point.title}</span>
                      <span className="mt-0.5 inline-block rounded-md bg-brand-accent-soft px-2 py-0.5 text-xs font-medium text-brand-teal">
                        {point.subtitle}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="relative mt-8 border-t border-brand-border pt-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-400">
                  Based in {company.city}
                </p>
                <p className="mt-2 text-sm text-slate-600">{company.tagline}</p>
              </div>
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
