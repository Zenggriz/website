import { useState, useEffect } from 'react';
import testimonials from '../data/testimonials.json';
import Reveal from './Reveal';
import { ArrowRightIcon } from './icons';

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance every 6 seconds unless user is hovering
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const activeReview = testimonials[currentIndex];

  return (
    <section
      id="reviews"
      className="section relative overflow-hidden bg-brand-dark/40"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-brand-accent/5 blur-3xl"
      />

      <div className="container-x relative">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal>
              <span className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
                Client Testimonials & Trust
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-teal sm:text-4xl">
                Validated By High-Growth Businesses
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="lead mt-3 max-w-xl">
                Hear directly from business owners and founders who trust Zenggrix to digitize and scale their daily operations.
              </p>
            </Reveal>
          </div>

          {/* Carousel Arrows */}
          <Reveal delay={140}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous testimonial"
                className="grid h-11 w-11 place-items-center rounded-xl border border-brand-border bg-white text-brand-teal transition hover:border-brand-teal/60 hover:bg-brand-accent-soft"
              >
                <ArrowRightIcon className="h-4 w-4 rotate-180" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next testimonial"
                className="grid h-11 w-11 place-items-center rounded-xl border border-brand-border bg-white text-brand-teal transition hover:border-brand-teal/60 hover:bg-brand-accent-soft"
              >
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </Reveal>
        </div>

        {/* Featured Review Spotlight Card */}
        <div className="mt-10">
          <Reveal>
            <div className="card relative overflow-hidden border-brand-teal/60/30 bg-gradient-to-br from-brand-card via-brand-dark to-brand-card p-8 shadow-card sm:p-12">
              {/* Giant background quote symbol */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-8 top-6 font-serif text-8xl font-black text-brand-border/40 select-none"
              >
                “
              </div>

              <div className="relative grid gap-8 lg:grid-cols-12 lg:items-center">
                {/* Left: Metric & Author */}
                <div className="lg:col-span-4">
                  <span className="inline-block rounded-lg border border-brand-teal/60/40 bg-brand-accent-soft px-3 py-1 font-mono text-xs font-bold text-brand-accent">
                    ⚡ {activeReview.metric}
                  </span>

                  <div className="mt-6 flex items-center gap-4">
                    <div
                      className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${activeReview.color} text-lg font-bold text-brand-teal shadow-md font-display`}
                    >
                      {activeReview.initials}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-brand-teal">{activeReview.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {activeReview.role} · {activeReview.company}
                      </p>
                      <p className="mt-0.5 text-[11px] font-mono text-slate-500">
                        {activeReview.location}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-amber-400">
                    {[...Array(activeReview.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-4 w-4 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 font-mono text-xs font-semibold text-slate-500">
                      5.0 Verified Review
                    </span>
                  </div>
                </div>

                {/* Right: The Review Quote & Service Tag */}
                <div className="lg:col-span-8 lg:border-l lg:border-brand-border lg:pl-10">
                  <div className="inline-block rounded bg-brand-border/70 px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-brand-accent">
                    Delivered: {activeReview.service}
                  </div>
                  <blockquote className="mt-4 text-lg leading-relaxed text-slate-700 sm:text-xl font-normal">
                    "{activeReview.quote}"
                  </blockquote>
                </div>
              </div>

              {/* Slider Dots */}
              <div className="mt-8 flex items-center justify-center gap-2 border-t border-brand-border/60 pt-6">
                {testimonials.map((t, idx) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentIndex === idx
                        ? 'w-8 bg-brand-accent'
                        : 'w-2 bg-brand-border hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Mini Review Thumbnails Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {testimonials.map((t, idx) => {
            const isActive = currentIndex === idx;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`card flex flex-col items-start p-3.5 text-left transition-all ${
                  isActive
                    ? 'border-brand-teal/60 bg-brand-accent-soft/30 shadow-sm'
                    : 'border-brand-border bg-white/70 opacity-60 hover:opacity-100 hover:border-slate-600'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-xs font-bold text-brand-teal truncate">{t.name}</span>
                  <span className="text-[10px] text-amber-400">★ 5.0</span>
                </div>
                <span className="mt-1 text-[11px] text-slate-500 truncate w-full">{t.company}</span>
                <span className="mt-2 font-mono text-[10px] text-brand-accent truncate w-full">
                  {t.metric}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
