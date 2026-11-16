import Reveal from './Reveal';
import useSiteContent from '../site-content/SiteContentContext';

const PROCESS_ICONS = {
  discover: (
    <>
      <path d="M9 18h6m-5 3h4m-2-19a7 7 0 0 0-4 12.75c.55.38 1 1.02 1 1.75h6c0-.73.45-1.37 1-1.75A7 7 0 0 0 12 2Z" />
      <path d="M12 5v4m-2-2h4" />
    </>
  ),
  design: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
    </>
  ),
  build: <path d="m8 8-4 4 4 4m8-8 4 4-4 4m-2-11-4 14" />,
  grow: (
    <>
      <path d="M4 16.5 20 4l-4.5 16-4-6-7.5 2.5Z" />
      <path d="m11.5 14 4.5-4.5" />
    </>
  ),
};

export default function Process() {
  const { content } = useSiteContent();

  return (
    <section id="process" className="section py-10 sm:py-14">
      <div className="container-x">
        <div className="brand-inverse grid gap-8 rounded-3xl border border-brand-accent/30 p-6 shadow-glow sm:p-8 lg:grid-cols-12 lg:items-center lg:gap-10 lg:p-10">
          <div className="lg:col-span-4">
            <Reveal>
              <span className="eyebrow border-white/20 bg-white/10 text-brand-accent">How We Work</span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="section-title mt-5 text-white">
                A clear path from <span className="text-brand-accent">idea to impact</span>
              </h2>
            </Reveal>
          </div>

          <ol className="relative grid gap-5 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4 lg:gap-3">
            {content.process.map((item, i) => (
              <Reveal as="li" key={item.id} delay={i * 90} className="relative text-center">
                <article className="flex h-full flex-col items-center">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-brand-accent shadow-sm">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-6 w-6">
                      {PROCESS_ICONS[item.id]}
                    </svg>
                  </span>
                  <span className="mt-3 font-mono text-xs font-bold tracking-widest text-brand-accent">{item.step}</span>
                  <h3 className="mt-1 text-sm font-semibold text-white">{item.title}</h3>
                  <p className="sr-only">{item.description}</p>
                </article>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
