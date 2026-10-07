import { useState } from 'react';
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
  CheckIcon,
  ArrowRightIcon,
} from './icons';

const QUICK_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Estimator', href: '#estimator' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Team', href: '#team' },
  { label: 'Contact', href: '#contact' },
];

const BUDGET_OPTIONS = [
  'Under PKR 100k',
  'PKR 100k – 300k',
  'PKR 300k – 600k',
  'PKR 600k+',
];

/**
 * Contact — interactive project inquiry form + direct contact details.
 */
export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    contactInfo: '',
    service: services[0]?.title || 'Software Development',
    budget: BUDGET_OPTIONS[1],
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const telHref = `tel:${company.phone.replace(/[^\d+]/g, '')}`;
  const mailHref = `mailto:${company.email}`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.contactInfo) {
      alert('Please provide your name and phone/email.');
      return;
    }

    const text = `*New Project Consultation Inquiry — Zenggrix Website*
━━━━━━━━━━━━━━━━━━━━
👤 *Client Name:* ${formData.name}
🏢 *Company:* ${formData.company || 'Not specified'}
📞 *Contact Info:* ${formData.contactInfo}
🛠️ *Service Required:* ${formData.service}
💰 *Estimated Budget:* ${formData.budget}
📝 *Project Notes:* ${formData.message || 'No additional notes provided'}
━━━━━━━━━━━━━━━━━━━━
Looking forward to discussing project milestones with Zenggrix engineers.`;

    const url = `${company.socials.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.contactInfo) {
      alert('Please provide your name and phone/email.');
      return;
    }

    const subject = encodeURIComponent(`Project Inquiry: ${formData.service} - ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nCompany: ${formData.company}\nContact: ${formData.contactInfo}\nService: ${formData.service}\nBudget: ${formData.budget}\n\nProject Details:\n${formData.message}`
    );

    window.location.href = `mailto:${company.email}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <section id="contact" className="section relative border-t border-brand-border/70 overflow-hidden">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1/4 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-brand-accent/5 blur-3xl"
      />

      <div className="container-x relative">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Left Column: Direct Info & Location */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <Reveal>
                <span className="eyebrow">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
                  Get In Touch
                </span>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="section-title mt-4">Let&apos;s build your digital engine</h2>
              </Reveal>
              <Reveal delay={140}>
                <p className="lead mt-4">
                  Tell us what slows your business operations down. Our engineering team will review
                  and propose a practical architecture blueprint — no jargon, no obligation.
                </p>
              </Reveal>

              {/* Direct Details Cards */}
              <Reveal delay={180}>
                <dl className="mt-8 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      icon: <PhoneIcon className="h-5 w-5" />,
                      term: 'Direct Line / WhatsApp',
                      detail: company.phone,
                      href: telHref,
                    },
                    {
                      icon: <MailIcon className="h-5 w-5" />,
                      term: 'Official Email',
                      detail: company.email,
                      href: mailHref,
                    },
                    {
                      icon: <MapPinIcon className="h-5 w-5" />,
                      term: 'Physical Office',
                      detail: company.address,
                    },
                    {
                      icon: <ClockIcon className="h-5 w-5" />,
                      term: 'Operational Hours',
                      detail: company.workingHours,
                    },
                  ].map((item) => (
                    <div
                      key={item.term}
                      className="rounded-2xl border border-brand-border bg-white/90 p-4 transition hover:border-slate-600"
                    >
                      <dt className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
                        {item.icon}
                        {item.term}
                      </dt>
                      <dd className="mt-2 text-xs leading-relaxed text-slate-600">
                        {item.href ? (
                          <a
                            href={item.href}
                            {...(item.href.startsWith('http')
                              ? { target: '_blank', rel: 'noopener noreferrer' }
                              : {})}
                            className="transition hover:text-brand-teal"
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
            </div>

            {/* Quick Service Badges */}
            <Reveal delay={220}>
              <div className="mt-8 border-t border-brand-border/60 pt-6">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block mb-2">
                  Specialized Solutions:
                </span>
                <ul className="flex flex-wrap gap-1.5">
                  {services.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-lg border border-brand-border bg-brand-dark/70 px-2.5 py-1 text-[11px] text-slate-500 font-mono"
                    >
                      {s.title}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Interactive Lead Capture Form */}
          <div className="lg:col-span-7">
            <Reveal delay={120}>
              <div className="card relative overflow-hidden border-brand-teal/60/30 bg-gradient-to-br from-brand-card via-brand-dark to-brand-card p-6 shadow-glow sm:p-8">
                {submitted ? (
                  <div className="py-12 text-center animate-fade-in">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50">
                      <CheckIcon className="h-8 w-8" />
                    </div>
                    <h3 className="mt-6 text-2xl font-bold text-brand-teal">Inquiry Sent Successfully!</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                      Thank you for reaching out. We have received your project details and will review your requirements.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                      <a
                        href={company.socials.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                      >
                        <WhatsAppIcon className="h-4 w-4" />
                        Chat on WhatsApp
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitted(false);
                          setFormData({
                            name: '',
                            company: '',
                            contactInfo: '',
                            service: services[0]?.title || 'Software Development',
                            budget: BUDGET_OPTIONS[1],
                            message: '',
                          });
                        }}
                        className="btn-outline text-xs"
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleWhatsAppSubmit} className="space-y-5">
                    <div>
                      <h3 className="text-xl font-bold text-brand-teal">Direct Project Consultation Form</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Fill in your project requirements below to initiate rapid consultation.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Your Full Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="e.g. Hasaan Moeen"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-brand-border bg-brand-dark px-3.5 py-2.5 text-xs text-brand-teal placeholder-slate-500 outline-none transition focus:border-brand-teal/60 focus:ring-1 focus:ring-brand-accent"
                        />
                      </div>

                      {/* Company Name */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Company / Business Name
                        </label>
                        <input
                          type="text"
                          name="company"
                          placeholder="e.g. Retail Corp Ltd"
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-brand-border bg-brand-dark px-3.5 py-2.5 text-xs text-brand-teal placeholder-slate-500 outline-none transition focus:border-brand-teal/60 focus:ring-1 focus:ring-brand-accent"
                        />
                      </div>
                    </div>

                    {/* Email or WhatsApp Contact */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        WhatsApp Number or Email Address <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="contactInfo"
                        required
                        placeholder="e.g. +92 300 1234567 or contact@yourdomain.com"
                        value={formData.contactInfo}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-brand-border bg-brand-dark px-3.5 py-2.5 text-xs text-brand-teal placeholder-slate-500 outline-none transition focus:border-brand-teal/60 focus:ring-1 focus:ring-brand-accent"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Service Selection */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Primary Solution Needed
                        </label>
                        <select
                          name="service"
                          value={formData.service}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-brand-border bg-brand-dark px-3.5 py-2.5 text-xs text-brand-teal outline-none transition focus:border-brand-teal/60 focus:ring-1 focus:ring-brand-accent"
                        >
                          {services.map((s) => (
                            <option key={s.id} value={s.title} className="bg-white">
                              {s.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Estimated Budget */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Estimated Budget Tier
                        </label>
                        <select
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-brand-border bg-brand-dark px-3.5 py-2.5 text-xs text-brand-teal outline-none transition focus:border-brand-teal/60 focus:ring-1 focus:ring-brand-accent"
                        >
                          {BUDGET_OPTIONS.map((b) => (
                            <option key={b} value={b} className="bg-white">
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Requirements / Notes */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Brief Project Description & Goals
                      </label>
                      <textarea
                        name="message"
                        rows={3}
                        placeholder="Describe your current bottlenecks or key requirements (e.g. 'We need multi-store inventory sync and POS barcode billing')..."
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-brand-border bg-brand-dark p-3.5 text-xs text-brand-teal placeholder-slate-500 outline-none transition focus:border-brand-teal/60 focus:ring-1 focus:ring-brand-accent resize-none"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="submit"
                        className="btn-primary flex-1 justify-center shadow-[0_0_20px_rgba(0,196,204,0.3)] animate-pulseRing"
                      >
                        <WhatsAppIcon className="h-4 w-4" />
                        Send Inquiry via WhatsApp
                      </button>

                      <button
                        type="button"
                        onClick={handleEmailSubmit}
                        className="btn-outline justify-center text-xs"
                      >
                        <MailIcon className="h-4 w-4" />
                        Send via Email
                      </button>
                    </div>

                    <p className="text-[11px] text-center text-slate-500 font-mono">
                      🔒 Strictly confidential. Non-disclosure agreements (NDAs) available upon request.
                    </p>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Footer — brand block, comprehensive quick navigation, contact summary and socials.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-brand-border bg-brand-dark">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <a href="#home" className="flex items-center gap-2.5" aria-label={`${company.name} home`}>
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-brand-teal/60/40 bg-brand-accent-soft font-display text-base font-bold text-brand-accent">
                Z
              </span>
              <span className="font-display text-xl font-bold text-brand-teal">
                {company.name}
                <span className="text-brand-accent">.</span>
              </span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">{company.tagline}</p>
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
                  className="grid h-10 w-10 place-items-center rounded-xl border border-brand-border bg-white text-slate-600 transition hover:-translate-y-0.5 hover:border-brand-teal/60 hover:text-brand-accent"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer navigation">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-teal">
              Navigation
            </h3>
            <ul className="mt-5 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-500 transition hover:text-brand-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-teal">
              Headquarters
            </h3>
            <ul className="mt-5 space-y-4 text-sm text-slate-500">
              <li className="flex gap-3">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                <span>{company.address}</span>
              </li>
              <li className="flex gap-3">
                <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                <a
                  href={`tel:${company.phone.replace(/[^\d+]/g, '')}`}
                  className="transition hover:text-brand-teal"
                >
                  {company.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                <a href={`mailto:${company.email}`} className="transition hover:text-brand-teal">
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
