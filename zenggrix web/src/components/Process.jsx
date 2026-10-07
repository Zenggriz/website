import process from '../data/process.json';
import Reveal from './Reveal';

export default function Process() {
  return (
    <section id="process" className="section relative border-t border-brand-border/70 bg-white/60">
      <div className="container-x">
        <div className="max-w-2xl">
          <Reveal>
            <span className="eyebrow">How We Work</span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="section-title mt-5">A clear path from idea to impact</h2>
          </Reveal>
        </div>

        <ol className="relative mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-[54px] hidden h-px w-full bg-gradient-to-r from-brand-border via-brand-teal/30 to-brand-border xl:block"
          />
          {process.map((item, i) => (
            <Reveal as="li" key={item.id} delay={i * 90} className="relative">
              <article className="card card-hover h-full p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-brand-teal/30 bg-brand-accent-soft font-mono text-sm font-bold text-brand-teal">
                    {item.step}
                  </span>
                  <h3 className="text-lg font-semibold text-brand-teal">{item.title}</h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </article>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
