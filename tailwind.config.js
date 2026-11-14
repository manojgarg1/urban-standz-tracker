/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        court: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38a8f6',
          500: '#0e8ce6',
          600: '#026ec4',
          700: '#03589f',
          800: '#074b83',
          900: '#0c3f6e',
          950: '#082848',
        },
        navy: {
          800: '#141e33',
          850: '#0f172a',
          900: '#0a0f1d',
          950: '#05070e',
        },
        amber: {
          450: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
