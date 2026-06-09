/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#F5F9FF',
        brand: {
          900: '#081028',
          700: '#003A9B',
          600: '#0057FF',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(8, 16, 40, 0.08)',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [],
}

