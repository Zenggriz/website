import { useState } from 'react';
import company from '../data/company.json';
import { WhatsAppIcon, CloseIcon, ArrowRightIcon } from './icons';

const QUICK_PROMPTS = [
  '⚡ I need a quote for an ERP/POS system',
  '🌐 I want to build a custom web application',
  '🤖 I want to automate my business workflow',
  '💬 I want to speak with a software engineer',
];

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const sendWhatsApp = (msg) => {
    const textToSend = msg || customMsg || 'Hello Zenggrix Team, I would like to inquire about your digital solutions.';
    const url = `${company.socials.whatsapp}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setCustomMsg('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Quick Chat Popup Drawer */}
      {isOpen && (
        <div className="mb-4 w-[340px] overflow-hidden rounded-2xl border border-brand-border bg-white shadow-[0_10px_40px_rgba(0,0,0,0.6)] animate-fade-up sm:w-[380px]">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-brand-dark via-brand-card to-white p-4 border-b border-brand-border">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <WhatsAppIcon className="h-5 w-5" />
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-brand-dark bg-emerald-400 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-teal flex items-center gap-1.5">
                  Zenggrix Support
                  <span className="text-[10px] font-normal text-emerald-400 font-mono">Online</span>
                </h4>
                <p className="text-[11px] text-slate-500">Typically replies within 15 minutes</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-brand-dark hover:text-brand-teal"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 space-y-3 bg-brand-dark/40">
            {/* Incoming message bubble */}
            <div className="rounded-2xl rounded-tl-sm bg-brand-border/60 p-3.5 text-xs text-slate-700 leading-relaxed border border-brand-border">
              <p className="font-semibold text-brand-accent mb-1">Assalam-o-Alaikum! 👋</p>
              Welcome to Zenggrix Digital Solutions. How can we help accelerate your business goals today?
            </div>

            {/* Quick Prompt Pills */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block px-1">
                Instant Inquiries:
              </span>
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendWhatsApp(prompt)}
                  className="w-full text-left rounded-xl border border-brand-border bg-white/95 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-emerald-500/60 hover:bg-emerald-950/20 hover:text-emerald-300"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendWhatsApp(customMsg);
            }}
            className="flex items-center gap-2 border-t border-brand-border p-3 bg-white"
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="flex-1 rounded-xl border border-brand-border bg-brand-dark px-3 py-2 text-xs text-brand-teal placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500 text-white transition hover:bg-emerald-400"
              aria-label="Send WhatsApp message"
            >
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open WhatsApp live chat"
        className="group relative flex items-center gap-3 rounded-full border border-emerald-400/40 bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-brand-teal shadow-[0_4px_25px_rgba(16,185,129,0.45)] transition-all duration-300 hover:scale-105 hover:shadow-[0_4px_35px_rgba(16,185,129,0.65)]"
      >
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-200" />
        </span>
        <WhatsAppIcon className="h-5 w-5" />
        <span className="text-xs font-bold tracking-wide hidden sm:inline-block">
          {isOpen ? 'Close Chat' : 'Chat on WhatsApp'}
        </span>
      </button>
    </div>
  );
}
