/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0f0f12',
          800: '#16161a',
          700: '#1e1e24',
          600: '#25252d',
          500: '#2d2d36',
        }
      }
    },
  },
  plugins: [],
}
