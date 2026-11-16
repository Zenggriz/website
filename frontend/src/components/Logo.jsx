import useSiteContent from '../site-content/SiteContentContext';

/**
 * Logo — inline SVG wordmark derived from the Zenggrix brand:
 * cyan "Z" glyph + white name with the "DIGITAL SOLUTIONS" sub-tagline.
 */
export default function Logo({ compact = false, href = '/' }) {
  const { content } = useSiteContent();
  const { company } = content;

  return (
    <a href={href} className="group flex items-center gap-2.5" aria-label={`${company.name} home`}>
      <span className="relative grid h-10 w-10 shrink-0 place-items-center transition group-hover:border-brand-accent/70">
        <img className="h-10 w-10 object-contain" src="/favicon.svg" alt="" />
      </span>

      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-bold tracking-tight text-white sm:text-xl">
          {company.name}
          <span className="text-brand-accent">.</span>
        </span>
        {!compact && (
          <span className="mt-1 font-mono text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            {company.subTagline}
          </span>
        )}
      </span>
    </a>
  );
}
