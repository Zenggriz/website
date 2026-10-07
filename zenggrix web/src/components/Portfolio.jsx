import { useState, useEffect } from 'react';
import portfolioData from '../data/portfolio.json';
import company from '../data/company.json';
import Reveal from './Reveal';
import { ArrowRightIcon, CheckIcon, CloseIcon, WhatsAppIcon } from './icons';

const CATEGORIES = [
  { key: 'all', label: 'All Projects' },
  { key: 'erp', label: 'ERP & POS' },
  { key: 'automation', label: 'Automation' },
  { key: 'web', label: 'Web Applications' },
  { key: 'software', label: 'Software Dev' },
];

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedProject(null);
    };
    if (selectedProject) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedProject]);

  const filteredProjects =
    activeCategory === 'all'
      ? portfolioData
      : portfolioData.filter((p) => p.categoryKey === activeCategory);

  return (
    <section id="portfolio" className="section relative overflow-hidden">
      {/* Subtle background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1/4 top-1/3 h-96 w-96 rounded-full bg-brand-accent/5 blur-3xl"
      />

      <div className="container-x relative">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="eyebrow mx-auto">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
              Proven Track Record
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-brand-teal sm:text-4xl lg:text-5xl">
              Featured Case Studies & Systems
            </h2>
          </Reveal>

          <Reveal delay={140}>
            <p className="lead mt-4">
              Explore how we engineer custom software, scalable ERPs, and automated workflows that drive tangible business metrics.
            </p>
          </Reveal>
        </div>

        {/* Category Filters */}
        <Reveal delay={180}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((cat) => {
              const count =
                cat.key === 'all'
                  ? portfolioData.length
                  : portfolioData.filter((p) => p.categoryKey === cat.key).length;

              const isActive = activeCategory === cat.key;

              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 sm:text-sm ${
                    isActive
                      ? 'border border-brand-teal/60 bg-brand-accent text-white shadow-[0_0_16px_rgba(0,196,204,0.4)]'
                      : 'border border-brand-border bg-white/90 text-slate-600 hover:border-slate-600 hover:text-brand-teal'
                  }`}
                >
                  {cat.label}
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                      isActive ? 'bg-brand-dark/20 text-white' : 'bg-brand-border text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Portfolio Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, idx) => (
            <Reveal as="article" key={project.id} delay={60 * idx}>
              <div className="card card-hover group flex h-full flex-col overflow-hidden p-0">
                {/* Visual Preview */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-dark/80">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-brand-card/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <span className="rounded-md bg-brand-dark/90 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-brand-accent backdrop-blur-md">
                      {project.category}
                    </span>
                  </div>

                  {/* Impact Metric Floating Tag */}
                  <div className="absolute bottom-3 right-3 rounded-lg border border-brand-teal/60/40 bg-brand-dark/90 px-3 py-1 text-xs font-semibold text-brand-accent shadow-md backdrop-blur-md">
                    ⚡ {project.heroMetric}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono uppercase tracking-wider text-slate-500">
                      Client: <span className="text-slate-600 font-sans">{project.client}</span>
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-bold leading-snug text-brand-teal transition group-hover:text-brand-accent">
                    {project.title}
                  </h3>

                  <p className="mt-2.5 text-sm leading-relaxed text-slate-500 line-clamp-3">
                    {project.summary}
                  </p>

                  {/* Tech stack chips */}
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {project.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-brand-border/60 px-2 py-0.5 font-mono text-[11px] text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 4 && (
                      <span className="rounded bg-brand-border/60 px-2 py-0.5 font-mono text-[11px] text-slate-500">
                        +{project.tags.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="mt-6 pt-4 border-t border-brand-border/70 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      className="group/btn inline-flex items-center gap-1.5 text-sm font-semibold text-brand-accent transition hover:text-brand-teal"
                    >
                      View Case Study
                      <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                    <span className="text-xs text-slate-500 font-mono">Verified Deploy</span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Bottom Banner */}
        <Reveal delay={200}>
          <div className="card mt-16 flex flex-col items-center justify-between gap-6 border-brand-teal/60/30 bg-gradient-to-r from-brand-card via-brand-dark to-brand-card p-8 text-center sm:flex-row sm:text-left">
            <div>
              <span className="eyebrow">Have a Custom Project in Mind?</span>
              <h3 className="mt-2 text-2xl font-bold text-brand-teal sm:text-3xl">
                Ready to automate or digitize your business?
              </h3>
              <p className="mt-2 max-w-xl text-sm text-slate-500">
                Let's discuss your requirements and build a scalable solution tailored to your operational workflow.
              </p>
            </div>
            <a
              href="#contact"
              className="btn-primary shrink-0 whitespace-nowrap"
            >
              Start Free Consultation
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>

      {/* Case Study Deep-Dive Modal */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-brand-dark/80 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedProject(null)}
          />

          {/* Modal Container */}
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-brand-border bg-white p-6 shadow-2xl sm:p-8">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              aria-label="Close modal"
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-xl border border-brand-border bg-brand-dark text-slate-500 transition hover:border-brand-teal/60 hover:text-brand-teal"
            >
              <CloseIcon className="h-5 w-5" />
            </button>

            {/* Header info */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-brand-accent-soft px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-brand-accent">
                {selectedProject.category}
              </span>
              <span className="font-mono text-xs text-slate-500">
                Client: <strong className="text-brand-teal font-sans">{selectedProject.client}</strong>
              </span>
            </div>

            <h3 className="mt-4 text-2xl font-bold text-brand-teal sm:text-3xl">
              {selectedProject.title}
            </h3>

            {/* Image Preview Banner */}
            <div className="mt-6 aspect-[16/9] w-full overflow-hidden rounded-xl border border-brand-border">
              <img
                src={selectedProject.image}
                alt={selectedProject.title}
                className="h-full w-full object-cover object-top"
              />
            </div>

            {/* Problem & Solution Grid */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-rose-500/20 bg-rose-950/10 p-5">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-rose-400">
                  The Operational Challenge
                </span>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {selectedProject.problem}
                </p>
              </div>

              <div className="rounded-xl border border-brand-teal/60/20 bg-brand-accent-soft p-5">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-accent">
                  The Zenggrix Solution
                </span>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {selectedProject.solution}
                </p>
              </div>
            </div>

            {/* Key Measurable Outcomes */}
            <div className="mt-8 rounded-xl border border-brand-border bg-brand-dark/50 p-6">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-teal">
                Measurable Impact & Results
              </h4>
              <ul className="mt-4 space-y-3">
                {selectedProject.results.map((result, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-accent text-white">
                      <CheckIcon className="h-3 w-3" />
                    </span>
                    <span>{result}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technologies */}
            <div className="mt-6">
              <span className="font-mono text-xs uppercase tracking-wider text-slate-500">
                Architecture & Technologies Deployed:
              </span>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {selectedProject.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-brand-border bg-brand-dark px-3 py-1 font-mono text-xs font-medium text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Footer CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-brand-border pt-6">
              <a
                href={`${company.socials.whatsapp}?text=${encodeURIComponent(
                  `Hi Zenggrix! I saw your case study on "${selectedProject.title}" and would like to build a similar solution for my business.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Inquire About Similar Solution
              </a>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="btn-outline text-sm"
              >
                Close Case Study
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
