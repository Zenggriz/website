import company from '../data/company.json';

/**
 * Logo — inline SVG wordmark derived from the Zenggrix brand:
 * cyan "Z" glyph + white name with the "DIGITAL SOLUTIONS" sub-tagline.
 */
export default function Logo({ compact = false }) {
  return (
    <a href="#home" className="group flex items-center gap-2.5" aria-label={`${company.name} home`}>
      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand-border bg-brand-card transition group-hover:border-brand-accent/70">
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="zg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00C4CC" />
              <stop offset="100%" stopColor="#0B8A90" />
            </linearGradient>
          </defs>
          <path
            d="M8 7h16l-1.6 5.2H12.4L22 20.6V25H8v-5h10.2L9.6 12.2z"
            fill="url(#zg)"
            opacity="0.95"
          />
          <path d="M8 7h16" stroke="#00C4CC" strokeWidth="2" strokeLinecap="round" />
        </svg>
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
