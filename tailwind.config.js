/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        /* ── Brand Palette ── */
        primary:      { DEFAULT: '#059669', light: '#D1FAE5', dark: '#047857', muted: '#A7F3D0' },
        /* ── Semantic Text ── */
        ink:          { DEFAULT: '#0F172A', secondary: '#475569', muted: '#94A3B8', subtle: '#CBD5E1' },
        /* ── Surface ── */
        surface:      { DEFAULT: '#FFFFFF', raised: '#F8FAFC', subtle: '#F1F5F9' },
        /* ── Status ── */
        danger:       { DEFAULT: '#EF4444', light: '#FEE2E2', soft: '#FCA5A5' },
        warning:      { DEFAULT: '#F59E0B', light: '#FEF3C7', soft: '#FCD34D' },
        success:      { DEFAULT: '#10B981', light: '#D1FAE5', soft: '#6EE7B7' },
        info:         { DEFAULT: '#3B82F6', light: '#DBEAFE', soft: '#93C5FD' },
      },
      fontFamily: {
        sans:    ["'Plus Jakarta Sans'", 'Inter', 'sans-serif'],
        display: ["'Plus Jakarta Sans'", 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'card':   '20px',
        'card-sm':'14px',
        'pill':   '999px',
      },
      boxShadow: {
        'card':       '0px 1px 2px rgba(15,23,42,0.04), 0px 4px 20px rgba(15,23,42,0.06)',
        'card-hover': '0px 4px 8px rgba(15,23,42,0.06), 0px 16px 40px rgba(15,23,42,0.10)',
        'card-sm':    '0px 1px 2px rgba(15,23,42,0.04), 0px 2px 8px rgba(15,23,42,0.05)',
        'dropdown':   '0px 4px 6px rgba(15,23,42,0.04), 0px 12px 32px rgba(15,23,42,0.12)',
        'glow-primary': '0 0 0 3px rgba(5,150,105,0.20)',
        'inset':      'inset 0 1px 2px rgba(15,23,42,0.06)',
      },
      spacing: {
        'card': '1.5rem',  /* 24px consistent card padding */
      },
      animation: {
        'fade-up':     'fade-up 0.4s ease-out',
        'toast-in':    'toast-in 0.35s cubic-bezier(0.21,1.02,0.73,1) forwards',
        'toast-out':   'toast-out 0.25s ease-in forwards',
        'skeleton':    'skeleton-pulse 1.6s ease-in-out infinite',
        'progress-in': 'progress-fill 1s cubic-bezier(0.4,0,0.2,1) forwards',
        'spin-smooth': 'spin-smooth 0.8s linear infinite',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-in': {
          from: { transform: 'translateX(calc(100% + 1.5rem))', opacity: '0' },
          to:   { transform: 'translateX(0)', opacity: '1' },
        },
        'toast-out': {
          from: { transform: 'translateX(0)', opacity: '1' },
          to:   { transform: 'translateX(calc(100% + 1.5rem))', opacity: '0' },
        },
        'skeleton-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.35' },
        },
        'progress-fill': {
          from: { width: '0%' },
        },
        'spin-smooth': {
          to: { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
