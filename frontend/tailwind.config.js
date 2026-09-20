/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#080d14',
        surface: '#0d1520',
        'surface-elevated': '#111c2a',
        overlay: '#162030',
        'border-subtle': 'rgba(255, 255, 255, 0.07)',
        'border-default': 'rgba(255, 255, 255, 0.12)',
        'border-accent': 'rgba(91, 147, 246, 0.5)',
        healthy: '#34c77b',
        warning: '#f5a623',
        critical: '#e8503a',
        disrupted: '#ff3b30',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
