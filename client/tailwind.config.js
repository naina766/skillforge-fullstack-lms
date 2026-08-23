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
          950: '#030712',
          900: '#0B0F19',
          800: '#111827',
          700: '#1F2937',
          600: '#374151',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
        purple: {
          500: '#8b5cf6',
          600: '#7c3aed',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.4)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'glow-purple': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'glass-hover': '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px -2px rgba(59, 130, 246, 0.3)',
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite linear',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'border-beam': 'borderBeam 4s infinite linear',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.2))' },
        },
        borderBeam: {
          '100%': { 'offset-distance': '100%' },
        },
      }
    },
  },
  plugins: [],
};
