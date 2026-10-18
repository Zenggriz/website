import { useEffect, useState } from 'react';

const CONSENT_KEY = 'zenggrix-analytics-consent';
const SETTINGS_EVENT = 'zenggrix:open-analytics-settings';

function getMeasurementId() {
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
  if (!id) return '';
  if (!/^G-[A-Z0-9]+$/.test(id)) {
    console.error('Invalid VITE_GA_MEASUREMENT_ID. Use a GA4 ID in the format G-XXXXXXXXXX.');
    return '';
  }
  return id;
}

export default function GoogleAnalytics() {
  const measurementId = getMeasurementId();
  const [consent, setConsent] = useState('unknown');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!measurementId) return undefined;

    try {
      const savedConsent = window.localStorage.getItem(CONSENT_KEY);
      setConsent(savedConsent === 'granted' || savedConsent === 'denied' ? savedConsent : 'unknown');
    } catch (error) {
      console.error('Unable to read analytics consent from local storage.', error);
    }

    const openSettings = () => setSettingsOpen(true);
    window.addEventListener(SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(SETTINGS_EVENT, openSettings);
  }, [measurementId]);

  useEffect(() => {
    if (!measurementId) return undefined;
    if (consent === 'denied' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
      return undefined;
    }
    if (consent !== 'granted') return undefined;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    window.gtag('config', measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      anonymize_ip: true,
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.onerror = () => console.error('Unable to load the Google Analytics script.');
    document.head.appendChild(script);

    return () => script.remove();
  }, [measurementId, consent]);

  const chooseConsent = (choice) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, choice);
    } catch (error) {
      console.error('Unable to save analytics consent to local storage.', error);
    }
    setConsent(choice);
    setSettingsOpen(false);
  };

  if (!measurementId || (!settingsOpen && consent !== 'unknown')) return null;

  return (
    <aside
      aria-label="Analytics preferences"
      className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-xl rounded-2xl border border-brand-border bg-brand-card p-5 shadow-card"
    >
      <p className="text-sm leading-relaxed text-slate-300">
        We use Google Analytics to understand how this site is used. Analytics stays off unless you
        choose to allow it. You can change this choice at any time in the footer.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => chooseConsent('granted')} className="btn-primary">
          Allow analytics
        </button>
        <button type="button" onClick={() => chooseConsent('denied')} className="btn-outline">
          Decline
        </button>
      </div>
    </aside>
  );
}
