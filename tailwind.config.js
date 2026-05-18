/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1e3a5f',
        brand: '#2563eb',
        teal: '#0d9488',
      },
    },
  },
  plugins: [],
};
