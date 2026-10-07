/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Zenggrix brand identity
        brand: {
          dark: '#0B192C', // Dark Slate background
          card: '#111827', // Card / container slate
          border: '#1E293B', // Border navy
          accent: '#00C4CC', // Vibrant accent cyan
          'accent-dark': '#009CA3',
          'accent-soft': 'rgba(0, 196, 204, 0.12)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(0,196,204,0.25), 0 18px 40px -18px rgba(0,196,204,0.45)',
        card: '0 10px 30px -12px rgba(2, 6, 23, 0.85)',
      },
      backgroundImage: {
        'brand-grid':
          'linear-gradient(to right, rgba(30,41,59,0.55) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,41,59,0.55) 1px, transparent 1px)',
        'brand-glow':
          'radial-gradient(60% 60% at 50% 0%, rgba(0,196,204,0.18) 0%, rgba(11,25,44,0) 70%)',
      },
      backgroundSize: {
        grid: '44px 44px',
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
          '0%': { boxShadow: '0 0 0 0 rgba(0,196,204,0.5)' },
          '70%': { boxShadow: '0 0 0 14px rgba(0,196,204,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(0,196,204,0)' },
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
