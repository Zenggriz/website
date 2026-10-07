import company from '../data/company.json';
import services from '../data/services.json';
import Reveal from './Reveal';
import {
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  ClockIcon,
  WhatsAppIcon,
  LinkedInIcon,
  FacebookIcon,
} from './icons';

const QUICK_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
  { label: 'Process', href: '#process' },
  { label: 'Team', href: '#team' },
  { label: 'Contact', href: '#contact' },
];

/**
 * Contact — direct-line details (all sourced from company.json) + mailto CTA.
 */
export default function Contact() {
  const telHref = `tel:${company.phone.replace(/[^\d+]/g, '')}`;
  const mailHref = `mailto:${company.email}`;

  return (
    <section id="contact" className="section relative border-t border-brand-border/70">
      <div className="container-x grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <span className="eyebrow">Contact</span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="section-title mt-5">Let&apos;s build your digital engine</h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="lead mt-4">
              Tell us what slows your business down. We&apos;ll reply with a practical plan — no
              jargon, no obligation.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={company.socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Message on WhatsApp
              </a>
              <a href={mailHref} className="btn-outline">
                <MailIcon className="h-4 w-4" />
                Email us
              </a>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal delay={120}>
            <dl className="card grid gap-px overflow-hidden bg-brand-border p-0 sm:grid-cols-2">
              {[
                {
                  icon: <PhoneIcon className="h-5 w-5" />,
                  term: 'Phone',
                  detail: company.phone,
                  href: telHref,
                },
                {
                  icon: <MailIcon className="h-5 w-5" />,
                  term: 'Email',
                  detail: company.email,
                  href: mailHref,
                },
                {
                  icon: <MapPinIcon className="h-5 w-5" />,
                  term: 'Office',
                  detail: company.address,
                },
                {
                  icon: <ClockIcon className="h-5 w-5" />,
                  term: 'Working hours',
                  detail: company.workingHours,
                },
              ].map((item) => (
                <div key={item.term} className="bg-brand-card p-6">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-accent">
                    {item.icon}
                    {item.term}
                  </dt>
                  <dd className="mt-3 text-sm leading-relaxed text-slate-300">
                    {item.href ? (
                      <a
                        href={item.href}
                        {...(item.href.startsWith('http')
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                        className="transition hover:text-white"
                      >
                        {item.detail}
                      </a>
                    ) : (
                      item.detail
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={180}>
            <ul className="mt-6 flex flex-wrap gap-2">
              {services.map((s) => (
                <li
                  key={s.id}
                  className="rounded-full border border-brand-border bg-brand-card px-3 py-1.5 text-xs font-medium text-slate-300"
                >
                  {s.title}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * Footer — brand block, quick navigation, contact summary and socials.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-brand-border bg-brand-dark">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <a href="#home" className="flex items-center gap-2.5" aria-label={`${company.name} home`}>
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-brand-accent/40 bg-brand-accent-soft font-display text-base font-bold text-brand-accent">
                Z
              </span>
              <span className="font-display text-xl font-bold text-white">
                {company.name}
                <span className="text-brand-accent">.</span>
              </span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">{company.tagline}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500">
              {company.subTagline}
            </p>

            <div className="mt-6 flex items-center gap-3">
              {[
                { href: company.socials.linkedin, label: 'LinkedIn', Icon: LinkedInIcon },
                { href: company.socials.facebook, label: 'Facebook', Icon: FacebookIcon },
                { href: company.socials.whatsapp, label: 'WhatsApp', Icon: WhatsAppIcon },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-brand-border bg-brand-card text-slate-300 transition hover:-translate-y-0.5 hover:border-brand-accent hover:text-brand-accent"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer navigation">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">
              Quick Links
            </h3>
            <ul className="mt-5 space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 transition hover:text-brand-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">
              Reach Us
            </h3>
            <ul className="mt-5 space-y-4 text-sm text-slate-400">
              <li className="flex gap-3">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                <span>{company.address}</span>
              </li>
              <li className="flex gap-3">
                <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                <a
                  href={`tel:${company.phone.replace(/[^\d+]/g, '')}`}
                  className="transition hover:text-white"
                >
                  {company.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                <a href={`mailto:${company.email}`} className="transition hover:text-white">
                  {company.email}
                </a>
              </li>
              <li className="flex gap-3">
                <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                <span>{company.workingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-brand-border pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-500">
            © {year} {company.legalName}. All rights reserved.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">
            Build • Digitize • Grow
          </p>
        </div>
      </div>
    </footer>
  );
}
