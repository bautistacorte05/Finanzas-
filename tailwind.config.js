/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#020617', // Deep Obsidian
        surface: '#0f172a',    // Slate-900
        'surface-lighter': '#1e293b', 
        primary: '#10b981',    // Emerald-500
        secondary: '#6366f1',  // Indigo-500
        accent: '#f59e0b',     // Amber-500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
