export default function PageIntro({ eyebrow, title, description }) {
  return (
    <section className="relative overflow-hidden border-b border-brand-border/70 pt-[72px]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-brand-grid bg-grid opacity-30" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-brand-glow" />
      <div className="container-x relative py-16 sm:py-20 lg:py-24">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="lead mt-5 max-w-2xl">{description}</p>
      </div>
    </section>
  );
}
