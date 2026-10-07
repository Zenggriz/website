/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Clean & Professional Light Theme
        brand: {
          // 60% Primary canvas background (bg-brand-dark still used in all components)
          dark: '#E6F7F8',

          // 30% Secondary (Cards, Structure & Typography)
          card: '#FFFFFF',
          'card-alt': '#F0FBFC',
          teal: '#004953',
          secondary: '#004953',
          border: 'rgba(0, 73, 83, 0.16)',
          'border-strong': '#004953',

          // 10% Accent (CTAs & Highlighting)
          accent: '#003F4A', // Dark Teal
          'accent-dark': '#002A32',
          'accent-soft': 'rgba(0, 73, 83, 0.08)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(0,73,83,0.2), 0 14px 30px -12px rgba(0,73,83,0.22)',
        card: '0 8px 30px -8px rgba(0, 73, 83, 0.10)',
      },
      backgroundImage: {
        'brand-grid':
          'linear-gradient(to right, rgba(0,73,83,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,73,83,0.06) 1px, transparent 1px)',
        'brand-glow':
          'radial-gradient(60% 60% at 50% 0%, rgba(0,73,83,0.08) 0%, rgba(230,247,248,0) 70%)',
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
          '0%': { boxShadow: '0 0 0 0 rgba(0,63,74,0.4)' },
          '70%': { boxShadow: '0 0 0 14px rgba(0,63,74,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(0,63,74,0)' },
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
