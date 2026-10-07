import { useState, useMemo } from 'react';
import estimatorData from '../data/estimator.json';
import company from '../data/company.json';
import Reveal from './Reveal';
import { WhatsAppIcon, CheckIcon, ArrowRightIcon } from './icons';

export default function CostEstimator() {
  const [currency, setCurrency] = useState('PKR'); // 'PKR' or 'USD'
  const [selectedType, setSelectedType] = useState(estimatorData.projectTypes[0].id);
  const [selectedFeatures, setSelectedFeatures] = useState([
    'auth-roles',
    'analytics-reports',
  ]);
  const [selectedTimeline, setSelectedTimeline] = useState('standard');
  const [selectedSupport, setSelectedSupport] = useState('standard-support');
  const [copied, setCopied] = useState(false);

  // Conversion rate
  const activeCurrency =
    estimatorData.currencies.find((c) => c.code === currency) ||
    estimatorData.currencies[0];

  const formatPrice = (pkrAmount) => {
    if (currency === 'USD') {
      const usd = Math.round(pkrAmount * 0.0036);
      return `$${usd.toLocaleString()}`;
    }
    return `Rs. ${pkrAmount.toLocaleString()}`;
  };

  // Toggle feature selection
  const toggleFeature = (id) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // Calculation
  const currentType = estimatorData.projectTypes.find((t) => t.id === selectedType);
  const currentTimeline = estimatorData.timelines.find((t) => t.id === selectedTimeline);
  const currentSupport = estimatorData.supportPackages.find((s) => s.id === selectedSupport);

  const { totalLow, totalHigh, totalDays } = useMemo(() => {
    let basePrice = currentType?.basePricePKR || 0;
    let baseDays = currentType?.baseDays || 0;

    selectedFeatures.forEach((fid) => {
      const feat = estimatorData.featureAddons.find((f) => f.id === fid);
      if (feat) {
        basePrice += feat.pricePKR;
        baseDays += feat.days;
      }
    });

    if (currentSupport) {
      basePrice += currentSupport.pricePKR;
    }

    const multiplier = currentTimeline?.multiplier || 1.0;
    const finalBase = Math.round(basePrice * multiplier);

    // Timeline calculation
    let calculatedDays = baseDays;
    if (selectedTimeline === 'express') {
      calculatedDays = Math.max(7, Math.round(baseDays * 0.65));
    }

    // Range calculation (-5% to +10%)
    const low = Math.round(finalBase * 0.95);
    const high = Math.round(finalBase * 1.1);

    return {
      totalLow: low,
      totalHigh: high,
      totalDays: calculatedDays,
    };
  }, [currentType, selectedFeatures, currentTimeline, currentSupport, selectedTimeline]);

  // Construct WhatsApp quotation message
  const whatsappQuoteUrl = useMemo(() => {
    const featureNames = selectedFeatures
      .map((fid) => estimatorData.featureAddons.find((f) => f.id === fid)?.name)
      .filter(Boolean)
      .join(', ');

    const text = `*New Project Estimate Inquiry — Zenggrix Website*
━━━━━━━━━━━━━━━━━━━━
📌 *Project Type:* ${currentType?.name}
✨ *Add-on Features:* ${featureNames || 'Core features only'}
⏱️ *Timeline:* ${currentTimeline?.name} (~${totalDays} business days)
🛡️ *Support:* ${currentSupport?.name}
💰 *Estimated Range:* ${formatPrice(totalLow)} – ${formatPrice(totalHigh)} (${currency})
━━━━━━━━━━━━━━━━━━━━
I would like to discuss this quotation and confirm technical specifications.`;

    return `${company.socials.whatsapp}?text=${encodeURIComponent(text)}`;
  }, [
    currentType,
    selectedFeatures,
    currentTimeline,
    currentSupport,
    totalDays,
    totalLow,
    totalHigh,
    currency,
  ]);

  const copyQuoteSummary = () => {
    const summary = `Zenggrix Project Estimate:
Type: ${currentType?.name}
Timeline: ~${totalDays} Days (${currentTimeline?.name})
Estimate: ${formatPrice(totalLow)} - ${formatPrice(totalHigh)} (${currency})`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="estimator" className="section relative overflow-hidden bg-brand-dark/50">
      {/* Background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/3 top-0 h-96 w-96 rounded-full bg-brand-accent/5 blur-3xl"
      />

      <div className="container-x relative">
        {/* Header with Currency Toggle */}
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <Reveal>
              <span className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
                {estimatorData.badge}
              </span>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-teal sm:text-4xl">
                {estimatorData.title}
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mt-2 text-sm text-slate-500 max-w-xl">
                {estimatorData.subtitle}
              </p>
            </Reveal>
          </div>

          {/* Currency Switcher */}
          <Reveal delay={120}>
            <div className="inline-flex rounded-xl border border-brand-border bg-white p-1 shadow-md">
              {estimatorData.currencies.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrency(c.code)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-mono font-semibold transition ${
                    currency === c.code
                      ? 'bg-brand-accent text-white shadow-sm'
                      : 'text-slate-500 hover:text-brand-teal'
                  }`}
                >
                  {c.code} ({c.symbol})
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Main Grid: Left Configurator / Right Live Summary */}
        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          {/* Left Column (8 cols): Step by Step Builder */}
          <div className="space-y-10 lg:col-span-8">
            {/* Step 1: Project Type */}
            <div>
              <div className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-accent/10 font-mono text-xs font-bold text-brand-accent border border-brand-teal/60/30">
                  01
                </span>
                <h3 className="text-lg font-bold text-brand-teal">Select Core Solution Type</h3>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {estimatorData.projectTypes.map((type) => {
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`card card-hover flex flex-col items-start p-4 text-left transition-all ${
                        isSelected
                          ? 'border-brand-teal/60 bg-brand-accent-soft/30 shadow-[0_0_20px_rgba(0,196,204,0.15)] ring-1 ring-brand-accent'
                          : 'border-brand-border hover:border-slate-600'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="text-sm font-semibold text-brand-teal">{type.name}</span>
                        <span className="font-mono text-xs font-bold text-brand-accent">
                          From {formatPrice(type.basePricePKR)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-500">
                        {type.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Add-on Capabilities */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-accent/10 font-mono text-xs font-bold text-brand-accent border border-brand-teal/60/30">
                    02
                  </span>
                  <h3 className="text-lg font-bold text-brand-teal">Feature Add-ons & Modules</h3>
                </div>
                <span className="font-mono text-xs text-slate-500">
                  {selectedFeatures.length} selected
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {estimatorData.featureAddons.map((feature) => {
                  const isChecked = selectedFeatures.includes(feature.id);
                  return (
                    <button
                      key={feature.id}
                      type="button"
                      onClick={() => toggleFeature(feature.id)}
                      className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                        isChecked
                          ? 'border-brand-teal/60/80 bg-white shadow-sm'
                          : 'border-brand-border/80 bg-brand-dark/60 hover:border-slate-700'
                      }`}
                    >
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border transition ${
                          isChecked
                            ? 'border-brand-teal/60 bg-brand-accent text-white'
                            : 'border-slate-600 bg-brand-dark'
                        }`}
                      >
                        {isChecked && <CheckIcon className="h-3 w-3" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-brand-teal">
                            {feature.name}
                          </span>
                          <span className="font-mono text-[11px] font-semibold text-brand-accent shrink-0">
                            +{formatPrice(feature.pricePKR)}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                          {feature.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Timeline & Support */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Delivery Speed */}
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-accent/10 font-mono text-xs font-bold text-brand-accent border border-brand-teal/60/30">
                    03
                  </span>
                  <h3 className="text-base font-bold text-brand-teal">Target Timeline</h3>
                </div>

                <div className="mt-3 space-y-2">
                  {estimatorData.timelines.map((timeline) => {
                    const isSelected = selectedTimeline === timeline.id;
                    return (
                      <button
                        key={timeline.id}
                        type="button"
                        onClick={() => setSelectedTimeline(timeline.id)}
                        className={`w-full rounded-xl border p-3 text-left transition ${
                          isSelected
                            ? 'border-brand-teal/60 bg-brand-accent-soft/20 text-brand-teal'
                            : 'border-brand-border bg-white/80 text-slate-500 hover:text-brand-teal'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span>{timeline.name}</span>
                          {timeline.multiplier > 1 && (
                            <span className="font-mono text-amber-400">+25% Priority Fee</span>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">{timeline.note}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Maintenance Tier */}
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-accent/10 font-mono text-xs font-bold text-brand-accent border border-brand-teal/60/30">
                    04
                  </span>
                  <h3 className="text-base font-bold text-brand-teal">Post-Launch Support</h3>
                </div>

                <div className="mt-3 space-y-2">
                  {estimatorData.supportPackages.map((support) => {
                    const isSelected = selectedSupport === support.id;
                    return (
                      <button
                        key={support.id}
                        type="button"
                        onClick={() => setSelectedSupport(support.id)}
                        className={`w-full rounded-xl border p-3 text-left transition ${
                          isSelected
                            ? 'border-brand-teal/60 bg-brand-accent-soft/20 text-brand-teal'
                            : 'border-brand-border bg-white/80 text-slate-500 hover:text-brand-teal'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="line-clamp-1">{support.name}</span>
                          <span className="font-mono text-brand-accent shrink-0 ml-1">
                            {support.pricePKR === 0 ? 'Included' : `+${formatPrice(support.pricePKR)}`}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">{support.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Sticky Quote Card */}
          <div className="lg:col-span-4">
            <div className="card sticky top-28 border-brand-teal/60/40 bg-white p-6 shadow-glow">
              <span className="eyebrow">Calculated Estimate</span>

              {/* Estimated Price Range */}
              <div className="mt-5">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                  Estimated Investment Range
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-display text-brand-teal sm:text-3xl">
                    {formatPrice(totalLow)}
                  </span>
                  <span className="text-slate-500 font-mono">–</span>
                  <span className="text-xl font-bold font-display text-brand-accent sm:text-2xl">
                    {formatPrice(totalHigh)}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 font-mono">
                  *Transparent estimate based on selected scope
                </p>
              </div>

              {/* Delivery Window */}
              <div className="mt-6 flex items-center justify-between border-y border-brand-border py-4">
                <div>
                  <span className="text-xs text-slate-500 block">Estimated Timeline</span>
                  <span className="text-sm font-semibold text-brand-teal">
                    ~{totalDays} Working Days
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Selected Tier</span>
                  <span className="text-xs font-mono font-medium text-brand-accent">
                    {currentTimeline?.name}
                  </span>
                </div>
              </div>

              {/* Scope Checklist Summary */}
              <div className="mt-5">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                  Included In Estimate:
                </span>
                <ul className="mt-3 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-3.5 w-3.5 text-brand-accent shrink-0" />
                    <span>{currentType?.name}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-3.5 w-3.5 text-brand-accent shrink-0" />
                    <span>{selectedFeatures.length} Modular Feature Add-ons</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-3.5 w-3.5 text-brand-accent shrink-0" />
                    <span>Free Cloud Deployment & Handover</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-3.5 w-3.5 text-brand-accent shrink-0" />
                    <span>{currentSupport?.name}</span>
                  </li>
                </ul>
              </div>

              {/* WhatsApp Action Button */}
              <div className="mt-8 space-y-3">
                <a
                  href={whatsappQuoteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full shadow-[0_0_20px_rgba(0,196,204,0.3)] animate-pulseRing"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Send Quote to WhatsApp
                </a>

                <button
                  type="button"
                  onClick={copyQuoteSummary}
                  className="btn-outline w-full text-xs"
                >
                  {copied ? '✓ Quote Summary Copied!' : 'Copy Quote Details'}
                </button>
              </div>

              <div className="mt-6 border-t border-brand-border/60 pt-4 text-center">
                <p className="text-[11px] text-slate-500">
                  Need an NDA or custom enterprise requirements?{' '}
                  <a href="#contact" className="text-brand-accent underline hover:text-brand-teal">
                    Contact team directly
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
