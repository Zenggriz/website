/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Zenggrix brand identity
        brand: {
          dark: 'rgb(var(--color-page) / <alpha-value>)',
          card: 'rgb(var(--color-surface) / <alpha-value>)',
          border: 'rgb(var(--color-border) / <alpha-value>)',
          accent: 'rgb(var(--color-accent) / <alpha-value>)',
          'accent-dark': 'rgb(var(--color-accent-dark) / <alpha-value>)',
          'accent-soft': 'rgb(var(--color-accent) / 0.12)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgb(var(--color-glow) / 0.25), 0 18px 40px -18px rgb(var(--color-glow) / 0.3)',
        card: '0 16px 38px -22px rgb(var(--color-card-shadow) / 0.42)',
      },
      backgroundImage: {
        'brand-grid':
          'linear-gradient(to right, rgb(var(--color-grid) / 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--color-grid) / 0.35) 1px, transparent 1px)',
        'brand-glow':
          'radial-gradient(60% 60% at 50% 0%, rgb(var(--color-glow) / 0.14) 0%, rgb(var(--color-page) / 0) 70%)',
      },
      backgroundSize: {
        grid: '56px 56px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgb(var(--color-glow) / 0.5)' },
          '70%': { boxShadow: '0 0 0 14px rgb(var(--color-glow) / 0)' },
          '100%': { boxShadow: '0 0 0 0 rgb(var(--color-glow) / 0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.9s ease both',
        float: 'float 6s ease-in-out infinite',
        marquee: 'marquee 28s linear infinite',
        pulseRing: 'pulseRing 2.4s ease-out infinite',
      },
    },
  },
  plugins: [],
};
