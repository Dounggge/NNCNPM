/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        error: {
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
        },
        success: {
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
        },
      },
      boxShadow: {
        'theme-xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      fontSize: {
        'theme-xs': '0.75rem',
        'theme-sm': '0.875rem',
        'title-sm': '1.5rem',
        'title-md': '2rem',
      },
    },
  },
  plugins: [],
}