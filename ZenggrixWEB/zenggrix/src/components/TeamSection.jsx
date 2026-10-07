import team from '../data/team.json';
import Reveal from './Reveal';
import { LinkedInIcon } from './icons';

/** Deterministic initials avatar (no external images → instant loads). */
function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * TeamSection — Founder & CEO / Co-Founder & CTO cards driven by team.json.
 */
export default function TeamSection() {
  return (
    <section id="team" className="section relative border-t border-brand-border/70 bg-brand-card/30">
      <div className="container-x">
        <div className="max-w-2xl">
          <Reveal>
            <span className="eyebrow">The Team</span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="section-title mt-5">Led by builders who ship</h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="lead mt-4">
              A focused leadership core combining product vision with deep engineering execution.
            </p>
          </Reveal>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:max-w-4xl">
          {team.map((member, i) => (
            <Reveal as="li" key={member.id} delay={i * 100} className="h-full">
              <article className="card card-hover group h-full p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-brand-accent/30 bg-gradient-to-br from-brand-accent/25 to-brand-dark font-display text-xl font-bold text-white transition duration-300 group-hover:border-brand-accent/70">
                    {initials(member.name)}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-white">{member.name}</h3>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-brand-accent">
                      {member.role}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-slate-300">{member.bio}</p>

                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg border border-brand-border px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-brand-accent hover:text-brand-accent"
                >
                  <LinkedInIcon className="h-4 w-4" />
                  LinkedIn profile
                </a>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
