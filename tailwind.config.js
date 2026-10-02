/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: '#F7F5F0', raised: '#FDFCF9', sunken: '#EFEBE3' },
        ink: { DEFAULT: '#1C2430', soft: '#4A5463', faint: '#8A8F99' },
        rule: '#E2DDD2',
        accent: { DEFAULT: '#2B4570', bg: '#E8EDF5' },
        approved: { DEFAULT: '#3F7355', bg: '#E6F0E9' },
        awaiting: { DEFAULT: '#9C7A3C', bg: '#F6EEDD' },
        attention: { DEFAULT: '#A8452F', bg: '#F7E7E2' },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
