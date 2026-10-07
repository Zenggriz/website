import comparisonData from '../data/comparison.json';
import Reveal from './Reveal';
import { CheckIcon, ArrowRightIcon } from './icons';

export default function Comparison() {
  return (
    <section id="comparison" className="section relative border-t border-brand-border/70 overflow-hidden bg-brand-dark/40">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-full max-w-5xl bg-brand-accent/5 blur-3xl"
      />

      <div className="container-x relative">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="eyebrow mx-auto">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
              {comparisonData.badge}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-brand-teal sm:text-4xl">
              {comparisonData.title}
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="lead mt-3">
              {comparisonData.subtitle}
            </p>
          </Reveal>
        </div>

        {/* Comparison Table / Matrix */}
        <Reveal delay={160}>
          <div className="mt-12 overflow-x-auto">
            <div className="min-w-[680px] rounded-2xl border border-brand-border bg-white/95 shadow-card">
              <div className="grid grid-cols-12 border-b border-brand-border text-center">
                <div className="col-span-4 p-5 text-left font-mono text-xs uppercase tracking-wider text-slate-500">
                  Core Criteria
                </div>
                <div className="col-span-2.5 p-5 text-xs font-semibold text-slate-500">
                  Solo Freelancers
                </div>
                <div className="col-span-4.5 relative p-5 bg-brand-accent-soft/40 border-x border-brand-teal/60/40 font-bold text-sm text-brand-accent">
                  <span className="relative z-10 flex items-center justify-center gap-1.5">
                    ✨ Zenggrix Digital Solutions
                  </span>
                </div>
                <div className="col-span-2.5 p-5 text-xs font-semibold text-slate-500">
                  Traditional Agencies
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-brand-border/60">
                {comparisonData.criteria.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 items-center text-xs transition hover:bg-brand-dark/40"
                  >
                    {/* Feature Label */}
                    <div className="col-span-4 p-4 text-left font-semibold text-brand-teal">
                      {item.feature}
                    </div>

                    {/* Freelancers */}
                    <div className="col-span-2.5 p-4 text-center text-slate-500">
                      {item.freelancers}
                    </div>

                    {/* Zenggrix (Highlighted) */}
                    <div className="col-span-4.5 p-4 text-center font-medium text-slate-700 bg-brand-accent-soft/20 border-x border-brand-teal/60/30 flex items-center justify-center gap-2">
                      <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-brand-accent text-white">
                        <CheckIcon className="h-2.5 w-2.5" />
                      </span>
                      <span>{item.zenggrix}</span>
                    </div>

                    {/* Traditional Agencies */}
                    <div className="col-span-2.5 p-4 text-center text-slate-500">
                      {item.agencies}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Action Callout */}
        <Reveal delay={200}>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-xl border border-brand-border/70 bg-brand-dark/80 p-5 text-center sm:flex-row sm:text-left">
            <div>
              <h4 className="text-sm font-bold text-brand-teal">
                Experience transparent software engineering with zero friction.
              </h4>
              <p className="mt-0.5 text-xs text-slate-500">
                Schedule a 20-minute architecture discovery call with our lead technical architects.
              </p>
            </div>
            <a href="#contact" className="btn-primary text-xs shrink-0 whitespace-nowrap">
              Schedule Free Discovery
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
