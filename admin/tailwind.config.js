/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './renderer/**/*.js'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        cir: {
          primary: '#21d4b4',
          emerald: '#10b981',
          dark: '#0a3e4a',
        },
      },
      width: {
        sidebar: 'var(--sidebar-width)',
      },
      margin: {
        sidebar: 'var(--sidebar-width)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
