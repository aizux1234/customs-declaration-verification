/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9', 100: '#dae4f0', 200: '#b8cce0', 300: '#8da9c8',
          400: '#5e80a8', 500: '#3d6089', 600: '#2d4a6e', 700: '#1e3a5f',
          800: '#172d49', 900: '#101f33',
        },
        brand: '#2563eb',
        teal: '#0d9488',
        success: { soft: '#dcfce7', DEFAULT: '#16a34a', text: '#15803d' },
        danger:  { soft: '#fee2e2', DEFAULT: '#dc2626', text: '#b91c1c' },
        warning: { soft: '#fef3c7', DEFAULT: '#d97706', text: '#b45309' },
        info:    { soft: '#dbeafe', DEFAULT: '#2563eb', text: '#1d4ed8' },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Thai"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(16 31 51 / 0.04), 0 1px 3px 0 rgb(16 31 51 / 0.08)',
        pop: '0 4px 6px -1px rgb(16 31 51 / 0.10), 0 2px 4px -2px rgb(16 31 51 / 0.08)',
        overlay: '0 20px 25px -5px rgb(16 31 51 / 0.18), 0 8px 10px -6px rgb(16 31 51 / 0.14)',
      },
      borderRadius: { md: '0.5rem', lg: '0.75rem' },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': { from: { opacity: '0', transform: 'scale(0.97)' }, to: { opacity: '1', transform: 'scale(1)' } },
        'slide-in-right': { from: { opacity: '0', transform: 'translateX(1rem)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'scale-in': 'scale-in 150ms ease-out',
        'slide-in-right': 'slide-in-right 200ms ease-out',
      },
    },
  },
  plugins: [],
};
