import { useState } from 'react';
import techData from '../data/techstack.json';
import Reveal from './Reveal';

export default function TechStack() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTech =
    activeCategory === 'all'
      ? techData.technologies
      : techData.technologies.filter((t) => t.category === activeCategory);

  // Marquee list duplicated for seamless infinite scroll
  const marqueeItems = [
    'React',
    'Next.js',
    'TypeScript',
    'Node.js',
    'Python',
    'FastAPI',
    'PostgreSQL',
    'Redis',
    'Docker',
    'AWS Cloud',
    'WhatsApp API',
    'Tailwind CSS',
    'Electron',
    'Linux',
  ];

  return (
    <section id="tech-stack" className="relative border-y border-brand-border/60 bg-brand-dark/60 py-16 overflow-hidden">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-72 w-full max-w-4xl bg-brand-accent/5 blur-3xl"
      />

      <div className="container-x relative">
        {/* ================= 1. IMPACT STATS GRID ================= */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
          {techData.stats.map((stat, idx) => (
            <Reveal key={stat.id} delay={60 * idx}>
              <div className="card flex flex-col justify-between border-brand-border/80 bg-white/95 p-5 text-center transition hover:border-brand-teal/60/50 hover:shadow-[0_0_20px_rgba(0,196,204,0.12)]">
                <div>
                  <span className="font-display text-3xl font-extrabold tracking-tight text-brand-teal sm:text-4xl lg:text-5xl text-brand-accent">
                    {stat.value}
                  </span>
                  <h3 className="mt-2 text-xs font-bold text-brand-teal sm:text-sm">
                    {stat.label}
                  </h3>
                </div>
                <p className="mt-2 text-[11px] leading-tight text-slate-500 font-mono">
                  {stat.subtext}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ================= 2. INFINITE TICKER MARQUEE ================= */}
        <div className="mt-14 overflow-hidden rounded-xl border border-brand-border/60 bg-white/60 py-3 backdrop-blur-sm">
          <div className="flex w-max animate-marquee items-center gap-8 text-xs font-mono font-semibold uppercase tracking-[0.2em] text-slate-500">
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span key={index} className="flex items-center gap-8">
                <span className="text-brand-teal hover:text-brand-accent transition cursor-default">
                  {item}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-brand-accent/70" />
              </span>
            ))}
          </div>
        </div>

        {/* ================= 3. TECH ARSENAL EXPLORER ================= */}
        <div className="mt-16 text-center">
          <Reveal>
            <span className="eyebrow mx-auto">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
              Modern Engineering Arsenal
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-brand-teal sm:text-3xl">
              Technologies Built for Speed, Scale & Security
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="lead mx-auto mt-2 max-w-xl text-xs sm:text-sm">
              We leverage production-proven open-source and enterprise technologies to build software that never slows down.
            </p>
          </Reveal>

          {/* Category Filters */}
          <Reveal delay={140}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {techData.categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition ${
                    activeCategory === cat.key
                      ? 'border border-brand-teal/60 bg-brand-accent text-white shadow-sm'
                      : 'border border-brand-border bg-white/80 text-slate-500 hover:text-brand-teal hover:border-slate-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Tech Cards Grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filteredTech.map((tech) => (
            <div
              key={tech.name}
              className="card card-hover flex flex-col justify-between border-brand-border/70 bg-white/70 p-4 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-brand-teal">{tech.name}</span>
                <span className="rounded bg-brand-accent-soft px-2 py-0.5 font-mono text-[10px] font-semibold text-brand-accent uppercase">
                  {tech.tag}
                </span>
              </div>
              <p className="mt-2.5 text-[11px] leading-relaxed text-slate-500">
                {tech.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
