/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1C2430',
          soft: '#3D4654',
          faint: '#6B7280',
        },
        paper: {
          DEFAULT: '#F7F5F0',
          raised: '#FCFBF8',
          sunken: '#EFEBE2',
        },
        rule: '#E4E0D6',
        approved: {
          DEFAULT: '#3F5D45',
          bg: '#E9EEE9',
        },
        awaiting: {
          DEFAULT: '#9C7A3C',
          bg: '#F3ECDD',
        },
        attention: {
          DEFAULT: '#8B3A3A',
          bg: '#F3E4E1',
        },
        accent: {
          DEFAULT: '#2B4570',
          bg: '#E7EBF2',
          soft: '#4A6491',
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        none: 'none',
      },
    },
  },
  plugins: [],
}
