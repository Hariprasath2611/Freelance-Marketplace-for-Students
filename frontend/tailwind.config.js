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
        primary: {
          50: '#f4f7fe',
          100: '#e8eeff',
          200: '#d5e0ff',
          300: '#b4c8ff',
          400: '#8ca6ff',
          500: '#4f46e5', // Indigo primary
          600: '#4338ca',
          700: '#3730a3',
          800: '#312e81',
          900: '#1e1b4b',
        },
        darkBg: '#0b0f19', // Sleek deep dark mode bg
        darkCard: '#151d30', // Glassy card dark bg
        darkBorder: '#222f4c',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
