/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#F5C84C',
          'yellow-light': '#FDF4D4',
          'yellow-dark': '#E5B83A',
        },
        surface: {
          white: '#FFFFFF',
          off: '#FAFAFA',
          muted: '#F5F5F5',
        },
        ink: {
          black: '#111111',
          charcoal: '#2A2A2A',
          muted: '#6B7280',
          light: '#9CA3AF',
        },
        status: {
          success: '#22C55E',
          'success-soft': '#DCFCE7',
          warning: '#F97316',
          'warning-soft': '#FFEDD5',
          danger: '#EF4444',
          'danger-soft': '#FEE2E2',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        'card-lg': '24px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 8px 24px rgba(245,200,76,0.12)',
        nav: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)',
        float: '0 8px 32px rgba(245,200,76,0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
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
        pulseSoft: {
          '0%, 100%': { boxShadow: '0 8px 32px rgba(245,200,76,0.35)' },
          '50%': { boxShadow: '0 8px 40px rgba(245,200,76,0.5)' },
        },
      },
    },
  },
  plugins: [],
}
