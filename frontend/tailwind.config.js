/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Cyber-Professional
        background: '#0f172a', // Slate 900
        surface: '#1e293b',    // Slate 800
        primary: '#3b82f6',    // Blue 500
        accent: '#06b6d4',     // Cyan 500
        danger: '#ef4444',     // Red 500
        success: '#10b981',    // Emerald 500
        warning: '#f59e0b',    // Amber 500
      }
    },
  },
  plugins: [],
}
