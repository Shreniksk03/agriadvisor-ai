/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          950: '#050505',
          900: '#0a0a0a',
          850: '#0d0f12',
          800: '#12151a',
          750: '#181c24',
        },
        slate: {
          950: '#080a0f',
          900: '#0d0f12',
          850: '#12151b',
          800: '#1e2430',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
        },
        brand: {
          blue: '#2563eb',
          'blue-light': '#3b82f6',
          'neon-blue': '#0088ff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'neon-blue': '0 0 15px rgba(37, 99, 235, 0.5)',
        'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.4)',
        'neon-emerald': '0 0 15px rgba(16, 185, 129, 0.4)',
        'neon-rose': '0 0 15px rgba(244, 63, 94, 0.4)',
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'app-mesh': 'radial-gradient(ellipse at top, #0f172a 0%, #0a0a0a 50%, #050505 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'blob': 'blob 15s infinite',
        'blob-reverse': 'blob-reverse 20s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'blob-reverse': {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(-30px, 50px) scale(1.2)' },
          '66%': { transform: 'translate(20px, -20px) scale(0.8)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
